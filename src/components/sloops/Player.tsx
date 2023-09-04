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
import Loading from "../utils/Loading";
import { useElementSize } from "usehooks-ts";
import { AnimatePresence, motion } from "framer-motion";
import { calcVideoTimestamp, clamp } from "~/utils/calc";
import Popover from "../ui/Popover";
import InputSlider from "../ui/InputSlider";
import Link from "next/link";
import { type EditorValues } from "~/contexts/Editor";
import toast from "react-hot-toast";
import SafeImage from "../ui/SafeImage";
import { type PlayerValues } from "~/contexts/Player";

interface PlayerProps {
  trackId: string;
  duration: number;
  context: EditorValues | PlayerValues;
}

const Player: React.FC<PlayerProps> = ({ trackId, duration, context }) => {
  const spotify = useSpotifyContext();
  const { mutateAsync: initializePlayback } = useMutation({
    mutationFn: async () => {
      const playResponse = await spotify?.playTrack(context.deviceId, trackId);
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
  const { mutateAsync: transferPlayback } = useMutation({
    mutationFn: async () => {
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
  }, [duration, isScrubbing, context, timelineWidth]);

  useEffect(() => {
    if (!context.player || context.deviceId === "") return;

    if (context.error) {
      setIsLoading(false);
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
  }, [
    context.player,
    context.deviceId,
    context.error,
    initializePlayback,
    transferPlayback,
  ]);

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

  if (!context.player || !track || isLoading) {
    return (
      <div className="flex h-[68px]">
        <Loading />
      </div>
    );
  }

  if (context.error) {
    return <div className="h-[68px]">{context.error}</div>;
  }

  if (!context.isReady) {
    return <div className="h-[68px]">no internet</div>;
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
          <div
            onMouseDown={() => setIsScrubbing(true)}
            onTouchStart={() => setIsScrubbing(true)}
            className="absolute -right-2 aspect-square h-4 cursor-pointer rounded-full bg-secondary"
          />
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
