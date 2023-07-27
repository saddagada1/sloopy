import { type ErrorResponse } from "spotify-types";

export interface GenericError {
  ok: false;
  message: string;
}

export interface SpotifyErrorResponse extends ErrorResponse {
  ok: false;
}

export interface SpotifyResponse<T> {
  ok: true;
  data: T;
}
