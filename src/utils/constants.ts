import { env } from "~/env.mjs";

export const timeSignature: Record<number, string> = {
  3: "3/4",
  4: "4/4",
  5: "5/4",
  6: "6/4",
  7: "7/4",
};

export const mode: Record<number, string> = {
  0: "Minor",
  1: "Major",
};

export const pitchClass: Record<number, string> = {
  0: "C",
  1: "C#",
  2: "D",
  3: "D#",
  4: "E",
  5: "F",
  6: "F#",
  7: "G",
  8: "G#",
  9: "A",
  10: "A#",
  11: "B",
};

export const pitchClassColours: Record<number, string> = {
  0: "#ef4444",
  1: "#f97316",
  2: "#eab308",
  3: "#84cc16",
  4: "#22c55e",
  5: "#14b8a6",
  6: "#06b6d4",
  7: "#3b82f6",
  8: "#8b5cf6",
  9: "#d946ef",
  10: "#ec4899",
  11: "#f43f5e",
};

export const spotifyScopes = `user-read-email user-read-private user-library-read user-library-modify 
user-read-recently-played user-top-read playlist-read-private playlist-read-collaborative 
playlist-modify-private playlist-modify-public user-follow-read user-follow-modify user-read-playback-state 
user-modify-playback-state user-read-currently-playing streaming`;

export const genericSpotifyError = {
  ok: false,
  message: "Failed To Query Spotify Api",
  status: 500,
};

export const CHORDS_OBJECT_NAME = "chords.json";

export const SLOOPY_HERO_OBJECT_NAME = "sloopy-hero.mp4";

export const FORGOT_PASSWORD_PREFIX = "forgot-password:";

export const VERIFY_EMAIL_PREFIX = "verify-email:";

export const TRENDING_TOPIC = "update-ranks";

export const LOVED_TOPIC = "update-like-ranks";

export const paginationLimit = 50;

export const lgBreakpoint = 1024;

export const lgCardSize = 150;

export const smCardSize = 100;

export const alwaysRefetch = {
  refetchOnWindowFocus: true,
  refetchOnMount: true,
  refetchOnReconnect: true,
  staleTime: 1000 * 60 * 5,
};

export const domain =
  env.NEXT_PUBLIC_CLIENT_ENV === "production"
    ? `https://${env.NEXT_PUBLIC_PRODUCTION_URL}`
    : "http://localhost:3000";
