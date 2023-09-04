import { type ErrorResponse } from "spotify-types";

export interface SpotifyErrorResponse extends ErrorResponse {
  ok: false;
}

export interface SpotifyResponse<T> {
  ok: true;
  data: T;
}

export interface Barre {
  fromString: number;
  toString: number;
  fret: number;
}

export interface Chord {
  title?: string;
  fingers: [number, number | "x"][];
  barres: Barre[];
  position: number;
}

export interface Chords {
  [key: string]: Chord[];
  chord: Chord[];
}

export interface Loop {
  [key: string]: string | number | undefined;
  id: number;
  start: number;
  end: number;
  key: number;
  mode: number;
  chord: string;
  voicing: number;
  notes: string;
}

export interface UpdateSloopInput {
  id: string;
  name: string;
  description: string;
  trackId: string;
  trackName: string;
  artists: string[];
  duration: number;
  key: number;
  mode: number;
  tempo: number;
  timeSignature: number;
  loops: Loop[];
  isPrivate: boolean;
}
