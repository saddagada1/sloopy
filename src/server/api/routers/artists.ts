import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const artistsRouter = createTRPCRouter({
  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const artist = await ctx.prisma.artist.findUnique({
        where: { id: input.id },
      });

      if (!artist) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Artist Not Found",
        });
      }

      return artist;
    }),
  getArtistTrendingSloops: publicProcedure
    .input(
      z.object({
        limit: z.number(),
        cursor: z.string().optional(),
        skip: z.number().optional(),
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const sloops = await ctx.prisma.rankedSloop.findMany({
          where: {
            sloop: {
              artists: {
                some: {
                  id: input.id,
                },
              },
              isPrivate: false,
            },
          },
          orderBy: { rank: "desc" },
          include: {
            sloop: {
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
          skip: input.skip,
          take: input.limit + 1,
          cursor: input.cursor ? { sloopId: input.cursor } : undefined,
        });
        let next: typeof input.cursor = undefined;
        if (sloops.length > input.limit) {
          next = sloops.pop()?.sloopId;
        }
        return {
          next: next,
          items: sloops,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could Not Artists' Trending Sloops",
        });
      }
    }),

  getArtistTrendingTracks: publicProcedure
    .input(
      z.object({
        limit: z.number(),
        cursor: z.string().optional(),
        skip: z.number().optional(),
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const tracks = await ctx.prisma.rankedTrack.findMany({
          where: {
            track: {
              artists: {
                some: {
                  id: input.id,
                },
              },
            },
          },
          orderBy: { rank: "desc" },
          include: {
            track: true,
          },
          skip: input.skip,
          take: input.limit + 1,
          cursor: input.cursor ? { trackId: input.cursor } : undefined,
        });
        let next: typeof input.cursor = undefined;
        if (tracks.length > input.limit) {
          next = tracks.pop()?.trackId;
        }
        return {
          next: next,
          items: tracks,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could Not Artists' Trending Tracks",
        });
      }
    }),

  getArtistLovedSloops: publicProcedure
    .input(
      z.object({
        limit: z.number(),
        cursor: z.string().optional(),
        skip: z.number().optional(),
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const sloops = await ctx.prisma.rankedSloop.findMany({
          where: {
            sloop: {
              artists: {
                some: {
                  id: input.id,
                },
              },
              isPrivate: false,
            },
          },
          orderBy: { likeRank: "desc" },
          include: {
            sloop: {
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
          skip: input.skip,
          take: input.limit + 1,
          cursor: input.cursor ? { sloopId: input.cursor } : undefined,
        });
        let next: typeof input.cursor = undefined;
        if (sloops.length > input.limit) {
          next = sloops.pop()?.sloopId;
        }
        return {
          next: next,
          items: sloops,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could Not Artists' Loved Sloops",
        });
      }
    }),

  getArtistLovedTracks: publicProcedure
    .input(
      z.object({
        limit: z.number(),
        cursor: z.string().optional(),
        skip: z.number().optional(),
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const tracks = await ctx.prisma.rankedTrack.findMany({
          where: {
            track: {
              artists: {
                some: {
                  id: input.id,
                },
              },
            },
          },
          orderBy: { likeRank: "desc" },
          include: {
            track: true,
          },
          skip: input.skip,
          take: input.limit + 1,
          cursor: input.cursor ? { trackId: input.cursor } : undefined,
        });
        let next: typeof input.cursor = undefined;
        if (tracks.length > input.limit) {
          next = tracks.pop()?.trackId;
        }
        return {
          next: next,
          items: tracks,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could Not Artists' Loved Tracks",
        });
      }
    }),

  getArtistMostRecent: publicProcedure
    .input(
      z.object({
        limit: z.number(),
        cursor: z.string().optional(),
        skip: z.number().optional(),
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const sloops = await ctx.prisma.sloop.findMany({
          where: {
            artists: {
              some: {
                id: input.id,
              },
            },
            isPrivate: false,
          },
          orderBy: { createdAt: "desc" },
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
          skip: input.skip,
          take: input.limit + 1,
          cursor: input.cursor ? { id: input.cursor } : undefined,
        });
        let next: typeof input.cursor = undefined;
        if (sloops.length > input.limit) {
          next = sloops.pop()?.id;
        }
        return {
          next: next,
          items: sloops,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could Not Get Artists' Most Recent Sloops",
        });
      }
    }),
});
