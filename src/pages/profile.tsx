import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { PiHeartFill } from "react-icons/pi";
import { useElementSize } from "usehooks-ts";
import { api } from "~/utils/api";
import Loading from "~/components/utils/Loading";
import WithAuth from "~/components/utils/WithAuth";
import SafeImage from "~/components/ui/SafeImage";
import { pitchClassColours } from "~/utils/constants";
import ErrorView from "~/components/utils/ErrorView";
import SloopList from "~/components/ui/SloopList";
import { useSession } from "next-auth/react";

const Profile: NextPage = ({}) => {
  const [imageContainerRef, { height }] = useElementSize();
  const { data: session } = useSession();
  const {
    data: user,
    isLoading: fetchingUser,
    error: userError,
  } = api.users.getSessionUser.useQuery();

  if (fetchingUser) {
    return <Loading />;
  }

  if (!user || userError) {
    return <ErrorView />;
  }

  return (
    <>
      <Head>
        <title>Sloopy - Profile</title>
      </Head>
      <div className="flex flex-1 flex-col px-4 pt-6">
        <h2 className="font-display text-xl text-gray-400 sm:text-2xl">
          Profile
        </h2>
        <h1 className="mb-4 truncate border-b border-gray-300 pb-4 text-4xl font-semibold sm:text-5xl">
          {session?.user.name ?? session?.user.username}
        </h1>
        <div ref={imageContainerRef} className="flex gap-4">
          <SafeImage
            url={user.image}
            alt={`${session?.user.username}'s profile picture`}
            width={height}
            className="relative aspect-square overflow-hidden rounded-full"
            colours={Object.keys(pitchClassColours).map(
              (key) => pitchClassColours[parseInt(key)]!
            )}
          />
          <div className="flex flex-1 flex-col justify-between gap-4">
            <div className="flex border-b border-gray-300 pb-4">
              <div className="flex flex-1 flex-col items-start gap-1 border-r border-gray-300">
                <p className="px-2 font-display text-xs text-gray-400 sm:text-sm">
                  Sloops
                </p>
                <p className="w-full text-center text-sm font-semibold sm:text-base">
                  {user.sloops.length.toLocaleString(undefined, {
                    notation: "compact",
                  })}
                </p>
              </div>
              <div className="flex flex-1 flex-col items-start gap-1 border-r border-gray-300">
                <p className="px-2 font-display text-xs text-gray-400 sm:text-sm">
                  Followers
                </p>
                <p className="w-full text-center text-sm font-semibold sm:text-base">
                  {user.followers.length.toLocaleString(undefined, {
                    notation: "compact",
                  })}
                </p>
              </div>
              <div className="flex flex-1 flex-col items-start gap-1">
                <p className="px-2 font-display text-xs text-gray-400 sm:text-sm">
                  Following
                </p>
                <p className="w-full text-center text-sm font-semibold sm:text-base">
                  {user.following.length.toLocaleString(undefined, {
                    notation: "compact",
                  })}
                </p>
              </div>
            </div>
            <div className="flex gap-2 text-center font-display text-base font-semibold sm:text-lg">
              <Link
                href="/settings"
                className="flex-1 rounded-md border border-gray-300 bg-gray-200 px-2 py-2.5"
              >
                Settings
              </Link>
              <Link
                href="/likes"
                className="flex aspect-square h-full items-center justify-center rounded-md border border-gray-300 bg-gray-200 text-2xl sm:text-3xl"
              >
                <PiHeartFill />
              </Link>
            </div>
          </div>
        </div>
        {session?.user.bio !== "" && (
          <div className="mt-4 flex w-full flex-col items-start gap-1 border-t border-gray-300 pt-4">
            <p className="font-display text-xs text-gray-400 sm:text-sm">Bio</p>
            <p className="w-full text-sm font-semibold sm:text-base">
              {session?.user.bio}
            </p>
          </div>
        )}
        <div className="mt-4 flex-1 border-t border-gray-300 pt-4">
          <SloopList sloops={user.sloops} />
        </div>
      </div>
    </>
  );
};
export default WithAuth(Profile);
