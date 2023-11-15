import { useInfiniteQuery } from "@tanstack/react-query";
import type { NextPage } from "next";
import Head from "next/head";
import { type Track } from "spotify-types";
import NoData from "~/components/noData";
import ErrorView from "~/components/utils/errorView";
import Loading from "~/components/utils/loading";
import { useSpotifyContext } from "~/contexts/spotify";
import Marquee from "~/components/marquee";
import { useMemo, useRef } from "react";
import InfinitePagination from "~/components/infinitePagination";
import TrackButton from "~/components/trackButton";
import { useElementSize } from "usehooks-ts";

const SavedTracks: NextPage = ({}) => {
  const [container, { width }] = useElementSize();
  const spotify = useSpotifyContext();
  const lastItem = useRef<HTMLButtonElement>(null!);
  const {
    data: saved,
    isLoading: fetchingSaved,
    error: savedError,
    fetchNextPage,
  } = useInfiniteQuery(
    ["SavedTracks"],
    async ({ pageParam = 0 }) => {
      const response = await spotify.fetchSavedTracks(pageParam as number);
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

  const tracks = useMemo(() => {
    return saved?.pages.flatMap((page) => page.items);
  }, [saved]);

  if (savedError) {
    return <ErrorView />;
  }

  return (
    <>
      <Head>
        <title>Sloopy - Saved Tracks</title>
      </Head>
      <main className="flex flex-1 flex-col gap-2 overflow-hidden">
        <Marquee label="Saved">Tracks</Marquee>
        <InfinitePagination
          lastItem={lastItem}
          onLastItem={() => void fetchNextPage()}
        >
          {fetchingSaved ? (
            <Loading />
          ) : tracks && tracks.length > 0 ? (
            <div ref={container} className="space-y-2">
              {tracks?.map((item, index) => (
                <TrackButton
                  style={{ maxWidth: width }}
                  ref={
                    index === (tracks?.length ?? 0) - 1 ? lastItem : undefined
                  }
                  key={index}
                  track={item.track as Track}
                  renderImage
                />
              ))}
            </div>
          ) : (
            <NoData />
          )}
        </InfinitePagination>
      </main>
    </>
  );
};

export default SavedTracks;
