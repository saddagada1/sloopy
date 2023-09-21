import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { type Loop } from "~/utils/types";
import { type Prisma } from "@prisma/client";
import { kafka } from "~/utils/upstash";
import { TRENDING_TOPIC } from "~/utils/constants";

const zodLoop: z.ZodType<Loop> = z.object({
  id: z.number().min(1),
  start: z.number().min(0),
  end: z.number().min(0),
  key: z.number().min(-1).max(11),
  mode: z.number().min(0).max(1),
  chord: z.string(),
  voicing: z.number(),
  notes: z.string(),
});

const zodArtist = z.object({
  spotifyId: z.string(),
  image: z.string().optional(),
  name: z.string(),
});

const createSloopInput = z.object({
  name: z.string(),
  description: z.string().max(500),
  trackId: z.string(),
  trackName: z.string(),
  artists: z.array(zodArtist),
  duration: z.number(),
  key: z.number().min(-1).max(11),
  mode: z.number().min(0).max(1),
  tempo: z.number(),
  timeSignature: z.number().min(3).max(7),
});

const updateSloopInput = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().max(500),
  key: z.number().min(-1).max(11),
  mode: z.number().min(0).max(1),
  tempo: z.number(),
  timeSignature: z.number().min(3).max(7),
  loops: z.array(zodLoop),
  isPrivate: z.boolean(),
});

export const sloopsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createSloopInput)
    .mutation(async ({ input, ctx }) => {
      // if (!ctx.session.user.verified) {
      //   throw new TRPCError({
      //     code: "UNAUTHORIZED",
      //     message: "Please Verify Your Account To Proceed",
      //   });
      // }
      try {
        const { artists, ...sloopInput } = input;
        const id = await ctx.prisma.$transaction(async () => {
          const sloop = await ctx.prisma.sloop.create({
            data: {
              ...sloopInput,
              userId: ctx.session.user.id,
              userUsername: ctx.session.user.username,
              artists: {
                connectOrCreate: artists.map((artist) => {
                  return {
                    where: { spotifyId: artist.spotifyId },
                    create: {
                      spotifyId: artist.spotifyId,
                      image: artist.image,
                      name: artist.name,
                    },
                  };
                }),
              },
              loops: [],
            },
            include: {
              artists: {
                select: {
                  id: true,
                },
              },
            },
          });
          for (const artist of sloop.artists) {
            await ctx.prisma.rankedArtist.create({
              data: { artistId: artist.id },
            });
          }
          await ctx.prisma.rankedSloop.create({ data: { sloopId: sloop.id } });
          return sloop.id;
        });
        return id;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could Not Create Sloop",
        });
      }
    }),

  update: protectedProcedure
    .input(updateSloopInput)
    .mutation(async ({ input, ctx }) => {
      try {
        const sloop = await ctx.prisma.sloop.update({
          where: { id: input.id, userId: ctx.session.user.id },
          data: {
            ...input,
            loops: input.loops as Prisma.JsonArray,
          },
        });
        return sloop;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Sloop Not Found",
        });
      }
    }),

  getTrendingSloops: publicProcedure
    .input(
      z.object({
        limit: z.number(),
        cursor: z.string().optional(),
        skip: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const sloops = await ctx.prisma.rankedSloop.findMany({
          where: { sloop: { isPrivate: false } },
          orderBy: { rank: "desc" },
          include: {
            sloop: {
              include: {
                _count: {
                  select: { likes: true },
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
          message: "Could Not Get Trending Sloops",
        });
      }
    }),

  getTrendingArtists: publicProcedure
    .input(
      z.object({
        limit: z.number(),
        cursor: z.string().optional(),
        skip: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const artists = await ctx.prisma.rankedArtist.findMany({
          orderBy: { rank: "desc" },
          include: {
            artist: true,
          },
          skip: input.skip,
          take: input.limit + 1,
          cursor: input.cursor ? { artistId: input.cursor } : undefined,
        });
        let next: typeof input.cursor = undefined;
        if (artists.length > input.limit) {
          next = artists.pop()?.artistId;
        }
        return {
          next: next,
          items: artists,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could Not Get Trending Artists",
        });
      }
    }),

  getFavouriteSloops: publicProcedure
    .input(
      z.object({
        limit: z.number(),
        cursor: z.string().optional(),
        skip: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const sloops = await ctx.prisma.rankedSloop.findMany({
          where: { sloop: { isPrivate: false } },
          orderBy: { likeRank: "desc" },
          include: {
            sloop: {
              include: {
                _count: {
                  select: { likes: true },
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
          message: "Could Not Get Favourite Sloops",
        });
      }
    }),

  getFavouriteArtists: publicProcedure
    .input(
      z.object({
        limit: z.number(),
        cursor: z.string().optional(),
        skip: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const artists = await ctx.prisma.rankedArtist.findMany({
          orderBy: { likeRank: "desc" },
          include: {
            artist: true,
          },
          skip: input.skip,
          take: input.limit + 1,
          cursor: input.cursor ? { artistId: input.cursor } : undefined,
        });
        let next: typeof input.cursor = undefined;
        if (artists.length > input.limit) {
          next = artists.pop()?.artistId;
        }
        return {
          next: next,
          items: artists,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could Not Get Trending Artists",
        });
      }
    }),

  getMostRecent: publicProcedure
    .input(
      z.object({
        limit: z.number(),
        cursor: z.string().optional(),
        skip: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const sloops = await ctx.prisma.sloop.findMany({
          where: { isPrivate: false },
          orderBy: { createdAt: "desc" },
          include: {
            _count: {
              select: { likes: true },
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
          message: "Could Not Get Most Recent Sloops",
        });
      }
    }),

  getMostLiked: publicProcedure
    .input(
      z.object({
        limit: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const sloops = await ctx.prisma.sloop.findMany({
          where: { isPrivate: false },
          orderBy: { likes: { _count: "desc" } },
          include: {
            _count: {
              select: { likes: true },
            },
          },
          take: input.limit ?? 50,
        });
        return sloops;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could Not Get Most Liked Sloops",
        });
      }
    }),

  getMostPlayed: publicProcedure
    .input(
      z.object({
        limit: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const sloops = await ctx.prisma.sloop.findMany({
          where: { isPrivate: false },
          orderBy: { plays: { _count: "desc" } },
          include: {
            _count: {
              select: { likes: true },
            },
          },
          take: input.limit ?? 50,
        });
        return sloops;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could Not Get Most Played Sloops",
        });
      }
    }),

  get: publicProcedure
    .input(
      z.object({
        id: z.string(),
        getPrivate: z.boolean().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const sloop = await ctx.prisma.sloop.findUnique({
          where: { id: input.id, isPrivate: !!input.getPrivate },
          include: {
            _count: {
              select: { likes: true, plays: true },
            },
            likes: { where: { userId: ctx.session?.user.id } },
            plays: { where: { userId: ctx.session?.user.id } },
          },
        });
        return sloop;
      } catch (error) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Sloop Not Found",
        });
      }
    }),

  getUserSloop: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const sloop = await ctx.prisma.sloop.findUnique({
          where: { id: input.id, userId: ctx.session.user.id },
          include: {
            _count: {
              select: { likes: true, plays: true },
            },
          },
        });
        return sloop;
      } catch (error) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Sloop Not Found",
        });
      }
    }),

  getTrackSloops: publicProcedure
    .input(
      z.object({
        limit: z.number(),
        cursor: z.string().optional(),
        skip: z.number().optional(),
        id: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const sloops = await ctx.prisma.sloop.findMany({
          where: { trackId: input.id, isPrivate: false },
          include: {
            _count: {
              select: { likes: true },
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
          message: "Could Not Fetch Sloops",
        });
      }
    }),

  createOrUpdatePlay: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const response = await ctx.prisma.play.upsert({
          where: {
            sloopId_userId: { userId: ctx.session.user.id, sloopId: input.id },
          },
          update: { sloopId: input.id },
          create: { userId: ctx.session.user.id, sloopId: input.id },
          include: {
            sloop: {
              select: { artists: { select: { id: true } } },
            },
          },
        });
        const p = kafka.producer();
        await p.produce(TRENDING_TOPIC, response);
        return;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable To Create or Update Play",
        });
      }
    }),

  like: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const like = await ctx.prisma.like.create({
          data: { userId: ctx.session.user.id, sloopId: input.id },
        });
        return like;
      } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === "P2002") {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Already Liked Sloop",
            });
          }
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable To Like Sloop",
        });
      }
    }),

  unlike: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await ctx.prisma.like.delete({
          where: {
            sloopId_userId: {
              sloopId: input.id,
              userId: ctx.session.user.id,
            },
          },
        });
      } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === "P2002") {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Sloop Not Liked",
            });
          }
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable To Unlike Sloop",
        });
      }
    }),
});
