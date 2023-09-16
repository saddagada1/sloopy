import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import argon2 from "argon2";
import { TRPCError } from "@trpc/server";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export const usersRouter = createTRPCRouter({
  getSessionUser: protectedProcedure.query(async ({ ctx }) => {
    try {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        include: {
          sloops: { include: { likes: true } },
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

  changeEmail: protectedProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input, ctx }) => {
      const duplicate = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });

      if (duplicate) {
        return {
          errors: [
            {
              field: "email",
              message: "Email In Use",
            },
          ],
        };
      }

      try {
        const user = await ctx.prisma.user.update({
          where: { id: ctx.session.user.id },
          data: { email: input.email },
        });
        return { user };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could Not Update Email",
        });
      }
    }),

  changeUsername: protectedProcedure
    .input(
      z.object({
        username: z
          .string()
          .min(3)
          .max(20)
          .regex(/^[A-Za-z0-9]*$/),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const duplicate = await ctx.prisma.user.findUnique({
        where: { username: input.username },
      });

      if (duplicate) {
        return {
          errors: [
            {
              field: "username",
              message: "Username In Use",
            },
          ],
        };
      }

      try {
        const user = await ctx.prisma.user.update({
          where: { id: ctx.session.user.id },
          data: { username: input.username },
        });
        return { user };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could Not Update Username",
        });
      }
    }),

  changePassword: protectedProcedure
    .input(z.object({ password: z.string().min(8) }))
    .mutation(async ({ input, ctx }) => {
      const hashedPassword = await argon2.hash(input.password);
      try {
        const user = await ctx.prisma.user.update({
          where: { id: ctx.session.user.id },
          data: { password: hashedPassword },
        });
        return user;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could Not Update Password",
        });
      }
    }),

  changeName: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const user = await ctx.prisma.user.update({
          where: { id: ctx.session.user.id },
          data: { name: input.name },
        });
        return user;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could Not Update Name",
        });
      }
    }),

  changeBio: protectedProcedure
    .input(z.object({ bio: z.string().max(500) }))
    .mutation(async ({ input, ctx }) => {
      try {
        const user = await ctx.prisma.user.update({
          where: { id: ctx.session.user.id },
          data: { bio: input.bio },
        });
        return user;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could Not Update Name",
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
