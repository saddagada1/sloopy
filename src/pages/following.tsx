import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import NoData from "~/components/ui/NoData";
import Pagination from "~/components/ui/Pagination";
import UserList from "~/components/ui/UserList";
import ErrorView from "~/components/utils/ErrorView";
import Loading from "~/components/utils/Loading";
import WithAuth from "~/components/utils/WithAuth";
import { api } from "~/utils/api";
import { paginationLimit } from "~/utils/constants";

const Following: NextPage = ({}) => {
  const { data: session } = useSession();
  const [page, setPage] = useState(0);
  const {
    data: following,
    isLoading: fetchingFollowing,
    error: followingError,
    fetchNextPage,
  } = api.users.getFollowing.useInfiniteQuery(
    {
      limit: paginationLimit,
    },
    {
      getNextPageParam: (page) => page.next,
    }
  );
  const data = following?.pages[page];

  const handleNext = async () => {
    if (!following?.pages[page + 1]) {
      await fetchNextPage();
    }
    setPage((prev) => prev + 1);
  };

  const handlePrevious = () => {
    setPage((prev) => prev - 1);
  };

  if (fetchingFollowing) {
    return <Loading />;
  }

  if (!following || followingError) {
    return <ErrorView />;
  }

  return (
    <>
      <Head>
        <title>Sloopy - Following</title>
      </Head>
      <div className="flex flex-1 flex-col px-4 pb-4 pt-6">
        <h2 className="font-display text-xl text-gray-400 sm:text-2xl">
          Following
        </h2>
        <Link
          href="/profile"
          className="mb-4 truncate border-b border-gray-300 pb-4 text-4xl font-semibold sm:text-5xl"
        >
          {session?.user.name ?? session?.user.username}
        </Link>
        {data && data.items.length > 0 ? (
          <Pagination
            page={page}
            hasNext={!!following.pages[page]?.next}
            hasPrevious={!!following.pages[page - 1]}
            onClickNext={() => void handleNext()}
            onClickPrevious={() => handlePrevious()}
          >
            <UserList users={data.items.map(({ followed }) => followed)} />
          </Pagination>
        ) : (
          <NoData>Not Following Anyone</NoData>
        )}
      </div>
    </>
  );
};

export default WithAuth(Following);
