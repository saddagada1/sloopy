import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type NextApiRequest, type NextApiResponse } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import GoogleProvider, { type GoogleProfile } from "next-auth/providers/google";
import FacebookProvider, {
  type FacebookProfile,
} from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import { env } from "~/env.mjs";
import { prisma } from "~/server/db";
import { TRPCError } from "@trpc/server";
import argon2 from "argon2";
import Cookies from "cookies";
import { randomUUID } from "crypto";
import { encode, decode } from "next-auth/jwt";
import { type LinkedAccount } from "@prisma/client";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string;
      email: string;
      username: string;
      verified: boolean;
      linkedAccounts: LinkedAccount[];
      spotifyLinked: boolean;
      canPlaySpotify: boolean;
      bio: string | null;
      // ...other properties
      // role: UserRole;
    };
  }

  interface User {
    username: string;
    verified: boolean;
    bio: string | null;
    // ...other properties
    // role: UserRole;
  }
}

interface GoogleExtendedProfile extends GoogleProfile {
  verified: boolean;
}

interface FacebookExtendedProfile extends FacebookProfile {
  verified: boolean;
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions = (
  req: NextApiRequest,
  res: NextApiResponse
): NextAuthOptions => {
  return {
    debug: true,
    callbacks: {
      signIn: async ({ user }) => {
        if (
          req.query.nextauth!.includes("callback") &&
          req.query.nextauth!.includes("credentials") &&
          req.method === "POST"
        ) {
          if (user) {
            const sessionToken = randomUUID();
            const sessionExpiry = new Date(
              Date.now() + 60 * 60 * 24 * 30 * 1000
            ); // 30 days

            await prisma.session.create({
              data: {
                sessionToken: sessionToken,
                userId: user.id,
                expires: sessionExpiry,
              },
            });

            const cookies = new Cookies(req, res);

            cookies.set(
              env.NODE_ENV === "production"
                ? "__Secure-next-auth.session-token"
                : "next-auth.session-token",
              sessionToken,
              {
                expires: sessionExpiry,
              }
            );
          }
        }

        return true;
      },
      session: async ({ session, user }) => {
        const linkedAccounts = await prisma.linkedAccount.findMany({
          where: { userId: user.id },
        });
        return {
          ...session,
          user: {
            ...session.user,
            id: user.id,
            email: user.email,
            verified: user.verified,
            username: user.username,
            bio: user.bio,
            linkedAccounts: linkedAccounts,
            spotifyLinked: linkedAccounts.find(
              (account) => account.provider === "spotify"
            )
              ? true
              : false,
            canPlaySpotify: linkedAccounts.find(
              (account) =>
                account.provider === "spotify" && account.isPremium === true
            )
              ? true
              : false,
          },
        };
      },
    },
    adapter: PrismaAdapter(prisma),
    session: {
      strategy: "database",
      maxAge: 24 * 60 * 60 * 30,
      updateAge: 24 * 60 * 60,
    },
    jwt: {
      maxAge: 24 * 60 * 60 * 30,
      encode: async ({ token, secret, maxAge }) => {
        if (
          req.query.nextauth!.includes("callback") &&
          req.query.nextauth!.includes("credentials") &&
          req.method === "POST"
        ) {
          const cookies = new Cookies(req, res);
          const cookie = cookies.get(
            env.NODE_ENV === "production"
              ? "__Secure-next-auth.session-token"
              : "next-auth.session-token"
          );

          if (cookie) {
            return cookie;
          }
          return "";
        }

        return encode({ token, secret, maxAge });
      },
      decode: async ({ token, secret }) => {
        if (
          req.query.nextauth!.includes("callback") &&
          req.query.nextauth!.includes("credentials") &&
          req.method === "POST"
        ) {
          return null;
        }
        return decode({ token, secret });
      },
    },
    providers: [
      CredentialsProvider({
        name: "Credentials",
        credentials: {
          email: {
            label: "Email",
            type: "text",
            placeholder: "sloopy@acme.ca",
          },
          password: {
            label: "Password",
            type: "password",
            placeholder: "password",
          },
        },
        async authorize(credentials) {
          if (!credentials) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "No Credentials",
            });
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Invalid Email or Password",
            });
          }

          if (!user.password) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Invalid Email or Password",
            });
          }

          const isValid = await argon2.verify(
            user.password,
            credentials.password
          );

          if (!isValid) {
            throw new TRPCError({
              code: "UNAUTHORIZED",
              message: "Invalid Email or Password",
            });
          }

          user.password = null;

          return user;
        },
      }),
      GoogleProvider({
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        profile: (profile: GoogleExtendedProfile) => {
          return {
            id: profile.sub,
            name: profile.name,
            bio: null,
            username:
              profile.email.split("@")[0]?.slice(0, 5) +
                Math.random().toString(36).slice(2, 10) ??
              profile.sub.slice(0, 13),
            email: profile.email,
            verified: true,
            image: null,
          };
        },
      }),
      FacebookProvider({
        clientId: env.FACEBOOK_CLIENT_ID,
        clientSecret: env.FACEBOOK_CLIENT_SECRET,
        profile: (profile: FacebookExtendedProfile) => {
          return {
            id: profile.id,
            name: profile.name as string,
            bio: null,
            username:
              (profile.email as string).split("@")[0]?.slice(0, 5) +
                Math.random().toString(36).slice(2, 10) ??
              profile.id.slice(0, 13),
            email: profile.email as string,
            verified: true,
            image: null,
          };
        },
      }),
      /**
       * ...add more providers here.
       *
       * Most other providers require a bit more work than the Discord provider. For example, the
       * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
       * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
       *
       * @see https://next-auth.js.org/providers/github
       */
    ],
  };
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: NextApiRequest;
  res: NextApiResponse;
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions(ctx.req, ctx.res));
};
