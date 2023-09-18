import { type Sloop } from "@prisma/client";
import React, {
  type SetStateAction,
  createContext,
  useContext,
  useState,
  type Dispatch,
  useEffect,
} from "react";
import { useSpotifyWebSDK } from "~/utils/hooks";
import { type Loop } from "~/utils/types";
import { useSpotifyContext } from "./Spotify";
import { api } from "~/utils/api";

export interface PlayerValues {
  player: Spotify.Player | undefined;
  isReady: boolean;
  error: string | undefined;
  deviceId: string;
  loops: Loop[];
  setLoops: Dispatch<SetStateAction<Loop[]>>;
  isPlaying: boolean;
  setIsPlaying: Dispatch<SetStateAction<boolean>>;
  playbackPosition: number;
  setPlaybackPosition: Dispatch<SetStateAction<number>>;
  playingLoop: Loop | null;
  setPlayingLoop: Dispatch<SetStateAction<Loop | null>>;
  repeatPlayingLoop: Loop | null;
  setRepeatPlayingLoop: Dispatch<SetStateAction<Loop | null>>;
  initialize: (sloop: Sloop) => void;
  handlePlayingLoop: (position: number) => void;
}

const PlayerContext = createContext<PlayerValues>(null!);

interface PlayerProviderProps {
  children: React.ReactNode;
}

const PlayerProvider: React.FC<PlayerProviderProps> = ({ children }) => {
  const spotify = useSpotifyContext();
  const { mutateAsync: refreshSpotifyAuth } =
    api.spotify.refreshSpotifyAuth.useMutation();
  const { player, isReady, error, deviceId } = useSpotifyWebSDK(
    spotify.auth?.access_token
  );
  const [loops, setLoops] = useState<Loop[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playingLoop, setPlayingLoop] = useState<Loop | null>(null);
  const [repeatPlayingLoop, setRepeatPlayingLoop] = useState<Loop | null>(null);

  const initialize = (sloop: Sloop) => {
    setLoops(sloop.loops as Loop[]);
  };

  const handlePlayingLoop = (position: number) => {
    if (!player) return;

    if (
      playingLoop &&
      playingLoop.start <= position &&
      position <= playingLoop.end
    ) {
      return;
    }

    if (
      repeatPlayingLoop &&
      (repeatPlayingLoop.start > position || position > repeatPlayingLoop.end)
    ) {
      void player.seek(repeatPlayingLoop.start * 1000);
      setPlaybackPosition(repeatPlayingLoop.start);
      return;
    }

    setPlayingLoop(null);
    const next = loops.find(
      (loop) => loop.start <= position && position <= loop.end
    );
    if (next) {
      setPlayingLoop(next);
    }
  };

  useEffect(() => {
    if (!spotify.auth) return;

    const refresh = async (refresh_token: string) => {
      const credentials = await refreshSpotifyAuth({
        refresh_token: refresh_token,
      });
      console.log("refreshed spotify auth");
      spotify.setAuth({ ...credentials, refresh_token: refresh_token });
    };

    if (
      spotify.auth.refresh_token &&
      spotify.auth.expires_at < Date.now() / 1000
    ) {
      void refresh(spotify.auth.refresh_token);
      return;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spotify.auth]);

  return (
    <PlayerContext.Provider
      value={{
        player,
        isReady,
        error,
        deviceId,
        loops,
        setLoops,
        isPlaying,
        setIsPlaying,
        playbackPosition,
        setPlaybackPosition,
        playingLoop,
        setPlayingLoop,
        repeatPlayingLoop,
        setRepeatPlayingLoop,
        initialize,
        handlePlayingLoop,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayerContext = () => useContext(PlayerContext);

export default PlayerProvider;
