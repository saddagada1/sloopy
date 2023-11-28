import { type HTMLAttributes } from "react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { type Loop } from "~/utils/types";
import { type EditorValues } from "~/contexts/editor";
import { type PlayerValues } from "~/contexts/player";
import {
  colourMod,
  mode,
  pitchClass,
  pitchClassColours,
} from "~/utils/constants";
import { cn } from "~/utils/shadcn/utils";
import { Button } from "../ui/button";
import { Pause, Play, Repeat } from "lucide-react";
import EditLoopModal from "./editLoopModal";

interface LoopButtonProps extends HTMLAttributes<HTMLDivElement> {
  loop: Loop;
  context: EditorValues | PlayerValues;
  disabled?: boolean;
}

const LoopButton: React.FC<LoopButtonProps> = ({
  loop,
  context,
  disabled,
  ...props
}) => {
  const { style, className, ...rest } = props;
  return (
    <AccordionItem
      {...rest}
      style={{
        backgroundColor: pitchClassColours[loop.key] + colourMod,
        ...style,
      }}
      className={cn("section", className)}
      value={loop.id.toString()}
    >
      <AccordionTrigger className="h-6">{`${pitchClass[loop.key]} ${
        mode[loop.mode]
      }`}</AccordionTrigger>
      <AccordionContent>
        <div className="flex items-end">
          <div className="flex flex-1 gap-2">
            <Button
              onClick={() => {
                void context.player?.seek(loop.start * 1000);
                context.setPlaybackPosition(loop.start);
                if (!context.isPlaying) {
                  context.setPlayingLoop(loop);
                  void context.player?.resume();
                } else {
                  void context.player?.pause();
                }
              }}
              variant="link"
              className="h-fit p-1"
            >
              {context.isPlaying &&
              (loop.id === context.repeatPlayingLoop?.id ||
                (!context.repeatPlayingLoop &&
                  loop.id === context.playingLoop?.id)) ? (
                <Pause strokeWidth={1} className="h-5 w-5 fill-foreground" />
              ) : (
                <Play strokeWidth={1} className="h-5 w-5 fill-foreground" />
              )}
            </Button>
            <Button
              variant={
                loop.id === context.repeatPlayingLoop?.id ? "secondary" : "link"
              }
              className="h-fit p-1"
              onClick={() => {
                if (loop.id === context.repeatPlayingLoop?.id) {
                  context.setRepeatPlayingLoop(null);
                } else {
                  context.setRepeatPlayingLoop(loop);
                  if (
                    context.playbackPosition >= loop.start &&
                    loop.end >= context.playbackPosition
                  ) {
                    return;
                  }
                  void context.player?.seek(loop.start * 1000);
                  context.setPlaybackPosition(loop.start);
                  if (!context.isPlaying) {
                    context.setPlayingLoop(loop);
                  }
                }
              }}
            >
              <Repeat className="h-5 w-5" strokeWidth={1} />
            </Button>
          </div>
          {!context.isPlaying && !disabled && <EditLoopModal loop={loop} />}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default LoopButton;
