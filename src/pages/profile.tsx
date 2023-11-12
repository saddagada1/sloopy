import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { api } from "~/utils/api";
import Loading from "~/components/utils/loading";
import { paginationLimit } from "~/utils/constants";
import { useRef, useMemo } from "react";
import NoData from "~/components/noData";
import { Button } from "~/components/ui/button";
import CardGrid from "~/components/cardGrid";
import SloopCard from "~/components/sloopCard";
import InfinitePagination from "~/components/infinitePagination";
import ErrorView from "~/components/utils/ErrorView";
import { calcCompactValue } from "~/utils/calc";
import ImageSection from "~/components/imageSection";
import Marquee from "~/components/marquee";

const Profile: NextPage = ({}) => {
  const lastItem = useRef<HTMLButtonElement>(null!);
  const { data: user, isLoading: fetchingUser } =
    api.users.getSessionUser.useQuery();
  const {
    data: sloops,
    isLoading: fetchingSloops,
    fetchNextPage,
  } = api.sloops.getSloops.useInfiniteQuery(
    {
      limit: paginationLimit,
    },
    {
      getNextPageParam: (page) => page.next,
    }
  );

  const data = useMemo(() => {
    return sloops?.pages.flatMap((page) => page.items);
  }, [sloops]);

  if (fetchingUser) {
    return <Loading />;
  }

  if (!user) {
    return <ErrorView />;
  }

  return (
    <>
      <Head>
        <title>Sloopy - Profile</title>
      </Head>
      <main className="flex flex-1 flex-col gap-2 overflow-scroll lg:grid lg:grid-cols-5 lg:grid-rows-5 lg:overflow-hidden">
        <Marquee className="lg:col-span-4" label="Profile">
          {user.name ?? user.username}
        </Marquee>
        <div className="flex flex-col gap-2 lg:row-span-5">
          <div className="section flex gap-2 bg-muted">
            <Button className="mono flex-1" variant="outline" asChild>
              <Link href="/likes">Likes</Link>
            </Button>
            <Button className="mono flex-1" variant="outline" asChild>
              <Link href="settings">Settings</Link>
            </Button>
          </div>
          <div className="flex gap-2 lg:flex-col">
            <ImageSection
              className="w-1/2 lg:w-full"
              url={user.image}
              alt={user.name ?? user.username}
            />
            <div className="flex flex-1 flex-col gap-2">
              <div className="section flex flex-1 flex-col">
                <h1 className="section-label mb-0">Sloops</h1>
                <p className="num-sm lg:num-lg">
                  {calcCompactValue(user.sloopsCount)}
                </p>
              </div>
              <Button
                variant="outline"
                size="base"
                className="lg:block"
                asChild
              >
                <Link href="/followers">
                  <h1 className="section-label mb-0">Followers</h1>
                  <p className="num-sm lg:num-lg">
                    {calcCompactValue(user.followersCount)}
                  </p>
                </Link>
              </Button>
              <Button
                variant="outline"
                size="base"
                className="lg:block"
                asChild
              >
                <Link href="/following">
                  <h1 className="section-label mb-0">Following</h1>
                  <p className="num-sm lg:num-lg">
                    {calcCompactValue(user.followingCount)}
                  </p>
                </Link>
              </Button>
            </div>
          </div>
          <div className="section  flex-1 lg:block">
            <h1 className="section-label">Bio</h1>
            {user.bio && user.bio.length > 0 ? (
              <p className="p">{user.bio}</p>
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

export default Profile;
