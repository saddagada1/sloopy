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
import axios, {
  type AxiosError,
  type AxiosResponse,
  type AxiosInstance,
} from "axios";
import {
  FeaturedPlaylists,
  type ErrorResponse,
  type RecentlyPlayed,
} from "spotify-types";
import {
  type GenericError,
  type SpotifyErrorResponse,
  type SpotifyResponse,
} from "~/utils/types";

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
    SpotifyResponse<RecentlyPlayed> | SpotifyErrorResponse | GenericError
  >;
  fetchFeaturedPlaylists: () => Promise<
    SpotifyResponse<FeaturedPlaylists> | SpotifyErrorResponse | GenericError
  >;
}

const SpotifyContext = createContext<SpotifyValues | null>(null);

interface SpotifyProviderProps {
  children: React.ReactNode;
}

const SpotifyProvider: React.FC<SpotifyProviderProps> = ({ children }) => {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const [auth, setAuth] = useState<SpotifyAuth | null>(null);
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
    SpotifyResponse<FeaturedPlaylists> | SpotifyErrorResponse | GenericError
  > => {
    try {
      const response = await client.get<FeaturedPlaylists>(
        "/browse/featured-playlists"
      );
      return { ok: true as const, data: response.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const serverError = error as AxiosError<ErrorResponse>;
        if (serverError?.response) {
          return { ok: false as const, ...serverError.response.data };
        }
      }
      return { ok: false as const, message: "Failed To Query Spotify Api" };
    }
  };

  const fetchRecentlyPlayedTracks = async (): Promise<
    SpotifyResponse<RecentlyPlayed> | SpotifyErrorResponse | GenericError
  > => {
    try {
      const response = await client.get<RecentlyPlayed>(
        "/me/player/recently-played"
      );
      return { ok: true as const, data: response.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const serverError = error as AxiosError<ErrorResponse>;
        if (serverError?.response) {
          return { ok: false as const, ...serverError.response.data };
        }
      }
      return { ok: false as const, message: "Failed To Query Spotify Api" };
    }
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
        console.log("refreshing spotify auth");
        try {
          const credentials = await refreshSpotifyAuth({
            refresh_token: auth.refresh_token,
          });
          console.log("refreshed spotify auth");
          setAuth({ ...credentials, refresh_token: auth.refresh_token });
          config.headers.Authorization = `Bearer ${credentials.access_token}`;
          return config;
        } catch (error) {
          if (error instanceof TRPCClientError) {
            toast.error(`Error: ${error.message}`);
          }
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
          try {
            const credentials = await refreshSpotifyAuth({
              refresh_token: auth.refresh_token,
            });
            console.log("refreshed spotify auth");
            setAuth({ ...credentials, refresh_token: auth.refresh_token });
            originalRequest.headers.Authorization = `Bearer ${credentials.access_token}`;
            return client(originalRequest);
          } catch (error) {
            if (error instanceof TRPCClientError) {
              toast.error(`Error: ${error.message}`);
            }
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
    setAuth({
      access_token: credentials.access_token,
      refresh_token: credentials.refresh_token,
      expires_at: credentials.expires_at,
    });
  }, [session, auth]);

  return (
    <SpotifyContext.Provider
      value={{
        auth,
        setAuth,
        linkAccount,
        fetchFeaturedPlaylists,
        fetchRecentlyPlayedTracks,
      }}
    >
      {children}
    </SpotifyContext.Provider>
  );
};

export const useSpotifyContext = () => useContext(SpotifyContext);

export default SpotifyProvider;
