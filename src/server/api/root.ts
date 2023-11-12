import { spotifyRouter } from "~/server/api/routers/spotify";
import { createTRPCRouter } from "~/server/api/trpc";
import { credentialsRouter } from "~/server/api/routers/credentials";
import { sloopsRouter } from "~/server/api/routers/sloops";
import { usersRouter } from "./routers/users";
import { searchRouter } from "./routers/search";
import { artistsRouter } from "./routers/artists";
import { tracksRouter } from "./routers/tracks";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  credentials: credentialsRouter,
  spotify: spotifyRouter,
  sloops: sloopsRouter,
  artists: artistsRouter,
  tracks: tracksRouter,
  users: usersRouter,
  search: searchRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
