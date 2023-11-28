import type { NextPage } from "next";
import Head from "next/head";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import ArtistCard from "~/components/artistCard";
import CardGrid from "~/components/cardGrid";
import InfinitePagination from "~/components/infinitePagination";
import Marquee from "~/components/marquee";
import SloopCard from "~/components/sloopCard";
import TrackCard from "~/components/trackCard";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import Loading from "~/components/utils/loading";
import { api } from "~/utils/api";
import { paginationLimit } from "~/utils/constants";

const Trending: NextPage = ({}) => {
  const [tab, setTab] = useState("sloops");
  const lastItem = useRef<HTMLButtonElement>(null!);
  const {
    data: sloops,
    isLoading: fetchingSloops,
    fetchNextPage: fetchMoreSloops,
  } = api.sloops.getTrendingSloops.useInfiniteQuery(
    {
      limit: paginationLimit,
    },
    {
      getNextPageParam: (page) => page.next,
      onError: () =>
        toast.error(
          "Failed to fetch sloops. Please refresh the page and try again."
        ),
    }
  );
  const {
    data: artists,
    isLoading: fetchingArtists,
    fetchNextPage: fetchMoreArtists,
  } = api.sloops.getTrendingArtists.useInfiniteQuery(
    {
      limit: paginationLimit,
    },
    {
      getNextPageParam: (page) => page.next,
      onError: () =>
        toast.error(
          "Failed to fetch artists. Please refresh the page and try again."
        ),
    }
  );
  const {
    data: tracks,
    isLoading: fetchingTracks,
    fetchNextPage: fetchMoreTracks,
  } = api.sloops.getTrendingTracks.useInfiniteQuery(
    {
      limit: paginationLimit,
    },
    {
      getNextPageParam: (page) => page.next,
      onError: () =>
        toast.error(
          "Failed to fetch tracks. Please refresh the page and try again."
        ),
    }
  );

  const fetchNextPage = useCallback(() => {
    if (tab === "sloops") {
      void fetchMoreSloops();
    } else if (tab === "artists") {
      void fetchMoreArtists();
    } else {
      void fetchMoreTracks();
    }
  }, [fetchMoreArtists, fetchMoreSloops, fetchMoreTracks, tab]);

  const data = useMemo(() => {
    return {
      sloops: sloops?.pages.flatMap((page) => page.items),
      artists: artists?.pages.flatMap((page) => page.items),
      tracks: tracks?.pages.flatMap((page) => page.items),
    };
  }, [artists, sloops, tracks]);

  return (
    <>
      <Head>
        <title>Sloopy - Trending</title>
      </Head>
      <main className="flex flex-1 flex-col gap-2 overflow-hidden">
        <section className="flex flex-col gap-2 lg:flex-row">
          <Marquee
            className="flex flex-1 flex-col overflow-hidden"
            label="Trending"
          >
            {tab}
          </Marquee>
          <Tabs
            className="w-full lg:w-auto"
            onValueChange={(value) => setTab(value)}
            defaultValue="sloops"
          >
            <TabsList className="h-full gap-2 lg:flex-col">
              <TabsTrigger value="sloops">Sloops</TabsTrigger>
              <TabsTrigger value="artists">Artists</TabsTrigger>
              <TabsTrigger value="tracks">Tracks</TabsTrigger>
            </TabsList>
          </Tabs>
        </section>
        <InfinitePagination
          lastItem={lastItem}
          onLastItem={() => void fetchNextPage()}
        >
          {fetchingSloops || fetchingArtists || fetchingTracks ? (
            <Loading />
          ) : (
            <CardGrid>
              {tab === "sloops"
                ? data.sloops?.map(({ sloop }, index) => (
                    <SloopCard
                      ref={
                        index === (data.sloops?.length ?? 0) - 1
                          ? lastItem
                          : undefined
                      }
                      key={index}
                      sloop={sloop}
                      ignoreWidth
                    />
                  ))
                : tab === "artists"
                ? data.artists?.map(({ artist }, index) => (
                    <ArtistCard
                      ref={
                        index === (data.sloops?.length ?? 0) - 1
                          ? lastItem
                          : undefined
                      }
                      key={index}
                      artist={artist}
                    />
                  ))
                : data.tracks?.map(({ track }, index) => (
                    <TrackCard
                      ref={
                        index === (data.sloops?.length ?? 0) - 1
                          ? lastItem
                          : undefined
                      }
                      key={index}
                      track={track}
                    />
                  ))}
            </CardGrid>
          )}
        </InfinitePagination>
      </main>
    </>
  );
};
export default Trending;
