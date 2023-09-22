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
import SloopList from "~/components/ui/SloopList";
import ErrorView from "~/components/utils/ErrorView";
import Loading from "~/components/utils/Loading";
import { api } from "~/utils/api";
import { calcTimeOfDay } from "~/utils/calc";
import { alwaysRefetch, paginationLimit } from "~/utils/constants";

const useHome = () => {
  const {
    data: trendingArtists,
    isLoading: fetchingTrendingArtists,
    error: trendingArtistsError,
  } = api.sloops.getTrendingArtists.useQuery(
    { limit: paginationLimit },
    alwaysRefetch
  );
  const {
    data: trendingSloops,
    isLoading: fetchingTrendingSloops,
    error: trendingSloopsError,
  } = api.sloops.getTrendingSloops.useQuery(
    { limit: paginationLimit },
    alwaysRefetch
  );
  const {
    data: lovedArtists,
    isLoading: fetchingLovedArtists,
    error: lovedArtistsError,
  } = api.sloops.getLovedArtists.useQuery(
    { limit: paginationLimit },
    alwaysRefetch
  );
  const {
    data: lovedSloops,
    isLoading: fetchingLovedSloops,
    error: lovedSloopsError,
  } = api.sloops.getLovedSloops.useQuery(
    { limit: paginationLimit },
    alwaysRefetch
  );
  const {
    data: mostRecent,
    isLoading: fetchingMostRecent,
    error: mostRecentError,
  } = api.sloops.getMostRecent.useQuery(
    { limit: paginationLimit },
    alwaysRefetch
  );

  if (
    fetchingTrendingArtists ||
    fetchingTrendingSloops ||
    fetchingLovedArtists ||
    fetchingLovedSloops ||
    fetchingMostRecent
  ) {
    return { data: undefined, isLoading: true, error: undefined };
  }

  if (
    !trendingArtists ||
    !trendingSloops ||
    !lovedArtists ||
    !lovedSloops ||
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
    lovedArtistsError ??
    lovedSloopsError ??
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
      lovedArtists,
      lovedSloops,
      mostRecent,
    },
    isLoading: false,
    error: undefined,
  };
};

const useUserHome = (enabled: boolean) => {
  const {
    data: recentlyPlayed,
    isLoading: fetchingRecentlyPlayed,
    error: recentlyPlayedError,
  } = api.sloops.getRecentlyPlayedSloops.useQuery(
    { limit: paginationLimit },
    {
      enabled: enabled,
    }
  );
  const {
    data: favourites,
    isLoading: fetchingFavourites,
    error: favouritesError,
  } = api.sloops.getRecentlyPlayedSloops.useQuery(
    { limit: paginationLimit },
    {
      enabled: enabled,
    }
  );

  if (fetchingRecentlyPlayed || fetchingFavourites) {
    return { data: undefined, isLoading: true, error: undefined };
  }

  if (!recentlyPlayed || !favourites) {
    return {
      data: undefined,
      isLoading: false,
      error: "Error: Could Not Fetch Library Data",
    };
  }

  if (recentlyPlayedError ?? favouritesError) {
    return {
      data: undefined,
      isLoading: false,
      error: "Error: Could Not Fetch Library Data",
    };
  }

  return {
    data: {
      recentlyPlayed,
      favourites,
    },
    isLoading: false,
    error: undefined,
  };
};

const Home: NextPage = () => {
  const { data: session, status: sessionStatus } = useSession();
  const [containerRef, { width }] = useElementSize();
  const { data: home, isLoading: fetchingHome, error: homeError } = useHome();
  const {
    data: userHome,
    isLoading: fetchingUserHome,
    error: userHomeError,
  } = useUserHome(sessionStatus === "authenticated");

  if (sessionStatus === "authenticated") {
    if (fetchingHome || fetchingUserHome) {
      return <Loading />;
    }

    if ((!home || homeError) ?? (!userHome || userHomeError)) {
      return <ErrorView />;
    }
  } else {
    if (fetchingHome) {
      return <Loading />;
    }

    if (!home || homeError) {
      return <ErrorView />;
    }
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
        <h1 className="mb-4 truncate border-b border-gray-300 pb-4 text-4xl font-semibold sm:text-5xl">
          {session ? session.user.name ?? session.user.username : "Welcome"}
        </h1>
        <SearchInput />
        <div ref={containerRef} className="mt-2 flex flex-1 flex-col gap-6">
          {sessionStatus !== "authenticated" ? (
            <section className="relative flex aspect-video w-full items-end overflow-hidden rounded-md p-4 text-primary">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute bottom-0 left-0 h-full w-full object-cover"
              >
                <source src="/sloopy-hero.mp4" />
              </video>
              <h1 className="z-10 -mb-1.5 w-3/4 font-display text-2xl font-semibold">
                Embrace your own unique sound.
              </h1>
              <PiAsterisk className="absolute right-3 top-3 animate-[spin_10s_linear_infinite] text-4xl" />
            </section>
          ) : (
            <>
              <section>
                <h3 className="mb-4 flex items-end justify-between font-display text-xl font-semibold sm:text-2xl">
                  Recently Played
                  <Link href="/saved/albums">
                    <PiArrowRight className="text-gray-400" />
                  </Link>
                </h3>
                {userHome!.recentlyPlayed.items.length > 0 ? (
                  <Carousel>
                    {userHome!.recentlyPlayed.items.map(({ sloop }, index) => (
                      <SloopCard key={index} sloop={sloop} width={width} />
                    ))}
                  </Carousel>
                ) : (
                  <NoData>No Recently Played Sloops</NoData>
                )}
              </section>
              <section>
                <h3 className="mb-4 flex items-end justify-between font-display text-xl font-semibold sm:text-2xl">
                  Favourites
                  <Link href="/saved/albums">
                    <PiArrowRight className="text-gray-400" />
                  </Link>
                </h3>
                {userHome!.favourites.items.length > 0 ? (
                  <Carousel>
                    {userHome!.favourites.items.map(({ sloop }, index) => (
                      <SloopCard key={index} sloop={sloop} width={width} />
                    ))}
                  </Carousel>
                ) : (
                  <NoData>No Favourite Sloops</NoData>
                )}
              </section>
            </>
          )}
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
              Most Loved Artists
              <Link href="/saved/albums">
                <PiArrowRight className="text-gray-400" />
              </Link>
            </h3>
            {home.lovedArtists.items.length > 0 ? (
              <Carousel>
                {home.lovedArtists.items.map(({ artist }, index) => (
                  <ArtistCard key={index} width={width} artist={artist} />
                ))}
              </Carousel>
            ) : (
              <NoData>No Loved Artists</NoData>
            )}
          </section>
          <section>
            <h3 className="mb-4 flex items-end justify-between font-display text-xl font-semibold sm:text-2xl">
              Most Loved Sloops
              <Link href="/saved/albums">
                <PiArrowRight className="text-gray-400" />
              </Link>
            </h3>
            {home.lovedSloops.items.length > 0 ? (
              <Carousel>
                {home.lovedSloops.items.map(({ sloop }, index) => (
                  <SloopCard key={index} sloop={sloop} width={width} />
                ))}
              </Carousel>
            ) : (
              <NoData>No Loved Sloops</NoData>
            )}
          </section>
          <section>
            <h3 className="mb-4 flex items-end justify-between font-display text-xl font-semibold sm:text-2xl">
              Most Recent
              <p className="text-base text-gray-400 sm:text-lg">
                {home.mostRecent.items.length}
              </p>
            </h3>
            {home.mostRecent.items.length > 0 ? (
              <SloopList sloops={home.mostRecent.items} />
            ) : (
              <NoData>No Recent Sloops</NoData>
            )}
          </section>
        </div>
      </div>
    </>
  );
};

export default Home;
