import { env } from "~/env.mjs";

export const primaryColour = "#f2f2f2";
export const secondaryColour = "#151515";
export const accentColour = "#d1d5db";
export const darkAccentColour = "#d1d5db80";

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
  0: "#ff0000",
  1: "#ff5200",
  2: "#ffa500",
  3: "#ffd200",
  4: "#ffff00",
  5: "#66ff00",
  6: "#33ff80",
  7: "#00ffff",
  8: "#0080ff",
  9: "#0000ff",
  10: "#8000ff",
  11: "#ff00ff",
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
