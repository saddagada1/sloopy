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
import { LOVED_TOPIC, TRENDING_TOPIC } from "~/utils/constants";

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
  type: z.string(),
  name: z.string(),
  description: z.string().max(500),
  trackId: z.string(),
  trackName: z.string(),
  trackImage: z.string().optional(),
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
      if (!ctx.session.user.verified) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Please Verify Your Account To Proceed",
        });
      }
      try {
        const { trackId, trackName, trackImage, ...sloopInput } = input;
        const id = await ctx.prisma.$transaction(async () => {
          const artists = await Promise.all(
            sloopInput.artists.map(
              async (artist) =>
                await ctx.prisma.artist.upsert({
                  where: {
                    id: artist.spotifyId,
                  },
                  update: {},
                  create: {
                    id: artist.spotifyId,
                    type: sloopInput.type,
                    image: artist.image,
                    name: artist.name,
                  },
                })
            )
          );
          for (const artist of artists) {
            await ctx.prisma.rankedArtist.upsert({
              where: {
                artistId: artist.id,
              },
              update: {},
              create: { artistId: artist.id },
            });
          }
          await ctx.prisma.track.upsert({
            where: {
              id: trackId,
            },
            update: {},
            create: {
              id: trackId,
              type: sloopInput.type,
              name: trackName,
              image: trackImage,
              artists: { connect: artists },
            },
          });
          await ctx.prisma.rankedTrack.upsert({
            where: {
              trackId: trackId,
            },
            update: {},
            create: {
              trackId: trackId,
            },
          });
          const sloop = await ctx.prisma.sloop.create({
            data: {
              ...sloopInput,
              userId: ctx.session.user.id,
              userUsername: ctx.session.user.username,
              trackId: trackId,
              artists: {
                connect: artists,
              },
              loops: [],
            },
          });
          await ctx.prisma.rankedSloop.create({ data: { sloopId: sloop.id } });
          await ctx.prisma.user.update({
            where: { id: ctx.session.user.id },
            data: {
              sloopsCount: { increment: 1 },
            },
          });
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

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const sloop = await ctx.prisma.$transaction(async () => {
          const response = await ctx.prisma.sloop.delete({
            where: { id: input.id, userId: ctx.session.user.id },
          });
          await ctx.prisma.user.update({
            where: { id: ctx.session.user.id },
            data: {
              sloopsCount: { decrement: 1 },
            },
          });
          return response;
        });
        return sloop;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could Not Delete Sloop",
        });
      }
    }),

  getRecentlyPlayedSloops: protectedProcedure
    .input(
      z.object({
        limit: z.number(),
        cursor: z.string().optional(),
        skip: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const plays = await ctx.prisma.play.findMany({
          where: { userId: ctx.session.user.id },
          orderBy: { updatedAt: "desc" },
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
          cursor: input.cursor ? { id: input.cursor } : undefined,
        });
        let next: typeof input.cursor = undefined;
        if (plays.length > input.limit) {
          next = plays.pop()?.id;
        }
        return {
          next: next,
          items: plays,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could Not Get Recently Played Sloops",
        });
      }
    }),

  getFavouriteSloops: protectedProcedure
    .input(
      z.object({
        limit: z.number(),
        cursor: z.string().optional(),
        skip: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const plays = await ctx.prisma.play.findMany({
          where: { userId: ctx.session.user.id },
          orderBy: { count: "desc" },
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
          cursor: input.cursor ? { id: input.cursor } : undefined,
        });
        let next: typeof input.cursor = undefined;
        if (plays.length > input.limit) {
          next = plays.pop()?.id;
        }
        return {
          next: next,
          items: plays,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could Not Get Favourite Sloops",
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
          message: "Could Not Get Trending Sloops",
        });
      }
    }),

  getTrendingTracks: publicProcedure
    .input(
      z.object({
        limit: z.number(),
        cursor: z.string().optional(),
        skip: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const tracks = await ctx.prisma.rankedTrack.findMany({
          orderBy: { rank: "desc" },
          include: {
            track: {
              include: {
                artists: {
                  select: {
                    name: true,
                  },
                },
              },
            },
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
          message: "Could Not Get Trending Tracks",
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

  getLovedSloops: publicProcedure
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
          message: "Could Not Get Loved Sloops",
        });
      }
    }),

  getLovedTracks: publicProcedure
    .input(
      z.object({
        limit: z.number(),
        cursor: z.string().optional(),
        skip: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const tracks = await ctx.prisma.rankedTrack.findMany({
          orderBy: { likeRank: "desc" },
          include: {
            track: {
              include: {
                artists: {
                  select: {
                    name: true,
                  },
                },
              },
            },
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
          message: "Could Not Get Loved Tracks",
        });
      }
    }),

  getLovedArtists: publicProcedure
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
          message: "Could Not Get Loved Artists",
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
          message: "Could Not Get Most Recent Sloops",
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
          where: {
            id: input.id,
            userId: input.getPrivate ? ctx.session?.user.id : undefined,
            isPrivate: !!input.getPrivate,
          },
          include: {
            rankedSloop: {
              select: { likes: true, plays: true },
            },
            artists: {
              select: {
                id: true,
                name: true,
              },
            },
            track: true,
            likes: {
              where: { userId: ctx.session?.user.id },
              select: { userId: true, sloopId: true },
            },
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

  getSloops: protectedProcedure
    .input(
      z.object({
        limit: z.number(),
        cursor: z.string().optional(),
        skip: z.number().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const sloops = await ctx.prisma.sloop.findMany({
          where: { userId: ctx.session.user.id },
          include: {
            rankedSloop: {
              select: { likes: true, plays: true },
            },
            artists: {
              select: {
                id: true,
                name: true,
              },
            },
            track: {
              select: { name: true },
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
          code: "NOT_FOUND",
          message: "Could Not Get User Sloops",
        });
      }
    }),

  getUserSloops: publicProcedure
    .input(
      z.object({
        limit: z.number(),
        cursor: z.string().optional(),
        skip: z.number().optional(),
        username: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const sloops = await ctx.prisma.sloop.findMany({
          where: { userUsername: input.username, isPrivate: false },
          include: {
            rankedSloop: {
              select: { likes: true, plays: true },
            },
            artists: {
              select: {
                id: true,
                name: true,
              },
            },
            track: {
              select: { name: true },
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
          code: "NOT_FOUND",
          message: "Could Not Get User Sloops",
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
        const play = await ctx.prisma.$transaction(async () => {
          const response = await ctx.prisma.play.upsert({
            where: {
              sloopId_userId: {
                userId: ctx.session.user.id,
                sloopId: input.id,
              },
            },
            update: { count: { increment: 1 } }, // play count for session user
            create: { userId: ctx.session.user.id, sloopId: input.id },
            include: {
              sloop: {
                select: {
                  artists: { select: { id: true } },
                  track: { select: { id: true } },
                },
              },
            },
          });
          if (!(response.updatedAt > response.createdAt)) {
            await ctx.prisma.rankedSloop.update({
              where: { sloopId: input.id },
              data: {
                plays: {
                  increment: 1,
                },
              },
            });
          }
          return response;
        });
        const p = kafka.producer();
        await p.produce(TRENDING_TOPIC, play);
        return play;
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
        const like = await ctx.prisma.$transaction(async () => {
          const response = await ctx.prisma.like.create({
            data: { userId: ctx.session.user.id, sloopId: input.id },
            include: {
              sloop: {
                select: {
                  artists: { select: { id: true } },
                  track: { select: { id: true } },
                },
              },
            },
          });
          await ctx.prisma.rankedSloop.update({
            where: { sloopId: input.id },
            data: {
              likes: { increment: 1 },
            },
          });
          return response;
        });
        const p = kafka.producer();
        await p.produce(LOVED_TOPIC, like);
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
        await ctx.prisma.$transaction(async () => {
          await ctx.prisma.like.delete({
            where: {
              sloopId_userId: {
                sloopId: input.id,
                userId: ctx.session.user.id,
              },
            },
          });
          await ctx.prisma.rankedSloop.update({
            where: { sloopId: input.id },
            data: {
              likes: { decrement: 1 },
            },
          });
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
