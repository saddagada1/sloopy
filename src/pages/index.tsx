import { type NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import { PiSpotifyLogoFill } from "react-icons/pi";

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
  const { data: sessionData } = useSession();
  return (
    <div className="px-4 pt-6" onClick={() => void signOut()}>
      <h2 className="text-xl text-gray-400">Welcome Back</h2>
      <h1 className="truncate text-5xl font-bold leading-tight">
        {sessionData!.user.name}
      </h1>
      <section className="mt-4 border-t border-secondary"></section>
    </div>
  );
};

const Home: NextPage = () => {
  const { data: sessionData, status: sessionStatus } = useSession();
  return (
    <>
      <Head>
        <title>Sloopy - Spotify</title>
      </Head>
      {sessionStatus === "loading" ? null : sessionData ? (
        <Dashboard />
      ) : (
        <Auth />
      )}
    </>
  );
};

export default Home;
