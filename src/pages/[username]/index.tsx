import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { PiHeart } from "react-icons/pi";
import { useElementSize } from "usehooks-ts";
import { api } from "~/utils/api";
import Loading from "~/components/utils/Loading";
import SafeImage from "~/components/ui/SafeImage";
import {
  alwaysRefetch,
  paginationLimit,
  pitchClassColours,
} from "~/utils/constants";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { TRPCClientError } from "@trpc/client";
import LoadingButton from "~/components/ui/LoadingButton";
import ErrorView from "~/components/utils/ErrorView";
import SloopList from "~/components/ui/SloopList";
import IsSessionUser from "~/components/utils/IsSessionUser";

const User: NextPage = ({}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [imageContainerRef, { height }] = useElementSize();
  const t3 = api.useContext();
  const {
    data: user,
    isLoading: fetchingUser,
    error: userError,
  } = api.users.getUserByUsername.useQuery(
    {
      username: router.query.username as string,
    },
    alwaysRefetch
  );
  const {
    data: sloops,
    isLoading: fetchingSloops,
    error: sloopsError,
  } = api.sloops.getUserSloops.useQuery({
    username: router.query.username as string,
    limit: paginationLimit,
  });
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
      t3.users.getUserByUsername.setData(
        { username: user.username },
        (cachedData) => {
          if (!cachedData) return;
          return {
            ...cachedData,
            followersCount: cachedData.followersCount + 1,
            followers: [response],
          };
        }
      );
      const userFollowers = t3.users.getUserFollowers.getInfiniteData({
        username: user.username,
        limit: paginationLimit,
      });
      if (userFollowers) {
        userFollowers.pages.map(
          (page) =>
            void t3.users.getUserFollowers.reset({
              username: user.username,
              limit: paginationLimit,
              cursor: page.next,
            })
        );
      }
      t3.users.getSessionUser.setData(undefined, (cachedData) => {
        if (!cachedData) return;
        return {
          ...cachedData,
          followingCount: cachedData.followingCount + 1,
        };
      });
      await t3.users.getFollowing.reset();
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
      t3.users.getUserByUsername.setData(
        { username: user.username },
        (cachedData) => {
          if (!cachedData) return;
          return {
            ...cachedData,
            followersCount: cachedData.followersCount - 1,
            followers: [],
          };
        }
      );
      const userFollowers = t3.users.getUserFollowers.getInfiniteData({
        username: user.username,
        limit: paginationLimit,
      });
      if (userFollowers) {
        userFollowers.pages.map(
          (page) =>
            void t3.users.getUserFollowers.reset({
              username: user.username,
              limit: paginationLimit,
              cursor: page.next,
            })
        );
      }
      t3.users.getSessionUser.setData(undefined, (cachedData) => {
        if (!cachedData) return;
        return {
          ...cachedData,
          followingCount: cachedData.followingCount - 1,
        };
      });
      await t3.users.getFollowing.reset();
    } catch (error) {
      if (error instanceof TRPCClientError) {
        toast.error(`Error: ${error.message}`);
      }
      return;
    }
  };

  if (fetchingUser || fetchingSloops) {
    return <Loading />;
  }

  if ((!user || userError) ?? (!sloops || sloopsError)) {
    return <ErrorView />;
  }

  return (
    <>
      <Head>
        <title>Sloopy - {`${user.username}'s Profile`}</title>
      </Head>
      <div className="flex flex-1 flex-col px-4 pb-4 pt-6">
        <h2 className="font-display text-xl text-gray-400 sm:text-2xl">User</h2>
        <h1 className="mb-4 truncate border-b border-gray-300 pb-4 text-4xl font-semibold sm:text-5xl">
          {user.username}
        </h1>
        <div ref={imageContainerRef} className="flex gap-4">
          <SafeImage
            url={user.image}
            alt={user.username}
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
              <Link
                href={`/${user.username}/followers`}
                className="flex flex-1 flex-col items-start gap-1 border-r border-gray-300"
              >
                <p className="px-2 font-display text-xs text-gray-400 sm:text-sm">
                  Followers
                </p>
                <p className="w-full text-center text-sm font-semibold sm:text-base">
                  {user.followersCount.toLocaleString(undefined, {
                    notation: "compact",
                  })}
                </p>
              </Link>
              <Link
                href={`/${user.username}/following`}
                className="flex flex-1 flex-col items-start gap-1"
              >
                <p className="px-2 font-display text-xs text-gray-400 sm:text-sm">
                  Following
                </p>
                <p className="w-full text-center text-sm font-semibold sm:text-base">
                  {user.followingCount.toLocaleString(undefined, {
                    notation: "compact",
                  })}
                </p>
              </Link>
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
                href={`/${user.username}/likes`}
                className="flex aspect-square h-full items-center justify-center rounded-md border border-gray-300 bg-gray-200 text-2xl sm:text-3xl"
              >
                <PiHeart />
              </Link>
            </div>
          </div>
        </div>
        {user.name && (
          <div className="mt-4 flex w-full flex-col items-start gap-1 border-t border-gray-300 pt-4">
            <p className="font-display text-xs text-gray-400 sm:text-sm">
              Name
            </p>
            <p className="w-full text-sm font-semibold sm:text-base">
              {user.name}
            </p>
          </div>
        )}
        {user.bio && (
          <div className="mt-4 flex w-full flex-col items-start gap-1 border-t border-gray-300 pt-4">
            <p className="font-display text-xs text-gray-400 sm:text-sm">Bio</p>
            <p className="w-full text-sm font-semibold sm:text-base">
              {user.bio}
            </p>
          </div>
        )}
        <div className="mt-4 flex-1 border-t border-gray-300 pt-4">
          <SloopList sloops={sloops.items} />
        </div>
      </div>
    </>
  );
};

export default IsSessionUser(User);
