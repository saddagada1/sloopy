import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { PiHeartFill } from "react-icons/pi";
import { useElementSize } from "usehooks-ts";
import { api } from "~/utils/api";
import Loading from "~/components/utils/Loading";
import SafeImage from "~/components/ui/SafeImage";
import clsx from "clsx";
import Avatar from "boring-avatars";
import { mode, pitchClassColours } from "~/utils/constants";
import { useRouter } from "next/router";
import { calcRelativeTime } from "~/utils/calc";
import toast from "react-hot-toast";
import { TRPCClientError } from "@trpc/client";
import { useQueryClient } from "@tanstack/react-query";
import LoadingButton from "~/components/ui/LoadingButton";
import ErrorView from "~/components/utils/ErrorView";

const User: NextPage = ({}) => {
  const router = useRouter();
  const { data: session } = useSession();
  if (router.query.username === session?.user.username) {
    void router.push("/profile");
  }
  const [imageContainerRef, { height, width }] = useElementSize();
  const ctx = useQueryClient();
  const {
    data: user,
    isLoading: fetchingUser,
    error: userError,
  } = api.users.getUserByUsername.useQuery(
    { username: router.query.username as string },
    { enabled: router.query.username !== session?.user.username }
  );
  const { mutateAsync: follow, isLoading: creatingFollow } =
    api.users.follow.useMutation();
  const { mutateAsync: unfollow, isLoading: deletingFollow } =
    api.users.unfollow.useMutation();

  const handleFollow = async () => {
    if (!user) return;
    if (!session?.user) {
      void router.push("/login");
      return;
    }
    try {
      const response = await follow({ id: user.id });
      ctx.setQueryData(
        [
          ["users", "getUserByUsername"],
          { input: { username: user.username }, type: "query" },
        ],
        (cachedData: typeof user | undefined) => {
          if (!cachedData) return;
          return {
            ...cachedData,
            followers: [...cachedData.followers, response],
          };
        }
      );
      ctx.setQueryData(
        [["users", "getSessionUser"], { type: "query" }],
        (cachedData: typeof user | undefined) => {
          if (!cachedData) return;
          return {
            ...cachedData,
            following: [...cachedData.following, response],
          };
        }
      );
    } catch (error) {
      if (error instanceof TRPCClientError) {
        toast.error(`Error: ${error.message}`);
      }
      return;
    }
  };

  const handleUnfollow = async () => {
    if (!user) return;
    if (!session?.user) {
      void router.push("/login");
      return;
    }
    try {
      await unfollow({ id: user.id });
      ctx.setQueryData(
        [
          ["users", "getUserByUsername"],
          { input: { username: user.username }, type: "query" },
        ],
        (cachedData: typeof user | undefined) => {
          if (!cachedData) return;
          return {
            ...cachedData,
            followers: cachedData.followers.filter(
              (follow) => follow.followerId !== session.user.id
            ),
          };
        }
      );
      ctx.setQueryData(
        [["users", "getSessionUser"], { type: "query" }],
        (cachedData: typeof user | undefined) => {
          if (!cachedData) return;
          return {
            ...cachedData,
            following: cachedData.following.filter(
              (follow) => follow.followedId !== user.id
            ),
          };
        }
      );
    } catch (error) {
      if (error instanceof TRPCClientError) {
        toast.error(`Error: ${error.message}`);
      }
      return;
    }
  };

  if (fetchingUser) {
    return <Loading />;
  }

  if (!user || userError) {
    return <ErrorView />;
  }

  return (
    <>
      <Head>
        <title>Sloopy - {`${user.username}'s Profile`}</title>
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
            <div className="flex flex-1 gap-2 text-center font-display text-base font-semibold sm:text-lg">
              {user.followers.find(
                (follower) => follower.followerId === session?.user.id
              ) ? (
                <LoadingButton
                  loading={deletingFollow}
                  disabled={deletingFollow}
                  onClick={() => void handleUnfollow()}
                  className="flex flex-1 items-center justify-center rounded-md border border-gray-300 bg-gray-200 px-2 py-2.5"
                >
                  Following
                </LoadingButton>
              ) : (
                <LoadingButton
                  loading={creatingFollow}
                  disabled={creatingFollow}
                  onClick={() => void handleFollow()}
                  className="flex flex-1 items-center justify-center rounded-md border border-gray-300 bg-gray-200 px-2 py-2.5"
                >
                  Follow
                </LoadingButton>
              )}
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
                  <div className="flex items-center gap-4 text-sm text-gray-400 sm:text-base">
                    <p className="flex-1 truncate">
                      {calcRelativeTime(sloop.updatedAt)}
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

export default User;
