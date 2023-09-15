import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { PiHeartFill } from "react-icons/pi";
import { useElementSize } from "usehooks-ts";
import { api } from "~/utils/api";
import Loading from "~/components/utils/Loading";
import WithAuth from "~/components/utils/WithAuth";
import SafeImage from "~/components/ui/SafeImage";
import clsx from "clsx";
import Avatar from "boring-avatars";
import { mode, pitchClassColours } from "~/utils/constants";
import { useRouter } from "next/router";
import { calcRelativeTime } from "~/utils/calc";

const Profile: NextPage = ({}) => {
  const router = useRouter();
  const [imageContainerRef, { height, width }] = useElementSize();
  const {
    data: user,
    isLoading: fetchingUser,
    error: userError,
  } = api.users.getSessionUser.useQuery();

  if (fetchingUser) {
    return <Loading />;
  }

  if (!user || userError) {
    return <div>ERROR</div>;
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
          {user.name ?? user.username}
        </h1>
        <div ref={imageContainerRef} className="flex gap-4">
          <SafeImage
            url={user.image}
            alt={`${user.username}'s profile picture`}
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
        <div className="mt-4 flex-1 border-t border-gray-300 pt-4">
          <ul className="w-full">
            {user.sloops.map((sloop, index) => (
              <li
                className={clsx(
                  "flex cursor-pointer gap-4 rounded-lg border border-gray-300 bg-gray-200 p-2",
                  index !== user.sloops.length - 1 &&
                    "mb-2 border-b border-gray-300 pb-2"
                )}
                key={index}
                onClick={() => void router.push(`/sloop/${sloop.id}`)}
              >
                <div
                  style={{ width: width * 0.25 }}
                  className="aspect-square overflow-hidden rounded-md"
                >
                  <Avatar
                    size={width * 0.25}
                    name={sloop.name}
                    variant="marble"
                    square
                    colors={[
                      pitchClassColours[sloop.key]!,
                      mode[sloop.mode] === "Major"
                        ? pitchClassColours[sloop.key - 3]! ??
                          pitchClassColours[12 - 3]!
                        : pitchClassColours[sloop.key + 3]! ??
                          pitchClassColours[-1 + 3]!,
                    ]}
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between overflow-hidden">
                  <div>
                    <h3 className="truncate font-display text-lg font-semibold sm:text-xl">
                      {sloop.name}
                    </h3>
                    <p className="truncate text-sm text-gray-400 sm:text-base">
                      {(sloop.artists as string[]).map((artist, index) =>
                        index === (sloop.artists as string[]).length - 1
                          ? artist
                          : `${artist}, `
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400 sm:text-base">
                    <p className="flex-1 truncate">
                      {sloop.userId === user.id
                        ? calcRelativeTime(sloop.updatedAt)
                        : sloop.userUsername}
                    </p>
                    <p className="flex items-center gap-2">
                      {(2312).toLocaleString(undefined, {
                        notation: "compact",
                      })}
                      <PiHeartFill className="text-xl sm:text-2xl" />
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};
export default WithAuth(Profile);
