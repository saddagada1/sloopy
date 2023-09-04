import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { PiHeartFill, PiPencilSimpleLine, PiPlayFill } from "react-icons/pi";
import { useElementSize } from "usehooks-ts";
import { api } from "~/utils/api";
import Loading from "~/components/utils/Loading";
import WithAuth from "~/components/utils/WithAuth";
import SafeImage from "~/components/ui/SafeImage";
import clsx from "clsx";
import Avatar from "boring-avatars";
import { mode, pitchClassColours } from "~/utils/constants";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const Profile: NextPage = ({}) => {
  const { data: session } = useSession();
  const [imageContainerRef, { height, width }] = useElementSize();
  const {
    data: sloops,
    isLoading,
    error,
  } = api.sloops.getUserSloops.useQuery();

  if (isLoading) {
    return <Loading />;
  }

  if (!sloops || error) {
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
          {session?.user.name ?? session?.user.username}
        </h1>
        <div ref={imageContainerRef} className="flex gap-4">
          <SafeImage
            url={session?.user.image}
            alt={`${session?.user.username}'s profile picture`}
            width={height}
            className="relative aspect-square overflow-hidden rounded-full"
          />
          <div className="flex flex-1 flex-col justify-between gap-4">
            <div className="flex border-b border-gray-300 pb-4">
              <div className="flex flex-1 flex-col items-start gap-1 border-r border-gray-300">
                <label className="px-2 font-display text-xs text-gray-400 sm:text-sm">
                  Sloops
                </label>
                <p className="w-full text-center text-sm font-semibold sm:text-base">
                  87
                </p>
              </div>
              <div className="flex flex-1 flex-col items-start gap-1 border-r border-gray-300">
                <label className="px-2 font-display text-xs text-gray-400 sm:text-sm">
                  Followers
                </label>
                <p className="w-full text-center text-sm font-semibold sm:text-base">
                  546
                </p>
              </div>
              <div className="flex flex-1 flex-col items-start gap-1">
                <label className="px-2 font-display text-xs text-gray-400 sm:text-sm">
                  Following
                </label>
                <p className="w-full text-center text-sm font-semibold sm:text-base">
                  657
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
            {sloops.map((sloop, index) => (
              <li
                className={clsx(
                  "flex gap-4 rounded-lg border border-gray-300 bg-gray-200 p-2",
                  index !== sloops.length - 1 &&
                    "mb-2 border-b border-gray-300 pb-2"
                )}
                key={index}
              >
                <div
                  style={{ width: width * 0.25 }}
                  className="relative aspect-square overflow-hidden rounded-md"
                >
                  <Avatar
                    size={width * 0.25}
                    name={sloop.name}
                    variant="marble"
                    square
                    colors={[
                      pitchClassColours[sloop.key]!,
                      mode[sloop.mode] === "Major"
                        ? pitchClassColours[sloop.key - 3 ?? 12 - 3]!
                        : pitchClassColours[sloop.key + 3 ?? -1 + 3]!,
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
                  <div className="flex items-center gap-4">
                    <p className="flex-1 truncate text-sm text-gray-400 sm:text-base">
                      {sloop.userId === session?.user.id
                        ? dayjs(sloop.updatedAt).fromNow()
                        : sloop.userUsername}
                    </p>
                    <Link
                      className="text-2xl sm:text-3xl"
                      href={`/editor/${sloop.id}`}
                    >
                      <PiPencilSimpleLine />
                    </Link>
                    <Link
                      className="text-2xl sm:text-3xl"
                      href={`/player/${sloop.id}`}
                    >
                      <PiPlayFill />
                    </Link>
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
