import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useMemo, useRef } from "react";
import CardGrid from "~/components/cardGrid";
import InfinitePagination from "~/components/infinitePagination";
import Marquee from "~/components/marquee";
import UserCard from "~/components/userCard";
import ErrorView from "~/components/utils/errorView";
import Loading from "~/components/utils/loading";
import { api } from "~/utils/api";
import { paginationLimit } from "~/utils/constants";

const Followers: NextPage = ({}) => {
  const router = useRouter();
  const lastItem = useRef<HTMLButtonElement>(null!);
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
      enabled: typeof router.query.username === "string",
    }
  );
  const data = useMemo(() => {
    return followers?.pages.flatMap((page) => page.items);
  }, [followers]);

  if (followersError) {
    return <ErrorView />;
  }

  return (
    <>
      <Head>
        <title>{`Sloopy - ${
          router.query.username as string
        }'s Followers`}</title>
      </Head>
      <main className="flex flex-1 flex-col gap-2 overflow-hidden">
        <Marquee label="Followers">{router.query.username}</Marquee>
        <InfinitePagination
          lastItem={lastItem}
          onLastItem={() => void fetchNextPage()}
        >
          {fetchingFollowers ? (
            <Loading />
          ) : (
            <CardGrid>
              {data?.map(({ follower }, index) => (
                <UserCard
                  ref={index === (data?.length ?? 0) - 1 ? lastItem : undefined}
                  key={index}
                  user={follower}
                />
              ))}
            </CardGrid>
          )}
        </InfinitePagination>
      </main>
    </>
  );
};

export default Followers;
