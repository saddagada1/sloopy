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
  notes: z.string(),
});

const createSloopInput = z.object({
  name: z.string().max(20),
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
  name: z.string().max(20),
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
        if (error instanceof PrismaClientKnownRequestError) {
          console.log(error);
          // if (error.code === "P2002") {
          //   return {
          //     errors: [
          //       {
          //         field: "email",
          //         message: `Email in Use`,
          //       },
          //     ],
          //   };
          // }
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Sloop Not Found",
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
        });
        return sloop;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Sloop Not Found",
        });
      }
    }),

  getUserSloops: protectedProcedure.query(async ({ ctx }) => {
    try {
      const sloops = await ctx.prisma.sloop.findMany({
        where: { userId: ctx.session.user.id },
      });
      return sloops;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Could Not Fetch Sloops",
      });
    }
  }),
});
