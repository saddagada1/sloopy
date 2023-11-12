import { useQuery } from "@tanstack/react-query";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useElementSize } from "usehooks-ts";
import Carousel from "~/components/carousel";
import ErrorView from "~/components/utils/ErrorView";
import Loading from "~/components/utils/loading";
import { useSpotifyContext } from "~/contexts/Spotify";
import { type Search as SpotifySearch } from "~/contexts/Spotify";
import { api } from "~/utils/api";
import { type ListSloop } from "~/utils/types";
import { type Track, type Artist } from "@prisma/client";
import NoData from "~/components/noData";
import AlbumCard from "~/components/albumCard";
import PlaylistCard from "~/components/playlistCard";
import ArtistCard from "~/components/artistCard";
import UserCard from "~/components/userCard";
import TrackCard from "~/components/trackCard";
import { useMemo, useState } from "react";
import Marquee from "~/components/marquee";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import SloopCard from "~/components/sloopCard";

interface SpotifyResultsProps {
  results?: SpotifySearch;
}

const SpotifyResults: React.FC<SpotifyResultsProps> = ({ results }) => {
  if (!results) return <NoData />;
  return (
    <>
      {results.artists && (
        <section className="section">
          <h1 className="section-label">Artists</h1>
          {results.artists.items.length > 0 ? (
            <Carousel>
              {results.artists.items.map((artist, index) => (
                <ArtistCard key={index} artist={artist} />
              ))}
            </Carousel>
          ) : (
            <NoData />
          )}
        </section>
      )}
      {results.albums && (
        <section className="section">
          <h1 className="section-label">Albums</h1>
          {results.albums.items.length > 0 ? (
            <Carousel>
              {results.albums.items.map((album, index) => (
                <AlbumCard key={index} album={album} />
              ))}
            </Carousel>
          ) : (
            <NoData />
          )}
        </section>
      )}
      {results.playlists && (
        <section className="section">
          <h1 className="section-label">Playlists</h1>
          {results.playlists.items.length > 0 ? (
            <Carousel>
              {results.playlists.items.map((playlist, index) => (
                <PlaylistCard key={index} playlist={playlist} />
              ))}
            </Carousel>
          ) : (
            <NoData />
          )}
        </section>
      )}
      {results.tracks && (
        <section className="section">
          <h1 className="section-label">Tracks</h1>
          {results.tracks.items.length > 0 ? (
            <Carousel>
              {results.tracks.items.map((track, index) => (
                <TrackCard key={index} track={track} />
              ))}
            </Carousel>
          ) : (
            <NoData />
          )}
        </section>
      )}
    </>
  );
};

interface SloopyResultsProps {
  results?: {
    users: { username: string; image: string | null }[];
    tracks: Track[];
    artists: Artist[];
    sloops: ListSloop[];
  };
}

const SloopyResults: React.FC<SloopyResultsProps> = ({ results }) => {
  const sloops = useMemo(() => {
    if (!results) return [];
    return results.sloops.filter(
      (dup, index) =>
        index <= results.sloops.findIndex((original) => original.id === dup.id)
    );
  }, [results]);

  if (!results) return <NoData />;
  return (
    <>
      <section className="section">
        <h1 className="section-label">Users</h1>
        {results.users.length > 0 ? (
          <Carousel>
            {results.users.map((user, index) => (
              <UserCard key={index} user={user} />
            ))}
          </Carousel>
        ) : (
          <NoData />
        )}
      </section>
      <section className="section">
        <h1 className="section-label">Artists</h1>
        {results.artists.length > 0 ? (
          <Carousel>
            {results.artists.map((artist, index) => (
              <ArtistCard key={index} artist={artist} />
            ))}
          </Carousel>
        ) : (
          <NoData />
        )}
      </section>
      <section className="section">
        <h1 className="section-label">Tracks</h1>
        {results.tracks.length > 0 ? (
          <Carousel>
            {results.tracks.map((track, index) => (
              <TrackCard key={index} track={track} />
            ))}
          </Carousel>
        ) : (
          <NoData />
        )}
      </section>
      <section className="section">
        <h1 className="section-label">Sloops</h1>
        {sloops?.length > 0 ? (
          <Carousel>
            {sloops?.map((sloop, index) => (
              <SloopCard key={index} sloop={sloop} />
            ))}
          </Carousel>
        ) : (
          <NoData />
        )}
      </section>
    </>
  );
};

const Search: NextPage = ({}) => {
  const router = useRouter();
  const [tab, setTab] = useState(
    router.query.tab && typeof router.query.tab === "string"
      ? router.query.tab
      : "sloopy"
  );
  const spotify = useSpotifyContext();
  const [container, { width }] = useElementSize();
  const {
    data: spotifySearch,
    isLoading: fetchingSpotifySearch,
    error: spotifySearchError,
  } = useQuery(
    ["spotify-search", router.query.q],
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
      enabled: !!spotify.auth && tab === "spotify",
    }
  );

  const {
    data: sloopySearch,
    isLoading: fetchingSloopySearch,
    error: sloopySearchError,
  } = api.search.all.useQuery(
    { query: router.query.q as string },
    {
      enabled: typeof router.query.q === "string" && tab === "sloopy",
    }
  );

  if (spotifySearchError ?? sloopySearchError) {
    return <ErrorView />;
  }

  return (
    <>
      <Head>
        <title>Sloopy - Search</title>
      </Head>
      <main className="flex flex-1 flex-col gap-2 overflow-hidden">
        <section className="flex flex-col gap-2 lg:flex-row">
          <Marquee
            className="flex flex-1 flex-col overflow-hidden"
            label="Search"
          >
            {tab}
          </Marquee>
          <Tabs
            className="w-full lg:w-auto"
            onValueChange={(value) => setTab(value)}
            defaultValue="sloopy"
          >
            <TabsList className="h-full gap-2 lg:flex-col">
              <TabsTrigger value="sloopy">Sloopy</TabsTrigger>
              <TabsTrigger value="spotify">Spotify</TabsTrigger>
            </TabsList>
          </Tabs>
        </section>
        {(tab === "sloopy" && fetchingSloopySearch) ||
        (tab === "spotify" && fetchingSpotifySearch) ? (
          <Loading />
        ) : (
          <ScrollArea ref={container}>
            <div style={{ width }} className="flex flex-col gap-2">
              {tab === "spotify" ? (
                <SpotifyResults results={spotifySearch?.data} />
              ) : (
                <SloopyResults results={sloopySearch} />
              )}
            </div>
          </ScrollArea>
        )}
      </main>
    </>
  );
};

export default Search;
