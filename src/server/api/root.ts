import { spotifyRouter } from "~/server/api/routers/spotify";
import { createTRPCRouter } from "~/server/api/trpc";
import { credentialsRouter } from "~/server/api/routers/credentials";
import { sloopsRouter } from "~/server/api/routers/sloops";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  credentials: credentialsRouter,
  spotify: spotifyRouter,
  sloops: sloopsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
