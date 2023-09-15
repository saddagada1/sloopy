import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export const usersRouter = createTRPCRouter({
  getSessionUser: protectedProcedure.query(async ({ ctx }) => {
    try {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        include: {
          sloops: true,
          followers: true,
          following: true,
          likes: true,
        },
      });
      return user;
    } catch (error) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User Not Found",
      });
    }
  }),

  getUserByUsername: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const user = await ctx.prisma.user.findUnique({
          where: { username: input.username },
          include: { sloops: true, followers: true, following: true },
        });
        return user;
      } catch (error) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User Not Found",
        });
      }
    }),

  follow: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const follow = await ctx.prisma.follow.create({
          data: { followerId: ctx.session.user.id, followedId: input.id },
        });
        return follow;
      } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === "P2002") {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Already Following User",
            });
          }
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable To Follow User",
        });
      }
    }),

  unfollow: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await ctx.prisma.follow.delete({
          where: {
            followedId_followerId: {
              followedId: input.id,
              followerId: ctx.session.user.id,
            },
          },
        });
      } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === "P2002") {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Not Following User",
            });
          }
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable To Unfollow User",
        });
      }
    }),
});
