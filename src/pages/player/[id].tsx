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
import { useEffect, useState } from "react";
import LoopTimeline from "~/components/sloops/loopTimeline";
import { usePlayerContext } from "~/contexts/player";
import { useElementSize, useWindowSize } from "usehooks-ts";
import LoopButton from "~/components/sloops/loopButton";
import ErrorView from "~/components/utils/errorView";
import ImageSection from "~/components/imageSection";
import { Accordion } from "@radix-ui/react-accordion";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import NoData from "~/components/noData";
import AudioTimeline from "~/components/sloops/audioTimeline";
import SpotifyButton from "~/components/spotifyButton";
import TrackButton from "~/components/trackButton";
import { calcSloopColours } from "~/utils/calc";
import TabViewer from "~/components/sloops/tabViewer";
import { type Tab } from "~/utils/types";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import Link from "next/link";

const Player: NextPage = ({}) => {
  const router = useRouter();
  const spotify = useSpotifyContext();
  const player = usePlayerContext();
  const { data, isLoading, error } = api.sloops.get.useQuery(
    {
      id: router.query.id as string,
      getPrivate: router.query.private === "true" ? true : undefined,
    },
    {
      enabled: typeof router.query.id === "string",
      onSuccess: (d) => {
        if (!d) return;
        void handleUpdatePlays(d.id);
      },
    }
  );
  const { mutateAsync: updatePlays } =
    api.sloops.createOrUpdatePlay.useMutation();
  const t3 = api.useContext();
  const [root, { width }] = useElementSize();
  const [container, { height }] = useElementSize();
  const { width: windowWidth } = useWindowSize();
  const [tab, setTab] = useState("loops");

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

  useEffect(() => {
    if (!data) return;
    player.initialize(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  if (isLoading || !spotify.auth) return <Loading />;

  if (!data || error) return <ErrorView />;

  return (
    <>
      <Head>
        <title>Sloopy - Player</title>
      </Head>
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
            alt={data.name}
            colours={calcSloopColours({
              ...data,
              ...data,
              loops: player.loops,
            })}
          />
          <TrackButton
            renderImage
            track={{ ...data.track, artists: data.artists }}
          />
          <SpotifyButton uri={`spotify:track:${data.trackId}`} />
          <div className="section">
            <h1 className="section-label">Name</h1>
            <p>{data.name}</p>
          </div>
          <div className="section flex-1">
            <h1 className="section-label">Description</h1>
            {data.description.length > 0 ? (
              <p>{data.description}</p>
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
        <nav className="section flex w-full shrink-0 gap-2 lg:hidden">
          <ImageSection
            key={player.loops.length}
            className="aspect-square h-full w-fit"
            alt={data.name}
            colours={calcSloopColours({
              ...data,
              loops: player.loops,
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
            <p className="line-clamp-2">{data.name}</p>
          </div>
        </nav>
        <div className="flex flex-1 flex-col gap-2 overflow-hidden">
          <header className="flex gap-2">
            <div className="section flex-1">
              <h1 className="section-label">Key</h1>
              <p>{`${pitchClass[data.key]} ${mode[data.mode]}`}</p>
            </div>
            <div className="section flex-1">
              <h1 className="section-label">Tempo</h1>
              <p>{`${Math.round(data.tempo)} BPM`}</p>
            </div>
            <div className="section flex-1">
              <h1 className="section-label">Time</h1>
              <p>{timeSignature[data.timeSignature]}</p>
            </div>
            <div className="section flex-1">
              <h1 className="section-label">Tuning</h1>
              <p>{tuning[data.tuning]?.name}</p>
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
                  <TabViewer
                    tabs={
                      player.playingLoop
                        ? (JSON.parse(player.playingLoop.composition) as Tab[])
                        : []
                    }
                  />
                </div>
              )}
              {((windowWidth < lgBreakpoint && tab === "loops") ||
                windowWidth > lgBreakpoint) && (
                <div
                  style={{ maxHeight: height }}
                  className="flex flex-1 flex-col gap-2 lg:flex-none lg:basis-1/4"
                >
                  <div className="section">
                    <h1 className="section-label">Chord</h1>
                    {player.playingLoop ? (
                      <p>
                        {`${player.playingLoop.chord} ${
                          mode[player.playingLoop.mode]
                        }`}
                      </p>
                    ) : (
                      <NoData>No loop.</NoData>
                    )}
                  </div>
                  <div className="section flex flex-1 flex-col overflow-hidden">
                    <h1 className="section-label flex-none">Loops</h1>
                    <ScrollArea className="section flex-1">
                      {player.loops.length > 0 ? (
                        <Accordion
                          type="multiple"
                          className="flex flex-col gap-2"
                        >
                          {player.loops.map((loop) => (
                            <LoopButton
                              key={loop.id}
                              loop={loop}
                              context={player}
                              disabled
                            />
                          ))}
                        </Accordion>
                      ) : (
                        <NoData>No loops :(</NoData>
                      )}
                    </ScrollArea>
                  </div>
                </div>
              )}
            </div>
            <div className="section">
              <LoopTimeline
                duration={data.duration}
                width={width}
                context={player}
              />
            </div>
            <div className="section flex flex-col gap-2">
              <AudioTimeline
                width={width}
                trackId={data.trackId}
                duration={data.duration}
                context={player}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Player;
