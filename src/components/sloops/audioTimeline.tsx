import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useSpotifyContext } from "~/contexts/spotify";
import { useEffectOnce, useElementSize } from "usehooks-ts";
import { calcVideoTimestamp, clamp } from "~/utils/calc";
import { type EditorValues } from "~/contexts/editor";
import { toast } from "sonner";
import { type PlayerValues } from "~/contexts/player";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Slider } from "../ui/slider";

interface AudioTimelineProps {
  width: number;
  trackId: string;
  duration: number;
  context: EditorValues | PlayerValues;
}

const AudioTimeline: React.FC<AudioTimelineProps> = ({
  width,
  trackId,
  duration,
  context,
}) => {
  const spotify = useSpotifyContext();
  const { mutateAsync: initializePlayback } = useMutation({
    mutationFn: async () => {
      if (context.deviceId === "") return;
      await spotify?.playTrack(context.deviceId, trackId);
      setIsLoading(false);
    },
    onError: () => toast.error(`Could not connect to Spotify. Please refresh.`),
  });
  const { mutateAsync: transferPlayback } = useMutation({
    mutationFn: async () => {
      if (context.deviceId === "") return;
      await spotify?.transferPlayback(context.deviceId);
    },
    onError: () => toast.error(`Could not connect to Spotify. Please refresh.`),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [updateTime, setUpdateTime] = useState(0);
  const [position, setPosition] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [timeline, { width: timelineWidth }] = useElementSize();

  const handleClickToSeek = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (isScrubbing || !context.player) return;
    const seekPercentage =
      clamp(e.clientX - (width - timelineWidth), 0, timelineWidth) /
      timelineWidth;
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
      const seekPercentage =
        clamp(e.clientX - (width - timelineWidth), 0, timelineWidth) /
        timelineWidth;
      const seekPosition = duration * seekPercentage;
      context.setPlaybackPosition(seekPosition);
    };

    const handleTouchScrub = (e: TouchEvent) => {
      if (!isScrubbing || !e.touches[0]) return;
      const seekPercentage =
        clamp(
          e.touches[0].clientX - (width - timelineWidth),
          0,
          timelineWidth
        ) / timelineWidth;
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
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!context.player) return;
      if (e.key === "ArrowLeft") {
        const playbackPosition = Math.max(context.playbackPosition - 5, 0);
        context.setPlaybackPosition(playbackPosition);
        void context.player.seek(playbackPosition * 1000);
        context.handlePlayingLoop(playbackPosition);
      }
      if (e.key === "ArrowRight") {
        const playbackPosition = Math.min(
          context.playbackPosition + 5,
          duration
        );
        context.setPlaybackPosition(playbackPosition);
        void context.player.seek(playbackPosition * 1000);
        context.handlePlayingLoop(playbackPosition);
      }
      if (e.key === "Space") {
        void context.player.togglePlay();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [context, duration]);

  useEffect(() => {
    if (!context.player) return;

    if (context.error) {
      toast.error(
        "Could not connect to Spotify. Please refresh the page and try again."
      );
      setIsLoading(false);
      return;
    }

    context.player.addListener("player_state_changed", (state) => {
      if (!state) {
        return;
      }
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

  return (
    <>
      <div
        ref={timeline}
        onClick={(e) => handleClickToSeek(e)}
        onMouseDown={() => setIsScrubbing(true)}
        onTouchStart={() => setIsScrubbing(true)}
        className="relative flex h-1.5 cursor-pointer items-center rounded border bg-accent"
      >
        <div className="h-full w-full overflow-hidden">
          <div
            style={{
              transform: `translateX(-${
                100 - (context.playbackPosition / duration) * 100
              }%)`,
            }}
            className="h-full bg-foreground"
          />
        </div>
        <div
          style={{
            right: `${100 - (context.playbackPosition / duration) * 100}%`,
          }}
          className="absolute h-4 w-4 translate-x-1/2 rounded-full bg-foreground"
        />
      </div>
      <div className="flex">
        <div className="flex flex-1 items-center gap-2">
          <Button
            onClick={() => {
              void context.player?.togglePlay();
            }}
            variant="outline"
            className="mono"
            autoFocus
          >
            {context.isPlaying ? "Pause" : "Play"}
          </Button>
          <p>{`${calcVideoTimestamp(
            Math.round(context.playbackPosition)
          )} / ${calcVideoTimestamp(Math.round(duration))}`}</p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="mono">
              Volume
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-fit">
            <Slider
              onValueChange={(value) => {
                if (value[0]) {
                  void context.player?.setVolume(value[0]);
                  setVolume(value[0]);
                  sessionStorage.setItem("volume", value[0].toString());
                }
              }}
              defaultValue={[volume]}
              max={1}
              step={0.01}
              orientation="vertical"
              className="h-[100px]"
            />
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
};

export default AudioTimeline;
