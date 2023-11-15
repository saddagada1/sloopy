import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useSpotifyContext } from "~/contexts/spotify";
import { useQuery } from "@tanstack/react-query";
import Loading from "~/components/utils/loading";
import { api } from "~/utils/api";
import { TRPCClientError } from "@trpc/client";
import { toast } from "sonner";
import ErrorView from "~/components/utils/errorView";
import TrackButton from "~/components/trackButton";
import SloopForm from "~/components/sloops/sloopForm";
import { useSession } from "next-auth/react";
import Marquee from "~/components/marquee";

const Create: NextPage = ({}) => {
  const router = useRouter();
  const spotify = useSpotifyContext();
  const { data: session } = useSession();
  const { mutateAsync: createSloop } = api.sloops.create.useMutation();
  const {
    data: track,
    isFetching: fetchingTrack,
    error: trackError,
  } = useQuery(
    ["track", router.query.track],
    async () => {
      const id = router.query.track;
      if (typeof id !== "string") {
        throw new Error("404");
      }
      const trackResponse = await spotify.fetchTrack(id);
      if (!trackResponse?.ok) {
        throw new Error("Error: Could Not Fetch Spotify Data");
      }
      return trackResponse.data;
    },
    {
      enabled: !!spotify.auth,
    }
  );
  const {
    data: analysis,
    isLoading: fetchingAnalysis,
    error: analysisError,
  } = useQuery(
    ["analysis", router.query.track],
    async () => {
      const id = router.query.track;
      if (typeof id !== "string") {
        throw new Error("404");
      }
      const analysisResponse = await spotify.fetchTrackAnalysis(id);
      if (!analysisResponse?.ok) {
        throw new Error("Error: Could Not Fetch Spotify Data");
      }
      return analysisResponse.data;
    },
    {
      enabled: !!spotify.auth,
    }
  );
  const {
    data: artists,
    isLoading: fetchingArtists,
    error: artistsError,
  } = useQuery(
    ["artists", track?.artists.map((artist) => artist.id)],
    async () => {
      if (!track) {
        throw new Error("404");
      }
      const artistsResponse = await spotify.fetchArtists(
        track.artists.map((artist) => artist.id)
      );
      if (!artistsResponse?.ok) {
        throw new Error("Error: Could Not Fetch Spotify Data");
      }
      return artistsResponse.data;
    },
    {
      enabled: !!spotify.auth && !fetchingTrack,
    }
  );

  if (fetchingTrack || fetchingAnalysis || fetchingArtists) {
    return <Loading />;
  }

  if (
    (!track || trackError) ??
    (!analysis || analysisError) ??
    (!artists || artistsError)
  ) {
    return <ErrorView />;
  }

  return (
    <>
      <Head>
        <title>Sloopy - Create Sloop</title>
      </Head>
      <main className="flex flex-1 flex-col gap-2 overflow-y-scroll">
        <Marquee label="Create">New Sloop</Marquee>
        <div className="section flex-1">
          <h1 className="section-label flex-none">General Information</h1>
          <TrackButton renderImage track={track} className="mb-8" />
          <SloopForm
            className="mb-8 flex w-full flex-col gap-8 border-b pb-8 lg:flex-row"
            defaultValues={{
              key: analysis.track.key,
              mode: analysis.track.mode,
              tempo: analysis.track.tempo,
              timeSignature: analysis.track.time_signature,
              tuning: 0,
              name: track.name,
              description: `Sloop of ${track.name} by ${session?.user.username}`,
            }}
            onFormSubmit={async (values) => {
              try {
                const response = await createSloop({
                  ...values,
                  type: "spotify",
                  trackId: track.id,
                  trackName: track.name,
                  trackImage: track.album.images[0]?.url,
                  artists: artists.artists.map((artist) => {
                    return {
                      spotifyId: artist.id,
                      image: artist.images[0]?.url,
                      name: artist.name,
                    };
                  }),
                  duration: analysis.track.duration,
                  key: analysis.track.key,
                  mode: analysis.track.mode,
                  tempo: analysis.track.tempo,
                  timeSignature: analysis.track.time_signature,
                });
                void router.replace(`/editor/${response}?private=true`);
              } catch (error) {
                if (error instanceof TRPCClientError) {
                  toast.error(`Error: ${error.message}`);
                  if (error.message.includes("Verify")) {
                    void router.push("/settings");
                  }
                }
                return;
              }
            }}
            buttonLabel="Create Sloop"
          />
        </div>
      </main>
    </>
  );
};

export default Create;
