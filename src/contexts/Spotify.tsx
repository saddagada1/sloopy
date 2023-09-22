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
  type ErrorResponse,
  type Track,
  type Paging,
  type Artist,
  type Playlist as SpotifyPlaylist,
  type PlaylistTrack,
  type AudioAnalysis,
  type SearchContent,
  type Album as SpotifyAlbum,
  type SimplifiedTrack,
  type RecentlyPlayed,
  type SavedAlbum,
} from "spotify-types";
import { type SpotifyErrorResponse, type SpotifyResponse } from "~/utils/types";

export interface Playlist extends Omit<SpotifyPlaylist, "tracks"> {
  tracks: Paging<PlaylistTrack>;
}

export interface Album extends Omit<SpotifyAlbum, "tracks"> {
  tracks: Paging<SimplifiedTrack>;
}

export interface Search extends SearchContent {
  playlists?: Paging<SpotifyPlaylist>;
}

interface QueuedRequest {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}

interface SpotifyAuth {
  access_token: string;
  refresh_token?: string;
  expires_at: number;
}

interface SpotifyValues {
  auth: SpotifyAuth | null;
  setAuth: Dispatch<SetStateAction<SpotifyAuth | null>>;
  linkAccount: (params: ReadonlyURLSearchParams) => Promise<void>;
  fetchRecentlyPlayedTracks: () => Promise<
    SpotifyResponse<RecentlyPlayed> | SpotifyErrorResponse
  >;
  fetchTopTracks: () => Promise<
    SpotifyResponse<Paging<Track>> | SpotifyErrorResponse
  >;
  fetchSavedTracks: (
    offset: number
  ) => Promise<SpotifyResponse<Paging<PlaylistTrack>> | SpotifyErrorResponse>;
  fetchTopArtists: () => Promise<
    SpotifyResponse<Paging<Artist>> | SpotifyErrorResponse
  >;
  fetchNewReleases: (
    offset: number
  ) => Promise<
    SpotifyResponse<{ albums: Paging<Album> }> | SpotifyErrorResponse
  >;
  fetchCurrentUserAlbums: (
    offset: number
  ) => Promise<SpotifyResponse<Paging<SavedAlbum>> | SpotifyErrorResponse>;
  fetchCurrentUserPlaylists: (
    offset: number
  ) => Promise<SpotifyResponse<Paging<Playlist>> | SpotifyErrorResponse>;
  fetchPlaylist: (
    id: string
  ) => Promise<SpotifyResponse<Playlist> | SpotifyErrorResponse>;
  fetchPlaylistTracks: (
    id: string,
    offset: number
  ) => Promise<SpotifyResponse<Paging<PlaylistTrack>> | SpotifyErrorResponse>;
  fetchTrack: (
    id: string
  ) => Promise<SpotifyResponse<Track> | SpotifyErrorResponse>;
  fetchAlbum: (
    id: string,
    offset: number
  ) => Promise<SpotifyResponse<Album> | SpotifyErrorResponse>;
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
  search: (
    query: string
  ) => Promise<SpotifyResponse<Search> | SpotifyErrorResponse>;
  fetchArtist: (
    id: string
  ) => Promise<SpotifyResponse<Artist> | SpotifyErrorResponse>;
  fetchArtists: (ids: string[]) => Promise<
    | SpotifyResponse<{
        artists: Artist[];
      }>
    | SpotifyErrorResponse
  >;
  fetchArtistAlbums: (
    id: string
  ) => Promise<SpotifyResponse<Paging<Album>> | SpotifyErrorResponse>;
  fetchRelatedArtists: (id: string) => Promise<
    | SpotifyResponse<{
        artists: Artist[];
      }>
    | SpotifyErrorResponse
  >;
  fetchArtistTopTracks: (id: string) => Promise<
    | SpotifyResponse<{
        tracks: Track[];
      }>
    | SpotifyErrorResponse
  >;
}

const SpotifyContext = createContext<SpotifyValues>(null!);

interface SpotifyProviderProps {
  children: React.ReactNode;
}

const SpotifyProvider: React.FC<SpotifyProviderProps> = ({ children }) => {
  const {
    data: session,
    status: sessionStatus,
    update: updateSession,
  } = useSession();
  const router = useRouter();
  const [auth, setAuth] = useState<SpotifyAuth | null>(null);
  const { mutateAsync: linkSpotifyAccount } =
    api.spotify.linkSpotifyAccount.useMutation();
  const { mutateAsync: refreshSpotifyAuth } =
    api.spotify.refreshSpotifyAuth.useMutation();
  const { mutateAsync: fetchSpotifyAuth } =
    api.spotify.fetchSpotifyAuth.useMutation();

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
      if (!credentials.isPremium) {
        toast.error("Spotify Premium Required For Streaming");
      }
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

  const handleSpotifyError = (error: unknown): SpotifyErrorResponse => {
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
  };

  const fetchRecentlyPlayedTracks = async (): Promise<
    SpotifyResponse<RecentlyPlayed> | SpotifyErrorResponse
  > => {
    try {
      const response = await client.get<RecentlyPlayed>(
        "/me/player/recently-played?limit=50"
      );
      return { ok: true, data: response.data };
    } catch (error) {
      return handleSpotifyError(error);
    }
  };

  const fetchTopTracks = async (): Promise<
    SpotifyResponse<Paging<Track>> | SpotifyErrorResponse
  > => {
    try {
      const response = await client.get<Paging<Track>>(
        `/me/top/tracks?limit=50`
      );
      return { ok: true, data: response.data };
    } catch (error) {
      return handleSpotifyError(error);
    }
  };

  const fetchSavedTracks = async (
    offset: number
  ): Promise<SpotifyResponse<Paging<PlaylistTrack>> | SpotifyErrorResponse> => {
    try {
      const response = await client.get<Paging<PlaylistTrack>>(
        `/me/tracks?limit=50&offset=${offset}`
      );
      return { ok: true, data: response.data };
    } catch (error) {
      return handleSpotifyError(error);
    }
  };

  const fetchTopArtists = async (): Promise<
    SpotifyResponse<Paging<Artist>> | SpotifyErrorResponse
  > => {
    try {
      const response = await client.get<Paging<Artist>>(
        `/me/top/artists?limit=50`
      );
      return { ok: true, data: response.data };
    } catch (error) {
      return handleSpotifyError(error);
    }
  };

  const fetchNewReleases = async (
    offset: number
  ): Promise<
    SpotifyResponse<{ albums: Paging<Album> }> | SpotifyErrorResponse
  > => {
    try {
      const response = await client.get<{ albums: Paging<Album> }>(
        `/browse/new-releases?limit=50&offset=${offset}`
      );
      return { ok: true, data: response.data };
    } catch (error) {
      return handleSpotifyError(error);
    }
  };

  const fetchCurrentUserPlaylists = async (
    offset: number
  ): Promise<SpotifyResponse<Paging<Playlist>> | SpotifyErrorResponse> => {
    try {
      const response = await client.get<Paging<Playlist>>(
        `/me/playlists?limit=50&offset=${offset}`
      );
      return { ok: true, data: response.data };
    } catch (error) {
      return handleSpotifyError(error);
    }
  };

  const fetchCurrentUserAlbums = async (
    offset: number
  ): Promise<SpotifyResponse<Paging<SavedAlbum>> | SpotifyErrorResponse> => {
    try {
      const response = await client.get<Paging<SavedAlbum>>(
        `/me/albums?limit=50&offset=${offset}`
      );
      return { ok: true, data: response.data };
    } catch (error) {
      return handleSpotifyError(error);
    }
  };

  const fetchPlaylist = async (
    id: string
  ): Promise<SpotifyResponse<Playlist> | SpotifyErrorResponse> => {
    try {
      const response = await client.get<Playlist>(`/playlists/${id}`);
      return { ok: true, data: response.data };
    } catch (error) {
      return handleSpotifyError(error);
    }
  };

  const fetchPlaylistTracks = async (
    id: string,
    offset: number
  ): Promise<SpotifyResponse<Paging<PlaylistTrack>> | SpotifyErrorResponse> => {
    try {
      const response = await client.get<Paging<PlaylistTrack>>(
        `/playlists/${id}/tracks?offset=${offset}`
      );
      return { ok: true, data: response.data };
    } catch (error) {
      return handleSpotifyError(error);
    }
  };

  const fetchAlbum = async (
    id: string,
    offset: number
  ): Promise<SpotifyResponse<Album> | SpotifyErrorResponse> => {
    try {
      const response = await client.get<Album>(
        `/albums/${id}?offset=${offset}`
      );
      return { ok: true, data: response.data };
    } catch (error) {
      return handleSpotifyError(error);
    }
  };

  const fetchTrack = async (
    id: string
  ): Promise<SpotifyResponse<Track> | SpotifyErrorResponse> => {
    try {
      const response = await client.get<Track>(`/tracks/${id}`);
      return { ok: true, data: response.data };
    } catch (error) {
      return handleSpotifyError(error);
    }
  };

  const fetchTrackAnalysis = async (
    id: string
  ): Promise<SpotifyResponse<AudioAnalysis> | SpotifyErrorResponse> => {
    try {
      const response = await client.get<AudioAnalysis>(`/audio-analysis/${id}`);
      return { ok: true, data: response.data };
    } catch (error) {
      return handleSpotifyError(error);
    }
  };

  const transferPlayback = async (
    deviceId: string
  ): Promise<SpotifyResponse<undefined> | SpotifyErrorResponse> => {
    try {
      await client.put(`/me/player`, {
        device_ids: [deviceId],
      });
      return { ok: true, data: undefined };
    } catch (error) {
      return handleSpotifyError(error);
    }
  };

  const playTrack = async (
    deviceId: string,
    trackId: string
  ): Promise<SpotifyResponse<undefined> | SpotifyErrorResponse> => {
    try {
      await client.put(`/me/player/play?device_id=${deviceId}`, {
        uris: [`spotify:track:${trackId}`],
        position_ms: 0,
      });
      return { ok: true, data: undefined };
    } catch (error) {
      return handleSpotifyError(error);
    }
  };

  const search = async (
    query: string
  ): Promise<SpotifyResponse<Search> | SpotifyErrorResponse> => {
    try {
      const response = await client.get<Search>(
        `/search?q=${query}&type=track,album,playlist,artist&limit=50`
      );
      return { ok: true, data: response.data };
    } catch (error) {
      return handleSpotifyError(error);
    }
  };

  const fetchArtist = async (
    id: string
  ): Promise<SpotifyResponse<Artist> | SpotifyErrorResponse> => {
    try {
      const response = await client.get<Artist>(`/artists/${id}`);
      return { ok: true, data: response.data };
    } catch (error) {
      return handleSpotifyError(error);
    }
  };

  const fetchArtists = async (
    ids: string[]
  ): Promise<SpotifyResponse<{ artists: Artist[] }> | SpotifyErrorResponse> => {
    try {
      const response = await client.get<{ artists: Artist[] }>(
        `/artists?ids=${ids.toString()}`
      );
      return { ok: true, data: response.data };
    } catch (error) {
      return handleSpotifyError(error);
    }
  };

  const fetchArtistAlbums = async (
    id: string
  ): Promise<SpotifyResponse<Paging<Album>> | SpotifyErrorResponse> => {
    try {
      const response = await client.get<Paging<Album>>(
        `/artists/${id}/albums?limit=50`
      );
      return { ok: true, data: response.data };
    } catch (error) {
      return handleSpotifyError(error);
    }
  };

  const fetchRelatedArtists = async (
    id: string
  ): Promise<SpotifyResponse<{ artists: Artist[] }> | SpotifyErrorResponse> => {
    try {
      const response = await client.get<{ artists: Artist[] }>(
        `/artists/${id}/related-artists`
      );
      return { ok: true, data: response.data };
    } catch (error) {
      return handleSpotifyError(error);
    }
  };

  const fetchArtistTopTracks = async (
    id: string
  ): Promise<SpotifyResponse<{ tracks: Track[] }> | SpotifyErrorResponse> => {
    try {
      const response = await client.get<{ tracks: Track[] }>(
        `/artists/${id}/top-tracks?market=CA`
      );
      return { ok: true, data: response.data };
    } catch (error) {
      return handleSpotifyError(error);
    }
  };

  let isRefreshing = false;
  let requestQueue: QueuedRequest[] = [];

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
    requestQueue = [];
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
              requestQueue.push({ resolve, reject })
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
        isRefreshing = true;
        console.log("refreshing spotify auth");
        try {
          let credentials: { access_token: string; expires_at: number };
          if (auth.refresh_token) {
            credentials = await refreshSpotifyAuth({
              refresh_token: auth.refresh_token,
            });
          } else {
            credentials = await fetchSpotifyAuth();
          }
          console.log("refreshed spotify auth");
          setAuth({ ...credentials, refresh_token: auth.refresh_token });
          config.headers.Authorization = `Bearer ${credentials.access_token}`;
          processRequestQueue({ error: null, token: credentials.access_token });
          isRefreshing = false;
          return config;
        } catch (error) {
          if (error instanceof TRPCClientError) {
            toast.error(`Error: ${error.message}`);
          }
          processRequestQueue({ error: error, token: null });
          isRefreshing = false;
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
        if (status === 401) {
          console.log("spotify auth error");
          if (!auth) {
            return Promise.reject(error);
          }
          if (isRefreshing) {
            try {
              const token = await new Promise((resolve, reject) =>
                requestQueue.push({ resolve, reject })
              );
              originalRequest.headers.Authorization = `Bearer ${
                token as string
              }`;
              return client(originalRequest);
            } catch (error) {
              return Promise.reject(error);
            }
          }
          isRefreshing = true;
          try {
            let credentials: { access_token: string; expires_at: number };
            if (auth.refresh_token) {
              credentials = await refreshSpotifyAuth({
                refresh_token: auth.refresh_token,
              });
            } else {
              credentials = await fetchSpotifyAuth();
            }
            console.log("refreshed spotify auth");
            setAuth({ ...credentials, refresh_token: auth.refresh_token });
            originalRequest.headers.Authorization = `Bearer ${credentials.access_token}`;
            processRequestQueue({
              error: null,
              token: credentials.access_token,
            });
            isRefreshing = false;
            return client(originalRequest);
          } catch (error) {
            if (error instanceof TRPCClientError) {
              toast.error(`Error: ${error.message}`);
            }
            processRequestQueue({ error: error, token: null });
            isRefreshing = false;
            return Promise.reject(error);
          }
        }
      }
      return Promise.reject(error);
    }
  );

  const initSpotifyClientCredentialsAuth = async () => {
    const credentials = await fetchSpotifyAuth();
    setAuth({
      access_token: credentials.access_token,
      expires_at: credentials.expires_at,
    });
  };

  useEffect(() => {
    if (sessionStatus === "loading" || auth) return;

    const credentials = session?.user.linkedAccounts.find(
      (account) => account.provider === "spotify"
    );

    if (!credentials) {
      void initSpotifyClientCredentialsAuth();
      return;
    }

    setAuth({
      access_token: credentials.access_token,
      refresh_token: credentials.refresh_token,
      expires_at: credentials.expires_at,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, auth]);

  return (
    <SpotifyContext.Provider
      value={{
        auth,
        setAuth,
        linkAccount,
        fetchRecentlyPlayedTracks,
        fetchSavedTracks,
        fetchTopArtists,
        fetchNewReleases,
        fetchCurrentUserPlaylists,
        fetchCurrentUserAlbums,
        fetchTopTracks,
        fetchPlaylist,
        fetchPlaylistTracks,
        fetchTrack,
        fetchAlbum,
        fetchTrackAnalysis,
        transferPlayback,
        playTrack,
        search,
        fetchArtist,
        fetchArtists,
        fetchArtistAlbums,
        fetchRelatedArtists,
        fetchArtistTopTracks,
      }}
    >
      {children}
    </SpotifyContext.Provider>
  );
};

export const useSpotifyContext = () => useContext(SpotifyContext);

export default SpotifyProvider;
