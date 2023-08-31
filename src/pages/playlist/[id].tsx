import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { PiHeart } from "react-icons/pi";
import { type Track } from "spotify-types";
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
      const response = await spotify?.fetchPlaylist(id);
      if (!response?.ok) {
        throw new Error(response?.message ?? "Fatal Error");
      }
      return response.data;
    },
    {
      enabled: !!spotify?.auth,
    }
  );

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
      <div className="flex flex-col items-center px-4 pb-4 pt-6">
        <div className="relative mb-4 aspect-square w-3/5 overflow-hidden rounded-md">
          <Image
            src={playlist.images[0]!.url}
            alt={playlist.name}
            fill
            sizes="60vw"
            className="object-cover"
          />
        </div>
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
        <ul className="w-full">
          {playlist.tracks.items.map((item, index) => {
            const track = item.track as Track;
            return (
              <li
                key={track.id}
                className={clsx(
                  "flex",
                  index !== playlist.tracks.items.length - 1 &&
                    "mb-2 border-b border-gray-300 pb-2"
                )}
                onClick={() => void router.push(`/track/${track.id}`)}
              >
                <div className="relative aspect-square w-[13%] flex-shrink-0 overflow-hidden rounded-md">
                  <Image
                    src={track.album.images[0]!.url}
                    alt={track.name}
                    sizes="13vw"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="ml-4 flex flex-col justify-between overflow-hidden">
                  <h3 className="truncate font-display text-lg font-semibold sm:text-xl">
                    {track.name}
                  </h3>
                  <p className="truncate text-sm text-gray-400 sm:text-base">
                    {track.artists.map((artist, index) =>
                      index === track.artists.length - 1
                        ? artist.name
                        : `${artist.name}, `
                    )}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
};
export default Playlist;
