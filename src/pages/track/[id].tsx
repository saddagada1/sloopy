import { useQuery } from "@tanstack/react-query";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { PiPlusCircle, PiSpotifyLogo } from "react-icons/pi";
import { useElementSize } from "usehooks-ts";
import SafeImage from "~/components/ui/SafeImage";
import Loading from "~/components/utils/Loading";
import { useSpotifyContext } from "~/contexts/Spotify";

const Track: NextPage = ({}) => {
  const router = useRouter();
  const spotify = useSpotifyContext();
  const [imageContainerRef, { width }] = useElementSize();
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
      const analysisResponse = await spotify.fetchTrackAnalysis(id);
      if (!trackResponse?.ok || !analysisResponse?.ok) {
        toast.error("Error: Could Not Fetch Spotify Data");
        throw new Error("Error: Could Not Fetch Spotify Data");
      }
      return { ...trackResponse.data, analysis: analysisResponse.data };
    },
    {
      enabled: !!spotify.auth,
    }
  );

  if (fetchingTrack) {
    return <Loading />;
  }

  if (!track || trackError) {
    return <div>ERROR</div>;
  }

  return (
    <>
      <Head>
        <title>Sloopy - {track.name}</title>
      </Head>
      <div
        ref={imageContainerRef}
        className="flex flex-1 flex-col items-center px-4 pb-12 pt-6"
      >
        <SafeImage
          url={track.album.images[0]?.url}
          alt={track.name}
          width={width * 0.6}
          className="relative mb-4 aspect-square overflow-hidden rounded-md"
          square
        />
        <h2 className="w-full truncate font-display text-lg text-gray-400 sm:text-xl">
          {track.artists.map((artist, index) =>
            index === track.artists.length - 1
              ? artist.name
              : `${artist.name}, `
          )}
        </h2>
        <h1 className="mb-4 w-full truncate text-3xl font-semibold sm:text-4xl">
          {track.name}
        </h1>
        <div className="mb-4 flex w-full items-end justify-between gap-4 border-b border-gray-300 pb-4">
          <div className="flex gap-4 text-3xl sm:text-4xl">
            <Link href={track.uri}>
              <PiSpotifyLogo />
            </Link>
            <Link href={`/create?track_id=${track.id}`}>
              <PiPlusCircle />
            </Link>
          </div>
          <p className="text-sm text-gray-400 sm:text-base">{0}</p>
        </div>
      </div>
    </>
  );
};
export default Track;
