import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  PiCaretDown,
  PiCaretUp,
  PiFloppyDiskBack,
  PiPauseFill,
  PiPencilSimpleLine,
  PiPlayFill,
  PiPlus,
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
import { AnimatePresence, motion } from "framer-motion";
import {
  type DetailedHTMLProps,
  type HTMLAttributes,
  useRef,
  useState,
  useEffect,
} from "react";
import CreateLoopModal from "~/components/sloops/CreateLoopModal";
import { useQuery } from "@tanstack/react-query";
import { fetchChords } from "~/utils/helpers";
import Chord from "~/components/sloops/Chord";
import LoopTimeline from "~/components/sloops/LoopTimeline";
import { useEditorContext } from "~/contexts/Editor";
import { WaveSpinner } from "react-spinners-kit";
import clsx from "clsx";
import EditLoopModal from "~/components/sloops/EditLoopModal";
import { type Loop } from "~/utils/types";
import { useElementSize } from "usehooks-ts";
import EditSloopModal from "~/components/sloops/EditSloopModal";

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

const Editor: NextPage = ({}) => {
  const router = useRouter();
  const spotify = useSpotifyContext();
  const editor = useEditorContext();
  const { data, isLoading, error } = api.sloops.get.useQuery(
    {
      id: router.query.id as string,
    },
    {
      refetchOnWindowFocus: false,
      onSuccess: (data) => data && editor.initialize(data),
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
  const [createLoop, setCreateLoop] = useState(false);
  const [editLoop, setEditLoop] = useState<Loop | null>(null);
  const [editSloop, setEditSloop] = useState(false);
  const [containerRef, { width: containerWidth }] = useElementSize();
  const variantsRef = useRef<HTMLDivElement>(null!);
  const [variantsScrollIndex, setVariantsScrollIndex] = useState(0);

  useEffect(() => {
    setVariantsScrollIndex(0);
  }, [editor.playingLoop]);

  if (isLoading || fetchingChords || !spotify.auth) return <Loading />;

  if ((!data || error) ?? (!chords || chordsError)) return <div>ERROR</div>;

  return (
    <>
      <Head>
        <title>Editor</title>
      </Head>
      <AnimatePresence>
        {editSloop && (
          <EditSloopModal
            setVisible={setEditSloop}
            sloop={data}
            onEdit={(values) => editor.setGeneralInfo(values)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {createLoop && (
          <CreateLoopModal
            setVisible={setCreateLoop}
            chords={chords.data}
            onCreate={(loop) => editor.createLoop(loop)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {editLoop && (
          <EditLoopModal
            loop={editLoop}
            setLoop={setEditLoop}
            chords={chords.data}
            onEdit={(loop) => editor.updateLoop(loop)}
          />
        )}
      </AnimatePresence>
      <main ref={containerRef} className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-300 p-2">
          <Link
            href="/"
            className="font-display text-3xl font-extrabold sm:text-4xl"
          >
            sloopy
          </Link>
          <div className="flex gap-4 text-3xl sm:text-4xl">
            <button onClick={() => setEditSloop(true)}>
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
            <p className="w-full pb-1 text-center text-sm font-semibold sm:text-base">{`${
              pitchClass[editor.generalInfo?.key ?? data.key]
            } ${mode[editor.generalInfo?.mode ?? data.mode]}`}</p>
          </button>
          <button className="flex flex-1 flex-col items-start border-r border-gray-300 p-1">
            <label className="px-1 font-display text-xs text-gray-400 sm:text-sm">
              Tempo
            </label>
            <p className="w-full pb-1 text-center text-sm font-semibold sm:text-base">{`${Math.round(
              editor.generalInfo?.tempo ?? data.tempo
            )} BPM`}</p>
          </button>
          <button className="flex flex-1 flex-col items-start p-1">
            <label className="px-1 font-display text-xs text-gray-400 sm:text-sm">
              Time
            </label>
            <p className="w-full pb-1 text-center text-sm font-semibold sm:text-base">{`${
              editor.generalInfo?.timeSignature ?? data.timeSignature
            }/4`}</p>
          </button>
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
              {editor.playingLoop && (
                <p className="w-full truncate text-center text-2xl font-semibold sm:text-3xl">
                  {editor.playingLoop.chord}
                </p>
              )}
            </div>
            <div className="row-[span_7_/_span_7] flex flex-col px-2 pb-2 pt-1">
              <div className="flex w-full items-center justify-between font-display text-base text-gray-400 sm:text-lg">
                <label>Loops</label>
                <button onClick={() => setCreateLoop(true)}>
                  <PiPlus />
                </button>
              </div>
              {editor.loops.length > 0 ? (
                <div className="no-scrollbar flex flex-col gap-1.5 overflow-scroll py-1">
                  {editor.loops.map((loop) => (
                    <LoopButton
                      key={loop.id}
                      style={{
                        backgroundColor: pitchClassColours[loop.key] + "80",
                      }}
                      label={`${pitchClass[loop.key]} ${mode[loop.mode]}`}
                      height={30}
                      open={loop.id === editor.playingLoop?.id}
                    >
                      <div className="flex h-full justify-between px-1.5 pb-1.5 text-xl sm:text-2xl">
                        <div className="flex gap-4">
                          <button
                            onClick={() => {
                              if (editor.repeatPlayingLoop) return;
                              void editor.player?.seek(loop.start * 1000);
                              editor.setPlaybackPosition(loop.start);
                              if (!editor.isPlaying) {
                                editor.setPlayingLoop(loop);
                              }
                            }}
                          >
                            {editor.isPlaying &&
                            (loop.id === editor.repeatPlayingLoop?.id ||
                              (!editor.repeatPlayingLoop &&
                                loop.id === editor.playingLoop?.id)) ? (
                              <PiPauseFill />
                            ) : (
                              <PiPlayFill />
                            )}
                          </button>
                          <button
                            className={clsx(
                              "rounded px-1 focus:outline-none",
                              editor.repeatPlayingLoop &&
                                loop.id === editor.repeatPlayingLoop?.id &&
                                "bg-secondary text-primary"
                            )}
                            onClick={() => {
                              if (loop.id === editor.repeatPlayingLoop?.id) {
                                editor.setRepeatPlayingLoop(null);
                              } else {
                                editor.setRepeatPlayingLoop(loop);
                                if (
                                  editor.playbackPosition >= loop.start &&
                                  loop.end >= editor.playbackPosition
                                ) {
                                  return;
                                }
                                void editor.player?.seek(loop.start * 1000);
                                editor.setPlaybackPosition(loop.start);
                                if (!editor.isPlaying) {
                                  editor.setPlayingLoop(loop);
                                }
                              }
                            }}
                          >
                            <PiRepeat />
                          </button>
                        </div>
                        {editor.isPlaying &&
                        (loop.id === editor.repeatPlayingLoop?.id ||
                          (!editor.repeatPlayingLoop &&
                            loop.id === editor.playingLoop?.id)) ? (
                          <WaveSpinner
                            size={24}
                            color={secondaryColour}
                            loading={true}
                          />
                        ) : (
                          <button onClick={() => setEditLoop(loop)}>
                            <PiPencilSimpleLine />
                          </button>
                        )}
                      </div>
                    </LoopButton>
                  ))}
                </div>
              ) : (
                <div className="flex w-full flex-1 items-center justify-center">
                  <label className="w-2/3 px-1 text-center font-display text-base text-gray-200 sm:text-lg">
                    Create A Loop To Begin
                  </label>
                </div>
              )}
            </div>
          </div>
          <div className="relative flex flex-1 flex-col items-start justify-start border-l border-gray-300 px-2 pb-2 pt-1 ">
            <div className="flex w-full items-center justify-between font-display text-gray-400">
              <label className="text-base sm:text-lg">Voicings</label>
              {editor.playingLoop && (
                <label className="-translate-y-1 text-xs sm:text-sm">
                  {`${variantsScrollIndex + 1}/${
                    chords.data[editor.playingLoop.chord]!.length
                  }`}
                </label>
              )}
            </div>
            {editor.playingLoop && (
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
                {chords.data[editor.playingLoop.chord]!.map((chord, index) => (
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
        <div className="flex flex-1 flex-shrink flex-col border-b border-gray-300 px-2 pb-2 pt-1">
          <label className="pb-1 font-display text-base text-gray-400 sm:text-lg">
            Composition / Notes
          </label>
          <textarea className="w-full flex-1 resize-none rounded-md border border-gray-300 bg-transparent p-3 text-sm focus:outline-none sm:text-base" />
        </div>
        <LoopTimeline duration={data.duration} width={containerWidth} />
        <Player trackId={data.trackId} duration={data.duration} />
      </main>
    </>
  );
};
export default Editor;
