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
  3: " #ffd200",
  4: "#ffff00",
  5: "#66ff00",
  6: "#33ff80",
  7: "#00ffff",
  8: "#0080ff",
  9: "#0000ff",
  10: "#8000ff",
  11: "#ff00ff",
};

const majorDegrees = {
  0: ["C", "D", "E", "F", "G", "A", "B"],
  1: ["C#/Db", "D#/Eb", "F", "F#/Gb", "G#/Ab", "A#/Bb", "C"],
  2: ["D", "E", "F#/Gb", "G", "A", "B", "C#/Db"],
  3: ["D#/Eb", "F", "G", "G#/Ab", "A#/Bb", "C#/Db", "D"],
  4: ["E", "F#/Gb", "G#/Ab", "A", "B", "C#/Db", "D#/Eb"],
  5: ["F", "G", "A", "A#/Bb", "C", "D", "E"],
  6: ["F#/Gb", "G#/Ab", "A#/Bb", "B", "C#/Db", "D#/Eb", "F"],
  7: ["G", "A", "B", "C", "D", "E", "F#/Gb"],
  8: ["G#/Ab", "A#/Bb", "C", "C#/Db", "D#/Eb", "F", "G"],
  9: ["A", "B", "C#/Db", "D", "E", "F#/Gb", "G#/Ab"],
  10: ["A#/Bb", "C", "D", "D#/Eb", "F", "G", "A"],
  11: ["B", "C#/Db", "D#/Eb", "E", "F#/Gb", "G#/Ab", "A#/Bb"],
};

const minorDegrees = {
  0: ["C", "D", "D#/Eb", "F", "G", "G#/Ab", "A#/Bb"],
  1: ["C#/Db", "D#/Eb", "E", "F#/Gb", "G#/Ab", "A", "B"],
  2: ["D", "E", "F", "G", "A", "A#/Bb", "C"],
  3: ["D#/Eb", "F", "F#/Gb", "G#/Ab", "A#/Bb", "B", "C#/Db"],
  4: ["E", "F#/Gb", "G", "A", "B", "C", "D"],
  5: ["F", "G", "G#/Ab", "A#/Bb", "C", "C#/Db", "D#/Eb"],
  6: ["F#/Gb", "G#/Ab", "A", "B", "C#/Db", "D", "E"],
  7: ["G", "A", "A#/Bb", "C", "D", "D#/Eb", "F"],
  8: ["G#/Ab", "A#/Bb", "B", "C#/Db", "D#/Eb", "E", "F#/Gb"],
  9: ["A", "B", "C", "D", "E", "F", "G"],
  10: ["A#/Bb", "C", "C#/Db", "D#/Eb", "F", "F#/Gb", "G#/Ab"],
  11: ["B", "C#/Db", "D", "E", "F#/Gb", "G", "A"],
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
