import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { type Track } from "spotify-types";
import { useElementSize } from "usehooks-ts";
import NoData from "~/components/noData";
import ErrorView from "~/components/utils/errorView";
import Loading from "~/components/utils/loading";
import { useSpotifyContext } from "~/contexts/spotify";
import { useMemo, useRef } from "react";
import ImageSection from "~/components/imageSection";
import SpotifyButton from "~/components/spotifyButton";
import InfinitePagination from "~/components/infinitePagination";
import TrackButton from "~/components/trackButton";
import Marquee from "~/components/marquee";

const Playlist: NextPage = ({}) => {
  const [container, { width }] = useElementSize();
  const router = useRouter();
  const spotify = useSpotifyContext();
  const {
    data: playlist,
    isLoading: fetchingPlaylist,
    error: playlistError,
  } = useQuery(
    ["playlist", router.query.id],
    async () => {
      const id = router.query.id;
      if (typeof id !== "string") {
        throw new Error("404");
      }
      const playlist = await spotify.fetchPlaylist(id);
      if (!playlist?.ok) {
        throw new Error(
          playlist.message ?? "Error: Could Not Fetch Spotify Data"
        );
      }
      return playlist.data;
    },
    {
      enabled: !!spotify.auth,
    }
  );
  const {
    data: playlistTracks,
    isLoading: fetchingPlaylistTracks,
    error: playlistTracksError,
    fetchNextPage,
  } = useInfiniteQuery(
    ["playlistTracks", router.query.id],
    async ({ pageParam = 0 }) => {
      const id = router.query.id;
      if (typeof id !== "string") {
        throw new Error("404");
      }
      const tracks = await spotify.fetchPlaylistTracks(id, pageParam as number);
      if (!tracks.ok) {
        throw new Error(
          tracks.message ?? "Error: Could Not Fetch Spotify Data"
        );
      }
      return tracks.data;
    },
    {
      enabled: !!spotify.auth,
      getNextPageParam: (page) =>
        page.next ? page.offset + page.limit : undefined,
    }
  );
  const lastItem = useRef<HTMLButtonElement>(null!);

  const tracks = useMemo(() => {
    return playlistTracks?.pages.flatMap((page) => page.items);
  }, [playlistTracks]);

  if (fetchingPlaylist) {
    return <Loading />;
  }

  if (!playlist || playlistError || playlistTracksError) {
    return <ErrorView />;
  }

  return (
    <>
      <Head>
        <title>Sloopy - {playlist.name}</title>
      </Head>
      <main className="flex flex-1 flex-col gap-2 overflow-scroll lg:grid lg:grid-cols-5 lg:grid-rows-5 lg:overflow-hidden">
        <Marquee className="lg:col-span-4" label="Playlist">
          {playlist.name}
        </Marquee>
        <div className="flex flex-col gap-2 lg:row-span-5">
          <ImageSection
            url={playlist.images[0]?.url}
            alt={playlist.name}
            square
          />
          <SpotifyButton uri={playlist.uri} />
          <div className="section">
            <h1 className="section-label">Owner</h1>
            <p className="p-lg">{playlist.owner.display_name}</p>
          </div>
          <div className="section">
            <h1 className="section-label">Tracks</h1>
            <p className="p-lg">{playlist.tracks.total}</p>
          </div>
          <div className="section filler hidden flex-1 lg:block" />
        </div>
        <InfinitePagination
          lastItem={lastItem}
          onLastItem={() => void fetchNextPage()}
          className="min-h-[500px] lg:col-span-4 lg:row-span-4"
        >
          {fetchingPlaylistTracks ? (
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

export default Playlist;
