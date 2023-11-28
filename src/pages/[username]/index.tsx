import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { api } from "~/utils/api";
import Loading from "~/components/utils/loading";
import { paginationLimit } from "~/utils/constants";
import { useRouter } from "next/router";
import ErrorView from "~/components/utils/errorView";
import { useMemo, useRef } from "react";
import NoData from "~/components/noData";
import Marquee from "~/components/marquee";
import ImageSection from "~/components/imageSection";
import { calcCompactValue } from "~/utils/calc";
import { Button } from "~/components/ui/button";
import InfinitePagination from "~/components/infinitePagination";
import CardGrid from "~/components/cardGrid";
import SloopCard from "~/components/sloopCard";
import { toast } from "sonner";
import { env } from "~/env.mjs";

const User: NextPage = ({}) => {
  const router = useRouter();
  const lastItem = useRef<HTMLButtonElement>(null!);
  const { data: session } = useSession();
  const t3 = api.useContext();
  const { data: user, isLoading: fetchingUser } =
    api.users.getUserByUsername.useQuery({
      username: router.query.username as string,
    });
  const {
    data: sloops,
    isLoading: fetchingSloops,
    fetchNextPage,
  } = api.sloops.getUserSloops.useInfiniteQuery(
    {
      username: router.query.username as string,
      limit: paginationLimit,
    },
    {
      getNextPageParam: (page) => page.next,
      enabled: typeof router.query.username === "string",
    }
  );
  const data = useMemo(() => {
    return sloops?.pages.flatMap((page) => page.items);
  }, [sloops]);

  const { mutateAsync: follow, isLoading: following } =
    api.users.follow.useMutation({
      onMutate: async () => {
        if (!session || !user) return;
        await t3.users.getUserByUsername.cancel({ username: user.username });
        const cachedUser = t3.users.getUserByUsername.getData({
          username: user.username,
        });
        t3.users.getUserByUsername.setData(
          { username: user.username },
          (cachedData) => {
            if (!cachedData) return;
            return {
              ...cachedData,
              followersCount: cachedData.followersCount + 1,
              followers: [
                {
                  followerId: session.user.id,
                  followedId: user.id,
                },
              ],
            };
          }
        );
        const cachedSessionUser = t3.users.getSessionUser.getData();
        t3.users.getSessionUser.setData(undefined, (cachedData) => {
          if (!cachedData) return;
          return {
            ...cachedData,
            followingCount: cachedData.followingCount + 1,
          };
        });
        return { cachedUser, cachedSessionUser };
      },
      onError: (err, _args, ctx) => {
        if (!user) return;
        t3.users.getUserByUsername.setData(
          { username: user?.username },
          () => ctx?.cachedUser
        );
        t3.users.getSessionUser.setData(
          undefined,
          () => ctx?.cachedSessionUser
        );
        toast.error(err.message);
      },
    });

  const { mutateAsync: unfollow, isLoading: unfollowing } =
    api.users.unfollow.useMutation({
      onMutate: async () => {
        if (!session || !user) return;
        await t3.users.getUserByUsername.cancel({ username: user.username });
        const cachedUser = t3.users.getUserByUsername.getData({
          username: user.username,
        });
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
        const cachedSessionUser = t3.users.getSessionUser.getData();
        t3.users.getSessionUser.setData(undefined, (cachedData) => {
          if (!cachedData) return;
          return {
            ...cachedData,
            followingCount: cachedData.followingCount - 1,
          };
        });
        return { cachedUser, cachedSessionUser };
      },
      onError: (err, _args, ctx) => {
        if (!user) return;
        t3.users.getUserByUsername.setData(
          { username: user?.username },
          () => ctx?.cachedUser
        );
        t3.users.getSessionUser.setData(
          undefined,
          () => ctx?.cachedSessionUser
        );
        toast.error(err.message);
      },
    });

  const followed = useMemo(() => {
    return user?.followers.some(
      (follow) => follow.followerId === session?.user.id
    );
  }, [user, session?.user.id]);

  if (fetchingUser) {
    return <Loading />;
  }

  if (!user) {
    return <ErrorView />;
  }

  return (
    <>
      <Head>
        <title>Sloopy - {`${user.username}'s Profile`}</title>
      </Head>
      <main className="flex flex-1 flex-col gap-2 overflow-scroll lg:grid lg:grid-cols-5 lg:grid-rows-5 lg:overflow-hidden">
        <Marquee className="lg:col-span-4" label="Profile">
          {user.username}
        </Marquee>
        <div className="p-lg flex flex-col gap-2 lg:row-span-5">
          <div className="section flex gap-2 bg-muted">
            <Button
              onClick={() => {
                if (following || unfollowing) return;
                try {
                  if (followed) {
                    void unfollow({ id: user.id });
                  } else {
                    void follow({ id: user.id });
                  }
                } catch (error) {
                  return;
                }
              }}
              variant={followed ? "outline" : "default"}
              className="mono flex-1"
            >
              {followed ? <>Following</> : <>Follow</>}
            </Button>
            <Button className="mono flex-1" variant="outline" asChild>
              <Link href={`${user.username}/likes`}>Likes</Link>
            </Button>
          </div>
          <div className="flex gap-2 lg:flex-col">
            <ImageSection
              className="w-1/2 max-w-[200px] lg:w-full lg:max-w-none"
              url={
                user.image
                  ? env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN + user.image
                  : undefined
              }
              alt={user.name ?? user.username}
              animated
            />
            <div className="flex flex-1 flex-col gap-2">
              <div className="section flex flex-1 flex-col">
                <h1 className="section-label">Sloops</h1>
                <p>{calcCompactValue(user.sloopsCount)}</p>
              </div>
              <Button
                variant="outline"
                size="base"
                className="lg:block"
                asChild
              >
                <Link href={`${user.username}/followers`}>
                  <h1 className="section-label">Followers</h1>
                  <p>{calcCompactValue(user.followersCount)}</p>
                </Link>
              </Button>
              <Button
                variant="outline"
                size="base"
                className="lg:block"
                asChild
              >
                <Link href={`${user.username}/following`}>
                  <h1 className="section-label">Following</h1>
                  <p>{calcCompactValue(user.followingCount)}</p>
                </Link>
              </Button>
            </div>
          </div>
          <div className="section">
            <h1 className="section-label">Name</h1>
            <p className="p-lg text-left">{user.name ?? user.username}</p>
          </div>
          <div className="section flex-1 overflow-y-scroll">
            <h1 className="section-label">Bio</h1>
            {user.bio && user.bio.length > 0 ? (
              <p className="p-lg text-left">{user.bio}</p>
            ) : (
              <NoData />
            )}
          </div>
        </div>
        <InfinitePagination
          lastItem={lastItem}
          onLastItem={() => void fetchNextPage()}
          className="min-h-[500px] lg:col-span-4 lg:row-span-4"
        >
          {fetchingSloops ? (
            <Loading />
          ) : data && data.length > 0 ? (
            <CardGrid className="lg:grid-cols-7">
              {data?.map((sloop, index) => (
                <SloopCard
                  ref={index === (data?.length ?? 0) - 1 ? lastItem : undefined}
                  key={index}
                  sloop={sloop}
                  ignoreWidth
                />
              ))}
            </CardGrid>
          ) : (
            <NoData className="m-0 flex h-full items-center justify-center">
              No sloops have been made :(
            </NoData>
          )}
        </InfinitePagination>
      </main>
    </>
  );
};

export default User;
