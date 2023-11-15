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
import { useEffect } from "react";
import LoopTimeline from "~/components/sloops/loopTimeline";
import { usePlayerContext } from "~/contexts/player";
import { WaveSpinner } from "react-spinners-kit";
import { useEffectOnce, useElementSize } from "usehooks-ts";
import LoopButton from "~/components/sloops/loopButton";
import ErrorView from "~/components/utils/errorView";
import ImageSection from "~/components/imageSection";
import { Accordion } from "@radix-ui/react-accordion";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Pause, Play, Repeat } from "lucide-react";
import NoData from "~/components/noData";
import AudioTimeline from "~/components/sloops/audioTimeline";
import TabEditor from "~/components/sloops/tabEditor";
import SpotifyButton from "~/components/spotifyButton";
import TrackButton from "~/components/trackButton";
import { calcSloopColours } from "~/utils/calc";
import { Button } from "~/components/ui/button";

const Player: NextPage = ({}) => {
  const router = useRouter();
  const spotify = useSpotifyContext();
  const player = usePlayerContext();
  const { data, isLoading, error } = api.sloops.get.useQuery({
    id: router.query.id as string,
    getPrivate: router.query.private === "true" ? true : undefined,
  });
  const { mutateAsync: updatePlays } =
    api.sloops.createOrUpdatePlay.useMutation();
  const t3 = api.useContext();
  const [container, { width, height }] = useElementSize();
  const [loopsContainer, { height: loopsHeight }] = useElementSize();

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
        ref={container}
        className="p-lg flex flex-1 flex-col gap-2 overflow-hidden lg:flex-row"
      >
        <nav className="hidden w-[200px] shrink-0 flex-col justify-end gap-2 lg:flex 2xl:w-[300px]">
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
        <nav className="flex w-full shrink-0 gap-2 lg:hidden">
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
        <div
          style={{ maxHeight: height }}
          className="flex flex-1 flex-col gap-2 overflow-hidden"
        >
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
            <div className="flex flex-1 flex-col-reverse gap-2 lg:flex-row">
              <div className="section flex basis-3/4 flex-col">
                <h1 className="section-label flex-none">Composition</h1>
                <TabEditor disabled />
              </div>
              <div className="flex basis-1/4 gap-2 lg:flex-col">
                <div className="flex flex-col gap-2 max-lg:basis-1/4">
                  <div className="section flex flex-1 flex-col">
                    <h1 className="section-label">Chord</h1>
                    {player.playingLoop ? (
                      <p>
                        {`${player.playingLoop.chord} ${
                          mode[player.playingLoop.mode]
                        }`}
                      </p>
                    ) : (
                      <NoData className="flex-none">No loop.</NoData>
                    )}
                  </div>
                </div>
                <div className="section flex basis-3/4 flex-col lg:flex-1">
                  <h1 className="section-label flex-none">Loops</h1>
                  <ScrollArea ref={loopsContainer} className="flex-1">
                    {player.loops.length > 0 ? (
                      <Accordion
                        type="multiple"
                        style={{ height: loopsHeight }}
                        className="flex flex-col gap-2"
                      >
                        {player.loops.map((loop) => (
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
                                    if (player.repeatPlayingLoop) return;
                                    void player.player?.seek(loop.start * 1000);
                                    player.setPlaybackPosition(loop.start);
                                    if (!player.isPlaying) {
                                      player.setPlayingLoop(loop);
                                      void player.player?.resume();
                                    } else {
                                      void player.player?.pause();
                                    }
                                  }}
                                  variant="link"
                                  className="h-fit p-1"
                                >
                                  {player.isPlaying &&
                                  (loop.id === player.repeatPlayingLoop?.id ||
                                    (!player.repeatPlayingLoop &&
                                      loop.id === player.playingLoop?.id)) ? (
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
                                    loop.id === player.repeatPlayingLoop?.id
                                      ? "secondary"
                                      : "link"
                                  }
                                  className="h-fit p-1"
                                  onClick={() => {
                                    if (
                                      loop.id === player.repeatPlayingLoop?.id
                                    ) {
                                      player.setRepeatPlayingLoop(null);
                                    } else {
                                      player.setRepeatPlayingLoop(loop);
                                      if (
                                        player.playbackPosition >= loop.start &&
                                        loop.end >= player.playbackPosition
                                      ) {
                                        return;
                                      }
                                      void player.player?.seek(
                                        loop.start * 1000
                                      );
                                      player.setPlaybackPosition(loop.start);
                                      if (!player.isPlaying) {
                                        player.setPlayingLoop(loop);
                                      }
                                    }
                                  }}
                                >
                                  <Repeat className="h-5 w-5" strokeWidth={1} />
                                </Button>
                              </div>
                              {player.isPlaying &&
                              (loop.id === player.repeatPlayingLoop?.id ||
                                (!player.repeatPlayingLoop &&
                                  loop.id === player.playingLoop?.id)) ? (
                                <WaveSpinner size={24} />
                              ) : null}
                            </div>
                          </LoopButton>
                        ))}
                      </Accordion>
                    ) : (
                      <NoData>No loops have been made :(</NoData>
                    )}
                  </ScrollArea>
                </div>
              </div>
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
