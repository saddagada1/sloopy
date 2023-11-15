import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import {
  fetchCurrentSpotifyUser,
  fetchSpotifyClientCredentials,
  fetchSpotifyCredentials,
  refreshSpotifyCredentials,
} from "~/utils/axios/spotify";
import { TRPCError } from "@trpc/server";

export const spotifyRouter = createTRPCRouter({
  linkSpotifyAccount: protectedProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const spotifyCredentials = await fetchSpotifyCredentials(input.code);
      if (!spotifyCredentials.ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: spotifyCredentials.message,
        });
      }
      const spotifyUser = await fetchCurrentSpotifyUser(
        spotifyCredentials.access_token
      );

      if (!spotifyUser.ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: spotifyUser.message,
        });
      }

      try {
        const user = await ctx.prisma.user.update({
          where: { id: ctx.session.user.id },
          data: {
            spotifyId: spotifyUser.id,
            accessToken: spotifyCredentials.access_token,
            refreshToken: spotifyCredentials.refresh_token,
            expiresAt: Date.now() / 1000 + spotifyCredentials.expires_in,
            streamingEnabled: spotifyUser.product === "premium" ? true : false,
          },
        });
        return user;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could Not Link Spotify Account",
        });
      }
    }),

  unlinkSpotifyAccount: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: {
          spotifyId: null,
          accessToken: null,
          refreshToken: null,
          expiresAt: null,
          streamingEnabled: false,
        },
      });
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Could Not Unlink Spotify Account",
      });
    }
  }),

  refreshSpotifyAuth: protectedProcedure
    .input(z.object({ refreshToken: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const spotifyCredentials = await refreshSpotifyCredentials(
        input.refreshToken
      );
      if (!spotifyCredentials.ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: spotifyCredentials.message,
        });
      }

      try {
        const expires_at = Date.now() / 1000 + spotifyCredentials.expires_in;
        await ctx.prisma.user.update({
          where: { id: ctx.session.user.id },
          data: {
            accessToken: spotifyCredentials.access_token,
            expiresAt: expires_at,
          },
        });
        return {
          accessToken: spotifyCredentials.access_token,
          expiresAt: expires_at,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could Not Update Spotify Credentials",
        });
      }
    }),

  fetchSpotifyAuth: publicProcedure.mutation(async () => {
    const spotifyCredentials = await fetchSpotifyClientCredentials();
    if (!spotifyCredentials.ok) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: spotifyCredentials.message,
      });
    }
    const expiresAt = Date.now() / 1000 + spotifyCredentials.expires_in;
    return {
      accessToken: spotifyCredentials.access_token,
      expiresAt,
    };
  }),
});
