import { useQuery } from "@tanstack/react-query";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useElementSize } from "usehooks-ts";
import Carousel from "~/components/ui/Carousel";
import SearchInput from "~/components/ui/SearchInput";
import TrackList from "~/components/ui/TrackList";
import ErrorView from "~/components/utils/ErrorView";
import Loading from "~/components/utils/Loading";
import { useSpotifyContext } from "~/contexts/Spotify";
import { type Search as SpotifySearch } from "~/contexts/Spotify";
import { api } from "~/utils/api";
import SloopList from "~/components/ui/SloopList";
import { type ListSloop } from "~/utils/types";
import { type Track, type Artist } from "@prisma/client";
import NoData from "~/components/ui/NoData";
import AlbumCard from "~/components/ui/AlbumCard";
import PlaylistCard from "~/components/ui/PlaylistCard";
import ArtistCard from "~/components/ui/ArtistCard";
import UserCard from "~/components/ui/UserCard";
import clsx from "clsx";
import TrackCard from "~/components/ui/TrackCard";

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
                <ArtistCard key={index} width={width} artist={artist} />
              ))}
            </Carousel>
          ) : (
            <NoData>No Artist Results</NoData>
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
                <AlbumCard key={index} width={width} album={album} />
              ))}
            </Carousel>
          ) : (
            <NoData>No Album Results</NoData>
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
                <PlaylistCard key={index} width={width} playlist={playlist} />
              ))}
            </Carousel>
          ) : (
            <NoData>No Playlist Results</NoData>
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
            <NoData>No Track Results</NoData>
          )}
        </section>
      )}
    </>
  );
};

interface SloopyResultsProps {
  results: {
    users: { username: string; image: string | null }[];
    tracks: Track[];
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
              <UserCard key={index} width={width} user={user} />
            ))}
          </Carousel>
        ) : (
          <NoData>No User Results</NoData>
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
              <ArtistCard key={index} width={width} artist={artist} />
            ))}
          </Carousel>
        ) : (
          <NoData>No Artist Results</NoData>
        )}
      </section>
      {results.tracks && (
        <section>
          <h3 className="mb-4 flex items-end justify-between font-display text-xl font-semibold sm:text-2xl">
            Tracks
            <p className="text-base text-gray-400 sm:text-lg">
              {results.tracks.length}
            </p>
          </h3>
          {results.tracks.length > 0 ? (
            <Carousel>
              {results.tracks.map((track, index) => (
                <TrackCard key={index} width={width} track={track} />
              ))}
            </Carousel>
          ) : (
            <NoData>No Track Results</NoData>
          )}
        </section>
      )}
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
          <NoData>No Sloop Results</NoData>
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
        <div className="mb-4 flex gap-2 text-center font-display text-base font-semibold sm:text-lg">
          <button
            onClick={() =>
              void router.replace(
                `/search?q=${router.query.q as string}&tab=sloopy`,
                undefined,
                { shallow: true }
              )
            }
            className={clsx(
              "flex-1 rounded-md px-2 py-2.5",
              router.query.tab === "sloopy"
                ? "bg-secondary text-primary"
                : "border border-gray-300 bg-gray-200"
            )}
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
            className={clsx(
              "flex-1 rounded-md px-2 py-2.5",
              router.query.tab === "spotify"
                ? "bg-secondary text-primary"
                : "border border-gray-300 bg-gray-200"
            )}
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
              <NoData>Unable To Search Sloopy. Please Refresh.</NoData>
            )
          ) : router.query.tab === "spotify" ? (
            fetchingSpotifySearch ? (
              <Loading />
            ) : spotifySearch ? (
              <SpotifyResults results={spotifySearch.data} width={width} />
            ) : (
              <NoData>Unable To Search Spotify. Please Refresh.</NoData>
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
