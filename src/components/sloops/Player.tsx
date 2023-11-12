import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  PiPauseFill,
  PiPlayFill,
  PiSpeakerHigh,
  PiSpeakerLow,
  PiSpeakerSlash,
  PiSpotifyLogo,
} from "react-icons/pi";
import { useSpotifyContext } from "~/contexts/Spotify";
import { useEffectOnce, useElementSize } from "usehooks-ts";
import { AnimatePresence, motion } from "framer-motion";
import { calcVideoTimestamp, clamp } from "~/utils/calc";
import Popover from "../ui/Popover";
import InputSlider from "../ui/InputSlider";
import Link from "next/link";
import { type EditorValues } from "~/contexts/Editor";
import toast from "react-hot-toast";
import SafeImage from "../safeImage";
import { type PlayerValues } from "~/contexts/Player";
import { WaveSpinner } from "react-spinners-kit";
import { secondaryColour } from "~/utils/constants";

interface PlayerProps {
  trackId: string;
  duration: number;
  context: EditorValues | PlayerValues;
}

const Player: React.FC<PlayerProps> = ({ trackId, duration, context }) => {
  const spotify = useSpotifyContext();
  const { mutateAsync: initializePlayback, error: initializeError } =
    useMutation({
      mutationFn: async () => {
        if (context.deviceId === "") return;
        const playResponse = await spotify?.playTrack(
          context.deviceId,
          trackId
        );
        if (!playResponse?.ok) {
          toast.error(
            `Error: ${
              playResponse.message ?? "Could Not Connect To Spotify"
            }. Please Refresh`
          );
        }
        setIsLoading(false);
      },
    });
  const { mutateAsync: transferPlayback, error: transferError } = useMutation({
    mutationFn: async () => {
      if (context.deviceId === "") return;
      const transferResponse = await spotify?.transferPlayback(
        context.deviceId
      );
      if (!transferResponse?.ok) {
        toast.error(
          `Error: ${
            transferResponse.message ?? "Could Not Connect To Spotify"
          }. Please Refresh.`
        );
      }
    },
  });
  const [track, setTrack] = useState<Spotify.Track | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [showVolume, setShowVolume] = useState(false);
  const [updateTime, setUpdateTime] = useState(0);
  const [position, setPosition] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [timelineRef, { width: timelineWidth }] = useElementSize();
  const [imageContainerRef, { height }] = useElementSize();

  const handleClickToSeek = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (isScrubbing || !context.player) return;
    const seekPercentage = clamp(e.clientX, 0, timelineWidth) / timelineWidth;
    const seekPosition = duration * seekPercentage;
    context.setPlaybackPosition(seekPosition);
    void context.player.seek(seekPosition * 1000);
    context.handlePlayingLoop(seekPosition);
  };

  useEffectOnce(() => {
    const savedVolume = sessionStorage.getItem("volume");
    if (savedVolume) {
      setVolume(parseFloat(savedVolume));
    }
  });

  useEffect(() => {
    const handleMouseScrub = (e: MouseEvent) => {
      if (!isScrubbing) return;
      const seekPercentage = clamp(e.clientX, 0, timelineWidth) / timelineWidth;
      const seekPosition = duration * seekPercentage;
      context.setPlaybackPosition(seekPosition);
    };

    const handleTouchScrub = (e: TouchEvent) => {
      if (!isScrubbing || !e.touches[0]) return;
      const seekPercentage =
        clamp(e.touches[0].clientX, 0, timelineWidth) / timelineWidth;
      const seekPosition = duration * seekPercentage;
      context.setPlaybackPosition(seekPosition);
    };

    const handleFinishScrub = () => {
      if (!isScrubbing || !context.player) return;
      void context.player.seek(context.playbackPosition * 1000);
      context.handlePlayingLoop(context.playbackPosition);
      setIsScrubbing(false);
    };

    window.addEventListener("mousemove", handleMouseScrub);
    window.addEventListener("touchmove", handleTouchScrub);
    window.addEventListener("mouseup", handleFinishScrub);
    window.addEventListener("touchend", handleFinishScrub);

    return () => {
      window.removeEventListener("mousemove", handleMouseScrub);
      window.removeEventListener("touchmove", handleTouchScrub);
      window.removeEventListener("mouseup", handleFinishScrub);
      window.removeEventListener("touchend", handleFinishScrub);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, isScrubbing, timelineWidth]);

  useEffect(() => {
    if (!context.player) return;

    if (context.error) {
      setIsLoading(false);
      return;
    }

    context.player.addListener("player_state_changed", (state) => {
      if (!state) {
        return;
      }
      setTrack(state.track_window.current_track);
      context.setIsPlaying(!state.paused);
      setPosition(state.position);
      setUpdateTime(performance.now());
    });

    if (isLoading) {
      void initializePlayback();
    } else {
      void transferPlayback();
    }

    return () => {
      context.player?.removeListener("player_state_changed");
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context.player, context.deviceId, context.error]);

  useEffect(() => {
    const getPlaybackPosition = () => {
      const newPosition =
        position / 1000 + (performance.now() - updateTime) / 1000;
      return newPosition > duration ? duration : newPosition;
    };

    let interval: NodeJS.Timer;

    if (context.isPlaying && !isScrubbing) {
      interval = setInterval(() => {
        const position = getPlaybackPosition();
        context.setPlaybackPosition(position);
        context.handlePlayingLoop(position);
      }, 1);
    }

    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    duration,
    context.isPlaying,
    position,
    updateTime,
    isScrubbing,
    context.playbackPosition,
  ]);

  if (!context.player || isLoading) {
    return (
      <div className="flex h-[68px] items-center justify-center p-2">
        <WaveSpinner size={24} color={secondaryColour} loading={true} />
      </div>
    );
  }

  if (context.error ?? !context.isReady) {
    return (
      <div className="flex h-[68px] items-center justify-center p-2">
        <p className="h-fit rounded border border-red-500 bg-red-200 p-1 text-xs text-red-500 sm:text-sm">
          {context.error?.split(":")[1]?.trim() ??
            "Something Went Wrong. Please Refresh."}
        </p>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="flex h-[68px] items-center justify-center p-2">
        {initializeError || transferError ? (
          <p className="h-fit rounded border border-red-500 bg-red-200 p-1 text-xs text-red-500 sm:text-sm">
            Something Went Wrong. Please Refresh.
          </p>
        ) : (
          <WaveSpinner size={24} color={secondaryColour} loading={true} />
        )}
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {isScrubbing && (
          <div className="pointer-events-none fixed z-50 flex h-full w-full items-end justify-center">
            <motion.div
              initial={{ translateY: "-150%", opacity: 0 }}
              animate={{ translateY: "-200%", opacity: 1 }}
              exit={{ translateY: "0%", opacity: 0 }}
              transition={{ type: "tween", duration: 0.2 }}
              className="select-none rounded-md border border-gray-300 bg-primary px-3 py-2 text-sm font-semibold sm:text-base"
            >
              {`${calcVideoTimestamp(
                Math.round(context.playbackPosition)
              )} / ${calcVideoTimestamp(Math.round(duration))}`}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <div
        ref={timelineRef}
        onClick={(e) => handleClickToSeek(e)}
        onMouseDown={() => setIsScrubbing(true)}
        onTouchStart={() => setIsScrubbing(true)}
        className="h-1 border-b border-gray-300 bg-gray-200"
      >
        <div
          style={{
            transform: `translateX(-${
              100 - (context.playbackPosition / duration) * 100
            }%)`,
          }}
          className="relative flex h-full items-center bg-secondary"
        >
          <div className="absolute -right-2 aspect-square h-4 cursor-pointer rounded-full bg-secondary" />
        </div>
      </div>
      <div
        ref={imageContainerRef}
        className="flex h-16 items-center gap-4 p-2 font-display"
      >
        <button
          onClick={() => {
            void context.player?.togglePlay();
          }}
          className="text-3xl sm:text-4xl"
        >
          {context.isPlaying ? <PiPauseFill /> : <PiPlayFill />}
        </button>
        <SafeImage
          url={track.album.images[0]?.url}
          alt={track.name}
          width={height * 0.75}
          className="relative aspect-square overflow-hidden rounded"
        />
        <div className="flex-1 overflow-hidden">
          <h3 className="truncate font-display text-lg font-semibold sm:text-xl">
            {track.name}
          </h3>
          <p className="truncate text-sm text-gray-400 sm:text-base">
            {track.artists.map((artist, index) =>
              index === track.artists.length - 1
                ? artist.name
                : `${artist.name}, `
            )}
          </p>
        </div>
        <button
          onClick={() => setShowVolume(true)}
          className="relative flex justify-center text-3xl sm:text-4xl"
        >
          {volume === 0 ? (
            <PiSpeakerSlash />
          ) : volume < 0.5 ? (
            <PiSpeakerLow />
          ) : (
            <PiSpeakerHigh />
          )}
          <AnimatePresence>
            {showVolume && (
              <Popover setVisible={setShowVolume} className="h-32" y="top">
                <InputSlider
                  vertical
                  defaultValue={volume}
                  onSlideEnd={(value) => {
                    if (value[0] === undefined) return;
                    void context.player?.setVolume(value[0]);
                    setVolume(value[0]);
                    sessionStorage.setItem("volume", value[0].toString());
                  }}
                />
              </Popover>
            )}
          </AnimatePresence>
        </button>
        <Link href={track.uri} className="text-3xl sm:text-4xl">
          <PiSpotifyLogo />
        </Link>
      </div>
    </>
  );
};

export default Player;
