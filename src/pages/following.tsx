import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import UserList from "~/components/ui/UserList";
import ErrorView from "~/components/utils/ErrorView";
import Loading from "~/components/utils/Loading";
import WithAuth from "~/components/utils/WithAuth";
import { api } from "~/utils/api";

const Following: NextPage = ({}) => {
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
        <title>Sloopy - Following</title>
      </Head>
      <div className="flex flex-1 flex-col px-4 pb-4 pt-6">
        <h2 className="font-display text-xl text-gray-400 sm:text-2xl">
          Following
        </h2>
        <h1 className="mb-4 truncate border-b border-gray-300 pb-4 text-4xl font-semibold sm:text-5xl">
          {session?.user.name ?? session?.user.username}
        </h1>
        <UserList users={user.following.map(({ followed }) => followed)} />
      </div>
    </>
  );
};

export default WithAuth(Following);
