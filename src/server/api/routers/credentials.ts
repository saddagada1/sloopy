import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import argon2 from "argon2";
import { type User } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export const credentialsRouter = createTRPCRouter({
  register: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string().min(8) }))
    .mutation(async ({ input, ctx }) => {
      const hashedPassword = await argon2.hash(input.password);

      let user: User | null = null;
      try {
        user = await ctx.prisma.user.create({
          data: {
            email: input.email,
            username:
              input.email.split("@")[0]?.slice(0, 5) +
                Math.random().toString(36).slice(2, 10) ??
              Math.random().toString(36).slice(0, 13),
            password: hashedPassword,
          },
        });
      } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === "P2002") {
            return {
              errors: [
                {
                  field: "email",
                  message: `Email in Use`,
                },
              ],
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

      user.password = "";

      return {
        user,
      };
    }),
});
