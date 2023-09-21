import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useState } from "react";
import NoData from "~/components/ui/NoData";
import Pagination from "~/components/ui/Pagination";
import SloopList from "~/components/ui/SloopList";
import ErrorView from "~/components/utils/ErrorView";
import Loading from "~/components/utils/Loading";
import WithAuth from "~/components/utils/WithAuth";
import { api } from "~/utils/api";
import { paginationLimit } from "~/utils/constants";

const Likes: NextPage = ({}) => {
  const { data: session } = useSession();
  const [page, setPage] = useState(0);
  const {
    data: likes,
    isLoading: fetchingLikes,
    error: likesError,
    fetchNextPage,
  } = api.users.getLikes.useInfiniteQuery(
    {
      limit: paginationLimit,
    },
    {
      getNextPageParam: (page) => page.next,
    }
  );
  const data = likes?.pages[page];

  const handleNext = async () => {
    if (!likes?.pages[page + 1]) {
      await fetchNextPage();
    }
    setPage((prev) => prev + 1);
  };

  const handlePrevious = () => {
    setPage((prev) => prev - 1);
  };

  if (fetchingLikes) {
    return <Loading />;
  }

  if (!likes || likesError) {
    return <ErrorView />;
  }

  return (
    <>
      <Head>
        <title>Sloopy - Likes</title>
      </Head>
      <div className="flex flex-1 flex-col px-4 pb-4 pt-6">
        <h2 className="font-display text-xl text-gray-400 sm:text-2xl">
          Likes
        </h2>
        <h1 className="mb-4 truncate border-b border-gray-300 pb-4 text-4xl font-semibold sm:text-5xl">
          {session?.user.name ?? session?.user.username}
        </h1>
        {data ? (
          <Pagination
            page={page}
            hasNext={!!likes.pages[page]?.next}
            hasPrevious={!!likes.pages[page - 1]}
            onClickNext={() => void handleNext()}
            onClickPrevious={() => handlePrevious()}
            className="mt-4"
          >
            <SloopList sloops={data.items.map(({ sloop }) => sloop)} />
          </Pagination>
        ) : (
          <NoData>No Likes</NoData>
        )}
      </div>
    </>
  );
};

export default WithAuth(Likes);
