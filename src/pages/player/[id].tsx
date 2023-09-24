import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { PiPauseFill, PiPlayFill, PiRepeat } from "react-icons/pi";
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
import { useRef, useEffect } from "react";
import Chord from "~/components/sloops/Chord";
import LoopTimeline from "~/components/sloops/LoopTimeline";
import { usePlayerContext } from "~/contexts/Player";
import { WaveSpinner } from "react-spinners-kit";
import clsx from "clsx";
import { type Chords, type Loop } from "~/utils/types";
import { useEffectOnce, useElementSize } from "usehooks-ts";
import WithAuth from "~/components/utils/WithAuth";
import LoopButton from "~/components/sloops/LoopButton";
import ErrorView from "~/components/utils/ErrorView";
import chordsData from "public/chords.json";
import { useSession } from "next-auth/react";

const chords = chordsData as Chords;

const SloopPlayer: NextPage = ({}) => {
  const router = useRouter();
  const spotify = useSpotifyContext();
  const { data: session } = useSession();
  const playerCtx = usePlayerContext();
  const { data, isLoading, error } = api.sloops.get.useQuery({
    id: router.query.id as string,
    getPrivate: router.query.private === "true" ? true : undefined,
  });
  const { mutateAsync: updatePlays } =
    api.sloops.createOrUpdatePlay.useMutation();
  const t3 = api.useContext();
  const [containerRef, { width: containerWidth }] = useElementSize();
  const voicingRef = useRef<HTMLDivElement>(null!);

  const handleUpdatePlays = async (id: string) => {
    try {
      const response = await updatePlays({ id: id });
      if (!(response.updatedAt > response.createdAt)) {
        t3.sloops.get.setData({ id: id }, (cachedData) => {
          if (!cachedData) return;
          return {
            ...cachedData,
            rankedSloop: cachedData.rankedSloop
              ? {
                  ...cachedData.rankedSloop,
                  plays: cachedData.rankedSloop.plays + 1,
                }
              : null,
          };
        });
      }
    } catch (error) {
      return;
    }
  };

  useEffectOnce(() => {
    void handleUpdatePlays(router.query.id as string);
  });

  useEffect(() => {
    if (!data) return;
    playerCtx.initialize(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    if (!voicingRef.current || !playerCtx.playingLoop || !containerWidth)
      return;
    voicingRef.current.scrollTo({
      left: (containerWidth / 2) * 0.9 * playerCtx.playingLoop?.voicing,
    });
  }, [playerCtx.playingLoop, containerWidth]);

  if (isLoading || !spotify.auth) return <Loading />;

  if (!data || error) return <ErrorView />;

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
            <p className="px-1 font-display text-xs text-gray-400 sm:text-sm">
              Key
            </p>
            <p className="w-full pb-1 text-center text-sm font-semibold sm:text-base">{`${
              pitchClass[data.key]
            } ${mode[data.mode]}`}</p>
          </div>
          <div className="flex flex-1 flex-col items-start border-r border-gray-300 p-1">
            <p className="px-1 font-display text-xs text-gray-400 sm:text-sm">
              Tempo
            </p>
            <p className="w-full pb-1 text-center text-sm font-semibold sm:text-base">{`${Math.round(
              data.tempo
            )} BPM`}</p>
          </div>
          <div className="flex flex-1 flex-col items-start p-1">
            <p className="px-1 font-display text-xs text-gray-400 sm:text-sm">
              Time
            </p>
            <p className="w-full pb-1 text-center text-sm font-semibold sm:text-base">{`${data.timeSignature}/4`}</p>
          </div>
        </div>
        <div
          style={{ height: (containerWidth / 2) * 1.3 }}
          className="flex border-b border-gray-300"
        >
          <div className="grid flex-1 grid-rows-[repeat(10,_minmax(0,_1fr))]">
            <div className="row-span-3 flex flex-col items-start border-b px-2 pb-2 pt-1">
              <p className="font-display text-base text-gray-400 sm:text-lg">
                Chord
              </p>
              {playerCtx.playingLoop && (
                <p className="w-full truncate text-center text-2xl font-semibold sm:text-3xl">
                  {playerCtx.playingLoop.chord}
                </p>
              )}
            </div>
            <div className="row-[span_7_/_span_7] flex flex-col px-2 pb-2 pt-1">
              <p className="font-display text-base text-gray-400 sm:text-lg">
                Loops
              </p>
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
                  <p className="w-2/3 px-1 text-center font-display text-base text-gray-200 sm:text-lg">
                    {"No Loops :("}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div
            key={playerCtx.playingLoop?.id}
            className="relative flex flex-1 flex-col items-start justify-start border-l border-gray-300 px-2 pb-2 pt-1 "
          >
            <div className="flex w-full items-center justify-between font-display text-gray-400">
              <p className="text-base sm:text-lg">Voicings</p>
              {playerCtx.playingLoop && (
                <p className="-translate-y-1 text-xs sm:text-sm">
                  {`${playerCtx.playingLoop.voicing + 1}/${
                    chords[playerCtx.playingLoop.chord]?.length
                  }`}
                </p>
              )}
            </div>
            {playerCtx.playingLoop && (
              <div
                ref={voicingRef}
                onScroll={() =>
                  playerCtx.setLoops((loops) =>
                    loops.map((loop) => {
                      if (loop.id === playerCtx.playingLoop?.id) {
                        loop.voicing = Math.round(
                          voicingRef?.current?.scrollLeft /
                            ((containerWidth / 2) * 0.9)
                        );
                        return loop;
                      }
                      return loop;
                    })
                  )
                }
                className="no-scrollbar absolute flex h-full w-[90%] snap-x snap-mandatory overflow-x-scroll"
              >
                {chords[playerCtx.playingLoop.chord]!.map((chord, index) => (
                  <div
                    key={index}
                    className="h-full w-full flex-shrink-0 snap-start snap-always"
                  >
                    <Chord chord={chord} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-1 flex-col border-b border-gray-300 px-2 pb-2 pt-1">
          <p className="pb-1 font-display text-base text-gray-400 sm:text-lg">
            Composition / Notes
          </p>
          <div className="no-scrollbar aspect-video w-full flex-1 overflow-scroll rounded-md border border-gray-300 p-3 text-sm sm:text-base">
            {playerCtx.playingLoop?.notes}
          </div>
        </div>
        <LoopTimeline
          duration={data.duration}
          width={containerWidth}
          context={playerCtx}
          disabled
        />
        {session?.user.canPlaySpotify ? (
          <Player
            trackId={data.trackId}
            duration={data.duration}
            context={playerCtx}
          />
        ) : (
          <div className="flex h-[68px] items-center justify-center p-2">
            <p className="h-fit rounded border border-red-500 bg-red-200 p-1 text-xs text-red-500 sm:text-sm">
              Spotify Premium Required
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default WithAuth(SloopPlayer, { premium: true });
