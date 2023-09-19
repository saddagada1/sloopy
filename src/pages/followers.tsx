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

const Followers: NextPage = ({}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const {
    data: user,
    isLoading: fetchingUser,
    error: userError,
  } = api.users.getSessionUser.useQuery();
  const {
    data: followers,
    isLoading: fetchingFollowers,
    error: followersError,
  } = api.users.getUserFollowers.useQuery({
    offset: router.query.offset ? parseInt(router.query.offset as string) : 0,
  });

  const handleNext = () => {
    if (!user || !followers) return;
    if (!(user._count.followers - followers.offset > followers.limit)) return;
    void router.push(
      `/followers?offset=${followers.offset + followers.limit}`,
      undefined,
      { shallow: true }
    );
  };

  const handlePrevious = () => {
    if (!user || !followers) return;
    if (!(followers.offset - followers.limit > 0)) return;
    void router.push(
      `/followers?offset=${followers.offset - followers.limit}`,
      undefined,
      { shallow: true }
    );
  };

  if (fetchingUser || fetchingFollowers) {
    return <Loading />;
  }

  if ((!user || userError) ?? (!followers || followersError)) {
    return <ErrorView />;
  }

  return (
    <>
      <Head>
        <title>Sloopy - Followers</title>
      </Head>
      <div className="flex flex-1 flex-col px-4 pb-4 pt-6">
        <h2 className="font-display text-xl text-gray-400 sm:text-2xl">
          Followers
        </h2>
        <h1 className="mb-4 truncate border-b border-gray-300 pb-4 text-4xl font-semibold sm:text-5xl">
          {session?.user.name ?? session?.user.username}
        </h1>
        {user._count.followers > 0 ? (
          <>
            <UserList users={followers.items.map(({ follower }) => follower)} />
            <div className="mt-2 flex items-center gap-4 border-t border-gray-300 pt-6 font-display text-3xl sm:text-4xl">
              <p className="flex-1">
                {Math.round(
                  (user._count.followers / followers.limit) *
                    (followers.offset / user._count.followers)
                ) + 1}
              </p>
              <button
                onClick={() => handlePrevious()}
                disabled={!(followers.offset - followers.limit > 0)}
                className={clsx(
                  !(followers.offset - followers.limit > 0) && "text-gray-300"
                )}
              >
                <PiArrowLeft />
              </button>
              <button
                onClick={() => handleNext()}
                disabled={
                  !(user._count.followers - followers.offset > followers.limit)
                }
                className={clsx(
                  !(
                    user._count.followers - followers.offset >
                    followers.limit
                  ) && "text-gray-300"
                )}
              >
                <PiArrowRight />
              </button>
            </div>
          </>
        ) : (
          <p className="mx-12 text-center font-display text-base text-gray-400 sm:text-lg">
            No Followers
          </p>
        )}
      </div>
    </>
  );
};

export default WithAuth(Followers);
