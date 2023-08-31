import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { PiFloppyDiskBack, PiPencilSimpleLine } from "react-icons/pi";
import Loading from "~/components/utils/Loading";
import { api } from "~/utils/api";
import { mode, pitchClass } from "~/utils/constants";
import { useSpotifyContext } from "~/contexts/Spotify";
import Player from "~/components/sloops/Player";
import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import CreateLoopModal from "~/components/sloops/CreateLoopModal";
import { type Loop } from "~/utils/types";
import { useQuery } from "@tanstack/react-query";
import { fetchChords } from "~/utils/helpers";
import Chord from "~/components/sloops/Chord";

const Editor: NextPage = ({}) => {
  const router = useRouter();
  const spotify = useSpotifyContext();
  const { data, isLoading, error } = api.sloops.get.useQuery(
    {
      id: router.query.id as string,
    },
    { refetchOnWindowFocus: false }
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
  const [createLoop, setCreateLoop] = useState(false);
  const [loops, setLoops] = useState<Loop[]>([]);

  useEffect(() => {
    if (data) {
      setLoops(data.loops as Loop[]);
    }
  }, [data]);

  const addLoop = ({
    key,
    mode,
    chord,
  }: {
    key: number;
    mode: number;
    chord: string;
  }) => {
    if (!data) return;

    let lastLoopEnd: number;
    let newLoopEnd: number;
    if (loops.length === 0) {
      lastLoopEnd = 0;
    } else {
      lastLoopEnd = loops[loops.length - 1]!.end;
    }
    if (lastLoopEnd + 2 > data.duration) {
      newLoopEnd = data.duration;
    } else {
      newLoopEnd = lastLoopEnd + 2;
    }
    const newLoop: Loop = {
      id: loops.length + 1,
      start: lastLoopEnd,
      end: newLoopEnd,
      key: key,
      mode: mode,
      chord: chord,
    };

    // if (newLoop.id === 1) {
    //   state.playingLoop = newLoop;
    // }
    setLoops((currentLoops) => [...currentLoops, newLoop]);
  };

  if (isLoading || fetchingChords || !spotify?.auth) return <Loading />;

  if ((!data || error) ?? (!chords || chordsError)) return <div>ERROR</div>;

  return (
    <>
      <Head>
        <title>Editor</title>
      </Head>
      <AnimatePresence>
        {createLoop && (
          <CreateLoopModal
            setVisible={setCreateLoop}
            chords={chords.data}
            onCreate={(loop) => addLoop(loop)}
          />
        )}
      </AnimatePresence>
      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-300 p-2">
          <Link
            href="/"
            className="font-display text-2xl font-extrabold sm:text-3xl"
          >
            sloopy
          </Link>
          <div className="flex gap-4 text-3xl sm:text-4xl">
            <button>
              <PiPencilSimpleLine />
            </button>
            <button>
              <PiFloppyDiskBack />
            </button>
          </div>
        </div>
        <div className="flex border-b border-gray-300">
          <button className="flex flex-1 flex-col items-start border-r border-gray-300 p-1">
            <label className="px-1 font-display text-xs text-gray-400 sm:text-sm">
              Key
            </label>
            <p className="w-full py-1 text-center text-sm font-semibold sm:text-base">{`${
              pitchClass[1]
            } ${mode[data.mode]}`}</p>
          </button>
          <button className="flex flex-1 flex-col items-start border-r border-gray-300 p-1">
            <label className="px-1 font-display text-xs text-gray-400 sm:text-sm">
              Tempo
            </label>
            <p className="w-full py-1 text-center text-sm font-semibold sm:text-base">{`${Math.round(
              data.tempo
            )} BPM`}</p>
          </button>
          <button className="flex flex-1 flex-col items-start p-1">
            <label className="px-1 font-display text-xs text-gray-400 sm:text-sm">
              Time Signature
            </label>
            <p className="w-full py-1 text-center text-sm font-semibold sm:text-base">{`${data.timeSignature}/4`}</p>
          </button>
        </div>
        <div className="grid h-72 grid-cols-2 grid-rows-6 border-b border-gray-300">
          <button className="row-span-2 flex flex-col items-start border-b border-r border-gray-300 p-1">
            <label className="px-1 font-display text-base text-gray-400 sm:text-lg">
              Chord
            </label>
            <p className="w-full text-center text-lg font-semibold sm:text-xl">
              C#Maj7
            </p>
          </button>
          <div className="row-span-6">
            {loops.length > 0 ? (
              <Chord
                chord={
                  chords.data[
                    Object.keys(chords.data).find(
                      (key) => key === loops[0]!.chord
                    )!
                  ]![0]!
                }
              />
            ) : (
              "make a loop"
            )}
          </div>
          <div className="row-span-4 flex flex-col gap-1 overflow-scroll border-r border-gray-300 p-2 font-display text-base font-bold sm:text-lg">
            {loops.map((loop) => (
              <button
                className="flex w-full justify-between rounded bg-gray-200 p-2"
                key={loop.id}
              >
                <span>{`${pitchClass[loop.key]} ${mode[loop.mode]}`}</span>
                <span>{loop.chord}</span>
              </button>
            ))}
            <button
              className="w-full rounded bg-secondary p-2 text-primary"
              onClick={() => setCreateLoop(true)}
            >
              Create Loop
            </button>
          </div>
        </div>
        <div className="flex-1 border-b border-gray-300"></div>
        <Player
          token={spotify.auth.access_token}
          trackId={data.trackId}
          duration={data.duration}
        />
      </main>
    </>
  );
};
export default Editor;
