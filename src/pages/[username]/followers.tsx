import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import NoData from "~/components/ui/NoData";
import Pagination from "~/components/ui/Pagination";
import UserList from "~/components/ui/UserList";
import ErrorView from "~/components/utils/ErrorView";
import IsSessionUser from "~/components/utils/IsSessionUser";
import Loading from "~/components/utils/Loading";
import { api } from "~/utils/api";
import { paginationLimit } from "~/utils/constants";

const Followers: NextPage = ({}) => {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const {
    data: followers,
    isLoading: fetchingFollowers,
    error: followersError,
    fetchNextPage,
  } = api.users.getUserFollowers.useInfiniteQuery(
    {
      username: router.query.username as string,
      limit: paginationLimit,
    },
    {
      getNextPageParam: (page) => page.next,
    }
  );
  const data = followers?.pages[page];

  const handleNext = async () => {
    if (!followers?.pages[page + 1]) {
      await fetchNextPage();
    }
    setPage((prev) => prev + 1);
  };

  const handlePrevious = () => {
    setPage((prev) => prev - 1);
  };

  if (fetchingFollowers) {
    return <Loading />;
  }

  if (!followers || followersError) {
    return <ErrorView />;
  }

  return (
    <>
      <Head>
        <title>{`Sloopy - ${
          router.query.username as string
        }'s Followers`}</title>
      </Head>
      <div className="flex flex-1 flex-col px-4 pb-4 pt-6">
        <h2 className="font-display text-xl text-gray-400 sm:text-2xl">
          Followers
        </h2>
        <h1 className="mb-4 truncate border-b border-gray-300 pb-4 text-4xl font-semibold sm:text-5xl">
          {router.query.username as string}
        </h1>
        {data ? (
          <Pagination
            page={page}
            hasNext={!!followers.pages[page]?.next}
            hasPrevious={!!followers.pages[page - 1]}
            onClickNext={() => void handleNext()}
            onClickPrevious={() => handlePrevious()}
          >
            <UserList users={data.items.map(({ follower }) => follower)} />
          </Pagination>
        ) : (
          <NoData>No Followers</NoData>
        )}
      </div>
    </>
  );
};

export default IsSessionUser(Followers);
