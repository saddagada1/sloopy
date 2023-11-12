import clsx from "clsx";
import { Resizable } from "re-resizable";
import { useEffect, useRef, useState } from "react";
import { type EditorValues } from "~/contexts/Editor";
import { pitchClassColours } from "~/utils/constants";
import Loading from "../utils/loading";
import { type PlayerValues } from "~/contexts/Player";
import { AnimatePresence, motion } from "framer-motion";
import { calcVideoTimestamp } from "~/utils/calc";

interface RulerProps {
  start?: number;
  segmentWidth: number;
  numOfSegments: number;
  unit: number;
  unitFocus?: number;
  width: number;
}

const Ruler: React.FC<RulerProps> = ({
  start,
  segmentWidth,
  numOfSegments,
  unit,
  unitFocus,
  width,
}) => {
  const segments = Array(numOfSegments + 1)
    .fill(null)
    .map((_, index) => index + (!start ? 0 : start));
  return (
    <div style={{ width: width }} className="flex h-full">
      {segments.map((segment) => {
        const focus = segment % (!unitFocus ? 10 : unitFocus) === 0;
        return (
          <span
            key={segment}
            className={focus ? "h-full bg-gray-400" : "h-3/4 bg-gray-300"}
            style={{
              width: segmentWidth,
              marginRight: segment === segments.length - 1 ? 0 : unit,
            }}
          />
        );
      })}
    </div>
  );
};

const SliderLoopHandle: React.FC = () => {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex h-1/2 w-full cursor-grab items-center justify-center rounded-full border border-gray-300 bg-primary">
        <span className="h-1/2 w-1/12 rounded bg-gray-400" />
      </div>
    </div>
  );
};

interface LoopTimelineProps {
  duration: number;
  width: number;
  disabled?: boolean;
  context: EditorValues | PlayerValues;
}

const LoopTimeline: React.FC<LoopTimelineProps> = ({
  duration,
  width,
  disabled,
  context,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null!);
  const unit = width / 100;
  const segmentWidth = 1;
  const snapTo = unit + segmentWidth;
  const sliderWidth = duration * snapTo + segmentWidth;
  const numScrollSections = sliderWidth / width;
  const [isResizing, setIsResizing] = useState(false);
  const [resizePosition, setResizePosition] = useState<number | null>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const scrollToIndex =
      (sliderWidth / numScrollSections) *
      Math.floor(context.playbackPosition / (duration / numScrollSections));
    if (container.scrollLeft === scrollToIndex) {
      return;
    }
    container.style.overflowX = "scroll";
    container.scrollTo({ left: scrollToIndex });
    container.style.overflowX = "hidden";
  }, [context.playbackPosition, duration, numScrollSections, sliderWidth]);

  if (!unit || !snapTo || !sliderWidth || !numScrollSections) {
    return <Loading />;
  }

  return (
    <>
      <AnimatePresence>
        {isResizing && resizePosition && (
          <div className="pointer-events-none fixed z-50 flex h-full w-full items-end justify-center">
            <motion.div
              initial={{ translateY: "-150%", opacity: 0 }}
              animate={{ translateY: "-200%", opacity: 1 }}
              exit={{ translateY: "0%", opacity: 0 }}
              transition={{ type: "tween", duration: 0.2 }}
              className="select-none rounded-md border border-gray-300 bg-primary px-3 py-2 text-sm font-semibold sm:text-base"
            >
              {`${calcVideoTimestamp(
                Math.round(resizePosition)
              )} / ${calcVideoTimestamp(Math.round(duration))}`}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <div
        ref={scrollContainerRef}
        className={clsx(
          "no-scrollbar h-24 border-b border-gray-300",
          !context.isPlaying && "overflow-x-scroll"
        )}
      >
        <div
          style={{ width: sliderWidth }}
          className={clsx(
            "relative flex h-full flex-col",
            width > sliderWidth && "border-r border-gray-300"
          )}
        >
          <div
            style={{
              transform: `translateX(-${
                100 - (context.playbackPosition / duration) * 100
              }%)`,
            }}
            className="absolute h-full w-full bg-gray-300/50"
          />
          <div className="h-1/5">
            <Ruler
              width={sliderWidth}
              numOfSegments={Math.round(duration)}
              segmentWidth={segmentWidth}
              unit={unit}
            />
          </div>
          <div key={context.loops.length} className="flex flex-1">
            {context.loops.map((loop, index) => (
              <Resizable
                key={loop.id}
                defaultSize={{
                  width: `${(loop.end - loop.start) * snapTo}`,
                  height: "100%",
                }}
                bounds="parent"
                enable={{ right: !disabled }}
                handleComponent={{ right: <SliderLoopHandle /> }}
                handleClasses={{ right: "z-10" }}
                onResizeStart={() => {
                  setIsResizing(true);
                  setResizePosition(loop.end);
                }}
                onResize={(_event, _direction, _refToElement, delta) =>
                  setResizePosition(loop.end + delta.width / snapTo)
                }
                onResizeStop={(_event, _direction, _refToElement, delta) => {
                  setIsResizing(false);
                  setResizePosition(null);
                  const loops = context.loops.map((lp, i) => {
                    if (i === index) {
                      lp.end = lp.end + delta.width / snapTo;
                    } else if (i > index) {
                      lp.start = lp.start + delta.width / snapTo;
                      lp.end = lp.end + delta.width / snapTo;
                    }
                    return lp;
                  });
                  context.setLoops(loops);
                  context.handlePlayingLoop(context.playbackPosition);
                }}
              >
                <div
                  style={{
                    backgroundColor: pitchClassColours[loop.key] + "80",
                  }}
                  className="h-full w-full rounded"
                />
              </Resizable>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default LoopTimeline;
