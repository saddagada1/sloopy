import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useMemo, useRef } from "react";
import NoData from "~/components/noData";
import ErrorView from "~/components/utils/errorView";
import Loading from "~/components/utils/loading";
import { api } from "~/utils/api";
import { paginationLimit } from "~/utils/constants";
import InfinitePagination from "~/components/infinitePagination";
import CardGrid from "~/components/cardGrid";
import SloopCard from "~/components/sloopCard";
import ImageSection from "~/components/imageSection";
import { useSpotifyContext } from "~/contexts/spotify";
import { useQuery } from "@tanstack/react-query";
import SpotifyButton from "~/components/spotifyButton";
import Link from "next/link";
import Marquee from "~/components/marquee";
import { Button } from "~/components/ui/button";

const Track: NextPage = ({}) => {
  const router = useRouter();
  const spotify = useSpotifyContext();
  const lastItem = useRef<HTMLButtonElement>(null!);
  const {
    data: track,
    isLoading: fetchingTrack,
    error: trackError,
  } = useQuery(
    ["track", router.query.id],
    async () => {
      const id = router.query.id;
      if (typeof id !== "string") {
        throw new Error("404");
      }
      const trackResponse = await spotify.fetchTrack(id);
      if (!trackResponse?.ok) {
        throw new Error("Error: Could Not Fetch Spotify Data");
      }
      return trackResponse.data;
    },
    {
      enabled: !!spotify.auth,
    }
  );
  const {
    data: sloops,
    isLoading: fetchingSloops,
    error: sloopError,
    fetchNextPage,
  } = api.sloops.getTrackSloops.useInfiniteQuery(
    { id: router.query.id as string, limit: paginationLimit },
    {
      enabled: typeof router.query.id === "string",
      getNextPageParam: (page) => page.next,
    }
  );

  const data = useMemo(() => {
    return sloops?.pages.flatMap((page) => page.items);
  }, [sloops]);

  if (fetchingTrack) {
    return <Loading />;
  }

  if ((!track || trackError) ?? sloopError) {
    return <ErrorView />;
  }

  return (
    <>
      <Head>
        <title>Sloopy - {track.name}</title>
      </Head>
      <main className="flex flex-1 flex-col gap-2 overflow-scroll lg:grid lg:grid-cols-5 lg:grid-rows-5 lg:overflow-hidden">
        <Marquee className="lg:col-span-4" label="Track">
          {track.name}
        </Marquee>
        <div className="p-lg flex flex-col gap-2 lg:row-span-5">
          <div className="section bg-muted">
            <Button className="mono w-full" variant="outline" asChild>
              <Link href={`/create?track=${track.id}`}>Create Sloop</Link>
            </Button>
          </div>
          <ImageSection
            url={track.album.images[0]?.url}
            alt={track.name}
            square
          />
          <SpotifyButton uri={track.uri} />
          <div className="section">
            <h1 className="section-label">Artists</h1>
            <div>
              {track.artists.map((artist, index) =>
                index === track.artists.length - 1 ? (
                  <Link
                    className="hover:underline"
                    key={index}
                    href={`/artist/${artist.id}`}
                  >
                    {artist.name}
                  </Link>
                ) : (
                  <Link
                    key={index}
                    className="hover:underline"
                    href={`/artist/${artist.id}`}
                  >{`${artist.name}, `}</Link>
                )
              )}
            </div>
          </div>
          <div className="section">
            <h1 className="section-label">Sloops</h1>
            <p>{0}</p>
          </div>
          <div className="section filler hidden flex-1 lg:block" />
        </div>
        <InfinitePagination
          lastItem={lastItem}
          onLastItem={() => void fetchNextPage()}
          className="min-h-[500px] lg:col-span-4 lg:row-span-4"
        >
          {fetchingSloops ? (
            <Loading />
          ) : data && data.length > 0 ? (
            <CardGrid className="lg:grid-cols-7">
              {data?.map((sloop, index) => (
                <SloopCard
                  ref={index === (data?.length ?? 0) - 1 ? lastItem : undefined}
                  key={index}
                  sloop={sloop}
                />
              ))}
            </CardGrid>
          ) : (
            <NoData />
          )}
        </InfinitePagination>
      </main>
    </>
  );
};

export default Track;
