import { useQuery } from "@tanstack/react-query";
import { Field, Form, Formik } from "formik";
import { type NextPage } from "next";
import { signIn, useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import {
  PiArrowRight,
  PiMagnifyingGlass,
  PiSpotifyLogoFill,
} from "react-icons/pi";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import { useElementSize } from "usehooks-ts";
import { useSpotifyContext } from "~/contexts/Spotify";
import { useRouter } from "next/navigation";
import Link from "next/link";

const Auth: React.FC = () => {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="flex w-3/4 flex-col gap-4 rounded-xl bg-secondary p-4">
        <button
          className="flex w-full items-center justify-center rounded-lg bg-[#1DB954] p-3 text-lg font-bold text-white"
          onClick={() => void signIn("spotify")}
        >
          <PiSpotifyLogoFill className="mr-2 text-4xl" /> Sign in with Spotify
        </button>
        <p className="text-xs text-gray-400">
          * Sloopy requires access to your Spotify account to stream content and
          personalize the app to your library.
        </p>
        <p className="text-xs text-gray-400">
          * A Sloopy account will be created using your Spotify credentials on
          initial sign in.
        </p>
        <p className="text-xs text-gray-400">
          * Spotify Premium required to access full functionality.
        </p>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [rootRef, { width, height }] = useElementSize();
  const router = useRouter();
  const { data: session } = useSession();
  const spotify = useSpotifyContext();
  const {
    data: featuredPlaylists,
    isLoading: fetchingFeaturedPlaylists,
    error: featuredPlaylistsError,
  } = useQuery(
    ["featuredPlaylists"],
    async () => {
      const response = await spotify.fetchFeaturedPlaylists();
      if (!response?.ok) {
        throw new Error(response?.message);
      }
      return response;
    },
    {
      enabled: !!spotify.auth,
    }
  );
  const {
    data: userPlaylists,
    isLoading: fetchingUserPlaylists,
    error: userPlaylistsError,
  } = useQuery(
    ["userPlaylists"],
    async () => {
      const response = await spotify.fetchCurrentUserPlaylists();
      if (!response?.ok) {
        throw new Error(response?.message);
      }
      return response;
    },
    {
      enabled: !!spotify.auth,
    }
  );

  const {
    data: topArtists,
    isLoading: fetchingTopArtists,
    error: topArtistsError,
  } = useQuery(
    ["topItems", "artists"],
    async () => {
      const response = await spotify.fetchTopArtists();
      if (!response?.ok) {
        throw new Error(response?.message);
      }
      return response;
    },
    {
      enabled: !!spotify.auth,
    }
  );

  return (
    <div className="flex flex-col px-4 pb-12 pt-6" ref={rootRef}>
      <h2 className="font-display text-xl text-gray-400 sm:text-2xl">
        Good Morning
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
          return;
        }}
      >
        {() => (
          <Form className="mb-4 w-full">
            <div className="flex items-center rounded-md border border-gray-300 bg-gray-200 p-2">
              <PiMagnifyingGlass className="text-2xl text-gray-400" />
              <Field
                className="ml-2 w-full bg-transparent text-sm sm:text-base"
                id="query"
                name="query"
                placeholder="Search for tracks, albums, playlists..."
                type="email"
              />
            </div>
          </Form>
        )}
      </Formik>
      <div className="mb-4">
        <div className="flex gap-2 font-display text-base font-semibold text-primary sm:text-lg">
          <button className="flex-1 rounded-md bg-secondary px-2 py-2.5">
            Recently Played
          </button>
          <button className="flex-1 rounded-md bg-secondary px-2 py-2.5">
            Liked Songs
          </button>
        </div>
      </div>
      <section className="mb-6 flex-1">
        <h3 className="mb-4 flex items-end justify-between font-display text-xl font-semibold sm:text-2xl">
          Top Artists
          <button className="text-gray-400">
            <PiArrowRight />
          </button>
        </h3>
        <Swiper
          slidesPerView={3}
          spaceBetween={8}
          modules={[Pagination]}
          pagination
        >
          {topArtists?.data.items.map((artist, index) => (
            <SwiperSlide key={index}>
              <div className="relative mb-2 aspect-square overflow-hidden rounded-full">
                <Image
                  src={artist.images[0]!.url}
                  alt={artist.name}
                  fill
                  className="object-cover"
                />
              </div>
              <p className="truncate text-sm font-semibold sm:text-base">
                {artist.name}
              </p>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>
      <section className="mb-6 flex-1">
        <h3 className="mb-4 flex items-end justify-between font-display text-xl font-semibold sm:text-2xl">
          Featured
          <button className="text-gray-400">
            <PiArrowRight />
          </button>
        </h3>
        <Swiper
          slidesPerView={3}
          spaceBetween={8}
          modules={[Pagination]}
          pagination
        >
          {featuredPlaylists?.data.playlists.items.map((playlist, index) => (
            <SwiperSlide
              key={index}
              onClick={() => router.push(`/playlist/${playlist.id}`)}
            >
              <div className="flex flex-col">
                <div className="relative mb-2 aspect-square overflow-hidden rounded-md">
                  <Image
                    src={playlist.images[0]!.url}
                    alt={playlist.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="truncate text-sm font-semibold sm:text-base">
                  {playlist.name}
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>
      <section className="flex-1">
        <h3 className="mb-4 flex items-end justify-between  font-display text-xl font-semibold sm:text-2xl">
          Playlists
          <button className="text-gray-400">
            <PiArrowRight />
          </button>
        </h3>
        <Swiper
          slidesPerView={3}
          spaceBetween={8}
          modules={[Pagination]}
          pagination
        >
          {userPlaylists?.data.items.map((playlist, index) => (
            <SwiperSlide key={index}>
              <div className="flex flex-col">
                <div className="relative mb-2 aspect-square overflow-hidden rounded-md">
                  {playlist.images.length > 0 ? (
                    <Image
                      src={playlist.images[0]!.url}
                      alt={playlist.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span className="bg-red-500" />
                  )}
                </div>
                <p className="truncate text-sm font-semibold sm:text-base">
                  {playlist.name}
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>
    </div>
  );
};

const Home: NextPage = () => {
  const { status: sessionStatus } = useSession();
  return (
    <>
      <Head>
        <title>Sloopy - Spotify</title>
      </Head>
      {sessionStatus === "authenticated" ? <Dashboard /> : <Auth />}
    </>
  );
};

export default Home;
