import { useQuery } from "@tanstack/react-query";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { PiSpotifyLogo } from "react-icons/pi";
import Loading from "~/components/utils/Loading";
import WithAuth from "~/components/utils/WithAuth";
import { useSpotifyContext } from "~/contexts/Spotify";
import PlaylistList from "~/components/ui/PlaylistList";
import Link from "next/link";
import ErrorView from "~/components/utils/ErrorView";
import Pagination from "~/components/ui/Pagination";
import NoData from "~/components/ui/NoData";

const SavedPlaylists: NextPage = ({}) => {
  const router = useRouter();
  const spotify = useSpotifyContext();
  const {
    data: saved,
    isLoading: fetchingSaved,
    error: savedError,
  } = useQuery(
    ["SavedPlaylists", router.query.offset ?? "0"],
    async () => {
      const offset = router.query.offset;
      if (offset && typeof offset !== "string") {
        throw new Error("404");
      }
      const response = await spotify.fetchCurrentUserPlaylists(
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
      `/saved/playlists?offset=${saved.offset + saved.limit}`,
      undefined,
      { shallow: true }
    );
  };

  const handlePrevious = () => {
    if (!saved?.previous) return;
    void router.push(
      `/saved/playlists?offset=${saved.offset - saved.limit}`,
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
        <title>Sloopy - Saved Playlists</title>
      </Head>
      <div className="flex flex-1 flex-col px-4 pb-4 pt-6">
        <h2 className="font-display text-xl text-gray-400 sm:text-2xl">
          Playlists
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
        {saved.total > 0 ? (
          <Pagination
            page={Math.round(
              (saved.total / saved.limit) * (saved.offset / saved.total)
            )}
            onClickNext={() => handleNext()}
            onClickPrevious={() => handlePrevious()}
            hasNext={!!saved.next}
            hasPrevious={!!saved.previous}
          >
            <PlaylistList playlists={saved.items} />
          </Pagination>
        ) : (
          <NoData>No Saved Playlists</NoData>
        )}
      </div>
    </>
  );
};
export default WithAuth(SavedPlaylists, { linked: true });
