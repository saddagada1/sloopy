import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  fetchCurrentSpotifyUser,
  fetchSpotifyClientCredentials,
  fetchSpotifyCredentials,
  refreshSpotifyCredentials,
} from "~/utils/axios/spotify";
import { TRPCError } from "@trpc/server";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

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
        const linkedAccount = await ctx.prisma.linkedAccount.create({
          data: {
            userId: ctx.session.user.id,
            provider: "spotify",
            providerAccountId: spotifyUser.id,
            access_token: spotifyCredentials.access_token,
            refresh_token: spotifyCredentials.refresh_token,
            expires_at: Date.now() / 1000 + spotifyCredentials.expires_in,
            token_type: spotifyCredentials.token_type,
            isPremium: spotifyUser.product === "premium" ? true : false,
          },
        });
        return linkedAccount;
      } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === "P2002") {
            throw new TRPCError({
              code: "CONFLICT",
              message: "User Has Existing Spotify Account Linked",
            });
          }
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Could Not Link Spotify Account",
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could Not Link Spotify Account",
        });
      }
    }),

  unlinkSpotifyAccount: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      await ctx.prisma.linkedAccount.delete({
        where: {
          userId_provider: {
            userId: ctx.session.user.id,
            provider: "spotify",
          },
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
    .input(z.object({ refresh_token: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const spotifyCredentials = await refreshSpotifyCredentials(
        input.refresh_token
      );
      if (!spotifyCredentials.ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: spotifyCredentials.message,
        });
      }

      try {
        const expires_at = Date.now() / 1000 + spotifyCredentials.expires_in;
        await ctx.prisma.linkedAccount.update({
          data: {
            access_token: spotifyCredentials.access_token,
            expires_at: expires_at,
          },
          where: {
            userId_provider: {
              userId: ctx.session.user.id,
              provider: "spotify",
            },
          },
        });
        return {
          access_token: spotifyCredentials.access_token,
          expires_at: expires_at,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could Not Update Spotify Credentials",
        });
      }
    }),

  fetchSpotifyAuth: protectedProcedure.mutation(async () => {
    const spotifyCredentials = await fetchSpotifyClientCredentials();
    if (!spotifyCredentials.ok) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: spotifyCredentials.message,
      });
    }
    const expires_at = Date.now() / 1000 + spotifyCredentials.expires_in;
    return {
      access_token: spotifyCredentials.access_token,
      expires_at: expires_at,
    };
  }),
});
