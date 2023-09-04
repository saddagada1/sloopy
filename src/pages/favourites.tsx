import { useQuery } from "@tanstack/react-query";
import type { NextPage } from "next";
import Head from "next/head";
import toast from "react-hot-toast";
import TrackList from "~/components/ui/TrackList";
import Loading from "~/components/utils/Loading";
import WithAuth from "~/components/utils/WithAuth";
import { useSpotifyContext } from "~/contexts/Spotify";

const Favourites: NextPage = ({}) => {
  const spotify = useSpotifyContext();
  const {
    data: favourites,
    isLoading: fetchingfavourites,
    error: favouritesError,
  } = useQuery(
    ["Favourites"],
    async () => {
      const response = await spotify.fetchTopTracks();
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

  if (fetchingfavourites) {
    return <Loading />;
  }

  if (!favourites || favouritesError) {
    return <div>ERROR</div>;
  }
  return (
    <>
      <Head>
        <title>Sloopy - Favourites</title>
      </Head>
      <div className="flex flex-1 flex-col px-4 pb-4 pt-6">
        <h2 className="font-display text-xl text-gray-400 sm:text-2xl">
          Tracks
        </h2>
        <h1 className="mb-4 truncate border-b border-gray-300 pb-4 text-4xl font-semibold sm:text-5xl">
          Favourites
        </h1>
        <TrackList tracks={favourites.items} />
      </div>
    </>
  );
};
export default WithAuth(Favourites, { linked: true });
