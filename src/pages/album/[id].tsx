import { useQuery } from "@tanstack/react-query";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { PiSpotifyLogo } from "react-icons/pi";
import { useElementSize } from "usehooks-ts";
import SafeImage from "~/components/ui/SafeImage";
import TrackList from "~/components/ui/TrackList";
import Loading from "~/components/utils/Loading";
import { useSpotifyContext } from "~/contexts/Spotify";

const Album: NextPage = ({}) => {
  const router = useRouter();
  const spotify = useSpotifyContext();
  const {
    data: album,
    isLoading: fetchingAlbum,
    error: albumError,
  } = useQuery(
    ["album", router.query.id],
    async () => {
      const id = router.query.id;
      if (typeof id !== "string") {
        throw new Error("404");
      }
      const response = await spotify.fetchAlbum(id);
      if (!response?.ok) {
        toast.error("Error: Could Not Fetch Spotify Data");
        throw new Error(
          response.message ?? "Error: Could Not Fetch Spotify Data"
        );
      }
      return response.data;
    },
    {
      enabled: !!spotify.auth,
    }
  );
  const [imageContainerRef, { width }] = useElementSize();

  if (fetchingAlbum) {
    return <Loading />;
  }

  if (!album || albumError) {
    return <div>ERROR</div>;
  }

  return (
    <>
      <Head>
        <title>Sloopy - {album.name}</title>
      </Head>
      <div
        ref={imageContainerRef}
        className="flex flex-1 flex-col items-center px-4 pb-4 pt-6"
      >
        <SafeImage
          url={album.images[0]?.url}
          alt={album.name}
          width={width * 0.6}
          className="relative mb-4 aspect-square overflow-hidden rounded-md"
          square
        />
        <h2 className="w-full font-display text-lg text-gray-400 sm:text-xl">
          {album.artists.map((artist, index) =>
            index === album.artists.length - 1
              ? artist.name
              : `${artist.name}, `
          )}
        </h2>
        <h1 className="mb-4 w-full truncate text-3xl font-semibold sm:text-4xl">
          {album.name}
        </h1>
        <div className="mb-4 flex w-full items-end justify-between gap-4 border-b border-gray-300 pb-4">
          <Link href={album.uri}>
            <PiSpotifyLogo className="text-3xl sm:text-4xl" />
          </Link>
          <p className="text-sm text-gray-400 sm:text-base">
            {album.tracks.items.length}
          </p>
        </div>
        <TrackList tracks={album.tracks.items} numbered />
      </div>
    </>
  );
};
export default Album;
