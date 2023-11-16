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
import { type SloopGeneralInfo, type Loop, type Tab } from "~/utils/types";
import { useSpotifyContext } from "./spotify";
import { api } from "~/utils/api";

export interface EditorValues {
  player: Spotify.Player | undefined;
  isReady: boolean;
  error: string | undefined;
  deviceId: string;
  loops: Loop[];
  setLoops: Dispatch<SetStateAction<Loop[]>>;
  generalInfo: SloopGeneralInfo;
  setGeneralInfo: Dispatch<SetStateAction<SloopGeneralInfo>>;
  isPlaying: boolean;
  setIsPlaying: Dispatch<SetStateAction<boolean>>;
  playbackPosition: number;
  setPlaybackPosition: Dispatch<SetStateAction<number>>;
  playingLoop: Loop | null;
  setPlayingLoop: Dispatch<SetStateAction<Loop | null>>;
  repeatPlayingLoop: Loop | null;
  setRepeatPlayingLoop: Dispatch<SetStateAction<Loop | null>>;
  initialize: (sloop: Sloop) => void;
  createLoop: ({
    key,
    mode,
    chord,
  }: {
    key: number;
    mode: number;
    chord: string;
  }) => void;
  handlePlayingLoop: (position: number) => void;
  updateLoop: (updatedLoop: Loop) => void;
  deleteLoop: (deletedLoop: Loop) => void;
  updateTuning: (tuning: string[]) => void;
}

const EditorContext = createContext<EditorValues>(null!);

interface EditorProviderProps {
  children: React.ReactNode;
}

const EditorProvider: React.FC<EditorProviderProps> = ({ children }) => {
  const spotify = useSpotifyContext();
  const { mutateAsync: refreshSpotifyAuth } =
    api.spotify.refreshSpotifyAuth.useMutation();
  const { player, isReady, error, deviceId } = useSpotifyWebSDK(
    spotify.auth?.accessToken
  );
  const [duration, setDuration] = useState(0);
  const [sloop, setSloop] = useState<Sloop>(null!);
  const [loops, setLoops] = useState<Loop[]>([]);
  const [generalInfo, setGeneralInfo] = useState<SloopGeneralInfo>(null!);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playingLoop, setPlayingLoop] = useState<Loop | null>(null);
  const [repeatPlayingLoop, setRepeatPlayingLoop] = useState<Loop | null>(null);

  const initialize = (sloop: Sloop) => {
    setSloop(sloop);
    setDuration(sloop.duration);
    setLoops(sloop.loops as Loop[]);
    setGeneralInfo({
      key: sloop.key,
      mode: sloop.mode,
      tempo: sloop.tempo,
      timeSignature: sloop.timeSignature,
      tuning: sloop.tuning,
      name: sloop.name,
      description: sloop.description,
    });
  };

  const createLoop = ({
    key,
    mode,
    chord,
  }: {
    key: number;
    mode: number;
    chord: string;
  }) => {
    let lastLoopEnd: number;
    let newLoopEnd: number;
    if (loops.length === 0) {
      lastLoopEnd = 0;
    } else {
      lastLoopEnd = loops[loops.length - 1]!.end;
    }
    if (lastLoopEnd + 10 > duration) {
      newLoopEnd = duration;
    } else {
      newLoopEnd = lastLoopEnd + 10;
    }
    const loop: Loop = {
      id: loops.length + 1,
      start: lastLoopEnd,
      end: newLoopEnd,
      key: key,
      mode: mode,
      chord: chord,
      composition: "",
    };

    if (loop.start <= playbackPosition && playbackPosition <= loop.end) {
      setPlayingLoop(loop);
    }
    setLoops((currentLoops) => [...currentLoops, loop]);
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

  const updateLoop = (updatedLoop: Loop) => {
    const update = loops.map((loop) => {
      if (loop.id === updatedLoop.id) {
        if (repeatPlayingLoop) {
          if (repeatPlayingLoop.id === loop.id) {
            setRepeatPlayingLoop(updatedLoop);
          }
        }
        if (playingLoop) {
          if (playingLoop.id === loop.id) {
            setPlayingLoop(updatedLoop);
          }
        }
        return updatedLoop;
      }

      return loop;
    });

    setLoops(update);
  };

  const deleteLoop = (deletedLoop: Loop) => {
    setRepeatPlayingLoop(null);
    setPlayingLoop(null);
    const filteredLoops = loops.filter((loop) => deletedLoop.id !== loop.id);
    const update = filteredLoops.map((loop, index) => {
      if (loop.id === deletedLoop.id + 1) {
        const updatedLoop = {
          id: deletedLoop.id,
          key: loop.key,
          mode: loop.mode,
          chord: loop.chord,
          composition: loop.composition,
          start: deletedLoop.id === 1 ? 0 : filteredLoops[index - 1]!.end,
          end: loop.end,
        };
        if (repeatPlayingLoop) {
          if (repeatPlayingLoop.id === deletedLoop.id) {
            setRepeatPlayingLoop(updatedLoop);
          }
        }
        if (playingLoop) {
          if (playingLoop.id === deletedLoop.id) {
            setPlayingLoop(updatedLoop);
          }
        }
        return updatedLoop;
      } else if (loop.id > deletedLoop.id + 1) {
        return {
          ...loop,
          id: loop.id - 1,
        };
      }

      return loop;
    });

    setLoops(update);
  };

  const updateTuning = (tuning: string[]) => {
    const update = loops.map((loop) => {
      const tabs = JSON.parse(loop.composition) as Tab[];
      return {
        ...loop,
        composition: JSON.stringify(
          tabs.map((tab) => ({
            ...tab,
            head: tuning.map((note) =>
              note.length > 1 ? `${note}|` : `${note} |`
            ),
          }))
        ),
      };
    });
    if (playingLoop) {
      const playingUpdate = update.find((loop) => loop.id === playingLoop.id);
      if (!playingUpdate) return;
      setPlayingLoop(playingUpdate);
    }
    setLoops(update);
  };

  useEffect(() => {
    if (!sloop) return;

    const autoSave = () => {
      const updatedSloop = {
        ...sloop,
        ...generalInfo,
        loops,
      };
      const update = JSON.stringify(updatedSloop);
      localStorage.setItem(sloop.id, update);
    };

    autoSave();
  }, [generalInfo, loops, sloop]);

  useEffect(() => {
    if (!spotify.auth) return;

    const refresh = async (refresh_token: string) => {
      const credentials = await refreshSpotifyAuth({
        refreshToken: refresh_token,
      });
      console.log("refreshed spotify auth");
      spotify.setAuth({ ...credentials, refreshToken: refresh_token });
    };

    if (
      spotify.auth.refreshToken &&
      spotify.auth.expiresAt < Date.now() / 1000
    ) {
      void refresh(spotify.auth.refreshToken);
      return;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spotify.auth]);

  return (
    <EditorContext.Provider
      value={{
        player,
        isReady,
        error,
        deviceId,
        loops,
        setLoops,
        generalInfo,
        setGeneralInfo,
        isPlaying,
        setIsPlaying,
        playbackPosition,
        setPlaybackPosition,
        playingLoop,
        setPlayingLoop,
        repeatPlayingLoop,
        setRepeatPlayingLoop,
        initialize,
        createLoop,
        handlePlayingLoop,
        updateLoop,
        deleteLoop,
        updateTuning,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export const useEditorContext = () => useContext(EditorContext);

export default EditorProvider;
