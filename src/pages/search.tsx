import { useQuery } from "@tanstack/react-query";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useElementSize } from "usehooks-ts";
import Carousel from "~/components/ui/Carousel";
import SafeImage from "~/components/ui/SafeImage";
import SearchInput from "~/components/ui/SearchInput";
import TrackList from "~/components/ui/TrackList";
import ErrorView from "~/components/utils/ErrorView";
import Loading from "~/components/utils/Loading";
import { useSpotifyContext } from "~/contexts/Spotify";
import { type Search as SpotifySearch } from "~/contexts/Spotify";
import Link from "next/link";
import { api } from "~/utils/api";
import SloopList from "~/components/ui/SloopList";
import { pitchClassColours } from "~/utils/constants";
import { type ListSloop } from "~/utils/types";
import { type Artist } from "@prisma/client";

interface SpotifyResultsProps {
  results: SpotifySearch;
  width: number;
}

const SpotifyResults: React.FC<SpotifyResultsProps> = ({ results, width }) => {
  return (
    <>
      {results.artists && (
        <section>
          <h3 className="mb-4 flex items-end justify-between font-display text-xl font-semibold sm:text-2xl">
            Artists
            <p className="text-base text-gray-400 sm:text-lg">
              {results.artists.items.length}
            </p>
          </h3>
          {results.artists.items.length > 0 ? (
            <Carousel>
              {results.artists.items.map((artist, index) => (
                <Link
                  key={index}
                  style={{ width: width / 3 }}
                  href={`/artist/${artist.id}`}
                >
                  <SafeImage
                    className="relative mb-2 aspect-square overflow-hidden rounded-full"
                    url={artist.images[0]?.url}
                    alt={artist.name}
                    width={width / 3}
                  />
                  <p className="truncate text-sm font-semibold sm:text-base">
                    {artist.name}
                  </p>
                </Link>
              ))}
            </Carousel>
          ) : (
            <p className="mx-12 text-center font-display text-base text-gray-400 sm:text-lg">
              No Artist Results
            </p>
          )}
        </section>
      )}
      {results.albums && (
        <section>
          <h3 className="mb-4 flex items-end justify-between font-display text-xl font-semibold sm:text-2xl">
            Albums
            <p className="text-base text-gray-400 sm:text-lg">
              {results.albums.items.length}
            </p>
          </h3>
          {results.albums.items.length > 0 ? (
            <Carousel>
              {results.albums.items.map((album, index) => (
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
        </section>
      )}
      {results.playlists && (
        <section>
          <h3 className="mb-4 flex items-end justify-between font-display text-xl font-semibold sm:text-2xl">
            Playlists
            <p className="text-base text-gray-400 sm:text-lg">
              {results.playlists.items.length}
            </p>
          </h3>
          {results.playlists.items.length > 0 ? (
            <Carousel>
              {results.playlists.items.map((playlist, index) => (
                <Link
                  key={index}
                  style={{ width: width / 3 }}
                  href={`/playlist/${playlist.id}`}
                >
                  <SafeImage
                    className="relative mb-2 aspect-square overflow-hidden rounded-md"
                    url={playlist.images[0]?.url}
                    alt={playlist.name}
                    square
                    width={width / 3}
                  />
                  <p className="truncate text-sm font-semibold sm:text-base">
                    {playlist.name}
                  </p>
                </Link>
              ))}
            </Carousel>
          ) : (
            <p className="mx-12 text-center font-display text-base text-gray-400 sm:text-lg">
              No Playlist Results
            </p>
          )}
        </section>
      )}
      {results.tracks && (
        <section>
          <h3 className="mb-4 flex items-end justify-between font-display text-xl font-semibold sm:text-2xl">
            Tracks
            <p className="text-base text-gray-400 sm:text-lg">
              {results.tracks.items.length}
            </p>
          </h3>
          {results.tracks.items.length > 0 ? (
            <TrackList tracks={results.tracks.items} />
          ) : (
            <p className="mx-12 text-center font-display text-base text-gray-400 sm:text-lg">
              No Track Results
            </p>
          )}
        </section>
      )}
    </>
  );
};

interface SloopyResultsProps {
  results: {
    users: { username: string; image: string | null }[];
    artists: Artist[];
    sloops: ListSloop[];
  };
  width: number;
}

const SloopyResults: React.FC<SloopyResultsProps> = ({ results, width }) => {
  return (
    <>
      <section>
        <h3 className="mb-4 flex items-end justify-between font-display text-xl font-semibold sm:text-2xl">
          Users
          <p className="text-base text-gray-400 sm:text-lg">
            {results.users.length}
          </p>
        </h3>
        {results.users.length > 0 ? (
          <Carousel>
            {results.users.map((user, index) => (
              <Link
                key={index}
                style={{ width: width / 3 }}
                href={`/${user.username}`}
              >
                <SafeImage
                  className="relative mb-2 aspect-square overflow-hidden rounded-full"
                  url={user.image}
                  alt={user.username}
                  width={width / 3}
                  colours={Object.keys(pitchClassColours).map(
                    (key) => pitchClassColours[parseInt(key)]!
                  )}
                />
                <p className="truncate text-sm font-semibold sm:text-base">
                  {user.username}
                </p>
              </Link>
            ))}
          </Carousel>
        ) : (
          <p className="mx-12 text-center font-display text-base text-gray-400 sm:text-lg">
            No User Results
          </p>
        )}
      </section>
      <section>
        <h3 className="mb-4 flex items-end justify-between font-display text-xl font-semibold sm:text-2xl">
          Artists
          <p className="text-base text-gray-400 sm:text-lg">
            {results.artists.length}
          </p>
        </h3>
        {results.artists.length > 0 ? (
          <Carousel>
            {results.artists.map((artist, index) => (
              <Link
                key={index}
                style={{ width: width / 3 }}
                href={`/${artist.name}`}
              >
                <SafeImage
                  className="relative mb-2 aspect-square overflow-hidden rounded-full"
                  url={artist.image}
                  alt={artist.name}
                  width={width / 3}
                  colours={Object.keys(pitchClassColours).map(
                    (key) => pitchClassColours[parseInt(key)]!
                  )}
                />
                <p className="truncate text-sm font-semibold sm:text-base">
                  {artist.name}
                </p>
              </Link>
            ))}
          </Carousel>
        ) : (
          <p className="mx-12 text-center font-display text-base text-gray-400 sm:text-lg">
            No Artist Results
          </p>
        )}
      </section>
      <section>
        <h3 className="mb-4 flex items-end justify-between font-display text-xl font-semibold sm:text-2xl">
          Sloops
          <p className="text-base text-gray-400 sm:text-lg">
            {results.sloops.length}
          </p>
        </h3>
        {results.sloops.length > 0 ? (
          <SloopList sloops={results.sloops} />
        ) : (
          <p className="mx-12 text-center font-display text-base text-gray-400 sm:text-lg">
            No Sloop Results
          </p>
        )}
      </section>
    </>
  );
};

const Search: NextPage = ({}) => {
  const router = useRouter();
  const spotify = useSpotifyContext();
  const [containerRef, { width }] = useElementSize();
  const {
    data: spotifySearch,
    isLoading: fetchingSpotifySearch,
    error: spotifySearchError,
  } = useQuery(
    ["spotify-search", router.query.q],
    async () => {
      const query = router.query.q;
      if (typeof query !== "string") {
        throw new Error("404");
      }
      const response = await spotify.search(query);

      if (!response?.ok) {
        throw new Error(response?.message ?? "Fatal Error");
      }
      return response;
    },
    {
      enabled: !!spotify.auth && router.query.tab === "spotify",
    }
  );

  const {
    data: sloopySearch,
    isLoading: fetchingSloopySearch,
    error: sloopySearchError,
  } = api.search.all.useQuery(
    { query: router.query.q as string },
    { enabled: router.query.tab === "sloopy" }
  );

  if (spotifySearchError ?? sloopySearchError) {
    return <ErrorView />;
  }

  return (
    <>
      <Head>
        <title>Sloopy - Search</title>
      </Head>
      <div className="flex flex-1 flex-col px-4 pb-4 pt-6">
        <h2 className="font-display text-xl text-gray-400 sm:text-2xl">
          {router.query.tab === "sloopy" ? "Sloopy" : "Spotify"}
        </h2>
        <h1 className="mb-4 truncate border-b border-gray-300 pb-4 text-4xl font-semibold sm:text-5xl">
          Search
        </h1>
        <SearchInput
          key={router.query.q as string | undefined}
          defaultValue={router.query.q as string | undefined}
          tab={router.query.tab as string | undefined}
        />
        <div className="mb-4 flex gap-2 text-center font-display text-base font-semibold text-primary sm:text-lg">
          <button
            onClick={() =>
              void router.replace(
                `/search?q=${router.query.q as string}&tab=sloopy`,
                undefined,
                { shallow: true }
              )
            }
            className="flex-1 rounded-md bg-secondary px-2 py-2.5"
          >
            Sloopy
          </button>
          <button
            onClick={() =>
              void router.replace(
                `/search?q=${router.query.q as string}&tab=spotify`,
                undefined,
                { shallow: true }
              )
            }
            className="flex-1 rounded-md bg-secondary px-2 py-2.5"
          >
            Spotify
          </button>
        </div>
        <div ref={containerRef} className="flex flex-1 flex-col gap-6">
          {router.query.tab === "sloopy" ? (
            fetchingSloopySearch ? (
              <Loading />
            ) : sloopySearch ? (
              <SloopyResults results={sloopySearch} width={width} />
            ) : (
              <p className="mx-12 text-center font-display text-base text-gray-400 sm:text-lg">
                Unable To Search Sloopy
              </p>
            )
          ) : router.query.tab === "spotify" ? (
            fetchingSpotifySearch ? (
              <Loading />
            ) : spotifySearch ? (
              <SpotifyResults results={spotifySearch.data} width={width} />
            ) : (
              <p className="mx-12 text-center font-display text-base text-gray-400 sm:text-lg">
                Unable To Search Spotify
              </p>
            )
          ) : (
            <ErrorView />
          )}
        </div>
      </div>
    </>
  );
};
export default Search;
