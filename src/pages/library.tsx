import { useQuery } from "@tanstack/react-query";
import { Field, Form, Formik } from "formik";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { PiArrowRight, PiMagnifyingGlass } from "react-icons/pi";
import { useSpotifyContext } from "~/contexts/Spotify";
import { useRouter } from "next/router";
import Link from "next/link";
import Loading from "~/components/utils/Loading";
import toast from "react-hot-toast";
import WithAuth from "~/components/utils/WithAuth";
import Carousel from "~/components/ui/Carousel";
import SafeImage from "~/components/ui/SafeImage";
import { useElementSize } from "usehooks-ts";

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
  const router = useRouter();
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
    return <div>ERROR</div>;
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
        <Formik
          initialValues={{
            query: "",
          }}
          onSubmit={(values: { query: string }) => {
            void router.push(`/search?q=${values.query}`);
          }}
        >
          {() => (
            <Form className="mb-4 w-full">
              <div className="flex items-center rounded-md border border-gray-300 bg-gray-200 p-2">
                <PiMagnifyingGlass className="text-2xl text-gray-400" />
                <Field
                  className="ml-2 w-full bg-transparent text-sm focus:outline-none sm:text-base"
                  id="query"
                  name="query"
                  placeholder="Search for artists, albums, playlists, tracks..."
                  autoComplete="off"
                  autoCorrect="off"
                />
              </div>
            </Form>
          )}
        </Formik>
        <div className="mb-4">
          <div className="flex gap-2 text-center font-display text-base font-semibold text-primary sm:text-lg">
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
        </div>
        <div ref={containerRef} className="flex flex-1 flex-col gap-6">
          <div>
            <h3 className="mb-4 flex items-end justify-between font-display text-xl font-semibold sm:text-2xl">
              Top Artists
              <p className="text-base text-gray-400 sm:text-lg">
                {library.topArtists.items.length}
              </p>
            </h3>
            <Carousel>
              {library.topArtists.items.map((artist, index) => (
                <div
                  key={index}
                  style={{ width: width / 3 }}
                  onClick={() => void router.push(`/artist/${artist.id}`)}
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
                </div>
              ))}
            </Carousel>
          </div>
          <div>
            <h3 className="mb-4 flex items-end justify-between font-display text-xl font-semibold sm:text-2xl">
              Top Tracks
              <p className="text-base text-gray-400 sm:text-lg">
                {library.topTracks.items.length}
              </p>
            </h3>
            <Carousel>
              {library.topTracks.items.map((track, index) => (
                <div
                  key={index}
                  style={{ width: width / 3 }}
                  onClick={() => void router.push(`/track/${track.id}`)}
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
                </div>
              ))}
            </Carousel>
          </div>
          <div>
            <h3 className="mb-4 flex items-end justify-between font-display text-xl font-semibold sm:text-2xl">
              Your Albums
              <Link href="/saved/albums">
                <PiArrowRight className="text-gray-400" />
              </Link>
            </h3>
            <Carousel>
              {library.savedAlbums.items.map((item, index) => (
                <div
                  key={index}
                  style={{ width: width / 3 }}
                  onClick={() => void router.push(`/album/${item.album.id}`)}
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
                </div>
              ))}
            </Carousel>
          </div>
          <div>
            <h3 className="mb-4 flex items-end justify-between font-display text-xl font-semibold sm:text-2xl">
              Your Playlists
              <Link href="/saved/playlists">
                <PiArrowRight className="text-gray-400" />
              </Link>
            </h3>
            <Carousel>
              {library.savedPlaylists.items.map((playlist, index) => (
                <div
                  key={index}
                  style={{ width: width / 3 }}
                  onClick={() => void router.push(`/playlist/${playlist.id}`)}
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
                </div>
              ))}
            </Carousel>
          </div>
          <div>
            <h3 className="mb-4 flex items-end justify-between font-display text-xl font-semibold sm:text-2xl">
              New Releases
              <Link href="/new-releases">
                <PiArrowRight className="text-gray-400" />
              </Link>
            </h3>
            <Carousel>
              {library.newReleases.albums.items.map((album, index) => (
                <div
                  key={index}
                  style={{ width: width / 3 }}
                  onClick={() => void router.push(`/album/${album.id}`)}
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
                </div>
              ))}
            </Carousel>
          </div>
        </div>
      </div>
    </>
  );
};

export default WithAuth(Library, { linked: true });
