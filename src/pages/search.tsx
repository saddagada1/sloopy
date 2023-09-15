import { useQuery } from "@tanstack/react-query";
import { Field, Form, Formik } from "formik";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { PiMagnifyingGlass } from "react-icons/pi";
import { useElementSize } from "usehooks-ts";
import Carousel from "~/components/ui/Carousel";
import SafeImage from "~/components/ui/SafeImage";
import TrackList from "~/components/ui/TrackList";
import Loading from "~/components/utils/Loading";
import { useSpotifyContext } from "~/contexts/Spotify";

const Search: NextPage = ({}) => {
  const router = useRouter();
  const spotify = useSpotifyContext();
  const [containerRef, { width }] = useElementSize();
  const {
    data: search,
    isLoading: fetchingSearch,
    error: searchError,
  } = useQuery(
    ["search", router.query.q],
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
      enabled: !!spotify.auth,
    }
  );

  if (fetchingSearch) {
    return <Loading />;
  }

  if (!search || searchError) {
    return <div>ERROR</div>;
  }

  return (
    <>
      <Head>
        <title>Sloopy - Search</title>
      </Head>
      <div className="flex flex-1 flex-col px-4 pb-4 pt-6">
        <h2 className="font-display text-xl text-gray-400 sm:text-2xl">
          Spotify
        </h2>
        <h1 className="mb-4 truncate border-b border-gray-300 pb-4 text-4xl font-semibold sm:text-5xl">
          Search
        </h1>
        <Formik
          initialValues={{
            query: router.query.q ? (router.query.q as string) : "",
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
        <div ref={containerRef} className="flex flex-1 flex-col gap-6">
          {search.data.artists && (
            <div>
              <h3 className="mb-4 flex items-end justify-between font-display text-xl font-semibold sm:text-2xl">
                Artists
                <p className="text-base text-gray-400 sm:text-lg">
                  {search.data.artists.items.length}
                </p>
              </h3>
              <Carousel>
                {search.data.artists.items.map((artist, index) => (
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
          )}
          {search.data.albums && (
            <div>
              <h3 className="mb-4 flex items-end justify-between font-display text-xl font-semibold sm:text-2xl">
                Albums
                <p className="text-base text-gray-400 sm:text-lg">
                  {search.data.albums.items.length}
                </p>
              </h3>
              <Carousel>
                {search.data.albums.items.map((album, index) => (
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
          )}
          {search.data.playlists && (
            <div>
              <h3 className="mb-4 flex items-end justify-between font-display text-xl font-semibold sm:text-2xl">
                Playlists
                <p className="text-base text-gray-400 sm:text-lg">
                  {search.data.playlists.items.length}
                </p>
              </h3>
              <Carousel>
                {search.data.playlists.items.map((playlist, index) => (
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
          )}
          {search.data.tracks && (
            <div>
              <h3 className="mb-4 flex items-end justify-between font-display text-xl font-semibold sm:text-2xl">
                Tracks
                <p className="text-base text-gray-400 sm:text-lg">
                  {search.data.tracks.items.length}
                </p>
              </h3>
              <TrackList tracks={search.data.tracks.items} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};
export default Search;
