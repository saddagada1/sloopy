import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useElementSize } from "usehooks-ts";
import Carousel from "~/components/carousel";
import NoData from "~/components/noData";
import SloopCard from "~/components/sloopCard";
import TrackCard from "~/components/trackCard";
import ErrorView from "~/components/utils/errorView";
import Loading from "~/components/utils/loading";
import { api } from "~/utils/api";
import { paginationLimit } from "~/utils/constants";
import { ScrollArea } from "~/components/ui/scroll-area";
import { useSpotifyContext } from "~/contexts/spotify";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useState } from "react";
import AlbumCard from "~/components/albumCard";
import ArtistCard from "~/components/artistCard";
import ImageSection from "~/components/imageSection";
import SpotifyButton from "~/components/spotifyButton";
import Marquee from "~/components/marquee";

const useSpotifyArtist = (enabled: boolean) => {
  const spotify = useSpotifyContext();
  const router = useRouter();
  const {
    data: albums,
    isLoading: fetchingAlbums,
    error: albumsError,
  } = useQuery(
    ["artistAlbums", router.query.id],
    async () => {
      const id = router.query.id;
      if (typeof id !== "string") {
        throw new Error("404");
      }
      const response = await spotify.fetchArtistAlbums(id);
      if (!response?.ok) {
        throw new Error(
          response?.message ?? "Error: Could Not Fetch Spotify Data"
        );
      }
      return response.data.items;
    },
    {
      enabled: !!spotify.auth && enabled,
    }
  );
  const {
    data: tracks,
    isLoading: fetchingTracks,
    error: tracksError,
  } = useQuery(
    ["artistTopTracks", router.query.id],
    async () => {
      const id = router.query.id;
      if (typeof id !== "string") {
        throw new Error("404");
      }
      const response = await spotify.fetchArtistTopTracks(id);
      if (!response?.ok) {
        throw new Error(
          response?.message ?? "Error: Could Not Fetch Spotify Data"
        );
      }
      return response.data.tracks;
    },
    {
      enabled: !!spotify.auth && enabled,
    }
  );
  const {
    data: related,
    isLoading: fetchingRelated,
    error: relatedError,
  } = useQuery(
    ["artistRelatedArtists", router.query.id],
    async () => {
      const id = router.query.id;
      if (typeof id !== "string") {
        throw new Error("404");
      }
      const response = await spotify.fetchRelatedArtists(id);
      if (!response?.ok) {
        throw new Error(
          response?.message ?? "Error: Could Not Fetch Spotify Data"
        );
      }
      return response.data.artists;
    },
    {
      enabled: !!spotify.auth && enabled,
    }
  );

  if (fetchingTracks || fetchingAlbums || fetchingRelated) {
    return { data: undefined, isLoading: true, error: undefined };
  }

  if (!tracks || !albums || !related) {
    return {
      data: undefined,
      isLoading: false,
      error: "Error: Could Not Fetch Library Data",
    };
  }

  if (tracksError || albumsError || relatedError) {
    return {
      data: undefined,
      isLoading: false,
      error: "Error: Could Not Fetch Library Data",
    };
  }

  return {
    data: { tracks, albums, related },
    isLoading: false,
    error: undefined,
  };
};

const useSloopyArtist = (enabled: boolean) => {
  const router = useRouter();
  const {
    data: trendingSloops,
    isLoading: fetchingTrendingSloops,
    error: trendingSloopsError,
  } = api.artists.getArtistTrendingSloops.useQuery(
    {
      id: router.query.id as string,
      limit: paginationLimit,
    },
    { enabled: typeof router.query.id === "string" && enabled }
  );
  const {
    data: trendingTracks,
    isLoading: fetchingTrendingTracks,
    error: trendingTracksError,
  } = api.artists.getArtistTrendingTracks.useQuery(
    {
      id: router.query.id as string,
      limit: paginationLimit,
    },
    { enabled: typeof router.query.id === "string" && enabled }
  );
  const {
    data: lovedSloops,
    isLoading: fetchingLovedSloops,
    error: lovedSloopsError,
  } = api.artists.getArtistLovedSloops.useQuery(
    {
      id: router.query.id as string,
      limit: paginationLimit,
    },
    { enabled: typeof router.query.id === "string" && enabled }
  );
  const {
    data: lovedTracks,
    isLoading: fetchingLovedTracks,
    error: lovedTracksError,
  } = api.artists.getArtistLovedTracks.useQuery(
    {
      id: router.query.id as string,
      limit: paginationLimit,
    },
    { enabled: typeof router.query.id === "string" && enabled }
  );
  const {
    data: mostRecent,
    isLoading: fetchingMostRecent,
    error: mostRecentError,
  } = api.artists.getArtistMostRecent.useQuery(
    {
      id: router.query.id as string,
      limit: paginationLimit,
    },
    { enabled: typeof router.query.id === "string" && enabled }
  );

  if (
    fetchingTrendingTracks ||
    fetchingTrendingSloops ||
    fetchingLovedTracks ||
    fetchingLovedSloops ||
    fetchingMostRecent
  ) {
    return { data: undefined, isLoading: true, error: undefined };
  }

  if (
    !trendingTracks ||
    !trendingSloops ||
    !lovedTracks ||
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
    trendingTracksError ??
    trendingSloopsError ??
    lovedTracksError ??
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
      trendingTracks: {
        ...trendingTracks,
        items: trendingTracks.items.map((t) => t.track),
      },
      trendingSloops: {
        ...trendingSloops,
        items: trendingSloops.items.map((s) => s.sloop),
      },
      lovedTracks: {
        ...lovedTracks,
        items: lovedTracks.items.map((t) => t.track),
      },
      lovedSloops: {
        ...lovedSloops,
        items: lovedSloops.items.map((s) => s.sloop),
      },
      mostRecent,
    },
    isLoading: false,
    error: undefined,
  };
};

const Artist: NextPage = ({}) => {
  const router = useRouter();
  const [tab, setTab] = useState(
    router.query.tab && typeof router.query.tab === "string"
      ? router.query.tab
      : "sloopy"
  );
  const [container, { width }] = useElementSize();
  const spotify = useSpotifyContext();
  const {
    data: artist,
    isLoading: fetchingArtist,
    error: artistError,
  } = useQuery(
    ["artist", router.query.id],
    async () => {
      const id = router.query.id;
      if (typeof id !== "string") {
        throw new Error("404");
      }
      const response = await spotify.fetchArtist(id);
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
    data: spotifyArtist,
    isLoading: fetchingSpotifyArtist,
    error: spotifyArtistError,
  } = useSpotifyArtist(tab === "spotify");
  const {
    data: sloopyArtist,
    isLoading: fetchingSloopyArtist,
    error: sloopyArtistError,
  } = useSloopyArtist(tab === "sloopy");

  if (fetchingArtist) {
    return <Loading />;
  }

  if ((!artist || artistError) ?? spotifyArtistError ?? sloopyArtistError) {
    return <ErrorView />;
  }

  return (
    <>
      <Head>
        <title>Sloopy - {artist.name}</title>
      </Head>
      <main className="flex flex-1 flex-col gap-2 overflow-scroll lg:grid lg:grid-cols-5 lg:grid-rows-5 lg:overflow-hidden">
        <Marquee className="lg:col-span-4" label="Artist">
          {artist.name}
        </Marquee>
        <div className="flex flex-col gap-2 lg:row-span-5">
          <ImageSection url={artist.images[0]?.url} alt={artist.name} />
          <SpotifyButton uri={artist.uri} />
          <Tabs
            className="w-full"
            onValueChange={(value) => setTab(value)}
            defaultValue="sloopy"
          >
            <TabsList className="gap-2">
              <TabsTrigger value="sloopy">Sloopy</TabsTrigger>
              <TabsTrigger value="spotify">Spotify</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="section filler hidden flex-1 lg:block" />
        </div>
        {(tab === "spotify" && fetchingSpotifyArtist) ||
        (tab === "sloopy" && fetchingSloopyArtist) ? (
          <Loading className="lg:col-span-4 lg:row-span-4" />
        ) : (
          <ScrollArea
            ref={container}
            className="overflow-visible lg:col-span-4 lg:row-span-4 lg:overflow-auto"
          >
            <div style={{ width }} className="flex flex-col gap-2">
              {tab === "sloopy" ? (
                !sloopyArtist ? (
                  <NoData />
                ) : (
                  <>
                    <section className="section">
                      <h1 className="section-label">Trending Sloops</h1>
                      {sloopyArtist.trendingSloops.items.length > 0 ? (
                        <Carousel>
                          {sloopyArtist.trendingSloops.items.map(
                            (sloop, index) => (
                              <SloopCard key={index} sloop={sloop} />
                            )
                          )}
                        </Carousel>
                      ) : (
                        <NoData />
                      )}
                    </section>
                    <section className="section">
                      <h1 className="section-label">Trending Tracks</h1>
                      {sloopyArtist.trendingTracks.items.length > 0 ? (
                        <Carousel>
                          {sloopyArtist.trendingTracks.items.map(
                            (track, index) => (
                              <TrackCard key={index} track={track} />
                            )
                          )}
                        </Carousel>
                      ) : (
                        <NoData />
                      )}
                    </section>
                    <section className="section">
                      <h1 className="section-label">Favourite Sloops</h1>
                      {sloopyArtist.lovedSloops.items.length > 0 ? (
                        <Carousel>
                          {sloopyArtist.lovedSloops.items.map(
                            (sloop, index) => (
                              <SloopCard key={index} sloop={sloop} />
                            )
                          )}
                        </Carousel>
                      ) : (
                        <NoData />
                      )}
                    </section>
                    <section className="section">
                      <h1 className="section-label">Favourite Tracks</h1>
                      {sloopyArtist.lovedTracks.items.length > 0 ? (
                        <Carousel>
                          {sloopyArtist.lovedTracks.items.map(
                            (track, index) => (
                              <TrackCard key={index} track={track} />
                            )
                          )}
                        </Carousel>
                      ) : (
                        <NoData />
                      )}
                    </section>
                    <section className="section">
                      <h1 className="section-label">Most Recent Sloops</h1>
                      {sloopyArtist.lovedSloops.items.length > 0 ? (
                        <Carousel>
                          {sloopyArtist.mostRecent.items.map((sloop, index) => (
                            <SloopCard key={index} sloop={sloop} />
                          ))}
                        </Carousel>
                      ) : (
                        <NoData />
                      )}
                    </section>
                  </>
                )
              ) : !spotifyArtist ? (
                <NoData />
              ) : (
                <>
                  <section className="section">
                    <h1 className="section-label">Top Albums</h1>
                    {spotifyArtist.albums.length > 0 ? (
                      <Carousel>
                        {spotifyArtist.albums.map((album, index) => (
                          <AlbumCard key={index} album={album} />
                        ))}
                      </Carousel>
                    ) : (
                      <NoData />
                    )}
                  </section>
                  <section className="section">
                    <h1 className="section-label">Top Tracks</h1>
                    {spotifyArtist.tracks.length > 0 ? (
                      <Carousel>
                        {spotifyArtist.tracks.map((track, index) => (
                          <TrackCard key={index} track={track} />
                        ))}
                      </Carousel>
                    ) : (
                      <NoData />
                    )}
                  </section>
                  <section className="section">
                    <h1 className="section-label">You May Also Like</h1>
                    {spotifyArtist.related.length > 0 ? (
                      <Carousel>
                        {spotifyArtist.related.map((related, index) => (
                          <ArtistCard key={index} artist={related} />
                        ))}
                      </Carousel>
                    ) : (
                      <NoData>No Artist Results</NoData>
                    )}
                  </section>
                </>
              )}
            </div>
          </ScrollArea>
        )}
      </main>
    </>
  );
};

export default Artist;
