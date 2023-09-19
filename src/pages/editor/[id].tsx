import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import {
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
import { AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import CreateLoopModal from "~/components/sloops/CreateLoopModal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchChords } from "~/utils/helpers";
import Chord from "~/components/sloops/Chord";
import LoopTimeline from "~/components/sloops/LoopTimeline";
import { useEditorContext } from "~/contexts/Editor";
import { WaveSpinner } from "react-spinners-kit";
import clsx from "clsx";
import EditLoopModal from "~/components/sloops/EditLoopModal";
import {
  type UpdateSloopInput,
  type Loop,
  type PageUser,
  type PageSloop,
} from "~/utils/types";
import { useElementSize } from "usehooks-ts";
import EditSloopModal from "~/components/sloops/EditSloopModal";
import { useSaveBeforeRouteChange } from "~/utils/hooks";
import toast from "react-hot-toast";
import Modal from "~/components/ui/Modal";
import StyledLoadingButton from "~/components/ui/form/StyledLoadingButton";
import LoadingButton from "~/components/ui/LoadingButton";
import WithAuth from "~/components/utils/WithAuth";
import LoopButton from "~/components/sloops/LoopButton";
import ErrorView from "~/components/utils/ErrorView";

const Editor: NextPage = ({}) => {
  const router = useRouter();
  const spotify = useSpotifyContext();
  const editor = useEditorContext();
  const { data, isLoading, error } = api.sloops.getUserSloop.useQuery({
    id: router.query.id as string,
  });
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
  const [saveSloop, setSaveSloop] = useState(false);
  const [containerRef, { width: containerWidth }] = useElementSize();
  const voicingRef = useRef<HTMLDivElement>(null!);
  const {
    mutateAsync: updateSloop,
    isLoading: updatingSloop,
    variables,
  } = api.sloops.update.useMutation();
  const { route, setRoute, disabled, setDisabled } = useSaveBeforeRouteChange();
  const ctx = useQueryClient();

  const handleSaveSloop = async ({
    publish,
    url,
  }: {
    publish?: boolean;
    url: string;
  }) => {
    if (!data || !editor.generalInfo) return;
    const updateProgress = toast.loading(
      !publish ? "Saving Sloop..." : "Saving and Publishing Sloop..."
    );
    try {
      const response = await updateSloop({
        ...data,
        ...editor.generalInfo,
        loops: editor.loops,
        isPrivate: publish === undefined ? data.isPrivate : !publish,
      });
      ctx.setQueryData(
        [["sloops", "get"], { input: { id: data.id }, type: "query" }],
        (cachedData: PageSloop | undefined) => {
          if (!cachedData) return;
          return {
            ...response,
            _count: cachedData._count,
          };
        }
      );
      ctx.setQueryData(
        [["sloops", "getUserSloop"], { input: { id: data.id }, type: "query" }],
        (cachedData: PageSloop | undefined) => {
          if (!cachedData) return;
          return {
            ...response,
            _count: cachedData._count,
          };
        }
      );
      ctx.setQueryData(
        [["users", "getSessionUser"], { type: "query" }],
        (cachedData: PageUser | undefined) => {
          if (!cachedData) return;
          return {
            ...cachedData,
            sloops: cachedData.sloops.map((sloop) => {
              if (sloop.id === response.id) {
                return { ...response, _count: { likes: sloop._count.likes } };
              }
              return sloop;
            }),
          };
        }
      );
      toast.remove(updateProgress);
      localStorage.removeItem(`sloop`);
      toast.success("Sloop Saved!", { duration: 4000 });
      void router.push(url);
    } catch (error) {
      toast.remove(updateProgress);
      toast.error("Error: Could Not Save Sloop. Please Try Again.");
      if (route) {
        setRoute(null);
      }
      if (disabled) {
        setDisabled(false);
      }
    }
  };

  useEffect(() => {
    if (!data) return;
    if (editor.generalInfo !== null) return;
    if (router.query.unsaved) {
      const unsavedData = localStorage.getItem("sloop");
      if (unsavedData) {
        const unsavedSloop = JSON.parse(unsavedData) as UpdateSloopInput;
        if (unsavedSloop.id === data.id) {
          const sloop = {
            ...data,
            ...unsavedSloop,
          };
          editor.initialize(sloop);
          return;
        }
      }
    }
    editor.initialize(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, router.query.unsaved]);

  useEffect(() => {
    if (!voicingRef.current || !editor.playingLoop || !containerWidth) return;
    voicingRef.current.scrollTo({
      left: (containerWidth / 2) * 0.9 * editor.playingLoop?.voicing,
    });
  }, [editor.playingLoop, containerWidth]);

  useEffect(() => {
    if (!route) return;
    void handleSaveSloop({ url: route });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route]);

  if (isLoading || fetchingChords || !spotify.auth) return <Loading />;

  if ((!data || error) ?? (!chords || chordsError)) return <ErrorView />;

  return (
    <>
      <Head>
        <title>Editor</title>
      </Head>
      <AnimatePresence>
        {editSloop && (
          <EditSloopModal
            setVisible={setEditSloop}
            sloopInfo={editor.generalInfo}
            onEdit={(values) => editor.setGeneralInfo(values)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {saveSloop && (
          <Modal setVisible={setSaveSloop}>
            {data.isPrivate ? (
              <>
                <LoadingButton
                  className="flex h-14 w-full items-center justify-center rounded-md border border-gray-300 bg-gray-200 font-display text-base font-bold sm:text-lg"
                  loading={updatingSloop && !!variables?.isPrivate}
                  disabled={updatingSloop}
                  onClick={() => {
                    setDisabled(true);
                    void handleSaveSloop({
                      publish: false,
                      url: "/profile?tab=private",
                    });
                  }}
                >
                  Save & Exit
                </LoadingButton>
                <div className="mt-4 border-t border-gray-300 pt-4">
                  <StyledLoadingButton
                    label="Save & Publish"
                    loading={updatingSloop && !variables?.isPrivate}
                    disabled={updatingSloop}
                    onClick={() => {
                      setDisabled(true);
                      void handleSaveSloop({
                        publish: true,
                        url: "/profile?tab=published",
                      });
                    }}
                  />
                </div>
              </>
            ) : (
              <>
                <LoadingButton
                  className="flex h-14 w-full items-center justify-center rounded-md border border-gray-300 bg-gray-200 font-display text-base font-bold sm:text-lg"
                  loading={updatingSloop && !!variables?.isPrivate}
                  disabled={updatingSloop}
                  onClick={() => {
                    setDisabled(true);
                    void handleSaveSloop({
                      publish: false,
                      url: "/profile?tab=private",
                    });
                  }}
                >
                  Save & Make Private
                </LoadingButton>
                <div className="mt-4 border-t border-gray-300 pt-4">
                  <StyledLoadingButton
                    label="Save & Exit"
                    loading={updatingSloop && !variables?.isPrivate}
                    disabled={updatingSloop}
                    onClick={() => {
                      setDisabled(true);
                      void handleSaveSloop({
                        url: "/profile?tab=published",
                      });
                    }}
                  />
                </div>
              </>
            )}
          </Modal>
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
      <div ref={containerRef} className="flex flex-1 flex-col overflow-hidden">
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
            <button onClick={() => setSaveSloop(true)}>
              <PiFloppyDiskBack />
            </button>
          </div>
        </div>
        <div className="flex border-b border-gray-300">
          <div className="flex flex-1 flex-col items-start border-r border-gray-300 p-1">
            <p className="px-1 font-display text-xs text-gray-400 sm:text-sm">
              Key
            </p>
            <p className="w-full pb-1 text-center text-sm font-semibold sm:text-base">{`${
              pitchClass[editor.generalInfo?.key ?? data.key]
            } ${mode[editor.generalInfo?.mode ?? data.mode]}`}</p>
          </div>
          <div className="flex flex-1 flex-col items-start border-r border-gray-300 p-1">
            <p className="px-1 font-display text-xs text-gray-400 sm:text-sm">
              Tempo
            </p>
            <p className="w-full pb-1 text-center text-sm font-semibold sm:text-base">{`${Math.round(
              editor.generalInfo?.tempo ?? data.tempo
            )} BPM`}</p>
          </div>
          <div className="flex flex-1 flex-col items-start p-1">
            <p className="px-1 font-display text-xs text-gray-400 sm:text-sm">
              Time
            </p>
            <p className="w-full pb-1 text-center text-sm font-semibold sm:text-base">{`${
              editor.generalInfo?.timeSignature ?? data.timeSignature
            }/4`}</p>
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
              {editor.playingLoop && (
                <p className="w-full truncate text-center text-2xl font-semibold sm:text-3xl">
                  {editor.playingLoop.chord}
                </p>
              )}
            </div>
            <div className="row-[span_7_/_span_7] flex flex-col px-2 pb-2 pt-1">
              <div className="flex w-full items-center justify-between font-display text-base text-gray-400 sm:text-lg">
                <p>Loops</p>
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
                  <p className="w-2/3 px-1 text-center font-display text-base text-gray-300 sm:text-lg">
                    Create a loop to begin!
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="relative flex flex-1 flex-col items-start justify-start border-l border-gray-300 px-2 pb-2 pt-1 ">
            <div className="flex w-full items-center justify-between font-display text-gray-400">
              <p className="text-base sm:text-lg">Voicings</p>
              {editor.playingLoop && (
                <p className="-translate-y-1 text-xs sm:text-sm">
                  {`${editor.playingLoop.voicing + 1}/${
                    chords.data[editor.playingLoop.chord]?.length
                  }`}
                </p>
              )}
            </div>
            {editor.playingLoop && (
              <div
                ref={voicingRef}
                onScroll={() =>
                  editor.setLoops((loops) =>
                    loops.map((loop) => {
                      if (loop.id === editor.playingLoop?.id) {
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
                {chords.data[editor.playingLoop.chord]?.map((chord, index) => (
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
          {editor.playingLoop ? (
            <textarea
              value={editor.playingLoop.notes}
              onChange={(e) =>
                editor.setLoops(
                  editor.loops.map((loop) => {
                    if (loop.id === editor.playingLoop?.id) {
                      loop.notes = e.target.value;
                      return loop;
                    }
                    return loop;
                  })
                )
              }
              autoComplete="off"
              autoCorrect="off"
              className="no-scrollbar aspect-video w-full flex-1 resize-none rounded-md border border-gray-300 bg-transparent p-3 text-sm focus:outline-none sm:text-base"
            />
          ) : (
            <div className="aspect-video w-full flex-1 rounded-md border border-gray-300" />
          )}
        </div>
        <LoopTimeline
          duration={data.duration}
          width={containerWidth}
          context={editor}
        />
        <Player
          trackId={data.trackId}
          duration={data.duration}
          context={editor}
        />
      </div>
    </>
  );
};

export default WithAuth(Editor, { linked: true, premium: true });
