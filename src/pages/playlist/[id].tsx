import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { PiArrowLeft, PiArrowRight, PiSpotifyLogo } from "react-icons/pi";
import { type Track } from "spotify-types";
import { useElementSize } from "usehooks-ts";
import SafeImage from "~/components/ui/SafeImage";
import TrackList from "~/components/ui/TrackList";
import ErrorView from "~/components/utils/ErrorView";
import Loading from "~/components/utils/Loading";
import { useSpotifyContext } from "~/contexts/Spotify";

const Playlist: NextPage = ({}) => {
  const router = useRouter();
  const spotify = useSpotifyContext();
  const [imageContainerRef, { width }] = useElementSize();
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
        toast.error("Error: Could Not Fetch Spotify Data");
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
  } = useQuery(
    ["playlistTracks", router.query.id, router.query.offset ?? "0"],
    async () => {
      const id = router.query.id;
      if (typeof id !== "string") {
        throw new Error("404");
      }
      const offset = router.query.offset;
      if (offset && typeof offset !== "string") {
        throw new Error("404");
      }
      const tracks = await spotify.fetchPlaylistTracks(
        id,
        offset ? parseInt(offset) : 0
      );
      if (!tracks.ok) {
        toast.error("Error: Could Not Fetch Spotify Data");
        throw new Error(
          tracks.message ?? "Error: Could Not Fetch Spotify Data"
        );
      }
      return tracks.data;
    },
    {
      enabled: !!spotify.auth,
    }
  );

  const handleNext = () => {
    if (!playlistTracks?.next || typeof router.query.id !== "string") return;
    void router.push(
      `/playlist/${router.query.id}?offset=${
        playlistTracks.offset + playlistTracks.limit
      }`,
      undefined,
      { shallow: true }
    );
  };

  const handlePrevious = () => {
    if (!playlistTracks?.previous || typeof router.query.id !== "string")
      return;
    void router.push(
      `/playlist/${router.query.id}?offset=${
        playlistTracks.offset - playlistTracks.limit
      }`,
      undefined,
      { shallow: true }
    );
  };

  if (fetchingPlaylist || fetchingPlaylistTracks) {
    return <Loading />;
  }

  if (!playlist || playlistError || !playlistTracks || playlistTracksError) {
    return <ErrorView />;
  }

  return (
    <>
      <Head>
        <title>Sloopy - {playlist.name}</title>
      </Head>
      <div
        ref={imageContainerRef}
        className="flex flex-1 flex-col items-center px-4 pb-4 pt-6"
      >
        <SafeImage
          url={playlist.images[0]?.url}
          alt={playlist.name}
          width={width * 0.6}
          className="relative mb-4 aspect-square overflow-hidden rounded-md"
          square
        />
        <h2 className="w-full font-display text-lg text-gray-400 sm:text-xl">
          {playlist.owner.display_name}
        </h2>
        <h1 className="mb-4 w-full truncate text-3xl font-semibold sm:text-4xl">
          {playlist.name}
        </h1>
        <div className="mb-4 flex w-full items-end justify-between gap-4 border-b border-gray-300 pb-4">
          <Link href={playlist.uri}>
            <PiSpotifyLogo className="text-3xl sm:text-4xl" />
          </Link>
          <p className="text-sm text-gray-400 sm:text-base">
            {`${playlistTracks.offset + playlistTracks.items.length} / ${
              playlistTracks.total
            }`}
          </p>
        </div>
        <TrackList
          tracks={playlistTracks.items.map((item) => item.track as Track)}
        />
        <div className="mt-2 flex w-full items-center gap-4 border-t border-gray-300 pt-6 font-display text-3xl sm:text-4xl">
          <p className="flex-1">
            {Math.round(
              (playlistTracks.total / playlistTracks.limit) *
                (playlistTracks.offset / playlistTracks.total)
            ) + 1}
          </p>
          <button
            onClick={() => handlePrevious()}
            disabled={!playlistTracks.previous}
            className={clsx(!playlistTracks.previous && "text-gray-300")}
          >
            <PiArrowLeft />
          </button>
          <button
            onClick={() => handleNext()}
            disabled={!playlistTracks.next}
            className={clsx(!playlistTracks.next && "text-gray-300")}
          >
            <PiArrowRight />
          </button>
        </div>
      </div>
    </>
  );
};
export default Playlist;
