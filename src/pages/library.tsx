import { useQuery } from "@tanstack/react-query";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { PiArrowRight } from "react-icons/pi";
import { useSpotifyContext } from "~/contexts/Spotify";
import Link from "next/link";
import Loading from "~/components/utils/Loading";
import toast from "react-hot-toast";
import WithAuth from "~/components/utils/WithAuth";
import Carousel from "~/components/ui/Carousel";
import SafeImage from "~/components/ui/SafeImage";
import { useElementSize } from "usehooks-ts";
import ErrorView from "~/components/utils/ErrorView";
import SearchInput from "~/components/ui/SearchInput";

const useLibrary = () => {
  const spotify = useSpotifyContext();
  const {
    data: topArtists,
    isLoading: fetchingTopArtists,
    error: topArtistsError,
  } = useQuery(
    ["topArtists"],
    async () => {
      const response = await spotify.fetchTopArtists();
      if (!response?.ok) {
        throw new Error(
          response?.message ?? "Error: Could Not Fetch Spotify Data"
        );
      }
      return response.data;
    },
    {
      enabled: !!spotify.auth,
    }
  );
  const {
    data: topTracks,
    isLoading: fetchingTopTracks,
    error: topTracksError,
  } = useQuery(
    ["topTracks"],
    async () => {
      const response = await spotify.fetchTopTracks();
      if (!response?.ok) {
        throw new Error(
          response?.message ?? "Error: Could Not Fetch Spotify Data"
        );
      }
      return response.data;
    },
    {
      enabled: !!spotify.auth,
    }
  );
  const {
    data: savedAlbums,
    isLoading: fetchingSavedAlbums,
    error: savedAlbumsError,
  } = useQuery(
    ["SavedAlbums", "0"],
    async () => {
      const response = await spotify.fetchCurrentUserAlbums(0);
      if (!response?.ok) {
        throw new Error(
          response?.message ?? "Error: Could Not Fetch Spotify Data"
        );
      }
      return response.data;
    },
    {
      enabled: !!spotify.auth,
    }
  );
  const {
    data: savedPlaylists,
    isLoading: fetchingSavedPlaylists,
    error: savedPlaylistsError,
  } = useQuery(
    ["SavedPlaylists", "0"],
    async () => {
      const response = await spotify.fetchCurrentUserPlaylists(0);
      if (!response?.ok) {
        throw new Error(
          response?.message ?? "Error: Could Not Fetch Spotify Data"
        );
      }
      return response.data;
    },
    {
      enabled: !!spotify.auth,
    }
  );
  const {
    data: newReleases,
    isLoading: fetchingNewReleases,
    error: newReleasesError,
  } = useQuery(
    ["NewReleases", "0"],
    async () => {
      const response = await spotify.fetchNewReleases(0);
      if (!response?.ok) {
        throw new Error(
          response?.message ?? "Error: Could Not Fetch Spotify Data"
        );
      }
      return response.data;
    },
    {
      enabled: !!spotify.auth,
    }
  );

  if (
    fetchingTopArtists ||
    fetchingTopTracks ||
    fetchingSavedAlbums ||
    fetchingSavedPlaylists ||
    fetchingNewReleases
  ) {
    return { data: undefined, isLoading: true, error: undefined };
  }

  if (
    !topArtists ||
    !topTracks ||
    !savedAlbums ||
    !savedPlaylists ||
    !newReleases
  ) {
    return {
      data: undefined,
      isLoading: false,
      error: "Error: Could Not Fetch Library Data",
    };
  }

  if (
    topArtistsError ||
    topTracksError ||
    savedAlbumsError ||
    savedPlaylistsError ||
    newReleasesError
  ) {
    return {
      data: undefined,
      isLoading: false,
      error: "Error: Could Not Fetch Library Data",
    };
  }

  return {
    data: { topArtists, topTracks, savedAlbums, savedPlaylists, newReleases },
    isLoading: false,
    error: undefined,
  };
};

const Library: NextPage = () => {
  const { data: session } = useSession();
  const [containerRef, { width }] = useElementSize();
  const {
    data: library,
    isLoading: fetchingLibrary,
    error: libraryError,
  } = useLibrary();

  if (fetchingLibrary) {
    return <Loading />;
  }

  if (!library || libraryError) {
    toast.error("Error: Could Not Fetch Library Data");
    return <ErrorView />;
  }

  return (
    <>
      <Head>
        <title>Sloopy - Library</title>
      </Head>
      <div className="flex flex-1 flex-col px-4 py-6">
        <h2 className="font-display text-xl text-gray-400 sm:text-2xl">
          Library
        </h2>
        <Link
          href="/profile"
          className="mb-4 truncate border-b border-gray-300 pb-4 text-4xl font-semibold sm:text-5xl"
        >
          {session?.user.name ?? session?.user.username}
        </Link>
        <SearchInput tab="spotify" />
        <div className="mb-4 flex gap-2 text-center font-display text-base font-semibold text-primary sm:text-lg">
          <Link
            href="/recently-played"
            className="flex-1 rounded-md bg-secondary px-2 py-2.5"
          >
            Recently Played
          </Link>
          <Link
            href="/saved/tracks"
            className="flex-1 rounded-md bg-secondary px-2 py-2.5"
          >
            Liked Songs
          </Link>
        </div>
        <div ref={containerRef} className="flex flex-1 flex-col gap-6">
          <section>
            <h3 className="mb-4 flex items-end justify-between font-display text-xl font-semibold sm:text-2xl">
              Top Artists
              <p className="text-base text-gray-400 sm:text-lg">
                {library.topArtists.items.length}
              </p>
            </h3>
            {library.topArtists.items.length > 0 ? (
              <Carousel>
                {library.topArtists.items.map((artist, index) => (
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
          <section>
            <h3 className="mb-4 flex items-end justify-between font-display text-xl font-semibold sm:text-2xl">
              Top Tracks
              <p className="text-base text-gray-400 sm:text-lg">
                {library.topTracks.items.length}
              </p>
            </h3>
            {library.topTracks.items.length > 0 ? (
              <Carousel>
                {library.topTracks.items.map((track, index) => (
                  <Link
                    key={index}
                    style={{ width: width / 3 }}
                    href={`/track/${track.id}`}
                  >
                    <SafeImage
                      className="relative mb-2 aspect-square overflow-hidden rounded-md"
                      url={track.album.images[0]?.url}
                      alt={track.name}
                      square
                      width={width / 3}
                    />
                    <p className="truncate text-sm font-semibold sm:text-base">
                      {track.name}
                    </p>
                  </Link>
                ))}
              </Carousel>
            ) : (
              <p className="mx-12 text-center font-display text-base text-gray-400 sm:text-lg">
                No Track Results
              </p>
            )}
          </section>
          <section>
            <h3 className="mb-4 flex items-end justify-between font-display text-xl font-semibold sm:text-2xl">
              Your Albums
              <Link href="/saved/albums">
                <PiArrowRight className="text-gray-400" />
              </Link>
            </h3>
            {library.savedAlbums.items.length > 0 ? (
              <Carousel>
                {library.savedAlbums.items.map((item, index) => (
                  <Link
                    key={index}
                    style={{ width: width / 3 }}
                    href={`/album/${item.album.id}`}
                  >
                    <SafeImage
                      className="relative mb-2 aspect-square overflow-hidden rounded-md"
                      url={item.album.images[0]?.url}
                      alt={item.album.name}
                      square
                      width={width / 3}
                    />
                    <p className="truncate text-sm font-semibold sm:text-base">
                      {item.album.name}
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
          <section>
            <h3 className="mb-4 flex items-end justify-between font-display text-xl font-semibold sm:text-2xl">
              Your Playlists
              <Link href="/saved/playlists">
                <PiArrowRight className="text-gray-400" />
              </Link>
            </h3>
            {library.savedPlaylists.items.length > 0 ? (
              <Carousel>
                {library.savedPlaylists.items.map((playlist, index) => (
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
          <section>
            <h3 className="mb-4 flex items-end justify-between font-display text-xl font-semibold sm:text-2xl">
              New Releases
              <Link href="/new-releases">
                <PiArrowRight className="text-gray-400" />
              </Link>
            </h3>
            {library.newReleases.albums.items.length > 0 ? (
              <Carousel>
                {library.newReleases.albums.items.map((album, index) => (
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
                No New Releases
              </p>
            )}
          </section>
        </div>
      </div>
    </>
  );
};

export default WithAuth(Library, { linked: true });
