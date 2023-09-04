import { useQuery } from "@tanstack/react-query";
import { Field, Form, Formik } from "formik";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import { PiArrowRight, PiMagnifyingGlass } from "react-icons/pi";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import { useSpotifyContext } from "~/contexts/Spotify";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Loading from "~/components/utils/Loading";
import toast from "react-hot-toast";
import WithAuth from "~/components/utils/WithAuth";

const Home: NextPage = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const spotify = useSpotifyContext();
  const {
    data: dashboard,
    isLoading: fetchingDashboard,
    error: dashboardError,
  } = useQuery(
    ["Dashboard"],
    async () => {
      const topArtists = await spotify.fetchTopArtists();
      const featuredPlaylists = await spotify.fetchFeaturedPlaylists();
      const userPlaylists = await spotify.fetchCurrentUserPlaylists();
      if (!topArtists.ok || !featuredPlaylists.ok || !userPlaylists.ok) {
        toast.error("Error: Could Not Fetch Dashboard Data");
        throw new Error("Error: Could Not Fetch Dashboard Data");
      }
      return {
        topArtists: topArtists.data,
        featuredPlayists: featuredPlaylists.data,
        userPlaylists: userPlaylists.data,
      };
    },
    {
      enabled: !!spotify.auth,
    }
  );

  if (fetchingDashboard) {
    return <Loading />;
  }

  if (!dashboard || dashboardError) {
    return <div>ERROR</div>;
  }

  return (
    <>
      <Head>
        <title>Sloopy - Spotify</title>
      </Head>
      <div className="flex flex-1 flex-col px-4 pb-8 pt-6">
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
          <div className="flex gap-2 text-center font-display text-base font-semibold text-primary sm:text-lg">
            <Link
              href="/favourites"
              className="flex-1 rounded-md bg-secondary px-2 py-2.5"
            >
              Favourites
            </Link>
            <Link
              href="/saved"
              className="flex-1 rounded-md bg-secondary px-2 py-2.5"
            >
              Saved Tracks
            </Link>
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
            {dashboard.topArtists.items.map((artist, index) => (
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
            {dashboard.featuredPlayists.playlists.items.map(
              (playlist, index) => (
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
              )
            )}
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
            {dashboard.userPlaylists.items.map((playlist, index) => (
              <SwiperSlide
                onClick={() => router.push(`/playlist/${playlist.id}`)}
                key={index}
              >
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
    </>
  );
};

export default WithAuth(Home);
