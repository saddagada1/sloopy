import { spotifyRouter } from "~/server/api/routers/spotify";
import { createTRPCRouter } from "~/server/api/trpc";
import { credentialsRouter } from "./routers/credentials";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  credentials: credentialsRouter,
  spotify: spotifyRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
