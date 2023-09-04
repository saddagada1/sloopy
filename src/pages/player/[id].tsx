import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  PiCaretDown,
  PiCaretUp,
  PiPauseFill,
  PiPlayFill,
  PiRepeat,
} from "react-icons/pi";
import Loading from "~/components/utils/Loading";
import { api } from "~/utils/api";
import {
  mode,
  pitchClass,
  pitchClassColours,
  secondaryColour,
} from "~/utils/constants";
import { useSpotifyContext } from "~/contexts/Spotify";
import Player from "~/components/sloops/Player";
import { motion } from "framer-motion";
import {
  type DetailedHTMLProps,
  type HTMLAttributes,
  useRef,
  useState,
  useEffect,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchChords } from "~/utils/helpers";
import Chord from "~/components/sloops/Chord";
import LoopTimeline from "~/components/sloops/LoopTimeline";
import { usePlayerContext } from "~/contexts/Player";
import { WaveSpinner } from "react-spinners-kit";
import clsx from "clsx";
import { type UpdateSloopInput, type Loop } from "~/utils/types";
import { useElementSize } from "usehooks-ts";
import WithAuth from "~/components/utils/WithAuth";

interface LoopButtonProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  label: string;
  height: number;
  open?: boolean;
  children: React.ReactNode;
}

const LoopButton: React.FC<LoopButtonProps> = ({
  children,
  label,
  height,
  open,
  ...DetailedHTMLProps
}) => {
  const [expand, setExpand] = useState(false);
  return (
    <div
      {...DetailedHTMLProps}
      className="flex flex-col rounded text-sm font-semibold sm:text-base"
    >
      <div className="flex items-center justify-between p-1.5">
        <label>{label}</label>
        {!open && (
          <button
            className="text-xl sm:text-2xl"
            onClick={() => setExpand(!expand)}
          >
            {expand ? <PiCaretUp /> : <PiCaretDown />}
          </button>
        )}
      </div>
      <motion.div
        className="overflow-hidden"
        initial={{ height: 0 }}
        animate={{ height: expand || open ? height : 0 }}
      >
        {children}
      </motion.div>
    </div>
  );
};

const SloopPlayer: NextPage = ({}) => {
  const router = useRouter();
  const spotify = useSpotifyContext();
  const playerCtx = usePlayerContext();
  const { data, isLoading, error } = api.sloops.get.useQuery(
    {
      id: router.query.id as string,
    },
    {
      onSuccess: (data) => {
        if (!data) return;
        if (router.query.unsaved) {
          const unsavedData = localStorage.getItem("sloop");
          if (unsavedData) {
            const unsavedSloop = JSON.parse(unsavedData) as UpdateSloopInput;
            if (unsavedSloop.id === data.id) {
              const sloop = {
                ...data,
                ...unsavedSloop,
              };
              playerCtx.initialize(sloop);
              return;
            }
          }
        }
        playerCtx.initialize(data);
      },
    }
  );
  const {
    data: chords,
    isLoading: fetchingChords,
    error: chordsError,
  } = useQuery(["chords"], async () => {
    const response = await fetchChords();
    if (!response.ok) {
      throw new Error("Failed To Fetch Chords");
    }
    return response;
  });
  const [containerRef, { width: containerWidth }] = useElementSize();
  const variantsRef = useRef<HTMLDivElement>(null!);
  const [variantsScrollIndex, setVariantsScrollIndex] = useState(0);

  useEffect(() => {
    setVariantsScrollIndex(0);
  }, [playerCtx.playingLoop?.id]);

  if (isLoading || fetchingChords || !spotify.auth) return <Loading />;

  if ((!data || error) ?? (!chords || chordsError)) return <div>ERROR</div>;

  return (
    <>
      <Head>
        <title>Sloopy - Player</title>
      </Head>
      <div ref={containerRef} className="flex flex-1 flex-col overflow-hidden">
        <Link
          href="/"
          className="border-b border-gray-300 p-2 font-display text-3xl font-extrabold sm:text-4xl"
        >
          sloopy
        </Link>
        <div className="flex border-b border-gray-300">
          <div className="flex flex-1 flex-col items-start border-r border-gray-300 p-1">
            <label className="px-1 font-display text-xs text-gray-400 sm:text-sm">
              Key
            </label>
            <p className="w-full pb-1 text-center text-sm font-semibold sm:text-base">{`${
              pitchClass[data.key]
            } ${mode[data.mode]}`}</p>
          </div>
          <div className="flex flex-1 flex-col items-start border-r border-gray-300 p-1">
            <label className="px-1 font-display text-xs text-gray-400 sm:text-sm">
              Tempo
            </label>
            <p className="w-full pb-1 text-center text-sm font-semibold sm:text-base">{`${Math.round(
              data.tempo
            )} BPM`}</p>
          </div>
          <div className="flex flex-1 flex-col items-start p-1">
            <label className="px-1 font-display text-xs text-gray-400 sm:text-sm">
              Time
            </label>
            <p className="w-full pb-1 text-center text-sm font-semibold sm:text-base">{`${data.timeSignature}/4`}</p>
          </div>
        </div>
        <div
          style={{ height: (containerWidth / 2) * 1.3 }}
          className="flex border-b border-gray-300"
        >
          <div className="grid flex-1 grid-rows-[repeat(10,_minmax(0,_1fr))]">
            <div className="row-span-3 flex flex-col items-start border-b px-2 pb-2 pt-1">
              <label className="font-display text-base text-gray-400 sm:text-lg">
                Chord
              </label>
              {playerCtx.playingLoop && (
                <p className="w-full truncate text-center text-2xl font-semibold sm:text-3xl">
                  {playerCtx.playingLoop.chord}
                </p>
              )}
            </div>
            <div className="row-[span_7_/_span_7] flex flex-col px-2 pb-2 pt-1">
              <label className="font-display text-base text-gray-400 sm:text-lg">
                Loops
              </label>

              {(data.loops as Loop[]).length > 0 ? (
                <div className="no-scrollbar flex flex-col gap-1.5 overflow-scroll py-1">
                  {(data.loops as Loop[]).map((loop) => (
                    <LoopButton
                      key={loop.id}
                      style={{
                        backgroundColor: pitchClassColours[loop.key] + "80",
                      }}
                      label={`${pitchClass[loop.key]} ${mode[loop.mode]}`}
                      height={30}
                      open={loop.id === playerCtx.playingLoop?.id}
                    >
                      <div className="flex h-full justify-between px-1.5 pb-1.5 text-xl sm:text-2xl">
                        <div className="flex gap-4">
                          <button
                            onClick={() => {
                              if (playerCtx.repeatPlayingLoop) return;
                              void playerCtx.player?.seek(loop.start * 1000);
                              playerCtx.setPlaybackPosition(loop.start);
                              if (!playerCtx.isPlaying) {
                                playerCtx.setPlayingLoop(loop);
                              }
                            }}
                          >
                            {playerCtx.isPlaying &&
                            (loop.id === playerCtx.repeatPlayingLoop?.id ||
                              (!playerCtx.repeatPlayingLoop &&
                                loop.id === playerCtx.playingLoop?.id)) ? (
                              <PiPauseFill />
                            ) : (
                              <PiPlayFill />
                            )}
                          </button>
                          <button
                            className={clsx(
                              "rounded px-1 focus:outline-none",
                              playerCtx.repeatPlayingLoop &&
                                loop.id === playerCtx.repeatPlayingLoop?.id &&
                                "bg-secondary text-primary"
                            )}
                            onClick={() => {
                              if (loop.id === playerCtx.repeatPlayingLoop?.id) {
                                playerCtx.setRepeatPlayingLoop(null);
                              } else {
                                playerCtx.setRepeatPlayingLoop(loop);
                                if (
                                  playerCtx.playbackPosition >= loop.start &&
                                  loop.end >= playerCtx.playbackPosition
                                ) {
                                  return;
                                }
                                void playerCtx.player?.seek(loop.start * 1000);
                                playerCtx.setPlaybackPosition(loop.start);
                                if (!playerCtx.isPlaying) {
                                  playerCtx.setPlayingLoop(loop);
                                }
                              }
                            }}
                          >
                            <PiRepeat />
                          </button>
                        </div>
                        {playerCtx.isPlaying &&
                        (loop.id === playerCtx.repeatPlayingLoop?.id ||
                          (!playerCtx.repeatPlayingLoop &&
                            loop.id === playerCtx.playingLoop?.id)) ? (
                          <WaveSpinner
                            size={24}
                            color={secondaryColour}
                            loading={true}
                          />
                        ) : null}
                      </div>
                    </LoopButton>
                  ))}
                </div>
              ) : (
                <div className="flex w-full flex-1 items-center justify-center">
                  <label className="w-2/3 px-1 text-center font-display text-base text-gray-200 sm:text-lg">
                    {"No Loops :("}
                  </label>
                </div>
              )}
            </div>
          </div>
          <div
            key={playerCtx.playingLoop?.id}
            className="relative flex flex-1 flex-col items-start justify-start border-l border-gray-300 px-2 pb-2 pt-1 "
          >
            <div className="flex w-full items-center justify-between font-display text-gray-400">
              <label className="text-base sm:text-lg">Voicings</label>
              {playerCtx.playingLoop && (
                <label className="-translate-y-1 text-xs sm:text-sm">
                  {`${variantsScrollIndex + 1}/${
                    chords.data[playerCtx.playingLoop.chord]!.length
                  }`}
                </label>
              )}
            </div>
            {playerCtx.playingLoop && (
              <div
                ref={variantsRef}
                onScroll={() =>
                  setVariantsScrollIndex(
                    Math.round(
                      variantsRef?.current?.scrollLeft /
                        ((containerWidth / 2) * 0.9)
                    )
                  )
                }
                className="no-scrollbar absolute flex h-full w-[90%] snap-x snap-mandatory overflow-x-scroll"
              >
                {chords.data[playerCtx.playingLoop.chord]!.map(
                  (chord, index) => (
                    <div
                      key={index}
                      className="h-full w-full flex-shrink-0 snap-start snap-always"
                    >
                      <Chord chord={chord} />
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-1 flex-shrink flex-col border-b border-gray-300 px-2 pb-2 pt-1">
          <label className="pb-1 font-display text-base text-gray-400 sm:text-lg">
            Composition / Notes
          </label>
          {playerCtx.playingLoop && (
            <div className="w-full flex-1 rounded-md border border-gray-300 p-3 text-sm sm:text-base">
              {playerCtx.playingLoop.notes}
            </div>
          )}
        </div>
        <LoopTimeline
          duration={data.duration}
          width={containerWidth}
          context={playerCtx}
          disabled
        />
        <Player
          trackId={data.trackId}
          duration={data.duration}
          context={playerCtx}
        />
      </div>
    </>
  );
};

export default WithAuth(SloopPlayer, { linked: true, premium: true });
