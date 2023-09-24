import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import NoData from "~/components/ui/NoData";
import Pagination from "~/components/ui/Pagination";
import SloopList from "~/components/ui/SloopList";
import ErrorView from "~/components/utils/ErrorView";
import IsSessionUser from "~/components/utils/IsSessionUser";
import Loading from "~/components/utils/Loading";
import { api } from "~/utils/api";
import { paginationLimit } from "~/utils/constants";

const Likes: NextPage = ({}) => {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const {
    data: likes,
    isLoading: fetchingLikes,
    error: likesError,
    fetchNextPage,
  } = api.users.getUserLikes.useInfiniteQuery(
    {
      limit: paginationLimit,
      username: router.query.username as string,
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
        <title>{`Sloopy - ${router.query.username as string}'s Likes`}</title>
      </Head>
      <div className="flex flex-1 flex-col px-4 pb-4 pt-6">
        <h2 className="font-display text-xl text-gray-400 sm:text-2xl">
          Likes
        </h2>
        <Link
          href={`/${router.query.username as string}`}
          className="mb-4 truncate border-b border-gray-300 pb-4 text-4xl font-semibold sm:text-5xl"
        >
          {router.query.username as string}
        </Link>
        {data && data.items.length > 0 ? (
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

export default IsSessionUser(Likes);
