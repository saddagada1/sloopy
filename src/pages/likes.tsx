import type { NextPage } from "next";
import Head from "next/head";
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
  const lastItem = useRef<HTMLButtonElement>(null!);
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

  const data = useMemo(() => {
    return likes?.pages.flatMap((page) => page.items);
  }, [likes]);

  if (likesError) {
    return <ErrorView />;
  }

  return (
    <>
      <Head>
        <title>Sloopy - Likes</title>
      </Head>
      <main className="flex flex-1 flex-col gap-2 overflow-hidden">
        <Marquee label="Your">Liked Sloops</Marquee>
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
