import { type Track } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { PiSpotifyLogo } from "react-icons/pi";
import {
  type Album as SpotifyAlbum,
  type Track as SpotifyTrack,
  type Artist as SpotifyArtist,
} from "spotify-types";
import { useElementSize } from "usehooks-ts";
import AlbumCard from "~/components/ui/AlbumCard";
import ArtistCard from "~/components/ui/ArtistCard";
import Carousel from "~/components/ui/Carousel";
import NoData from "~/components/ui/NoData";
import SafeImage from "~/components/ui/SafeImage";
import SloopCard from "~/components/ui/SloopCard";
import SloopList from "~/components/ui/SloopList";
import TrackCard from "~/components/ui/TrackCard";
import TrackList from "~/components/ui/TrackList";
import ErrorView from "~/components/utils/ErrorView";
import Loading from "~/components/utils/Loading";
import { useSpotifyContext } from "~/contexts/Spotify";
import { api } from "~/utils/api";
import { paginationLimit, pitchClassColours } from "~/utils/constants";
import { type ListSloop, type Paging } from "~/utils/types";

const useSpotifyArtist = () => {
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
      enabled: !!spotify.auth,
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
      enabled: !!spotify.auth,
    }
  );
  const {
    data: related,
    isLoading: fetchingRelated,
    error: relatedError,
  } = useQuery(
    ["artistTopTracks", router.query.id],
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
      enabled: !!spotify.auth,
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

const useSloopyArtist = () => {
  const router = useRouter();
  const {
    data: trendingSloops,
    isLoading: fetchingTrendingSloops,
    error: trendingSloopsError,
  } = api.sloops.getArtistTrendingSloops.useQuery({
    id: router.query.id as string,
    limit: paginationLimit,
  });
  const {
    data: trendingTracks,
    isLoading: fetchingTrendingTracks,
    error: trendingTracksError,
  } = api.sloops.getArtistTrendingTracks.useQuery({
    id: router.query.id as string,
    limit: paginationLimit,
  });
  const {
    data: lovedSloops,
    isLoading: fetchingLovedSloops,
    error: lovedSloopsError,
  } = api.sloops.getArtistLovedSloops.useQuery({
    id: router.query.id as string,
    limit: paginationLimit,
  });
  const {
    data: lovedTracks,
    isLoading: fetchingLovedTracks,
    error: lovedTracksError,
  } = api.sloops.getArtistLovedTracks.useQuery({
    id: router.query.id as string,
    limit: paginationLimit,
  });
  const {
    data: mostRecent,
    isLoading: fetchingMostRecent,
    error: mostRecentError,
  } = api.sloops.getArtistMostRecent.useQuery({
    id: router.query.id as string,
    limit: paginationLimit,
  });

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

interface SpotifyArtistProps {
  artist: {
    tracks: SpotifyTrack[];
    albums: SpotifyAlbum[];
    related: SpotifyArtist[];
  };
  width: number;
}

const SpotifyArtist: React.FC<SpotifyArtistProps> = ({ artist, width }) => {
  return (
    <>
      <section>
        <h3 className="mb-4 flex items-end justify-between font-display text-xl font-semibold sm:text-2xl">
          Top Albums
          <p className="text-base text-gray-400 sm:text-lg">
            {artist.albums.length}
          </p>
        </h3>
        {artist.albums.length > 0 ? (
          <Carousel>
            {artist.albums.map((album, index) => (
              <AlbumCard key={index} album={album} width={width} />
            ))}
          </Carousel>
        ) : (
          <NoData>No Album Results</NoData>
        )}
      </section>
      <section>
        <h3 className="mb-4 flex items-end justify-between font-display text-xl font-semibold sm:text-2xl">
          Top Tracks
          <p className="text-base text-gray-400 sm:text-lg">
            {artist.tracks.length}
          </p>
        </h3>
        {artist.tracks.length > 0 ? (
          <TrackList tracks={artist.tracks} />
        ) : (
          <NoData>No Track Results</NoData>
        )}
      </section>
      <section>
        <h3 className="mb-4 flex items-end justify-between font-display text-xl font-semibold sm:text-2xl">
          You May Also Like
          <p className="text-base text-gray-400 sm:text-lg">
            {artist.related.length}
          </p>
        </h3>
        {artist.related.length > 0 ? (
          <Carousel>
            {artist.related.map((related, index) => (
              <ArtistCard key={index} artist={related} width={width} />
            ))}
          </Carousel>
        ) : (
          <NoData>No Artist Results</NoData>
        )}
      </section>
    </>
  );
};

interface SloopyArtistProps {
  artist: {
    trendingSloops: Paging<ListSloop>;
    trendingTracks: Paging<Track>;
    lovedSloops: Paging<ListSloop>;
    lovedTracks: Paging<Track>;
    mostRecent: Paging<ListSloop>;
  };
  width: number;
}

const SloopyArtist: React.FC<SloopyArtistProps> = ({ artist, width }) => {
  return (
    <>
      <section>
        <h3 className="mb-4 flex items-end justify-between font-display text-xl font-semibold sm:text-2xl">
          Trending Sloops
          <p className="text-base text-gray-400 sm:text-lg">
            {artist.trendingSloops.items.length}
          </p>
        </h3>
        {artist.trendingSloops.items.length > 0 ? (
          <Carousel>
            {artist.trendingSloops.items.map((sloop, index) => (
              <SloopCard key={index} sloop={sloop} width={width} />
            ))}
          </Carousel>
        ) : (
          <NoData>No Trending Sloops</NoData>
        )}
      </section>
      <section>
        <h3 className="mb-4 flex items-end justify-between font-display text-xl font-semibold sm:text-2xl">
          Trending Tracks
          <p className="text-base text-gray-400 sm:text-lg">
            {artist.trendingTracks.items.length}
          </p>
        </h3>
        {artist.trendingTracks.items.length > 0 ? (
          <Carousel>
            {artist.trendingTracks.items.map((track, index) => (
              <TrackCard key={index} track={track} width={width} />
            ))}
          </Carousel>
        ) : (
          <NoData>No Trending Tracks</NoData>
        )}
      </section>
      <section>
        <h3 className="mb-4 flex items-end justify-between font-display text-xl font-semibold sm:text-2xl">
          Loved Sloops
          <p className="text-base text-gray-400 sm:text-lg">
            {artist.lovedSloops.items.length}
          </p>
        </h3>
        {artist.lovedSloops.items.length > 0 ? (
          <Carousel>
            {artist.lovedSloops.items.map((sloop, index) => (
              <SloopCard key={index} sloop={sloop} width={width} />
            ))}
          </Carousel>
        ) : (
          <NoData>No Loved Sloops</NoData>
        )}
      </section>
      <section>
        <h3 className="mb-4 flex items-end justify-between font-display text-xl font-semibold sm:text-2xl">
          Loved Tracks
          <p className="text-base text-gray-400 sm:text-lg">
            {artist.lovedTracks.items.length}
          </p>
        </h3>
        {artist.lovedTracks.items.length > 0 ? (
          <Carousel>
            {artist.lovedTracks.items.map((track, index) => (
              <TrackCard key={index} track={track} width={width} />
            ))}
          </Carousel>
        ) : (
          <NoData>No Loved Tracks</NoData>
        )}
      </section>
      <section>
        <h3 className="mb-4 flex items-end justify-between font-display text-xl font-semibold sm:text-2xl">
          Most Recent
          <p className="text-base text-gray-400 sm:text-lg">
            {artist.mostRecent.items.length}
          </p>
        </h3>
        {artist.mostRecent.items.length > 0 ? (
          <SloopList sloops={artist.mostRecent.items} />
        ) : (
          <NoData>No Recent Sloops</NoData>
        )}
      </section>
    </>
  );
};

const Artist: NextPage = ({}) => {
  const router = useRouter();
  const spotify = useSpotifyContext();
  const [containerRef, { width }] = useElementSize();
  const [imageContainerRef, { height }] = useElementSize();
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
  } = useSpotifyArtist();
  const {
    data: sloopyArtist,
    isLoading: fetchingSloopyArtist,
    error: sloopyArtistError,
  } = useSloopyArtist();

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
      <div className="flex flex-1 flex-col px-4 py-6">
        <h2 className="font-display text-xl text-gray-400 sm:text-2xl">
          Artist
        </h2>
        <h1 className="mb-4 truncate border-b border-gray-300 pb-4 text-4xl font-semibold sm:text-5xl">
          {artist.name}
        </h1>
        <div ref={imageContainerRef} className="flex gap-4">
          <SafeImage
            url={artist.images[0]?.url}
            alt={artist.name}
            width={height}
            className="relative aspect-square overflow-hidden rounded-full"
            colours={Object.keys(pitchClassColours).map(
              (key) => pitchClassColours[parseInt(key)]!
            )}
          />
          <div className="flex flex-1 flex-col justify-between gap-4">
            <div className="flex border-b border-gray-300 pb-4">
              <div className="flex basis-3/5 flex-col items-start gap-1 border-r border-gray-300">
                <label className="px-2 font-display text-xs text-gray-400 sm:text-sm">
                  Followers
                </label>
                <p className="w-full text-center text-sm font-semibold sm:text-base">
                  {artist.followers.total.toLocaleString()}
                </p>
              </div>
              <div className="flex flex-1 flex-col items-center gap-1">
                <label className="px-2 font-display text-xs text-gray-400 sm:text-sm">
                  Popularity
                </label>
                <p className="ml-4 w-full text-center text-sm font-semibold sm:text-base">
                  {`${artist.popularity}%`}
                </p>
              </div>
            </div>
            <Link
              href={artist.uri}
              className="flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-gray-200 px-2 py-2.5 font-display text-base font-semibold sm:text-lg"
            >
              <PiSpotifyLogo className="text-2xl sm:text-3xl" />
              Listen On Spotify
            </Link>
          </div>
        </div>
        <div className="my-4 flex gap-2 border-t border-gray-300 pt-4 text-center font-display text-base font-semibold sm:text-lg">
          <button
            onClick={() =>
              void router.replace(
                `/artist/${router.query.id as string}?tab=sloopy`,
                undefined,
                { shallow: true }
              )
            }
            className={clsx(
              "flex-1 rounded-md px-2 py-2.5",
              router.query.tab === "sloopy"
                ? "bg-secondary text-primary"
                : "border border-gray-300 bg-gray-200"
            )}
          >
            Sloopy
          </button>
          <button
            onClick={() =>
              void router.replace(
                `/artist/${router.query.id as string}?tab=spotify`,
                undefined,
                { shallow: true }
              )
            }
            className={clsx(
              "flex-1 rounded-md px-2 py-2.5",
              router.query.tab === "spotify"
                ? "bg-secondary text-primary"
                : "border border-gray-300 bg-gray-200"
            )}
          >
            Spotify
          </button>
        </div>
        <div ref={containerRef} className="flex flex-1 flex-col gap-6">
          {router.query.tab === "sloopy" ? (
            fetchingSloopyArtist ? (
              <Loading />
            ) : sloopyArtist ? (
              <SloopyArtist artist={sloopyArtist} width={width} />
            ) : (
              <NoData>Unable To Get Artist. Please Refresh.</NoData>
            )
          ) : router.query.tab === "spotify" ? (
            fetchingSpotifyArtist ? (
              <Loading />
            ) : spotifyArtist ? (
              <SpotifyArtist artist={spotifyArtist} width={width} />
            ) : (
              <NoData>Unable To Get Artist. Please Refresh.</NoData>
            )
          ) : (
            <ErrorView />
          )}
        </div>
      </div>
    </>
  );
};

export default Artist;
