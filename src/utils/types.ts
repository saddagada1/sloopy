import { type Track, type Follow, type Sloop, type User } from "@prisma/client";
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
  composition: string;
}

export interface SloopGeneralInfo {
  key: number;
  mode: number;
  tempo: number;
  timeSignature: number;
  tuning: number;
  name: string;
  description: string;
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

export interface Paging<T> {
  next?: string;
  items: T[];
}

export interface ListSloop extends Sloop {
  rankedSloop: { likes: number } | null;
  track: {
    name: string;
  };
  artists: {
    name: string;
  }[];
}

export interface ListTrack extends Track {
  artists: {
    name: string;
  }[];
}

export interface ListUser {
  name: string | null;
  image: string | null;
  username: string;
}

export interface ListArtist {
  id: string;
  name: string;
  image: string | null;
}

export interface PageSloop extends Sloop {
  rankedSloop: { likes: number; plays: number } | null;
}

export interface Follower extends Follow {
  follower: {
    name?: string | null;
    image?: string | null;
    username: string;
  };
}

export interface Following extends Follow {
  followed: {
    name?: string | null;
    image?: string | null;
    username: string;
  };
}

export interface PageUser extends User {
  sloops: ListSloop[];
}

export interface SelectItem {
  value: string;
  label: string;
}

export interface Tuning {
  name: string;
  notes: string[];
}
