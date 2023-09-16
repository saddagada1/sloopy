import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { PiArrowLeft, PiArrowRight, PiSpotifyLogo } from "react-icons/pi";
import { type Track } from "spotify-types";
import TrackList from "~/components/ui/TrackList";
import ErrorView from "~/components/utils/ErrorView";
import Loading from "~/components/utils/Loading";
import WithAuth from "~/components/utils/WithAuth";
import { useSpotifyContext } from "~/contexts/Spotify";

const SavedTracks: NextPage = ({}) => {
  const router = useRouter();
  const spotify = useSpotifyContext();
  const {
    data: saved,
    isLoading: fetchingSaved,
    error: savedError,
  } = useQuery(
    ["SavedTracks", router.query.offset ?? "0"],
    async () => {
      const offset = router.query.offset;
      if (offset && typeof offset !== "string") {
        throw new Error("404");
      }
      const response = await spotify.fetchSavedTracks(
        offset ? parseInt(offset) : 0
      );
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

  const handleNext = () => {
    if (!saved?.next) return;
    void router.push(
      `/saved/tracks?offset=${saved.offset + saved.limit}`,
      undefined,
      { shallow: true }
    );
  };

  const handlePrevious = () => {
    if (!saved?.previous) return;
    void router.push(
      `/saved/tracks?offset=${saved.offset - saved.limit}`,
      undefined,
      { shallow: true }
    );
  };

  if (fetchingSaved) {
    return <Loading />;
  }

  if (!saved || savedError) {
    return <ErrorView />;
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
        <h1 className="mb-4 text-4xl font-semibold sm:text-5xl">Saved</h1>
        <div className="mb-4 flex w-full items-end justify-between gap-4 border-b border-gray-300 pb-4">
          <Link href={"spotify:user"}>
            <PiSpotifyLogo className="text-3xl sm:text-4xl" />
          </Link>
          <p className="text-sm text-gray-400 sm:text-base">
            {`${saved.offset + saved.items.length} / ${saved.total}`}
          </p>
        </div>
        <TrackList tracks={saved.items.map((item) => item.track as Track)} />
        <div className="mt-2 flex items-center gap-4 border-t border-gray-300 pt-6 font-display text-3xl sm:text-4xl">
          <p className="flex-1">
            {Math.round(
              (saved.total / saved.limit) * (saved.offset / saved.total)
            ) + 1}
          </p>
          <button
            onClick={() => handlePrevious()}
            disabled={!saved.previous}
            className={clsx(!saved.previous && "text-gray-300")}
          >
            <PiArrowLeft />
          </button>
          <button
            onClick={() => handleNext()}
            disabled={!saved.next}
            className={clsx(!saved.next && "text-gray-300")}
          >
            <PiArrowRight />
          </button>
        </div>
      </div>
    </>
  );
};

export default WithAuth(SavedTracks, { linked: true });
