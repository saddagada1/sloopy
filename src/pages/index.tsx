import Avatar from "boring-avatars";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { PiArrowRight, PiHeartFill } from "react-icons/pi";
import { useElementSize } from "usehooks-ts";
import Carousel from "~/components/ui/Carousel";
import SearchInput from "~/components/ui/SearchInput";
import ErrorView from "~/components/utils/ErrorView";
import Loading from "~/components/utils/Loading";
import WithAuth from "~/components/utils/WithAuth";
import { api } from "~/utils/api";
import {
  calcRelativeTime,
  calcSloopColours,
  calcTimeOfDay,
} from "~/utils/calc";
import { type CompleteSloop } from "~/utils/types";

interface SloopCardProps {
  sloop: CompleteSloop;
  width: number;
}

const SloopCard: React.FC<SloopCardProps> = ({ sloop, width }) => {
  const router = useRouter();
  const { data: session } = useSession();
  return (
    <div
      style={{ width: width / 3 }}
      onClick={() => void router.push(`/sloop/${sloop.id}`)}
      className="cursor-pointer rounded-md border border-gray-300 bg-gray-200 p-2"
    >
      <div className="mb-2 aspect-square overflow-hidden rounded-md">
        <Avatar
          size={width / 3}
          name={sloop.name}
          variant="pixel"
          square
          colors={calcSloopColours(sloop)}
        />
      </div>
      <p className="truncate text-sm font-semibold sm:text-base">
        {sloop.name}
      </p>
      <p className="truncate text-xs sm:text-sm">
        {sloop.userId === session?.user.id
          ? session.user.username
          : sloop.userUsername}
      </p>
      <div className="mt-2 flex items-center gap-4 text-xs sm:text-sm">
        <p className="flex-1 truncate">{calcRelativeTime(sloop.updatedAt)}</p>
        <p className="flex items-center gap-2">
          {sloop.likes.length.toLocaleString(undefined, {
            notation: "compact",
          })}
          <PiHeartFill className="text-base sm:text-lg" />
        </p>
      </div>
    </div>
  );
};

const Home: NextPage = () => {
  const { data: session } = useSession();
  const [containerRef, { width }] = useElementSize();
  const {
    data: sloops,
    isLoading: fetchingSloops,
    error: sloopsError,
  } = api.sloops.getAll.useQuery();

  if (fetchingSloops) {
    return <Loading />;
  }

  if (!sloops || sloopsError) {
    return <ErrorView />;
  }

  return (
    <>
      <Head>
        <title>Sloopy - Home</title>
      </Head>
      <div className="flex flex-1 flex-col px-4 py-6">
        <h2 className="font-display text-xl text-gray-400 sm:text-2xl">
          {calcTimeOfDay()}
        </h2>
        <Link
          href="/profile"
          className="mb-4 truncate border-b border-gray-300 pb-4 text-4xl font-semibold sm:text-5xl"
        >
          {session?.user.name ?? session?.user.username}
        </Link>
        <SearchInput />
        <div ref={containerRef} className="mt-2 flex flex-1 flex-col gap-6">
          <section>
            <h3 className="mb-4 flex items-end justify-between font-display text-xl font-semibold sm:text-2xl">
              Most Recent
              <Link href="/saved/albums">
                <PiArrowRight className="text-gray-400" />
              </Link>
            </h3>
            <Carousel>
              {sloops.map((sloop, index) => (
                <SloopCard key={index} sloop={sloop} width={width} />
              ))}
            </Carousel>
          </section>
        </div>
      </div>
    </>
  );
};

export default WithAuth(Home);
