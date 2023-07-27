import { useQuery } from "@tanstack/react-query";
import { type NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import { PiSpotifyLogoFill } from "react-icons/pi";
import { useSpotifyContext } from "~/contexts/Spotify";

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
  const { data: session } = useSession();
  const spotify = useSpotifyContext();
  const {
    data: featuredPlaylists,
    isLoading: fetchingFeaturedPlaylists,
    error: featuredPlaylistsError,
  } = useQuery(
    ["featuredPlaylists"],
    async () => {
      const response = await spotify?.fetchFeaturedPlaylists();
      if (!response?.ok) {
        throw new Error(response?.message);
      }
      return response;
    },
    {
      enabled: !!spotify?.auth,
    }
  );
  const {
    data: recentlyPlayed,
    isLoading: fetchingRecentlyPlayed,
    error: recentlyPlayedError,
  } = useQuery(
    ["recentlyPlayed"],
    async () => {
      const response = await spotify?.fetchRecentlyPlayedTracks();
      if (!response?.ok) {
        throw new Error(response?.message);
      }
      return response;
    },
    {
      enabled: !!spotify?.auth,
    }
  );

  return (
    <div className="px-4 pt-6" onClick={() => void signOut()}>
      <h2 className="ml-1 font-display text-xl text-gray-400">good morning</h2>
      <h1 className="mb-4 truncate border-b border-gray-300 pb-2 text-4xl font-bold">
        {session?.user.name}
      </h1>
      <section className="mb-4 border-b border-gray-300 pb-20 ">
        {featuredPlaylists?.data.playlists.items.map((playlist) => (
          <div
            className="relative overflow-hidden rounded-md"
            key={playlist.id}
          >
            {playlist.name}
            <Image
              src={playlist.images[0]!.url}
              alt={playlist.name}
              fill
              className="object-cover"
            />
          </div>
        ))}
      </section>
      <section className="mb-4 border-b border-gray-300 pb-2 ">
        {recentlyPlayed?.data.items.map((item) => (
          <div key={item.track.id}>{item.track.name}</div>
        ))}
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
