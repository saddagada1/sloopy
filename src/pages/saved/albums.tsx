import { useInfiniteQuery } from "@tanstack/react-query";
import type { NextPage } from "next";
import Head from "next/head";
import ErrorView from "~/components/utils/ErrorView";
import Loading from "~/components/utils/loading";
import { useSpotifyContext } from "~/contexts/Spotify";
import Marquee from "~/components/marquee";
import InfinitePagination from "~/components/infinitePagination";
import { useMemo, useRef } from "react";
import CardGrid from "~/components/cardGrid";
import AlbumCard from "~/components/albumCard";

const SavedAlbums: NextPage = ({}) => {
  const spotify = useSpotifyContext();
  const lastItem = useRef<HTMLButtonElement>(null!);
  const {
    data: saved,
    isLoading: fetchingSaved,
    error: savedError,
    fetchNextPage,
  } = useInfiniteQuery(
    ["SavedAlbums"],
    async ({ pageParam = 0 }) => {
      const response = await spotify.fetchCurrentUserAlbums(
        pageParam as number
      );
      if (!response?.ok) {
        throw new Error(
          response?.message ?? "Error: Could Not Fetch Spotify Data"
        );
      }
      return response.data;
    },
    {
      enabled: !!spotify.auth,
      getNextPageParam: (page) =>
        page.next ? page.offset + page.limit : undefined,
    }
  );

  const albums = useMemo(() => {
    return saved?.pages.flatMap((page) => page.items);
  }, [saved]);

  if (savedError) {
    return <ErrorView />;
  }

  return (
    <>
      <Head>
        <title>Sloopy - Saved Albums</title>
      </Head>
      <main className="flex flex-1 flex-col gap-2 overflow-hidden">
        <Marquee label="Saved">Albums</Marquee>
        <InfinitePagination
          lastItem={lastItem}
          onLastItem={() => void fetchNextPage()}
        >
          {fetchingSaved ? (
            <Loading />
          ) : (
            <CardGrid>
              {albums?.map((item, index) => (
                <AlbumCard
                  ref={
                    index === (albums?.length ?? 0) - 1 ? lastItem : undefined
                  }
                  key={index}
                  album={item.album}
                />
              ))}
            </CardGrid>
          )}
        </InfinitePagination>
      </main>
    </>
  );
};
export default SavedAlbums;
