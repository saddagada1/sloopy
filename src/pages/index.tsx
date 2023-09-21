import { useMutation } from "@tanstack/react-query";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { PiArrowRight, PiAsterisk } from "react-icons/pi";
import { useElementSize } from "usehooks-ts";
import ArtistCard from "~/components/ui/ArtistCard";
import Carousel from "~/components/ui/Carousel";
import NoData from "~/components/ui/NoData";
import SearchInput from "~/components/ui/SearchInput";
import SloopCard from "~/components/ui/SloopCard";
import ErrorView from "~/components/utils/ErrorView";
import Loading from "~/components/utils/Loading";
import WithAuth from "~/components/utils/WithAuth";
import { api } from "~/utils/api";
import { calcTimeOfDay } from "~/utils/calc";
import { paginationLimit } from "~/utils/constants";
import { fetchTrends } from "~/utils/helpers";

const useHome = () => {
  const homeFetchOptions = {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: 1000 * 60 * 5,
  };
  const {
    data: trendingArtists,
    isLoading: fetchingTrendingArtists,
    error: trendingArtistsError,
  } = api.sloops.getTrendingArtists.useQuery(
    { limit: paginationLimit },
    homeFetchOptions
  );
  const {
    data: trendingSloops,
    isLoading: fetchingTrendingSloops,
    error: trendingSloopsError,
  } = api.sloops.getTrendingSloops.useQuery(
    { limit: paginationLimit },
    homeFetchOptions
  );
  const {
    data: favouriteArtists,
    isLoading: fetchingFavouriteArtists,
    error: favouriteArtistsError,
  } = api.sloops.getFavouriteArtists.useQuery(
    { limit: paginationLimit },
    homeFetchOptions
  );
  const {
    data: favouriteSloops,
    isLoading: fetchingFavouriteSloops,
    error: favouriteSloopsError,
  } = api.sloops.getFavouriteSloops.useQuery(
    { limit: paginationLimit },
    homeFetchOptions
  );
  const {
    data: mostRecent,
    isLoading: fetchingMostRecent,
    error: mostRecentError,
  } = api.sloops.getMostRecent.useQuery(
    { limit: paginationLimit },
    homeFetchOptions
  );

  if (
    fetchingTrendingArtists ||
    fetchingTrendingSloops ||
    fetchingFavouriteArtists ||
    fetchingFavouriteSloops ||
    fetchingMostRecent
  ) {
    return { data: undefined, isLoading: true, error: undefined };
  }

  if (
    !trendingArtists ||
    !trendingSloops ||
    !favouriteArtists ||
    !favouriteSloops ||
    !mostRecent
  ) {
    return {
      data: undefined,
      isLoading: false,
      error: "Error: Could Not Fetch Library Data",
    };
  }

  if (
    trendingArtistsError ??
    trendingSloopsError ??
    favouriteArtistsError ??
    favouriteSloopsError ??
    mostRecentError
  ) {
    return {
      data: undefined,
      isLoading: false,
      error: "Error: Could Not Fetch Library Data",
    };
  }

  return {
    data: {
      trendingArtists,
      trendingSloops,
      favouriteArtists,
      favouriteSloops,
      mostRecent,
    },
    isLoading: false,
    error: undefined,
  };
};

const Home: NextPage = () => {
  const { data: session } = useSession();
  const [containerRef, { width }] = useElementSize();
  const { data: home, isLoading: fetchingHome, error: homeError } = useHome();
  const { mutateAsync: updateRanks } = useMutation(async () => {
    await fetchTrends();
  });

  if (fetchingHome) {
    return <Loading />;
  }

  if (!home || homeError) {
    return <ErrorView />;
  }

  return (
    <>
      <Head>
        <title>Sloopy - Home</title>
      </Head>
      <div className="flex flex-1 flex-col px-4 py-6">
        <h2 className="font-display text-xl text-gray-400 sm:text-2xl">
          {calcTimeOfDay()}
        </h2>
        <Link
          href="/profile"
          className="mb-4 truncate border-b border-gray-300 pb-4 text-4xl font-semibold sm:text-5xl"
        >
          {session?.user.name ?? session?.user.username}
        </Link>
        <SearchInput />
        <div ref={containerRef} className="mt-2 flex flex-1 flex-col gap-6">
          <section
            onClick={() => void updateRanks()}
            className="relative flex aspect-video w-full items-end overflow-hidden rounded-md p-4 text-primary"
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute bottom-0 left-0 h-full w-full object-cover"
            >
              <source src="/sloopy-hero.mp4" />
            </video>
            <div className="anim-grain top-0 opacity-10" />
            <h1 className="z-10 -mb-1.5 w-3/4 font-display text-2xl font-semibold">
              Embrace your own unique sound.
            </h1>
            <PiAsterisk className="absolute right-3 top-3 animate-[spin_10s_linear_infinite] text-4xl" />
          </section>
          <section>
            <h3 className="mb-4 flex items-end justify-between font-display text-xl font-semibold sm:text-2xl">
              Trending Artists
              <Link href="/saved/albums">
                <PiArrowRight className="text-gray-400" />
              </Link>
            </h3>
            {home.trendingArtists.items.length > 0 ? (
              <Carousel>
                {home.trendingArtists.items.map(({ artist }, index) => (
                  <ArtistCard key={index} width={width} artist={artist} />
                ))}
              </Carousel>
            ) : (
              <NoData>No Trending Artists</NoData>
            )}
          </section>
          <section>
            <h3 className="mb-4 flex items-end justify-between font-display text-xl font-semibold sm:text-2xl">
              Trending Sloops
              <Link href="/saved/albums">
                <PiArrowRight className="text-gray-400" />
              </Link>
            </h3>
            {home.trendingSloops.items.length > 0 ? (
              <Carousel>
                {home.trendingSloops.items.map(({ sloop }, index) => (
                  <SloopCard key={index} sloop={sloop} width={width} />
                ))}
              </Carousel>
            ) : (
              <NoData>No Trending Sloops</NoData>
            )}
          </section>
          <section>
            <h3 className="mb-4 flex items-end justify-between font-display text-xl font-semibold sm:text-2xl">
              Favourite Artists
              <Link href="/saved/albums">
                <PiArrowRight className="text-gray-400" />
              </Link>
            </h3>
            {home.favouriteArtists.items.length > 0 ? (
              <Carousel>
                {home.favouriteArtists.items.map(({ artist }, index) => (
                  <ArtistCard key={index} width={width} artist={artist} />
                ))}
              </Carousel>
            ) : (
              <NoData>No Favourite Artists</NoData>
            )}
          </section>
          <section>
            <h3 className="mb-4 flex items-end justify-between font-display text-xl font-semibold sm:text-2xl">
              Favourite Sloops
              <Link href="/saved/albums">
                <PiArrowRight className="text-gray-400" />
              </Link>
            </h3>
            {home.favouriteSloops.items.length > 0 ? (
              <Carousel>
                {home.favouriteSloops.items.map(({ sloop }, index) => (
                  <SloopCard key={index} sloop={sloop} width={width} />
                ))}
              </Carousel>
            ) : (
              <NoData>No Favourite Sloops</NoData>
            )}
          </section>
          <section>
            <h3 className="mb-4 flex items-end justify-between font-display text-xl font-semibold sm:text-2xl">
              Most Recent
              <Link href="/saved/albums">
                <PiArrowRight className="text-gray-400" />
              </Link>
            </h3>
            {home.mostRecent.items.length > 0 ? (
              <Carousel>
                {home.mostRecent.items.map((sloop, index) => (
                  <SloopCard key={index} sloop={sloop} width={width} />
                ))}
              </Carousel>
            ) : (
              <NoData>No Recent Sloops</NoData>
            )}
          </section>
        </div>
      </div>
    </>
  );
};

export default WithAuth(Home);
