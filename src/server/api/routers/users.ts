import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import argon2 from "argon2";
import { TRPCError } from "@trpc/server";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import {
  sendAccountVerificationEmail,
  sendForgotPasswordEmail,
} from "~/utils/resend";
import { v4 } from "uuid";
import { FORGOT_PASSWORD_PREFIX, VERIFY_EMAIL_PREFIX } from "~/utils/constants";
import { redis } from "~/utils/upstash";
import { deleteObject, uploadObject } from "~/utils/s3";

export const usersRouter = createTRPCRouter({
  getSessionUser: protectedProcedure.query(async ({ ctx }) => {
    try {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.session.user.id },
        select: {
          name: true,
          email: true,
          image: true,
          username: true,
          bio: true,
          verified: true,
          sloopsCount: true,
          followersCount: true,
          followingCount: true,
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
    .input(
      z.object({
        username: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const user = await ctx.prisma.user.findUnique({
          where: { username: input.username },
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
            bio: true,
            sloopsCount: true,
            followersCount: true,
            followingCount: true,
            followers: {
              where: { followerId: ctx.session?.user.id },
              select: { followerId: true, followedId: true },
            },
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

  getLikes: protectedProcedure
    .input(
      z.object({
        limit: z.number(),
        cursor: z.string().optional(),
        skip: z.number().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const likes = await ctx.prisma.like.findMany({
          where: { userId: ctx.session.user.id },
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
          orderBy: {
            createdAt: "desc",
          },
        });
        let next: typeof input.cursor = undefined;
        if (likes.length > input.limit) {
          next = likes.pop()?.id;
        }
        return {
          next: next,
          items: likes,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could Not Get Likes",
        });
      }
    }),

  getFollowers: protectedProcedure
    .input(
      z.object({
        limit: z.number(),
        cursor: z.string().optional(),
        skip: z.number().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const followers = await ctx.prisma.follow.findMany({
          where: { followedId: ctx.session.user.id },
          include: {
            follower: { select: { name: true, image: true, username: true } },
          },
          skip: input.skip,
          take: input.limit + 1,
          cursor: input.cursor ? { id: input.cursor } : undefined,
          orderBy: {
            createdAt: "desc",
          },
        });
        let next: typeof input.cursor = undefined;
        if (followers.length > input.limit) {
          next = followers.pop()?.id;
        }
        return {
          next: next,
          items: followers,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could Not Get Followers",
        });
      }
    }),

  getFollowing: protectedProcedure
    .input(
      z.object({
        limit: z.number(),
        cursor: z.string().optional(),
        skip: z.number().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const following = await ctx.prisma.follow.findMany({
          where: { followerId: ctx.session.user.id },
          include: {
            followed: { select: { name: true, image: true, username: true } },
          },
          skip: input.skip,
          take: input.limit + 1,
          cursor: input.cursor ? { id: input.cursor } : undefined,
          orderBy: {
            createdAt: "desc",
          },
        });
        let next: typeof input.cursor = undefined;
        if (following.length > input.limit) {
          next = following.pop()?.id;
        }
        return {
          next: next,
          items: following,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could Not Get Following",
        });
      }
    }),

  getUserLikes: publicProcedure
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
        const likes = await ctx.prisma.like.findMany({
          where: { user: { username: input.username } },
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
          orderBy: {
            createdAt: "desc",
          },
        });
        let next: typeof input.cursor = undefined;
        if (likes.length > input.limit) {
          next = likes.pop()?.id;
        }
        return {
          next: next,
          items: likes,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could Not Get User Likes",
        });
      }
    }),

  getUserFollowers: publicProcedure
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
        const followers = await ctx.prisma.follow.findMany({
          where: { followed: { username: input.username } },
          include: {
            follower: { select: { name: true, image: true, username: true } },
          },
          skip: input.skip,
          take: input.limit + 1,
          cursor: input.cursor ? { id: input.cursor } : undefined,
          orderBy: {
            createdAt: "desc",
          },
        });
        let next: typeof input.cursor = undefined;
        if (followers.length > input.limit) {
          next = followers.pop()?.id;
        }
        return {
          next: next,
          items: followers,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could Not Get User Followers",
        });
      }
    }),

  getUserFollowing: publicProcedure
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
        const following = await ctx.prisma.follow.findMany({
          where: { follower: { username: input.username } },
          include: {
            followed: { select: { name: true, image: true, username: true } },
          },
          skip: input.skip,
          take: input.limit + 1,
          cursor: input.cursor ? { id: input.cursor } : undefined,
          orderBy: {
            createdAt: "desc",
          },
        });
        let next: typeof input.cursor = undefined;
        if (following.length > input.limit) {
          next = following.pop()?.id;
        }
        return {
          next: next,
          items: following,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could Not Get User Following",
        });
      }
    }),

  sendVerificationEmail: protectedProcedure.mutation(async ({ ctx }) => {
    const token = v4();
    await redis.set(VERIFY_EMAIL_PREFIX + token, ctx.session.user.id, {
      ex: 1000 * 60 * 60 * 24,
    });
    try {
      await sendAccountVerificationEmail(
        ctx.session.user.name ?? ctx.session.user.username,
        ctx.session.user.email,
        token
      );
    } catch (error) {
      await redis.del(VERIFY_EMAIL_PREFIX + token);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Could Not Send Verification Email",
      });
    }
  }),

  verifyAccount: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const key = VERIFY_EMAIL_PREFIX + input.token;
      const id = await redis.get<string>(key);

      if (!id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Link Expired Or Invalid",
        });
      }

      try {
        await ctx.prisma.user.update({
          where: { id: id },
          data: { verified: true },
        });
        await redis.del(key);
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could Not Verify Account",
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
          error: {
            field: "email",
            message: "Email In Use",
          },
        };
      }

      try {
        const user = await ctx.prisma.user.update({
          where: { id: ctx.session.user.id },
          data: { email: input.email },
        });
        user.password = null;
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
          error: {
            field: "username",
            message: "Username In Use",
          },
        };
      }

      try {
        const user = await ctx.prisma.user.update({
          where: { id: ctx.session.user.id },
          data: { username: input.username },
        });
        user.password = null;
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
        user.password = null;
        return user;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could Not Update Password",
        });
      }
    }),

  forgotPassword: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });
      if (!user) {
        return;
      }

      const token = v4();
      await redis.set(FORGOT_PASSWORD_PREFIX + token, user.id, {
        ex: 1000 * 60 * 60 * 24,
      });

      try {
        await sendForgotPasswordEmail(
          user.name ?? user.username,
          user.email,
          token
        );
        return;
      } catch (error) {
        await redis.del(FORGOT_PASSWORD_PREFIX + token);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could Not Send Password Reset Email",
        });
      }
    }),

  resetPassword: publicProcedure
    .input(z.object({ token: z.string(), password: z.string().min(8) }))
    .mutation(async ({ input, ctx }) => {
      const key = FORGOT_PASSWORD_PREFIX + input.token;
      const id = await redis.get<string>(key);

      if (!id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Link Expired Or Invalid",
        });
      }

      const hashedPassword = await argon2.hash(input.password);

      try {
        const user = await ctx.prisma.user.update({
          where: { id: id },
          data: { password: hashedPassword },
        });
        await redis.del(key);
        user.password = null;
        try {
          await ctx.prisma.session.deleteMany({ where: { userId: id } });
          return user;
        } catch (error) {
          return user;
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could Not Reset Password",
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
        user.password = null;
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
        user.password = null;
        return user;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could Not Update Name",
        });
      }
    }),

  changeImage: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      let image: string;
      if (ctx.session.user.image) {
        image = ctx.session.user.image;
      } else {
        image = v4();
      }
      await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: { image: image },
      });
      const url = await uploadObject(image);
      return { url, image };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Could Not Update Profile Image",
      });
    }
  }),

  deleteImage: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      if (!ctx.session.user.image) {
        throw "No Image";
      }
      await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: { image: null },
      });
      await deleteObject(ctx.session.user.image);
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Could Not Delete Profile Image",
      });
    }
  }),

  follow: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const follow = await ctx.prisma.$transaction(async () => {
          const response = await ctx.prisma.follow.create({
            data: { followerId: ctx.session.user.id, followedId: input.id },
          });
          await ctx.prisma.user.update({
            where: { id: ctx.session.user.id },
            data: {
              followingCount: { increment: 1 },
            },
          });
          await ctx.prisma.user.update({
            where: { id: input.id },
            data: {
              followersCount: { increment: 1 },
            },
          });
          return response;
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
        await ctx.prisma.$transaction(async () => {
          await ctx.prisma.follow.delete({
            where: {
              followedId_followerId: {
                followedId: input.id,
                followerId: ctx.session.user.id,
              },
            },
          });
          await ctx.prisma.user.update({
            where: { id: ctx.session.user.id },
            data: {
              followingCount: { decrement: 1 },
            },
          });
          await ctx.prisma.user.update({
            where: { id: input.id },
            data: {
              followersCount: { decrement: 1 },
            },
          });
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
