import type { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import NoData from "~/components/ui/NoData";
import Pagination from "~/components/ui/Pagination";
import TrackList from "~/components/ui/TrackList";
import ErrorView from "~/components/utils/ErrorView";
import Loading from "~/components/utils/Loading";
import { api } from "~/utils/api";
import { paginationLimit } from "~/utils/constants";

const TrendingTracks: NextPage = ({}) => {
  const [page, setPage] = useState(0);
  const {
    data: tracks,
    isLoading: fetchingTracks,
    error: tracksError,
    fetchNextPage,
  } = api.sloops.getTrendingTracks.useInfiniteQuery(
    {
      limit: paginationLimit,
    },
    {
      getNextPageParam: (page) => page.next,
    }
  );
  const data = tracks?.pages[page];

  const handleNext = async () => {
    if (!tracks?.pages[page + 1]) {
      await fetchNextPage();
    }
    setPage((prev) => prev + 1);
  };

  const handlePrevious = () => {
    setPage((prev) => prev - 1);
  };

  if (fetchingTracks) {
    return <Loading />;
  }

  if (!tracks || tracksError) {
    return <ErrorView />;
  }
  return (
    <>
      <Head>
        <title>Sloopy - Trending Tracks</title>
      </Head>
      <div className="flex flex-1 flex-col px-4 pb-4 pt-6">
        <h2 className="font-display text-xl text-gray-400 sm:text-2xl">
          Trending
        </h2>
        <h1 className="mb-4 truncate border-b border-gray-300 pb-4 text-4xl font-semibold sm:text-5xl">
          Tracks
        </h1>
        {data ? (
          <Pagination
            page={page}
            hasNext={!!tracks.pages[page]?.next}
            hasPrevious={!!tracks.pages[page - 1]}
            onClickNext={() => void handleNext()}
            onClickPrevious={() => handlePrevious()}
          >
            <TrackList tracks={data.items.map((item) => item.track)} />
          </Pagination>
        ) : (
          <NoData>No Trending Tracks</NoData>
        )}
      </div>
    </>
  );
};

export default TrendingTracks;
