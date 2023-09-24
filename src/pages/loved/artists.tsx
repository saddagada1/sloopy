import type { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import ArtistList from "~/components/ui/ArtistList";
import NoData from "~/components/ui/NoData";
import Pagination from "~/components/ui/Pagination";
import ErrorView from "~/components/utils/ErrorView";
import Loading from "~/components/utils/Loading";
import { api } from "~/utils/api";
import { paginationLimit } from "~/utils/constants";

const LovedArtists: NextPage = ({}) => {
  const [page, setPage] = useState(0);
  const {
    data: artists,
    isLoading: fetchingArtists,
    error: artistsError,
    fetchNextPage,
  } = api.sloops.getLovedArtists.useInfiniteQuery(
    {
      limit: paginationLimit,
    },
    {
      getNextPageParam: (page) => page.next,
    }
  );
  const data = artists?.pages[page];

  const handleNext = async () => {
    if (!artists?.pages[page + 1]) {
      await fetchNextPage();
    }
    setPage((prev) => prev + 1);
  };

  const handlePrevious = () => {
    setPage((prev) => prev - 1);
  };

  if (fetchingArtists) {
    return <Loading />;
  }

  if (!artists || artistsError) {
    return <ErrorView />;
  }
  return (
    <>
      <Head>
        <title>Sloopy - Loved Artists</title>
      </Head>
      <div className="flex flex-1 flex-col px-4 pb-4 pt-6">
        <h2 className="font-display text-xl text-gray-400 sm:text-2xl">
          Loved
        </h2>
        <h1 className="mb-4 truncate border-b border-gray-300 pb-4 text-4xl font-semibold sm:text-5xl">
          Artists
        </h1>
        {data ? (
          <Pagination
            page={page}
            hasNext={!!artists.pages[page]?.next}
            hasPrevious={!!artists.pages[page - 1]}
            onClickNext={() => void handleNext()}
            onClickPrevious={() => handlePrevious()}
          >
            <ArtistList artists={data.items.map((item) => item.artist)} />
          </Pagination>
        ) : (
          <NoData>No Loved Artists</NoData>
        )}
      </div>
    </>
  );
};

export default LovedArtists;
