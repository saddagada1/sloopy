import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import Loading from "~/components/utils/loading";
import { api } from "~/utils/api";
import {
  colourMod,
  mode,
  pitchClass,
  pitchClassColours,
  timeSignature,
  tuning,
} from "~/utils/constants";
import { useSpotifyContext } from "~/contexts/spotify";
import AudioTimeline from "~/components/sloops/audioTimeline";
import { useState, useEffect } from "react";
import CreateLoopModal from "~/components/sloops/createLoopModal";
import { useEditorContext } from "~/contexts/editor";
import { WaveSpinner } from "react-spinners-kit";
import { type UpdateSloopInput } from "~/utils/types";
import { useElementSize } from "usehooks-ts";
import { useSaveBeforeRouteChange } from "~/utils/hooks";
import { toast } from "sonner";
import ErrorView from "~/components/utils/errorView";
import ImageSection from "~/components/imageSection";
import { calcSloopColours } from "~/utils/calc";
import { Button } from "~/components/ui/button";
import TrackButton from "~/components/trackButton";
import SpotifyButton from "~/components/spotifyButton";
import NoData from "~/components/noData";
import LoopTimeline from "~/components/sloops/loopTimeline";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Accordion } from "~/components/ui/accordion";
import LoopButton from "~/components/sloops/loopButton";
import { Pause, Play, Repeat } from "lucide-react";
import TabEditor from "~/components/sloops/tabEditor";
import EditLoopModal from "~/components/sloops/editLoopModal";
import EditSloopModal from "~/components/sloops/editSloopModal";
import UnsavedChangesModal from "~/components/sloops/unsavedChangesModal";
import SaveSloopModal from "~/components/sloops/saveSloopModal";

const Editor: NextPage = ({}) => {
  const router = useRouter();
  const spotify = useSpotifyContext();
  const editor = useEditorContext();
  const { data, isLoading, error } = api.sloops.get.useQuery(
    {
      id: router.query.id as string,
      getPrivate: router.query.private === "true" ? true : undefined,
    },
    { enabled: typeof router.query.id === "string" }
  );
  const [container, { width, height }] = useElementSize();
  const [loopsContainer, { height: loopsHeight }] = useElementSize();
  const { mutateAsync: updateSloop } = api.sloops.update.useMutation();
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const { route, setRoute, disabled, setDisabled } = useSaveBeforeRouteChange();
  const t3 = api.useContext();

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
      t3.sloops.get.setData(
        {
          id: data.id,
          getPrivate: router.query.private === "true" ? true : undefined,
        },
        (cachedData) => {
          if (!cachedData) return;
          return {
            ...response,
            ...cachedData,
          };
        }
      );
      await t3.sloops.getSloops.reset();
      toast.dismiss(updateProgress);
      localStorage.removeItem(`sloop`);
      toast.success("Sloop Saved!", { duration: 4000 });
      void router.push(url);
    } catch (error) {
      toast.dismiss(updateProgress);
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
    if (!route) return;
    setUnsavedChanges(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route]);

  if (isLoading || !spotify.auth || !editor.generalInfo) return <Loading />;

  if (!data || error) return <ErrorView />;

  return (
    <>
      <Head>
        <title>Sloopy - Editor</title>
      </Head>
      {unsavedChanges && route && (
        <UnsavedChangesModal
          onExit={() => {
            localStorage.removeItem(`sloop`);
            void router.push(route);
          }}
          onSave={() => {
            setDisabled(true);
            void handleSaveSloop({
              url: route,
            });
          }}
        />
      )}
      <main
        ref={container}
        className="p-lg flex flex-1 flex-col gap-2 overflow-hidden lg:flex-row"
      >
        <nav className="hidden w-[200px] shrink-0 flex-col justify-end gap-2 lg:flex 2xl:w-[300px]">
          <ImageSection
            alt={editor.generalInfo?.name}
            colours={calcSloopColours({
              ...data,
              ...editor.generalInfo,
              loops: editor.loops,
            })}
          />
          <div className="section flex gap-2 bg-muted">
            <EditSloopModal />
            <SaveSloopModal
              onSave={() => {
                setDisabled(true);
                void handleSaveSloop({
                  url: "/profile",
                });
              }}
              onPublish={() => {
                setDisabled(true);
                void handleSaveSloop({
                  publish: data.isPrivate,
                  url: "/profile",
                });
              }}
              isPrivate={data.isPrivate}
            />
          </div>
          <TrackButton
            renderImage
            track={{ ...data.track, artists: data.artists }}
          />
          <SpotifyButton uri={`spotify:track:${data.trackId}`} />
          <div className="section">
            <h1 className="section-label">Name</h1>
            <p>{editor.generalInfo?.name}</p>
          </div>
          <div className="section flex-1">
            <h1 className="section-label">Description</h1>
            {editor.generalInfo?.description.length > 0 ? (
              <p>{editor.generalInfo?.description}</p>
            ) : (
              <NoData />
            )}
          </div>
        </nav>
        <nav className="flex w-full shrink-0 gap-2 lg:hidden">
          <ImageSection
            key={editor.loops.length}
            className="aspect-square h-full w-fit"
            alt={editor.generalInfo?.name}
            colours={calcSloopColours({
              ...data,
              ...editor.generalInfo,
              loops: editor.loops,
            })}
          />
          <TrackButton
            renderImage
            track={{ ...data.track, artists: data.artists }}
            className="w-fit"
            imageSize={65}
            imageOnly
          />
          <div className="section flex flex-1 flex-col">
            <h1 className="section-label">Name</h1>
            <p className="line-clamp-2">{editor.generalInfo?.name}</p>
          </div>
          <div className="flex flex-col gap-2">
            <SaveSloopModal
              onSave={() => {
                setDisabled(true);
                void handleSaveSloop({
                  url: "/profile",
                });
              }}
              onPublish={() => {
                setDisabled(true);
                void handleSaveSloop({
                  publish: data.isPrivate,
                  url: "/profile",
                });
              }}
              isPrivate={data.isPrivate}
            />
            <EditSloopModal />
          </div>
        </nav>
        <div
          style={{ maxHeight: height }}
          className="flex flex-1 flex-col gap-2 overflow-hidden"
        >
          <header className="flex gap-2">
            <div className="section flex-1">
              <h1 className="section-label">Key</h1>
              <p>{`${pitchClass[editor.generalInfo?.key]} ${
                mode[editor.generalInfo?.mode]
              }`}</p>
            </div>
            <div className="section flex-1">
              <h1 className="section-label">Tempo</h1>
              <p>{`${Math.round(editor.generalInfo?.tempo)} BPM`}</p>
            </div>
            <div className="section flex-1">
              <h1 className="section-label">Time</h1>
              <p>{timeSignature[editor.generalInfo?.timeSignature]}</p>
            </div>
            <div className="section flex-1">
              <h1 className="section-label">Tuning</h1>
              <p>{tuning[editor.generalInfo?.tuning]?.name}</p>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex flex-1 flex-col-reverse gap-2 lg:flex-row">
              <div className="section flex basis-3/4 flex-col">
                <h1 className="section-label flex-none">Composition</h1>
                <TabEditor key={editor.playingLoop?.id} />
              </div>
              <div className="flex basis-1/4 gap-2 lg:flex-col">
                <div className="flex flex-col gap-2 max-lg:basis-1/4">
                  <div className="section flex flex-1 flex-col">
                    <h1 className="section-label">Chord</h1>
                    {editor.playingLoop ? (
                      <p>
                        {`${editor.playingLoop.chord} ${
                          mode[editor.playingLoop.mode]
                        }`}
                      </p>
                    ) : (
                      <NoData className="flex-none">No loop.</NoData>
                    )}
                  </div>
                  <CreateLoopModal small className="lg:hidden" />
                </div>
                <div className="section flex basis-3/4 flex-col lg:flex-1">
                  <h1 className="section-label flex-none">Loops</h1>
                  <ScrollArea ref={loopsContainer} className="flex-1 lg:mb-2">
                    {editor.loops.length > 0 ? (
                      <Accordion
                        type="multiple"
                        style={{ height: loopsHeight }}
                        className="flex flex-col gap-2"
                      >
                        {editor.loops.map((loop) => (
                          <LoopButton
                            key={loop.id}
                            style={{
                              backgroundColor:
                                pitchClassColours[loop.key] + colourMod,
                            }}
                            loopId={loop.id.toString()}
                            chord={`${pitchClass[loop.key]} ${mode[loop.mode]}`}
                            className="section"
                          >
                            <div className="flex items-end">
                              <div className="flex flex-1 gap-2">
                                <Button
                                  onClick={() => {
                                    if (editor.repeatPlayingLoop) return;
                                    void editor.player?.seek(loop.start * 1000);
                                    editor.setPlaybackPosition(loop.start);
                                    if (!editor.isPlaying) {
                                      editor.setPlayingLoop(loop);
                                      void editor.player?.resume();
                                    } else {
                                      void editor.player?.pause();
                                    }
                                  }}
                                  variant="link"
                                  className="h-fit p-1"
                                >
                                  {editor.isPlaying &&
                                  (loop.id === editor.repeatPlayingLoop?.id ||
                                    (!editor.repeatPlayingLoop &&
                                      loop.id === editor.playingLoop?.id)) ? (
                                    <Pause
                                      strokeWidth={1}
                                      className="h-5 w-5 fill-foreground"
                                    />
                                  ) : (
                                    <Play
                                      strokeWidth={1}
                                      className="h-5 w-5 fill-foreground"
                                    />
                                  )}
                                </Button>
                                <Button
                                  variant={
                                    loop.id === editor.repeatPlayingLoop?.id
                                      ? "secondary"
                                      : "link"
                                  }
                                  className="h-fit p-1"
                                  onClick={() => {
                                    if (
                                      loop.id === editor.repeatPlayingLoop?.id
                                    ) {
                                      editor.setRepeatPlayingLoop(null);
                                    } else {
                                      editor.setRepeatPlayingLoop(loop);
                                      if (
                                        editor.playbackPosition >= loop.start &&
                                        loop.end >= editor.playbackPosition
                                      ) {
                                        return;
                                      }
                                      void editor.player?.seek(
                                        loop.start * 1000
                                      );
                                      editor.setPlaybackPosition(loop.start);
                                      if (!editor.isPlaying) {
                                        editor.setPlayingLoop(loop);
                                      }
                                    }
                                  }}
                                >
                                  <Repeat className="h-5 w-5" strokeWidth={1} />
                                </Button>
                              </div>
                              {editor.isPlaying &&
                              (loop.id === editor.repeatPlayingLoop?.id ||
                                (!editor.repeatPlayingLoop &&
                                  loop.id === editor.playingLoop?.id)) ? (
                                <WaveSpinner size={24} />
                              ) : (
                                <EditLoopModal loop={loop} />
                              )}
                            </div>
                          </LoopButton>
                        ))}
                      </Accordion>
                    ) : (
                      <NoData>Create a loop to begin!</NoData>
                    )}
                  </ScrollArea>
                  <CreateLoopModal className="hidden lg:block" />
                </div>
              </div>
            </div>
            <div className="section">
              <LoopTimeline
                duration={data.duration}
                width={width}
                context={editor}
              />
            </div>
            <div className="section flex flex-col gap-2">
              <AudioTimeline
                width={width}
                trackId={data.trackId}
                duration={data.duration}
                context={editor}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Editor;
