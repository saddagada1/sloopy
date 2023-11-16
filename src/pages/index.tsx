import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useElementSize } from "usehooks-ts";
import ArtistCard from "~/components/artistCard";
import Carousel from "~/components/carousel";
import NoData from "~/components/noData";
import SloopCard from "~/components/sloopCard";
import ErrorView from "~/components/utils/errorView";
import Loading from "~/components/utils/loading";
import { api } from "~/utils/api";
import { calcTimeOfDay } from "~/utils/calc";
import { alwaysRefetch, paginationLimit } from "~/utils/constants";
import TrackCard from "~/components/trackCard";
import { ScrollArea } from "~/components/ui/scroll-area";
import Marquee from "~/components/marquee";

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
    data: trendingTracks,
    isLoading: fetchingTrendingTracks,
    error: trendingTracksError,
  } = api.sloops.getTrendingTracks.useQuery(
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
    data: lovedTracks,
    isLoading: fetchingLovedTracks,
    error: lovedTracksError,
  } = api.sloops.getLovedTracks.useQuery(
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
    fetchingTrendingTracks ||
    fetchingTrendingSloops ||
    fetchingLovedArtists ||
    fetchingLovedTracks ||
    fetchingLovedSloops ||
    fetchingMostRecent
  ) {
    return { data: undefined, isLoading: true, error: undefined };
  }

  if (
    !trendingArtists ||
    !trendingTracks ||
    !trendingSloops ||
    !lovedArtists ||
    !lovedTracks ||
    !lovedSloops ||
    !mostRecent
  ) {
    return {
      data: undefined,
      isLoading: false,
      error: "Error: Could Not Fetch Discover Data",
    };
  }

  if (
    trendingArtistsError ??
    trendingTracksError ??
    trendingSloopsError ??
    lovedArtistsError ??
    lovedTracksError ??
    lovedSloopsError ??
    mostRecentError
  ) {
    return {
      data: undefined,
      isLoading: false,
      error: "Error: Could Not Fetch Discover Data",
    };
  }

  return {
    data: {
      trendingArtists,
      trendingTracks,
      trendingSloops,
      lovedArtists,
      lovedTracks,
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
  } = api.sloops.getFavouriteSloops.useQuery(
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
      error: "Error: Could Not Fetch User Data",
    };
  }

  if (recentlyPlayedError ?? favouritesError) {
    return {
      data: undefined,
      isLoading: false,
      error: "Error: Could Not Fetch User Data",
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
  const [container, { width }] = useElementSize();
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
      <ScrollArea ref={container}>
        <main style={{ width }} className="flex flex-col gap-2">
          <Marquee label={calcTimeOfDay()}>
            {sessionStatus === "authenticated"
              ? session.user.name ?? session.user.username
              : "Welcome"}
          </Marquee>
          {!!userHome && (
            <>
              <section className="section">
                <h1 className="section-label">Recently Played</h1>
                {userHome.recentlyPlayed.items.length > 0 ? (
                  <Carousel>
                    {userHome.recentlyPlayed.items.map(({ sloop }, index) => (
                      <SloopCard key={index} sloop={sloop} />
                    ))}
                  </Carousel>
                ) : (
                  <NoData />
                )}
              </section>
              <section className="section">
                <h1 className="section-label">Favourites</h1>
                {userHome.favourites.items.length > 0 ? (
                  <Carousel>
                    {userHome.favourites.items.map(({ sloop }, index) => (
                      <SloopCard key={index} sloop={sloop} />
                    ))}
                  </Carousel>
                ) : (
                  <NoData />
                )}
              </section>
            </>
          )}
          <section className="section">
            <h1 className="section-label">Trending Artists</h1>
            {home.trendingArtists.items.length > 0 ? (
              <Carousel>
                {home.trendingArtists.items.map(({ artist }, index) => (
                  <ArtistCard key={index} artist={artist} />
                ))}
              </Carousel>
            ) : (
              <NoData />
            )}
          </section>
          <section className="section">
            <h1 className="section-label">Trending Tracks</h1>
            {home.trendingTracks.items.length > 0 ? (
              <Carousel>
                {home.trendingTracks.items.map(({ track }, index) => (
                  <TrackCard key={index} track={track} />
                ))}
              </Carousel>
            ) : (
              <NoData />
            )}
          </section>
          <section className="section">
            <h1 className="section-label">Trending Sloops</h1>
            {home.trendingSloops.items.length > 0 ? (
              <Carousel>
                {home.trendingSloops.items.map(({ sloop }, index) => (
                  <SloopCard key={index} sloop={sloop} />
                ))}
              </Carousel>
            ) : (
              <NoData />
            )}
          </section>
          <section className="section">
            <h1 className="section-label">Favourite Artists</h1>
            {home.lovedArtists.items.length > 0 ? (
              <Carousel>
                {home.lovedArtists.items.map(({ artist }, index) => (
                  <ArtistCard key={index} artist={artist} />
                ))}
              </Carousel>
            ) : (
              <NoData />
            )}
          </section>
          <section className="section">
            <h1 className="section-label">Favourite Tracks</h1>
            {home.lovedTracks.items.length > 0 ? (
              <Carousel>
                {home.lovedTracks.items.map(({ track }, index) => (
                  <TrackCard key={index} track={track} />
                ))}
              </Carousel>
            ) : (
              <NoData />
            )}
          </section>
          <section className="section">
            <h1 className="section-label">Favourite Sloops</h1>
            {home.lovedSloops.items.length > 0 ? (
              <Carousel>
                {home.lovedSloops.items.map(({ sloop }, index) => (
                  <SloopCard key={index} sloop={sloop} />
                ))}
              </Carousel>
            ) : (
              <NoData />
            )}
          </section>
          <section className="section">
            <h1 className="section-label">Most Recent</h1>
            {home.mostRecent.items.length > 0 ? (
              <Carousel>
                {home.mostRecent.items.map((sloop, index) => (
                  <SloopCard key={index} sloop={sloop} />
                ))}
              </Carousel>
            ) : (
              <NoData />
            )}
          </section>
        </main>
      </ScrollArea>
    </>
  );
};

export default Home;
