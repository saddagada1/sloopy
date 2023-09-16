import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { PiArrowLeft, PiArrowRight, PiSpotifyLogo } from "react-icons/pi";
import AlbumList from "~/components/ui/AlbumList";
import ErrorView from "~/components/utils/ErrorView";
import Loading from "~/components/utils/Loading";
import WithAuth from "~/components/utils/WithAuth";
import { useSpotifyContext } from "~/contexts/Spotify";

const NewReleases: NextPage = ({}) => {
  const router = useRouter();
  const spotify = useSpotifyContext();
  const {
    data: newReleases,
    isLoading: fetchingNewReleases,
    error: newReleasesError,
  } = useQuery(
    ["NewReleases", router.query.offset ?? "0"],
    async () => {
      const offset = router.query.offset;
      if (offset && typeof offset !== "string") {
        throw new Error("404");
      }
      const response = await spotify.fetchNewReleases(
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
    if (!newReleases?.albums.next) return;
    void router.push(
      `/new-releases?offset=${
        newReleases.albums.offset + newReleases.albums.limit
      }`,
      undefined,
      { shallow: true }
    );
  };

  const handlePrevious = () => {
    if (!newReleases?.albums.previous) return;
    void router.push(
      `/new-releases?offset=${
        newReleases.albums.offset - newReleases.albums.limit
      }`,
      undefined,
      { shallow: true }
    );
  };

  if (fetchingNewReleases) {
    return <Loading />;
  }

  if (!newReleases || newReleasesError) {
    return <ErrorView />;
  }

  return (
    <>
      <Head>
        <title>Sloopy - New Releases</title>
      </Head>
      <div className="flex flex-1 flex-col px-4 pb-4 pt-6">
        <h2 className="font-display text-xl text-gray-400 sm:text-2xl">
          Spotify
        </h2>
        <h1 className="mb-4 text-4xl font-semibold sm:text-5xl">
          New Releases
        </h1>
        <div className="mb-4 flex w-full items-end justify-between gap-4 border-b border-gray-300 pb-4">
          <Link href={"spotify:user"}>
            <PiSpotifyLogo className="text-3xl sm:text-4xl" />
          </Link>
          <p className="text-sm text-gray-400 sm:text-base">
            {`${
              newReleases.albums.offset + newReleases.albums.items.length
            } / ${newReleases.albums.total}`}
          </p>
        </div>
        <AlbumList albums={newReleases.albums.items} />
        <div className="mt-2 flex items-center gap-4 border-t border-gray-300 pt-6 font-display text-3xl sm:text-4xl">
          <p className="flex-1">
            {Math.round(
              (newReleases.albums.total / newReleases.albums.limit) *
                (newReleases.albums.offset / newReleases.albums.total)
            ) + 1}
          </p>
          <button
            onClick={() => handlePrevious()}
            disabled={!newReleases.albums.previous}
            className={clsx(!newReleases.albums.previous && "text-gray-300")}
          >
            <PiArrowLeft />
          </button>
          <button
            onClick={() => handleNext()}
            disabled={!newReleases.albums.next}
            className={clsx(!newReleases.albums.next && "text-gray-300")}
          >
            <PiArrowRight />
          </button>
        </div>
      </div>
    </>
  );
};
export default WithAuth(NewReleases, { linked: true });
