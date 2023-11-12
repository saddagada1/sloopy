import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider, { type GoogleProfile } from "next-auth/providers/google";
import FacebookProvider, {
  type FacebookProfile,
} from "next-auth/providers/facebook";
import argon2 from "argon2";
import { env } from "~/env.mjs";
import { prisma } from "~/server/db";
import { calcUsername } from "~/utils/calc";
import { TRPCError } from "@trpc/server";
import { type DefaultJWT } from "next-auth/jwt";
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

  interface Token extends DefaultJWT {
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
    // linkedAccounts: LinkedAccount[];
    // spotifyLinked: boolean;
    // canPlaySpotify: boolean;
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
export const authOptions: NextAuthOptions = {
  callbacks: {
    jwt: async ({ token, user, account, trigger }) => {
      if (trigger === "update") {
        const update = await prisma.user.findUnique({
          where: { id: token.id as string },
        });
        if (!update) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User Not Found",
          });
        }
        const linkedAccounts = await prisma.linkedAccount.findMany({
          where: { userId: user.id },
        });
        (token.bio = update.bio),
          (token.username = update.username),
          (token.verified = update.verified),
          (token.linkedAccounts = linkedAccounts),
          (token.spotifyLinked = linkedAccounts.find(
            (account) => account.provider === "spotify"
          )
            ? true
            : false),
          (token.canPlaySpotify = linkedAccounts.find(
            (account) =>
              account.provider === "spotify" && account.isPremium === true
          )
            ? true
            : false);
      }
      if (account) {
        const linkedAccounts = await prisma.linkedAccount.findMany({
          where: { userId: user.id },
        });
        token.id = user.id;
        (token.bio = user.bio),
          (token.username = user.username),
          (token.verified = user.verified);
        (token.linkedAccounts = linkedAccounts),
          (token.spotifyLinked = linkedAccounts.find(
            (account) => account.provider === "spotify"
          )
            ? true
            : false),
          (token.canPlaySpotify = linkedAccounts.find(
            (account) =>
              account.provider === "spotify" && account.isPremium === true
          )
            ? true
            : false);
      }
      return token;
    },
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.id,
        bio: token.bio,
        username: token.username,
        verified: token.verified,
        linkedAccounts: token.linkedAccounts,
        spotifyLinked: token.spotifyLinked,
        canPlaySpotify: token.canPlaySpotify,
      },
    }),
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
    verifyRequest: "/login",
    newUser: "/login",
  },
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60 * 30,
    updateAge: 24 * 60 * 60,
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
          username: calcUsername(profile.email),
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
          username: calcUsername(profile.email as string),
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

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
