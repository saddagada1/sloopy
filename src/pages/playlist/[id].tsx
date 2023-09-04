import { useQuery } from "@tanstack/react-query";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { PiHeart } from "react-icons/pi";
import { type Track } from "spotify-types";
import { useElementSize } from "usehooks-ts";
import SafeImage from "~/components/ui/SafeImage";
import TrackList from "~/components/ui/TrackList";
import Loading from "~/components/utils/Loading";
import { useSpotifyContext } from "~/contexts/Spotify";

const Playlist: NextPage = ({}) => {
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
      const response = await spotify.fetchPlaylist(id);
      if (!response?.ok) {
        throw new Error(response?.message ?? "Fatal Error");
      }
      return response.data;
    },
    {
      enabled: !!spotify.auth,
    }
  );
  const [imageContainerRef, { width }] = useElementSize();

  if (fetchingPlaylist) {
    return <Loading />;
  }

  if (!playlist || playlistError) {
    return <div>ERROR</div>;
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
          <button>
            <PiHeart className="text-3xl sm:text-4xl" />
          </button>
          <p className="text-sm text-gray-400 sm:text-base">
            {playlist.tracks.items.length}
          </p>
        </div>
        <TrackList
          tracks={playlist.tracks.items.map((item) => item.track as Track)}
        />
      </div>
    </>
  );
};
export default Playlist;
