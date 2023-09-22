import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const searchRouter = createTRPCRouter({
  all: publicProcedure
    .input(
      z.object({
        query: z.string(),
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
          take: 50,
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
                rankedSloop: {
                  select: { likes: true },
                },
                artists: {
                  select: {
                    name: true,
                  },
                },
                track: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          take: 50,
        });
        const tracks = await ctx.prisma.track.findMany({
          where: {
            name: {
              search: `${input.query}*`,
            },
          },
          include: {
            sloops: {
              include: {
                rankedSloop: {
                  select: { likes: true },
                },
                artists: {
                  select: {
                    name: true,
                  },
                },
                track: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          take: 50,
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
            userUsername: {
              search: `${input.query}*`,
            },
          },
          include: {
            rankedSloop: {
              select: { likes: true },
            },
            artists: {
              select: {
                name: true,
              },
            },
            track: {
              select: {
                name: true,
              },
            },
          },
          take: 50,
        });
        return {
          users,
          artists,
          tracks,
          sloops: [
            ...sloops,
            artists.flatMap((artist) => artist.sloops),
            tracks.flatMap((track) => track.sloops),
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
