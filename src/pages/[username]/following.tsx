import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useMemo, useRef } from "react";
import CardGrid from "~/components/cardGrid";
import InfinitePagination from "~/components/infinitePagination";
import Marquee from "~/components/marquee";
import UserCard from "~/components/userCard";
import ErrorView from "~/components/utils/ErrorView";
import Loading from "~/components/utils/loading";
import { api } from "~/utils/api";
import { paginationLimit } from "~/utils/constants";

const Following: NextPage = ({}) => {
  const router = useRouter();
  const lastItem = useRef<HTMLButtonElement>(null!);
  const {
    data: following,
    isLoading: fetchingFollowing,
    error: followingError,
    fetchNextPage,
  } = api.users.getUserFollowing.useInfiniteQuery(
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
    return following?.pages.flatMap((page) => page.items);
  }, [following]);

  if (followingError) {
    return <ErrorView />;
  }

  return (
    <>
      <Head>
        <title>{`Sloopy - ${
          router.query.username as string
        }'s Following`}</title>
      </Head>
      <main className="flex flex-1 flex-col gap-2 overflow-hidden">
        <Marquee label="Following">{router.query.username}</Marquee>
        <InfinitePagination
          lastItem={lastItem}
          onLastItem={() => void fetchNextPage()}
        >
          {fetchingFollowing ? (
            <Loading />
          ) : (
            <CardGrid>
              {data?.map(({ followed }, index) => (
                <UserCard
                  ref={index === (data?.length ?? 0) - 1 ? lastItem : undefined}
                  key={index}
                  user={followed}
                />
              ))}
            </CardGrid>
          )}
        </InfinitePagination>
      </main>
    </>
  );
};

export default Following;
