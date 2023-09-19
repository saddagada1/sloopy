import clsx from "clsx";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { PiArrowLeft, PiArrowRight } from "react-icons/pi";
import UserList from "~/components/ui/UserList";
import ErrorView from "~/components/utils/ErrorView";
import Loading from "~/components/utils/Loading";
import WithAuth from "~/components/utils/WithAuth";
import { api } from "~/utils/api";

const Following: NextPage = ({}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const {
    data: user,
    isLoading: fetchingUser,
    error: userError,
  } = api.users.getSessionUser.useQuery();
  const {
    data: following,
    isLoading: fetchingFollowing,
    error: followingError,
  } = api.users.getUserFollowing.useQuery({
    offset: router.query.offset ? parseInt(router.query.offset as string) : 0,
  });

  const handleNext = () => {
    if (!user || !following) return;
    if (!(user._count.following - following.offset > following.limit)) return;
    void router.push(
      `/following?offset=${following.offset + following.limit}`,
      undefined,
      { shallow: true }
    );
  };

  const handlePrevious = () => {
    if (!user || !following) return;
    if (!(following.offset - following.limit > 0)) return;
    void router.push(
      `/following?offset=${following.offset - following.limit}`,
      undefined,
      { shallow: true }
    );
  };

  if (fetchingUser || fetchingFollowing) {
    return <Loading />;
  }

  if ((!user || userError) ?? (!following || followingError)) {
    return <ErrorView />;
  }

  return (
    <>
      <Head>
        <title>Sloopy - Following</title>
      </Head>
      <div className="flex flex-1 flex-col px-4 pb-4 pt-6">
        <h2 className="font-display text-xl text-gray-400 sm:text-2xl">
          Following
        </h2>
        <h1 className="mb-4 truncate border-b border-gray-300 pb-4 text-4xl font-semibold sm:text-5xl">
          {session?.user.name ?? session?.user.username}
        </h1>
        {user._count.following > 0 ? (
          <>
            <UserList users={following.items.map(({ followed }) => followed)} />
            <div className="mt-2 flex items-center gap-4 border-t border-gray-300 pt-6 font-display text-3xl sm:text-4xl">
              <p className="flex-1">
                {Math.round(
                  (user._count.following / following.limit) *
                    (following.offset / user._count.following)
                ) + 1}
              </p>
              <button
                onClick={() => handlePrevious()}
                disabled={!(following.offset - following.limit > 0)}
                className={clsx(
                  !(following.offset - following.limit > 0) && "text-gray-300"
                )}
              >
                <PiArrowLeft />
              </button>
              <button
                onClick={() => handleNext()}
                disabled={
                  !(user._count.following - following.offset > following.limit)
                }
                className={clsx(
                  !(
                    user._count.following - following.offset >
                    following.limit
                  ) && "text-gray-300"
                )}
              >
                <PiArrowRight />
              </button>
            </div>
          </>
        ) : (
          <p className="mx-12 text-center font-display text-base text-gray-400 sm:text-lg">
            Not Following Anyone
          </p>
        )}
      </div>
    </>
  );
};

export default WithAuth(Following);
