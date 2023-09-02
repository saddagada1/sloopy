import {
  type Dispatch,
  type SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import { type ReadonlyURLSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import toast from "react-hot-toast";
import { TRPCClientError } from "@trpc/client";
import axios, { type AxiosError, type AxiosResponse } from "axios";
import {
  type FeaturedPlaylists,
  type ErrorResponse,
  type RecentlyPlayed,
  type Track,
  type Paging,
  type Artist,
  type Playlist as SpotifyPlaylist,
  type PlaylistTrack,
  type AudioAnalysis,
} from "spotify-types";
import { type SpotifyErrorResponse, type SpotifyResponse } from "~/utils/types";

interface Playlist extends Omit<SpotifyPlaylist, "tracks"> {
  tracks: Paging<PlaylistTrack>;
}

interface SpotifyAuth {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

interface SpotifyValues {
  auth: SpotifyAuth | null;
  setAuth: Dispatch<SetStateAction<SpotifyAuth | null>>;
  linkAccount: (params: ReadonlyURLSearchParams) => Promise<void>;
  fetchRecentlyPlayedTracks: () => Promise<
    SpotifyResponse<RecentlyPlayed> | SpotifyErrorResponse
  >;
  fetchFeaturedPlaylists: () => Promise<
    SpotifyResponse<FeaturedPlaylists> | SpotifyErrorResponse
  >;
  fetchTopTracks: () => Promise<
    SpotifyResponse<Paging<Track>> | SpotifyErrorResponse
  >;
  fetchTopArtists: () => Promise<
    SpotifyResponse<Paging<Artist>> | SpotifyErrorResponse
  >;
  fetchCurrentUserPlaylists: () => Promise<
    SpotifyResponse<Paging<Playlist>> | SpotifyErrorResponse
  >;
  fetchPlaylist: (
    id: string
  ) => Promise<SpotifyResponse<Playlist> | SpotifyErrorResponse>;
  fetchTrack: (
    id: string
  ) => Promise<SpotifyResponse<Track> | SpotifyErrorResponse>;
  fetchTrackAnalysis: (
    id: string
  ) => Promise<SpotifyResponse<AudioAnalysis> | SpotifyErrorResponse>;
  transferPlayback: (
    deviceId: string
  ) => Promise<SpotifyResponse<undefined> | SpotifyErrorResponse>;
  playTrack: (
    deviceId: string,
    trackId: string
  ) => Promise<SpotifyResponse<undefined> | SpotifyErrorResponse>;
}

const SpotifyContext = createContext<SpotifyValues>(null!);

interface QueuedRequest {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}

interface SpotifyProviderProps {
  children: React.ReactNode;
}

const SpotifyProvider: React.FC<SpotifyProviderProps> = ({ children }) => {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const [auth, setAuth] = useState<SpotifyAuth | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [requestQueue, setRequestQueue] = useState<QueuedRequest[]>([]);
  const { mutateAsync: linkSpotifyAccount } =
    api.spotify.linkSpotifyAccount.useMutation();
  const { mutateAsync: refreshSpotifyAuth } =
    api.spotify.refreshSpotifyAuth.useMutation();

  const linkAccount = async (params: ReadonlyURLSearchParams) => {
    const code = params.get("code");
    if (!code) {
      return;
    }
    const originalState = localStorage.getItem("spotify_state");
    const responseState = params.get("state");
    if (!originalState || !responseState || originalState !== responseState) {
      void router.replace("/settings");
      toast.error("Error: Please Try Again.");
      return;
    }
    localStorage.removeItem("spotify_state");
    const linkSpotify = toast.loading("Linking Spotify Account...");
    try {
      const credentials = await linkSpotifyAccount({ code: code });
      toast.remove(linkSpotify);
      setAuth({
        access_token: credentials.access_token,
        refresh_token: credentials.refresh_token,
        expires_at: credentials.expires_at,
      });
      toast.success("Success: Linked Spotify Account", { duration: 4000 });
      await router.replace("/settings", undefined, { shallow: true });
      await updateSession();
      return;
    } catch (error) {
      toast.remove(linkSpotify);
      if (error instanceof TRPCClientError) {
        toast.error(`Error: ${error.message}`);
      }
      return;
    }
  };

  const client = axios.create({
    baseURL: "https://api.spotify.com/v1",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const fetchFeaturedPlaylists = async (): Promise<
    SpotifyResponse<FeaturedPlaylists> | SpotifyErrorResponse
  > => {
    try {
      const response = await client.get<FeaturedPlaylists>(
        "/browse/featured-playlists?limit=15"
      );
      return { ok: true, data: response.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const serverError = error as AxiosError<ErrorResponse>;
        if (serverError?.response) {
          return { ok: false, ...serverError.response.data };
        }
      }
      return {
        ok: false,
        message: "Failed To Query Spotify Api",
        status: 500,
      };
    }
  };

  const fetchRecentlyPlayedTracks = async (): Promise<
    SpotifyResponse<RecentlyPlayed> | SpotifyErrorResponse
  > => {
    try {
      const response = await client.get<RecentlyPlayed>(
        "/me/player/recently-played"
      );
      return { ok: true, data: response.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const serverError = error as AxiosError<ErrorResponse>;
        if (serverError?.response) {
          return { ok: false, ...serverError.response.data };
        }
      }
      return {
        ok: false,
        message: "Failed To Query Spotify Api",
        status: 500,
      };
    }
  };

  const fetchTopTracks = async (): Promise<
    SpotifyResponse<Paging<Track>> | SpotifyErrorResponse
  > => {
    try {
      const response = await client.get<Paging<Track>>(`/me/top/tracks`);
      return { ok: true, data: response.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const serverError = error as AxiosError<ErrorResponse>;
        if (serverError?.response) {
          return { ok: false, ...serverError.response.data };
        }
      }
      return {
        ok: false,
        message: "Failed To Query Spotify Api",
        status: 500,
      };
    }
  };

  const fetchTopArtists = async (): Promise<
    SpotifyResponse<Paging<Artist>> | SpotifyErrorResponse
  > => {
    try {
      const response = await client.get<Paging<Artist>>(`/me/top/artists`);
      return { ok: true, data: response.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const serverError = error as AxiosError<ErrorResponse>;
        if (serverError?.response) {
          return { ok: false, ...serverError.response.data };
        }
      }
      return {
        ok: false,
        message: "Failed To Query Spotify Api",
        status: 500,
      };
    }
  };

  const fetchCurrentUserPlaylists = async (): Promise<
    SpotifyResponse<Paging<Playlist>> | SpotifyErrorResponse
  > => {
    try {
      const response = await client.get<Paging<Playlist>>(
        "https://api.spotify.com/v1/me/playlists"
      );
      return { ok: true, data: response.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const serverError = error as AxiosError<ErrorResponse>;
        if (serverError?.response) {
          return { ok: false, ...serverError.response.data };
        }
      }
      return {
        ok: false,
        message: "Failed To Query Spotify Api",
        status: 500,
      };
    }
  };

  const fetchPlaylist = async (
    id: string
  ): Promise<SpotifyResponse<Playlist> | SpotifyErrorResponse> => {
    try {
      const response = await client.get<Playlist>(
        `https://api.spotify.com/v1/playlists/${id}`
      );
      return { ok: true, data: response.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const serverError = error as AxiosError<ErrorResponse>;
        if (serverError?.response) {
          return { ok: false, ...serverError.response.data };
        }
      }
      return {
        ok: false,
        message: "Failed To Query Spotify Api",
        status: 500,
      };
    }
  };

  const fetchTrack = async (
    id: string
  ): Promise<SpotifyResponse<Track> | SpotifyErrorResponse> => {
    try {
      const response = await client.get<Track>(
        `https://api.spotify.com/v1/tracks/${id}`
      );
      return { ok: true, data: response.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const serverError = error as AxiosError<ErrorResponse>;
        if (serverError?.response) {
          return { ok: false, ...serverError.response.data };
        }
      }
      return {
        ok: false,
        message: "Failed To Query Spotify Api",
        status: 500,
      };
    }
  };

  const fetchTrackAnalysis = async (
    id: string
  ): Promise<SpotifyResponse<AudioAnalysis> | SpotifyErrorResponse> => {
    try {
      const response = await client.get<AudioAnalysis>(
        `https://api.spotify.com/v1/audio-analysis/${id}`
      );
      return { ok: true, data: response.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const serverError = error as AxiosError<ErrorResponse>;
        if (serverError?.response) {
          return { ok: false, ...serverError.response.data };
        }
      }
      return {
        ok: false,
        message: "Failed To Query Spotify Api",
        status: 500,
      };
    }
  };

  const transferPlayback = async (
    deviceId: string
  ): Promise<SpotifyResponse<undefined> | SpotifyErrorResponse> => {
    try {
      await client.put(`https://api.spotify.com/v1/me/player`, {
        device_ids: [deviceId],
      });
      return { ok: true, data: undefined };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const serverError = error as AxiosError<ErrorResponse>;
        if (serverError?.response) {
          return { ok: false, ...serverError.response.data };
        }
      }
      return {
        ok: false,
        message: "Failed To Query Spotify Api",
        status: 500,
      };
    }
  };

  const playTrack = async (
    deviceId: string,
    trackId: string
  ): Promise<SpotifyResponse<undefined> | SpotifyErrorResponse> => {
    try {
      await client.put(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        { uris: [`spotify:track:${trackId}`], position_ms: 0 }
      );
      return { ok: true, data: undefined };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const serverError = error as AxiosError<ErrorResponse>;
        if (serverError?.response) {
          return { ok: false, ...serverError.response.data };
        }
      }
      return {
        ok: false,
        message: "Failed To Query Spotify Api",
        status: 500,
      };
    }
  };

  const processRequestQueue = ({
    error,
    token,
  }: {
    error: unknown;
    token: string | null;
  }) => {
    requestQueue.map((request) => {
      if (!token) {
        request.reject(error);
      } else {
        request.resolve(token);
      }
    });
    setRequestQueue([]);
  };

  client.interceptors.request.use(
    async (config) => {
      const controller = new AbortController();
      if (!auth) {
        console.log("no spotify auth");
        controller.abort();
        return {
          ...config,
          signal: controller.signal,
        };
      }
      if (auth.expires_at < Date.now() / 1000) {
        if (isRefreshing) {
          try {
            const token = await new Promise((resolve, reject) =>
              setRequestQueue((requestQueue) => [
                ...requestQueue,
                { resolve, reject },
              ])
            );
            config.headers.Authorization = `Bearer ${token as string}`;
            return config;
          } catch (error) {
            controller.abort();
            return {
              ...config,
              signal: controller.signal,
            };
          }
        }
        setIsRefreshing(true);
        console.log("refreshing spotify auth");
        try {
          const credentials = await refreshSpotifyAuth({
            refresh_token: auth.refresh_token,
          });
          console.log("refreshed spotify auth");
          setAuth({ ...credentials, refresh_token: auth.refresh_token });
          config.headers.Authorization = `Bearer ${credentials.access_token}`;
          processRequestQueue({ error: null, token: credentials.access_token });
          setIsRefreshing(false);
          return config;
        } catch (error) {
          if (error instanceof TRPCClientError) {
            toast.error(`Error: ${error.message}`);
          }
          processRequestQueue({ error: error, token: null });
          setIsRefreshing(false);
          controller.abort();
          return {
            ...config,
            signal: controller.signal,
          };
        }
      }
      console.log("vaild spotify auth");
      config.headers.Authorization = `Bearer ${auth.access_token}`;
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  client.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error: AxiosError | Error) => {
      if (axios.isAxiosError(error)) {
        const originalRequest = error.config;
        if (!originalRequest) {
          return Promise.reject(error);
        }
        const { status } = (error.response as AxiosResponse) ?? {};
        if (status === 400 || status === 401) {
          console.log("spotify auth error");
          if (!auth) {
            return Promise.reject(error);
          }
          if (isRefreshing) {
            try {
              const token = await new Promise((resolve, reject) =>
                setRequestQueue((requestQueue) => [
                  ...requestQueue,
                  { resolve, reject },
                ])
              );
              originalRequest.headers.Authorization = `Bearer ${
                token as string
              }`;
              return client(originalRequest);
            } catch (error) {
              return Promise.reject(error);
            }
          }
          setIsRefreshing(true);
          try {
            const credentials = await refreshSpotifyAuth({
              refresh_token: auth.refresh_token,
            });
            console.log("refreshed spotify auth");
            setAuth({ ...credentials, refresh_token: auth.refresh_token });
            originalRequest.headers.Authorization = `Bearer ${credentials.access_token}`;
            processRequestQueue({
              error: null,
              token: credentials.access_token,
            });
            setIsRefreshing(false);
            return client(originalRequest);
          } catch (error) {
            if (error instanceof TRPCClientError) {
              toast.error(`Error: ${error.message}`);
            }
            processRequestQueue({ error: error, token: null });
            setIsRefreshing(false);
            return Promise.reject(error);
          }
        }
      }
      return Promise.reject(error);
    }
  );

  useEffect(() => {
    if (!session || auth) {
      return;
    }
    const credentials = session.user.linkedAccounts.find(
      (account) => account.provider === "spotify"
    );
    if (!credentials) {
      return;
    }

    const refreshInitial = async (refresh_token: string) => {
      const newCredentials = await refreshSpotifyAuth({
        refresh_token: refresh_token,
      });
      console.log("refreshed spotify auth");
      setAuth({ ...newCredentials, refresh_token: refresh_token });
    };

    if (credentials.expires_at < Date.now() / 1000) {
      void refreshInitial(credentials.refresh_token);
    } else {
      setAuth({
        access_token: credentials.access_token,
        refresh_token: credentials.refresh_token,
        expires_at: credentials.expires_at,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, auth]);

  return (
    <SpotifyContext.Provider
      value={{
        auth,
        setAuth,
        linkAccount,
        fetchFeaturedPlaylists,
        fetchRecentlyPlayedTracks,
        fetchTopTracks,
        fetchTopArtists,
        fetchCurrentUserPlaylists,
        fetchPlaylist,
        fetchTrack,
        fetchTrackAnalysis,
        transferPlayback,
        playTrack,
      }}
    >
      {children}
    </SpotifyContext.Provider>
  );
};

export const useSpotifyContext = () => useContext(SpotifyContext);

export default SpotifyProvider;
