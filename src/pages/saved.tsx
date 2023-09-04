import { useQuery } from "@tanstack/react-query";
import type { NextPage } from "next";
import Head from "next/head";
import toast from "react-hot-toast";
import { type Track } from "spotify-types";
import TrackList from "~/components/ui/TrackList";
import Loading from "~/components/utils/Loading";
import WithAuth from "~/components/utils/WithAuth";
import { useSpotifyContext } from "~/contexts/Spotify";

const SavedTracks: NextPage = ({}) => {
  const spotify = useSpotifyContext();
  const {
    data: saved,
    isLoading: fetchingSaved,
    error: savedError,
  } = useQuery(
    ["Saved"],
    async () => {
      const response = await spotify.fetchSavedTracks();
      if (!response?.ok) {
        toast.error("Error: Could Not Fetch Spotify Data");
        throw new Error(
          response?.message ?? "Error: Could Not Fetch Spotify Data"
        );
      }
      return response.data;
    },
    {
      enabled: !!spotify.auth,
    }
  );

  if (fetchingSaved) {
    return <Loading />;
  }

  if (!saved || savedError) {
    return <div>ERROR</div>;
  }
  return (
    <>
      <Head>
        <title>Sloopy - Saved Tracks</title>
      </Head>
      <div className="flex flex-1 flex-col px-4 pb-4 pt-6">
        <h2 className="font-display text-xl text-gray-400 sm:text-2xl">
          Tracks
        </h2>
        <h1 className="mb-4 truncate border-b border-gray-300 pb-4 text-4xl font-semibold sm:text-5xl">
          Saved
        </h1>
        <TrackList tracks={saved.items.map((item) => item.track as Track)} />
      </div>
    </>
  );
};
export default WithAuth(SavedTracks, { linked: true });
