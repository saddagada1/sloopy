import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const searchRouter = createTRPCRouter({
  all: publicProcedure
    .input(
      z.object({
        query: z.string(),
        limit: z.number().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const users = await ctx.prisma.user.findMany({
          where: {
            name: {
              search: `${input.query}*`,
            },
            bio: {
              search: `${input.query}*`,
            },
            username: {
              search: `${input.query}*`,
            },
          },
          select: {
            username: true,
            image: true,
          },
          take: input.limit ?? 50,
        });
        const artists = await ctx.prisma.artist.findMany({
          where: {
            name: {
              search: `${input.query}*`,
            },
          },
          include: {
            sloops: {
              include: {
                _count: {
                  select: { likes: true },
                },
              },
            },
          },
          take: input.limit ?? 50,
        });
        const sloops = await ctx.prisma.sloop.findMany({
          where: {
            isPrivate: false,
            name: {
              search: `${input.query}*`,
            },
            description: {
              search: `${input.query}*`,
            },
            trackName: {
              search: `${input.query}*`,
            },
            userUsername: {
              search: `${input.query}*`,
            },
          },
          include: {
            _count: {
              select: { likes: true },
            },
          },
          take: input.limit ?? 50,
        });
        return {
          users,
          artists,
          sloops: [
            ...sloops,
            artists.flatMap((artist) => artist.sloops),
          ].flat(),
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could Not Search Sloopy",
        });
      }
    }),
});
