import { useQuery } from "@tanstack/react-query";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useMemo } from "react";
import toast from "react-hot-toast";
import { PiSpotifyLogo } from "react-icons/pi";
import TrackList from "~/components/ui/TrackList";
import Loading from "~/components/utils/Loading";
import WithAuth from "~/components/utils/WithAuth";
import { useSpotifyContext } from "~/contexts/Spotify";

const RecentlyPlayed: NextPage = ({}) => {
  const spotify = useSpotifyContext();
  const {
    data: recentlyPlayed,
    isLoading: fetchingRecentlyPlayed,
    error: recentlyPlayedError,
  } = useQuery(
    ["recentlyPlayed"],
    async () => {
      const response = await spotify.fetchRecentlyPlayedTracks();
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

  const tracks = useMemo(() => {
    if (!recentlyPlayed) return [];
    return recentlyPlayed.items
      .filter(
        (dup, index) =>
          index <=
          recentlyPlayed.items.findIndex(
            (original) => original.track.id === dup.track.id
          )
      )
      .map((item) => item.track);
  }, [recentlyPlayed]);

  if (fetchingRecentlyPlayed) {
    return <Loading />;
  }

  if (!recentlyPlayed || recentlyPlayedError) {
    return <div>ERROR</div>;
  }
  return (
    <>
      <Head>
        <title>Sloopy - Recently Played</title>
      </Head>
      <div className="flex flex-1 flex-col px-4 pb-4 pt-6">
        <h2 className="font-display text-xl text-gray-400 sm:text-2xl">
          Tracks
        </h2>
        <h1 className="mb-4 text-4xl font-semibold sm:text-5xl">
          Recently Played
        </h1>
        <div className="mb-4 flex w-full items-end justify-between gap-4 border-b border-gray-300 pb-4">
          <Link href={"spotify:user"}>
            <PiSpotifyLogo className="text-3xl sm:text-4xl" />
          </Link>
          <p className="text-sm text-gray-400 sm:text-base">{tracks.length}</p>
        </div>
        {!tracks?.length ? (
          <div className="flex w-full flex-1 items-center justify-center">
            <p className="w-2/3 px-1 text-center font-display text-xl text-gray-400 sm:text-2xl">
              You REALLY need to listen to more music!
            </p>
          </div>
        ) : (
          <TrackList tracks={tracks} />
        )}
        {tracks.length < recentlyPlayed.limit && (
          <p className="mt-2 border-t border-gray-300 pt-4 text-center font-display text-base text-gray-400 sm:text-lg">
            You need to listen to more music!
          </p>
        )}
      </div>
    </>
  );
};

export default WithAuth(RecentlyPlayed, { linked: true });
