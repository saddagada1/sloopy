import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import Loading from "~/components/utils/loading";
import { api } from "~/utils/api";
import {
  lgBreakpoint,
  mode,
  pitchClass,
  timeSignature,
  tuning,
} from "~/utils/constants";
import { useSpotifyContext } from "~/contexts/spotify";
import AudioTimeline from "~/components/sloops/audioTimeline";
import { useState, useEffect } from "react";
import CreateLoopModal from "~/components/sloops/createLoopModal";
import { useEditorContext } from "~/contexts/editor";
import { useElementSize, useWindowSize } from "usehooks-ts";
import { useSaveBeforeRouteChange } from "~/utils/hooks";
import { toast } from "sonner";
import ErrorView from "~/components/utils/errorView";
import ImageSection from "~/components/imageSection";
import { calcSloopColours } from "~/utils/calc";
import TrackButton from "~/components/trackButton";
import SpotifyButton from "~/components/spotifyButton";
import NoData from "~/components/noData";
import LoopTimeline from "~/components/sloops/loopTimeline";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Accordion } from "~/components/ui/accordion";
import LoopButton from "~/components/sloops/loopButton";
import TabEditor from "~/components/sloops/tabEditor";
import EditSloopModal from "~/components/sloops/editSloopModal";
import ConfirmModal from "~/components/sloops/confirmModal";
import SaveSloopModal from "~/components/sloops/saveSloopModal";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import Link from "next/link";
import { type UpdateSloopInput } from "~/utils/types";

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
  const [localStorageVariant, setLocalStorageVariant] = useState<string | null>(
    null
  );
  const [root, { width }] = useElementSize();
  const [container, { height }] = useElementSize();
  const { width: windowWidth } = useWindowSize();
  const [tab, setTab] = useState("loops");
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
            ...cachedData,
            ...response,
          };
        }
      );
      await t3.sloops.getSloops.reset();
      toast.dismiss(updateProgress);
      localStorage.removeItem(data.id);
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
    const unsavedData = localStorage.getItem(data.id);
    if (!!unsavedData && unsavedData !== JSON.stringify(data)) {
      setLocalStorageVariant(unsavedData);
    } else {
      editor.initialize(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, router.query.unsaved]);

  useEffect(() => {
    if (!route) return;
    setUnsavedChanges(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route]);

  if (data && !!localStorageVariant) {
    return (
      <ConfirmModal
        title="Unsaved Changes"
        message="There is a variant of this sloop that does not match the one on our servers. Would you like to edit that instead?"
        onCancel={() => {
          localStorage.removeItem(data.id);
          editor.initialize(data);
          setLocalStorageVariant(null);
        }}
        onConfirm={() => {
          const variant = JSON.parse(localStorageVariant) as UpdateSloopInput;
          editor.initialize({ ...data, ...variant });
          setLocalStorageVariant(null);
        }}
        cancelLabel="Discard"
        confirmLabel="Edit"
        cancelDestructive
      />
    );
  }

  if (isLoading || !spotify.auth || !editor.generalInfo) return <Loading />;

  if (!data || error) return <ErrorView />;

  return (
    <>
      <Head>
        <title>Sloopy - Editor</title>
      </Head>
      {unsavedChanges && route && (
        <ConfirmModal
          title="Unsaved Changes"
          message="There may be unsaved changes. Would you like to save these changes
        before leaving?"
          onCancel={() => {
            localStorage.removeItem(data.id);
            void router.push(route);
          }}
          onConfirm={() => {
            setDisabled(true);
            void handleSaveSloop({
              url: route,
            });
          }}
          cancelLabel="Exit"
          confirmLabel="Save"
          cancelDestructive
        />
      )}
      <main
        ref={root}
        className="p-lg flex flex-1 flex-col gap-2 overflow-hidden lg:flex-row"
      >
        <nav className="hidden w-[200px] shrink-0 flex-col justify-end gap-2 lg:flex 2xl:w-[300px]">
          <Link
            href="/"
            className="section t3 text-center font-extrabold uppercase"
          >
            Sloopy
          </Link>
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
        <Link
          href="/"
          className="section t3 text-center font-extrabold uppercase lg:hidden"
        >
          Sloopy
        </Link>
        <nav className="flex h-24 w-full shrink-0 gap-2 overflow-hidden lg:hidden">
          <ImageSection
            key={editor.loops.length}
            className="h-full w-24"
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
            imageSize={79}
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
        <div className="flex flex-1 flex-col gap-2 overflow-hidden">
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
            <Tabs
              className="w-full lg:hidden"
              onValueChange={(value) => setTab(value)}
              defaultValue="loops"
            >
              <TabsList className="gap-2">
                <TabsTrigger value="loops">Loops</TabsTrigger>
                <TabsTrigger value="tabs">Tabs</TabsTrigger>
              </TabsList>
            </Tabs>
            <div
              ref={container}
              className="flex flex-1 flex-col-reverse gap-2 lg:flex-row"
            >
              {((windowWidth < lgBreakpoint && tab === "tabs") ||
                windowWidth > lgBreakpoint) && (
                <div
                  style={{ maxHeight: height }}
                  className="section flex flex-1 flex-col overflow-hidden lg:flex-none lg:basis-3/4"
                >
                  <h1 className="section-label flex-none">Composition</h1>
                  <TabEditor
                    key={`${editor.playingLoop?.id}${editor.playingLoop?.composition}`}
                  />
                </div>
              )}
              {((windowWidth < lgBreakpoint && tab === "loops") ||
                windowWidth > lgBreakpoint) && (
                <div
                  style={{ maxHeight: height }}
                  className="lg:flex-nonw flex flex-1 flex-col gap-2 lg:basis-1/4"
                >
                  <div className="section">
                    <h1 className="section-label">Chord</h1>
                    {editor.playingLoop ? (
                      <p>
                        {`${editor.playingLoop.chord} ${
                          mode[editor.playingLoop.mode]
                        }`}
                      </p>
                    ) : (
                      <NoData>No loop.</NoData>
                    )}
                  </div>
                  <div className="section flex flex-1 flex-col overflow-hidden">
                    <h1 className="section-label flex-none">Loops</h1>
                    <ScrollArea className="section mb-2 flex-1">
                      {editor.loops.length > 0 ? (
                        <Accordion
                          type="multiple"
                          className="flex flex-col gap-2"
                        >
                          {editor.loops.map((loop) => (
                            <LoopButton
                              key={loop.id}
                              loop={loop}
                              context={editor}
                            />
                          ))}
                        </Accordion>
                      ) : (
                        <NoData>Create a loop to begin!</NoData>
                      )}
                    </ScrollArea>
                    <CreateLoopModal />
                  </div>
                </div>
              )}
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
