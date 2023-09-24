import type { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import NoData from "~/components/ui/NoData";
import Pagination from "~/components/ui/Pagination";
import SloopList from "~/components/ui/SloopList";
import ErrorView from "~/components/utils/ErrorView";
import Loading from "~/components/utils/Loading";
import { api } from "~/utils/api";
import { paginationLimit } from "~/utils/constants";

const LovedSloops: NextPage = ({}) => {
  const [page, setPage] = useState(0);
  const {
    data: sloops,
    isLoading: fetchingSloops,
    error: sloopsError,
    fetchNextPage,
  } = api.sloops.getLovedSloops.useInfiniteQuery(
    {
      limit: paginationLimit,
    },
    {
      getNextPageParam: (page) => page.next,
    }
  );
  const data = sloops?.pages[page];

  const handleNext = async () => {
    if (!sloops?.pages[page + 1]) {
      await fetchNextPage();
    }
    setPage((prev) => prev + 1);
  };

  const handlePrevious = () => {
    setPage((prev) => prev - 1);
  };

  if (fetchingSloops) {
    return <Loading />;
  }

  if (!sloops || sloopsError) {
    return <ErrorView />;
  }
  return (
    <>
      <Head>
        <title>Sloopy - Loved Sloops</title>
      </Head>
      <div className="flex flex-1 flex-col px-4 pb-4 pt-6">
        <h2 className="font-display text-xl text-gray-400 sm:text-2xl">
          Loved
        </h2>
        <h1 className="mb-4 truncate border-b border-gray-300 pb-4 text-4xl font-semibold sm:text-5xl">
          Sloops
        </h1>
        {data ? (
          <Pagination
            page={page}
            hasNext={!!sloops.pages[page]?.next}
            hasPrevious={!!sloops.pages[page - 1]}
            onClickNext={() => void handleNext()}
            onClickPrevious={() => handlePrevious()}
          >
            <SloopList sloops={data.items.map((item) => item.sloop)} />
          </Pagination>
        ) : (
          <NoData>No Loved Sloops</NoData>
        )}
      </div>
    </>
  );
};

export default LovedSloops;
