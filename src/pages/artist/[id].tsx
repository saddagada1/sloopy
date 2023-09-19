import { useQuery } from "@tanstack/react-query";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { PiSpotifyLogo } from "react-icons/pi";
import { useElementSize } from "usehooks-ts";
import Carousel from "~/components/ui/Carousel";
import SafeImage from "~/components/ui/SafeImage";
import TrackList from "~/components/ui/TrackList";
import ErrorView from "~/components/utils/ErrorView";
import Loading from "~/components/utils/Loading";
import WithAuth from "~/components/utils/WithAuth";
import { useSpotifyContext } from "~/contexts/Spotify";
import { pitchClassColours } from "~/utils/constants";

const Artist: NextPage = ({}) => {
  const router = useRouter();
  const spotify = useSpotifyContext();
  const [containerRef, { width }] = useElementSize();
  const [imageContainerRef, { height }] = useElementSize();
  const {
    data: artist,
    isLoading: fetchingArtist,
    error: artistError,
  } = useQuery(
    ["artist", router.query.id],
    async () => {
      const id = router.query.id;
      if (typeof id !== "string") {
        throw new Error("404");
      }
      const artistResponse = await spotify.fetchArtist(id);
      const artistAlbumsResponse = await spotify.fetchArtistAlbums(id);
      const relatedArtistsResponse = await spotify.fetchRelatedArtists(id);
      const topTracksResponse = await spotify.fetchArtistTopTracks(id);

      if (
        !artistResponse.ok ||
        !artistAlbumsResponse.ok ||
        !relatedArtistsResponse.ok ||
        !topTracksResponse.ok
      ) {
        toast.error("Error: Could Not Fetch Spotify Data");
        throw new Error("Error: Could Not Fetch Spotify Data");
      }
      return {
        ...artistResponse.data,
        albums: artistAlbumsResponse.data.items,
        related: relatedArtistsResponse.data.artists,
        tracks: topTracksResponse.data.tracks,
      };
    },
    {
      enabled: !!spotify.auth,
    }
  );

  if (fetchingArtist) {
    return <Loading />;
  }

  if (!artist || artistError) {
    return <ErrorView />;
  }

  return (
    <>
      <Head>
        <title>Sloopy - {artist.name}</title>
      </Head>
      <div className="flex flex-1 flex-col px-4 py-6">
        <h2 className="font-display text-xl text-gray-400 sm:text-2xl">
          Artist
        </h2>
        <h1 className="mb-4 truncate border-b border-gray-300 pb-4 text-4xl font-semibold sm:text-5xl">
          {artist.name}
        </h1>
        <div ref={imageContainerRef} className="flex gap-4">
          <SafeImage
            url={artist.images[0]?.url}
            alt={artist.name}
            width={height}
            className="relative aspect-square overflow-hidden rounded-full"
            colours={Object.keys(pitchClassColours).map(
              (key) => pitchClassColours[parseInt(key)]!
            )}
          />
          <div className="flex flex-1 flex-col justify-between gap-4">
            <div className="flex border-b border-gray-300 pb-4">
              <div className="flex basis-3/5 flex-col items-start gap-1 border-r border-gray-300">
                <label className="px-2 font-display text-xs text-gray-400 sm:text-sm">
                  Followers
                </label>
                <p className="w-full text-center text-sm font-semibold sm:text-base">
                  {artist.followers.total.toLocaleString()}
                </p>
              </div>
              <div className="flex flex-1 flex-col items-center gap-1">
                <label className="px-2 font-display text-xs text-gray-400 sm:text-sm">
                  Popularity
                </label>
                <p className="ml-4 w-full text-center text-sm font-semibold sm:text-base">
                  {`${artist.popularity}%`}
                </p>
              </div>
            </div>
            <Link
              href={artist.uri}
              className="flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-gray-200 px-2 py-2.5 font-display text-base font-semibold sm:text-lg"
            >
              <PiSpotifyLogo className="text-2xl sm:text-3xl" />
              Listen On Spotify
            </Link>
          </div>
        </div>
        <div
          ref={containerRef}
          className="mt-4 flex flex-1 flex-col gap-6 border-t border-gray-300 pt-4"
        >
          <div>
            <h3 className="mb-4 flex items-end justify-between font-display text-xl font-semibold sm:text-2xl">
              Top Albums
              <p className="text-base text-gray-400 sm:text-lg">
                {artist.albums.length}
              </p>
            </h3>
            {artist.albums.length > 0 ? (
              <Carousel>
                {artist.albums.map((album, index) => (
                  <Link
                    key={index}
                    style={{ width: width / 3 }}
                    href={`/album/${album.id}`}
                  >
                    <SafeImage
                      className="relative mb-2 aspect-square overflow-hidden rounded-md"
                      url={album.images[0]?.url}
                      alt={album.name}
                      square
                      width={width / 3}
                    />
                    <p className="truncate text-sm font-semibold sm:text-base">
                      {album.name}
                    </p>
                  </Link>
                ))}
              </Carousel>
            ) : (
              <p className="mx-12 text-center font-display text-base text-gray-400 sm:text-lg">
                No Album Results
              </p>
            )}
          </div>
          <div>
            <h3 className="mb-4 flex items-end justify-between font-display text-xl font-semibold sm:text-2xl">
              Top Tracks
              <p className="text-base text-gray-400 sm:text-lg">
                {artist.tracks.length}
              </p>
            </h3>
            {artist.tracks.length > 0 ? (
              <TrackList tracks={artist.tracks} />
            ) : (
              <p className="mx-12 text-center font-display text-base text-gray-400 sm:text-lg">
                No Track Results
              </p>
            )}
          </div>
          <div>
            <h3 className="mb-4 flex items-end justify-between font-display text-xl font-semibold sm:text-2xl">
              You May Also Like
              <p className="text-base text-gray-400 sm:text-lg">
                {artist.related.length}
              </p>
            </h3>
            {artist.related.length > 0 ? (
              <Carousel>
                {artist.related.map((related, index) => (
                  <Link
                    key={index}
                    style={{ width: width / 3 }}
                    href={`/artist/${related.id}`}
                  >
                    <SafeImage
                      className="relative mb-2 aspect-square overflow-hidden rounded-full"
                      url={related.images[0]?.url}
                      alt={related.name}
                      width={width / 3}
                    />
                    <p className="truncate text-sm font-semibold sm:text-base">
                      {related.name}
                    </p>
                  </Link>
                ))}
              </Carousel>
            ) : (
              <p className="mx-12 text-center font-display text-base text-gray-400 sm:text-lg">
                No Artist Results
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default WithAuth(Artist);
