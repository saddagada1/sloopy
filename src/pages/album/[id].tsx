import { useInfiniteQuery } from "@tanstack/react-query";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import NoData from "~/components/noData";
import ErrorView from "~/components/utils/errorView";
import Loading from "~/components/utils/loading";
import { Album, useSpotifyContext } from "~/contexts/spotify";
import ImageSection from "~/components/imageSection";
import InfinitePagination from "~/components/infinitePagination";
import { useMemo, useRef } from "react";
import TrackButton from "~/components/trackButton";
import { useElementSize } from "usehooks-ts";
import SpotifyButton from "~/components/spotifyButton";
import Link from "next/link";
import Marquee from "~/components/marquee";

const Album: NextPage = ({}) => {
  const [container, { width }] = useElementSize();
  const router = useRouter();
  const spotify = useSpotifyContext();
  const {
    data: album,
    isLoading: fetchingAlbum,
    error: albumError,
    fetchNextPage,
  } = useInfiniteQuery(
    ["album", router.query.id],
    async ({ pageParam = 0 }) => {
      const id = router.query.id;
      if (typeof id !== "string") {
        throw new Error("404");
      }
      const response = await spotify.fetchAlbum(id, pageParam as number);
      if (!response?.ok) {
        throw new Error(
          response.message ?? "Error: Could Not Fetch Spotify Data"
        );
      }
      return response.data;
    },
    {
      enabled: !!spotify.auth,
      getNextPageParam: (page) =>
        page.tracks.next ? page.tracks.offset + page.tracks.limit : undefined,
    }
  );
  const lastItem = useRef<HTMLButtonElement>(null!);

  const data = useMemo(() => {
    return album?.pages.reduce(
      (obj, page) => ({
        ...page,
        tracks: {
          ...page.tracks,
          items: obj.tracks
            ? [...obj.tracks.items, ...page.tracks.items]
            : page.tracks.items,
        },
      }),
      {} as Album
    );
  }, [album]);

  const tracks = useMemo(() => {
    return album?.pages.flatMap((page) => page.tracks.items);
  }, [album]);

  if (fetchingAlbum) {
    return <Loading />;
  }

  if (!album || albumError) {
    return <ErrorView />;
  }

  return (
    <>
      <Head>
        <title>Sloopy - {data?.name}</title>
      </Head>
      <main className="flex flex-1 flex-col gap-2 overflow-scroll lg:grid lg:grid-cols-5 lg:grid-rows-5 lg:overflow-hidden">
        <Marquee className="lg:col-span-4" label="Album">
          {data?.name}
        </Marquee>
        <div className="flex flex-col gap-2 lg:row-span-5">
          <ImageSection url={data?.images[0]?.url} alt={data?.name} square />
          <SpotifyButton uri={`spotify:album:${data?.id}`} />
          <div className="section">
            <h1 className="section-label">Artists</h1>
            <div className="p-lg">
              {data?.artists.map((artist, index) =>
                index === data?.artists.length - 1 ? (
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
            <h1 className="section-label">Tracks</h1>
            <p className="p-lg">{data?.tracks.total}</p>
          </div>
          <div className="section filler hidden flex-1 lg:block" />
        </div>
        <InfinitePagination
          lastItem={lastItem}
          onLastItem={() => void fetchNextPage()}
          className="min-h-[500px] lg:col-span-4 lg:row-span-4"
        >
          {fetchingAlbum ? (
            <Loading />
          ) : tracks && tracks.length > 0 ? (
            <div ref={container} className="space-y-2">
              {tracks?.map((track, index) => (
                <TrackButton
                  style={{ maxWidth: width }}
                  ref={
                    index === (tracks?.length ?? 0) - 1 ? lastItem : undefined
                  }
                  key={index}
                  track={track}
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

export default Album;
