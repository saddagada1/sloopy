import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useMemo, useRef } from "react";
import CardGrid from "~/components/cardGrid";
import InfinitePagination from "~/components/infinitePagination";
import Marquee from "~/components/marquee";
import SloopCard from "~/components/sloopCard";
import ErrorView from "~/components/utils/ErrorView";
import Loading from "~/components/utils/loading";
import { api } from "~/utils/api";
import { paginationLimit } from "~/utils/constants";

const Likes: NextPage = ({}) => {
  const router = useRouter();
  const lastItem = useRef<HTMLButtonElement>(null!);
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
      enabled: typeof router.query.username === "string",
    }
  );

  const data = useMemo(() => {
    return likes?.pages.flatMap((page) => page.items);
  }, [likes]);

  if (likesError) {
    return <ErrorView />;
  }

  return (
    <>
      <Head>
        <title>{`Sloopy - ${router.query.username as string}'s Likes`}</title>
      </Head>
      <main className="flex flex-1 flex-col gap-2 overflow-hidden">
        <Marquee label="Likes">{router.query.username}</Marquee>
        <InfinitePagination
          lastItem={lastItem}
          onLastItem={() => void fetchNextPage()}
        >
          {fetchingLikes ? (
            <Loading />
          ) : (
            <CardGrid>
              {data?.map(({ sloop }, index) => (
                <SloopCard
                  ref={index === (data?.length ?? 0) - 1 ? lastItem : undefined}
                  key={index}
                  sloop={sloop}
                />
              ))}
            </CardGrid>
          )}
        </InfinitePagination>
      </main>
    </>
  );
};

export default Likes;
