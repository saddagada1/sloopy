import Avatar from "boring-avatars";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { PiArrowRight, PiAsterisk, PiHeartFill } from "react-icons/pi";
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
import { type ListSloop } from "~/utils/types";

interface SloopCardProps {
  sloop: ListSloop;
  width: number;
}

const SloopCard: React.FC<SloopCardProps> = ({ sloop, width }) => {
  const { data: session } = useSession();
  return (
    <Link
      style={{ width: width / 3 }}
      href={`/sloop/${sloop.id}`}
      className="rounded-md border border-gray-300 bg-gray-200 p-2"
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
          {sloop._count.likes.toLocaleString(undefined, {
            notation: "compact",
          })}
          <PiHeartFill className="text-base sm:text-lg" />
        </p>
      </div>
    </Link>
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
          <section className="relative flex aspect-video w-full items-end overflow-hidden rounded-md p-4 text-primary">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute bottom-0 left-0 h-full w-full object-cover"
            >
              <source src="/sloopy-hero.mp4" />
            </video>
            <div className="anim-grain top-0 opacity-10" />
            <h1 className="z-10 -mb-1.5 w-3/4 font-display text-2xl font-semibold">
              Embrace your own unique sound.
            </h1>
            <PiAsterisk className="absolute right-3 top-3 animate-[spin_10s_linear_infinite] text-4xl" />
          </section>
          <section>
            <h3 className="mb-4 flex items-end justify-between font-display text-xl font-semibold sm:text-2xl">
              Most Recent
              <Link href="/saved/albums">
                <PiArrowRight className="text-gray-400" />
              </Link>
            </h3>
            {sloops.length > 0 ? (
              <Carousel>
                {sloops.map((sloop, index) => (
                  <SloopCard key={index} sloop={sloop} width={width} />
                ))}
              </Carousel>
            ) : (
              <p className="mx-12 text-center font-display text-base text-gray-400 sm:text-lg">
                No Sloop Results
              </p>
            )}
          </section>
        </div>
      </div>
    </>
  );
};

export default WithAuth(Home);
