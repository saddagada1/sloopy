import { useQuery } from "@tanstack/react-query";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useSpotifyContext } from "~/contexts/Spotify";
import Loading from "~/components/utils/loading";
import Carousel from "~/components/carousel";
import { useElementSize } from "usehooks-ts";
import ErrorView from "~/components/utils/ErrorView";
import NoData from "~/components/noData";
import AlbumCard from "~/components/albumCard";
import ArtistCard from "~/components/artistCard";
import TrackCard from "~/components/trackCard";
import { ScrollArea } from "~/components/ui/scroll-area";
import { calcTimeOfDay } from "~/utils/calc";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import Marquee from "~/components/marquee";

const useLibrary = () => {
  const spotify = useSpotifyContext();
  const {
    data: recentlyPlayed,
    isLoading: fetchingRecentlyPlayed,
    error: recentlyPlayedError,
  } = useQuery(
    ["recentlyPlayed"],
    async () => {
      const response = await spotify.fetchRecentlyPlayedTracks();
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
    fetchingRecentlyPlayed ||
    fetchingTopArtists ||
    fetchingTopTracks ||
    fetchingNewReleases
  ) {
    return { data: undefined, isLoading: true, error: undefined };
  }

  if (!recentlyPlayed || !topArtists || !topTracks || !newReleases) {
    return {
      data: undefined,
      isLoading: false,
      error: "Error: Could Not Fetch Library Data",
    };
  }

  if (
    recentlyPlayedError ||
    topArtistsError ||
    topTracksError ||
    newReleasesError
  ) {
    return {
      data: undefined,
      isLoading: false,
      error: "Error: Could Not Fetch Library Data",
    };
  }

  return {
    data: {
      recentlyPlayed: recentlyPlayed.items
        .filter(
          (dup, index) =>
            index <=
            recentlyPlayed.items.findIndex(
              (original) => original.track.id === dup.track.id
            )
        )
        .map((item) => item.track),
      topArtists,
      topTracks,
      newReleases,
    },
    isLoading: false,
    error: undefined,
  };
};

const Library: NextPage = () => {
  const { data: session, status: sessionStatus } = useSession();
  const [container, { width }] = useElementSize();
  const {
    data: library,
    isLoading: fetchingLibrary,
    error: libraryError,
  } = useLibrary();

  if (fetchingLibrary) {
    return <Loading />;
  }

  if (!library || libraryError) {
    return <ErrorView />;
  }

  return (
    <>
      <Head>
        <title>Sloopy - Library</title>
      </Head>
      <ScrollArea ref={container}>
        <main style={{ width }} className="flex flex-col gap-2">
          <section className="flex flex-col gap-2 lg:flex-row">
            <Marquee
              className="flex flex-1 flex-col overflow-hidden"
              label={calcTimeOfDay()}
            >
              {sessionStatus === "authenticated"
                ? session.user.name ?? session.user.username
                : "Welcome"}
            </Marquee>
            <div className="section mono flex gap-2 bg-muted lg:flex-col">
              <Button asChild variant="outline" className="flex-1">
                <Link href="/saved/tracks">
                  <span className="hidden lg:inline-block">Saved&nbsp;</span>
                  Tracks
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-fit flex-1 text-center"
              >
                <Link href="/saved/albums">
                  <span className="hidden lg:inline-block">Saved&nbsp;</span>
                  Albums
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-fit flex-1 text-center"
              >
                <Link href="/saved/playlists">
                  <span className="hidden lg:inline-block">Saved&nbsp;</span>
                  Playlists
                </Link>
              </Button>
            </div>
          </section>
          <section className="section">
            <h1 className="section-label">Recently Played</h1>
            {library.recentlyPlayed.length > 0 ? (
              <Carousel>
                {library.recentlyPlayed.map((track, index) => (
                  <TrackCard key={index} track={track} />
                ))}
              </Carousel>
            ) : (
              <NoData />
            )}
          </section>
          <section className="section">
            <h1 className="section-label">Top Artists</h1>
            {library.topArtists.items.length > 0 ? (
              <Carousel>
                {library.topArtists.items.map((artist, index) => (
                  <ArtistCard key={index} artist={artist} />
                ))}
              </Carousel>
            ) : (
              <NoData />
            )}
          </section>
          <section className="section">
            <h1 className="section-label">Top Tracks</h1>
            {library.topTracks.items.length > 0 ? (
              <Carousel>
                {library.topTracks.items.map((track, index) => (
                  <TrackCard key={index} track={track} />
                ))}
              </Carousel>
            ) : (
              <NoData />
            )}
          </section>
          <section className="section">
            <h1 className="section-label">New Releases</h1>
            {library.newReleases.albums.items.length > 0 ? (
              <Carousel>
                {library.newReleases.albums.items.map((album, index) => (
                  <AlbumCard key={index} album={album} />
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

export default Library;
