import axiosRetry from "axios-retry";
import axios, { type AxiosError } from "axios";
import {
  type AccessToken,
  type ErrorResponse,
  type PrivateUser,
} from "spotify-types";
import { env } from "~/env.mjs";

axiosRetry(axios, {
  retries: 3,
  // retryCondition: (error) => {
  //   console.log(error);
  //   return true;
  // },
  retryDelay: (retryCount, error) =>
    axiosRetry.exponentialDelay(retryCount, error),
  onRetry: (retryCount) => {
    console.log("retry: ", retryCount);
  },
});

export const fetchSpotifyCredentials = async (code: string) => {
  try {
    const response = await axios.post<AccessToken & { refresh_token: string }>(
      "https://accounts.spotify.com/api/token",
      {
        grant_type: "authorization_code",
        code: code,
        redirect_uri: "http://localhost:3000/settings",
      },
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(
              env.SPOTIFY_CLIENT_ID + ":" + env.SPOTIFY_CLIENT_SECRET,
              "utf-8"
            ).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return { ok: true as const, ...response.data };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const serverError = error as AxiosError<ErrorResponse>;
      if (serverError?.response) {
        return {
          ok: false as const,
          ...serverError.response.data,
        };
      }
    }
    return {
      ok: false as const,
      message: "Failed To Fetch Spotify Credentials",
    };
  }
};

export const fetchSpotifyClientCredentials = async () => {
  try {
    const response = await axios.post<AccessToken>(
      "https://accounts.spotify.com/api/token",
      {
        grant_type: "client_credentials",
      },
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(
              env.SPOTIFY_CLIENT_ID + ":" + env.SPOTIFY_CLIENT_SECRET,
              "utf-8"
            ).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return { ok: true as const, ...response.data };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const serverError = error as AxiosError<ErrorResponse>;
      if (serverError?.response) {
        return {
          ok: false as const,
          ...serverError.response.data,
        };
      }
    }
    return {
      ok: false as const,
      message: "Failed To Fetch Spotify Credentials",
    };
  }
};

export const fetchCurrentSpotifyUser = async (access_token: string) => {
  try {
    const response = await axios.get<PrivateUser>(
      "https://api.spotify.com/v1/me",
      {
        headers: {
          Authorization: "Bearer " + access_token,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return { ok: true as const, ...response.data };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const serverError = error as AxiosError<ErrorResponse>;
      if (serverError?.response) {
        return { ok: false as const, ...serverError.response.data };
      }
    }
    return {
      ok: false as const,
      message: "Failed To Fetch Current Spotify User",
    };
  }
};

export const refreshSpotifyCredentials = async (refresh_token: string) => {
  try {
    const response = await axios.post<AccessToken>(
      "https://accounts.spotify.com/api/token",
      {
        grant_type: "refresh_token",
        refresh_token: refresh_token,
      },
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(
              env.SPOTIFY_CLIENT_ID + ":" + env.SPOTIFY_CLIENT_SECRET,
              "utf-8"
            ).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return { ok: true as const, ...response.data };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const serverError = error as AxiosError<ErrorResponse>;
      if (serverError?.response) {
        return { ok: false as const, ...serverError.response.data };
      }
    }
    return {
      ok: false as const,
      message: "Failed to Refresh Spotify Credentials",
    };
  }
};
