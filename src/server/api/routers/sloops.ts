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

const createSloopInput = z.object({
  name: z.string(),
  description: z.string().max(500),
  trackId: z.string(),
  trackName: z.string(),
  artists: z.array(z.string()),
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
  trackId: z.string(),
  trackName: z.string(),
  artists: z.array(z.string()),
  duration: z.number(),
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
        const sloop = await ctx.prisma.sloop.create({
          data: {
            ...input,
            userId: ctx.session.user.id,
            userUsername: ctx.session.user.username,
            artists: input.artists as Prisma.JsonArray,
            loops: [],
          },
        });
        return sloop;
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
            artists: input.artists as Prisma.JsonArray,
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

  getAll: publicProcedure.query(async ({ ctx }) => {
    try {
      const sloops = await ctx.prisma.sloop.findMany({
        orderBy: { createdAt: "desc" },
        include: { likes: true },
      });
      return sloops;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Could Not Get Sloops",
      });
    }
  }),

  get: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const sloop = await ctx.prisma.sloop.findUnique({
          where: { id: input.id },
          include: { likes: true },
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
        });
        return sloop;
      } catch (error) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Sloop Not Found",
        });
      }
    }),

  getUserSloops: protectedProcedure.query(async ({ ctx }) => {
    try {
      const sloops = await ctx.prisma.sloop.findMany({
        where: { userId: ctx.session.user.id },
        include: { likes: true },
      });
      return sloops;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Could Not Fetch Sloops",
      });
    }
  }),

  getTrackSloops: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const sloops = await ctx.prisma.sloop.findMany({
          where: { trackId: input.id },
          include: { likes: true },
        });
        return sloops;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could Not Fetch Sloops",
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

  search: publicProcedure
    .input(
      z.object({
        query: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const sloops = await ctx.prisma.sloop.findMany({
          where: {
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
          include: { likes: true },
        });
        return sloops;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could Not Search Sloops",
        });
      }
    }),
});
