import clsx from "clsx";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { PiArrowLeft, PiArrowRight } from "react-icons/pi";
import SloopList from "~/components/ui/SloopList";
import ErrorView from "~/components/utils/ErrorView";
import IsSessionUser from "~/components/utils/IsSessionUser";
import Loading from "~/components/utils/Loading";
import { api } from "~/utils/api";

const Likes: NextPage = ({}) => {
  const router = useRouter();
  const {
    data: total,
    isLoading: fetchingTotal,
    error: totalError,
  } = api.users.countLikes.useQuery({
    username: router.query.username as string,
  });
  const {
    data: likes,
    isLoading: fetchingLikes,
    error: likesError,
  } = api.users.getLikes.useQuery({
    username: router.query.username as string,
    offset: parseInt(router.query.offset as string) ?? 0,
  });

  const handleNext = () => {
    if (!total || !likes) return;
    if (!(total - likes.offset > likes.limit)) return;
    void router.push(
      `/${router.query.username as string}/likes?offset=${
        likes.offset + likes.limit
      }`,
      undefined,
      {
        shallow: true,
      }
    );
  };

  const handlePrevious = () => {
    if (!total || !likes) return;
    if (!(likes.offset - likes.limit > 0)) return;
    void router.push(
      `/${router.query.username as string}/likes?offset=${
        likes.offset - likes.limit
      }`,
      undefined,
      {
        shallow: true,
      }
    );
  };

  if (fetchingTotal || fetchingLikes) {
    return <Loading />;
  }

  if ((!total || totalError) ?? (!likes || likesError)) {
    return <ErrorView />;
  }

  return (
    <>
      <Head>
        <title>{`Sloopy - ${router.query.username as string}'s Likes`}</title>
      </Head>
      <div className="flex flex-1 flex-col px-4 pb-4 pt-6">
        <h2 className="font-display text-xl text-gray-400 sm:text-2xl">
          Likes
        </h2>
        <h1 className="mb-4 truncate border-b border-gray-300 pb-4 text-4xl font-semibold sm:text-5xl">
          {router.query.username as string}
        </h1>
        {total > 0 ? (
          <>
            <SloopList sloops={likes.items.map(({ sloop }) => sloop)} />
            <div className="mt-2 flex items-center gap-4 border-t border-gray-300 pt-6 font-display text-3xl sm:text-4xl">
              <p className="flex-1">
                {Math.round((total / likes.limit) * (likes.offset / total)) + 1}
              </p>
              <button
                onClick={() => handlePrevious()}
                disabled={!(likes.offset - likes.limit > 0)}
                className={clsx(
                  !(likes.offset - likes.limit > 0) && "text-gray-300"
                )}
              >
                <PiArrowLeft />
              </button>
              <button
                onClick={() => handleNext()}
                disabled={!(total - likes.offset > likes.limit)}
                className={clsx(
                  !(total - likes.offset > likes.limit) && "text-gray-300"
                )}
              >
                <PiArrowRight />
              </button>
            </div>
          </>
        ) : (
          <p className="mx-12 text-center font-display text-base text-gray-400 sm:text-lg">
            No Likes
          </p>
        )}
      </div>
    </>
  );
};

export default IsSessionUser(Likes);
