import { useInfiniteQuery } from "@tanstack/react-query";
import type { NextPage } from "next";
import Head from "next/head";
import Loading from "~/components/utils/loading";
import { useSpotifyContext } from "~/contexts/Spotify";
import ErrorView from "~/components/utils/ErrorView";
import { useMemo, useRef } from "react";
import Marquee from "~/components/marquee";
import InfinitePagination from "~/components/infinitePagination";
import CardGrid from "~/components/cardGrid";
import PlaylistCard from "~/components/playlistCard";

const SavedPlaylists: NextPage = ({}) => {
  const spotify = useSpotifyContext();
  const lastItem = useRef<HTMLButtonElement>(null!);
  const {
    data: saved,
    isLoading: fetchingSaved,
    error: savedError,
    fetchNextPage,
  } = useInfiniteQuery(
    ["SavedPlaylists"],
    async ({ pageParam = 0 }) => {
      const response = await spotify.fetchCurrentUserPlaylists(
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

  const playlists = useMemo(() => {
    return saved?.pages.flatMap((page) => page.items);
  }, [saved]);

  if (savedError) {
    return <ErrorView />;
  }

  return (
    <>
      <Head>
        <title>Sloopy - Saved Playlists</title>
      </Head>
      <main className="flex flex-1 flex-col gap-2 overflow-hidden">
        <Marquee label="Saved">Playlists</Marquee>
        <InfinitePagination
          lastItem={lastItem}
          onLastItem={() => void fetchNextPage()}
        >
          {fetchingSaved ? (
            <Loading />
          ) : (
            <CardGrid>
              {playlists?.map((playlist, index) => (
                <PlaylistCard
                  ref={
                    index === (playlists?.length ?? 0) - 1
                      ? lastItem
                      : undefined
                  }
                  key={index}
                  playlist={playlist}
                />
              ))}
            </CardGrid>
          )}
        </InfinitePagination>
      </main>
    </>
  );
};
export default SavedPlaylists;
