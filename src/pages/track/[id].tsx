import { useQuery } from "@tanstack/react-query";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { PiHeart, PiPlusCircle } from "react-icons/pi";
import { type Track } from "spotify-types";
import { useElementSize } from "usehooks-ts";
import SafeImage from "~/components/ui/SafeImage";
import Loading from "~/components/utils/Loading";
import { useSpotifyContext } from "~/contexts/Spotify";

const Track: NextPage = ({}) => {
  const router = useRouter();
  const spotify = useSpotifyContext();
  const { data, isLoading, error } = useQuery(
    ["track", router.query.id],
    async () => {
      const id = router.query.id;
      if (typeof id !== "string") {
        throw new Error("404");
      }
      const trackResponse = await spotify.fetchTrack(id);
      const analysisResponse = await spotify.fetchTrackAnalysis(id);
      if (!trackResponse?.ok) {
        throw new Error(trackResponse?.message ?? "Fatal Error");
      }
      if (!analysisResponse?.ok) {
        throw new Error(analysisResponse?.message ?? "Fatal Error");
      }
      return { track: trackResponse.data, analysis: analysisResponse.data };
    },
    {
      enabled: !!spotify.auth,
    }
  );
  const [imageContainerRef, { width }] = useElementSize();

  if (isLoading) {
    return <Loading />;
  }

  if (!data || error) {
    return <div>ERROR</div>;
  }

  return (
    <>
      <Head>
        <title>Sloopy - {data.track.name}</title>
      </Head>
      <div
        ref={imageContainerRef}
        className="flex flex-1 flex-col items-center px-4 pb-12 pt-6"
      >
        <SafeImage
          url={data.track.album.images[0]?.url}
          alt={data.track.name}
          width={width * 0.6}
          className="relative mb-4 aspect-square overflow-hidden rounded-md"
          square
        />
        <h2 className="w-full font-display text-lg text-gray-400 sm:text-xl">
          {data.track.artists.map((artist, index) =>
            index === data.track.artists.length - 1
              ? artist.name
              : `${artist.name}, `
          )}
        </h2>
        <h1 className="mb-4 w-full text-3xl font-semibold sm:text-4xl">
          {data.track.name}
        </h1>
        <div className="mb-4 flex w-full items-end justify-between gap-4 border-b border-gray-300 pb-4">
          <div className="flex gap-4 text-3xl sm:text-4xl">
            <button>
              <PiHeart />
            </button>
            <Link href={`/create?track_id=${data.track.id}`}>
              <PiPlusCircle />
            </Link>
          </div>
          <p className="text-sm text-gray-400 sm:text-base">{0}</p>
        </div>
        {/* <ul className="w-full">
          {playlist?.data.tracks.items.map((item, index) => {
            const track = item.track as Track;
            return (
              <li
                key={track.id}
                className={clsx(
                  "flex",
                  index !== playlist.data.tracks.items.length - 1 &&
                    "mb-2 border-b border-gray-300 pb-2"
                )}
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
                    {track.artists.map((artist, index) => (
                    
                        index === track.artists.length - 1
                          ? artist.name : `${artist.name}, `
                     
                    ))}
                  </p>
                </div>
              </li>
            );
          })}
        </ul> */}
      </div>
    </>
  );
};
export default Track;
