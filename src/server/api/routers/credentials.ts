import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import argon2 from "argon2";
import { type User } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { v4 } from "uuid";
import { redis } from "~/utils/upstash";
import { VERIFY_EMAIL_PREFIX } from "~/utils/constants";
import { sendAccountVerificationEmail } from "~/utils/resend";
import { calcUsername } from "~/utils/calc";

export const credentialsRouter = createTRPCRouter({
  signUp: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string().min(8) }))
    .mutation(async ({ input, ctx }) => {
      const hashedPassword = await argon2.hash(input.password);

      let user: User | null = null;
      try {
        user = await ctx.prisma.user.create({
          data: {
            email: input.email,
            username: calcUsername(input.email),
            password: hashedPassword,
          },
        });
      } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === "P2002") {
            return {
              error: {
                field: "email",
                message: `Email in Use`,
              },
            };
          }
        }
      }

      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable To Create User",
        });
      }

      const account = await ctx.prisma.account.create({
        data: {
          userId: user.id,
          type: "credentials",
          provider: "credentials",
          providerAccountId: user.id,
        },
      });

      if (!account) {
        await ctx.prisma.user.delete({ where: { id: user.id } });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable To Link User To Account",
        });
      }

      const token = v4();
      await redis.set(VERIFY_EMAIL_PREFIX + token, user.id, {
        ex: 1000 * 60 * 60 * 24,
      });

      try {
        await sendAccountVerificationEmail(
          user.name ?? user.username,
          user.email,
          token
        );
      } catch (error) {
        await redis.del(VERIFY_EMAIL_PREFIX + token);
      }

      user.password = "";

      return {
        user,
      };
    }),
});
