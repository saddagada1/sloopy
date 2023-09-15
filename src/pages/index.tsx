import Avatar from "boring-avatars";
import clsx from "clsx";
import { Field, Form, Formik } from "formik";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { PiHeartFill, PiMagnifyingGlass } from "react-icons/pi";
import { useElementSize } from "usehooks-ts";
import Loading from "~/components/utils/Loading";
import WithAuth from "~/components/utils/WithAuth";
import { api } from "~/utils/api";
import { calcRelativeTime, calcTimeOfDay } from "~/utils/calc";
import { mode, pitchClassColours } from "~/utils/constants";

const Home: NextPage = () => {
  const router = useRouter();
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
    toast.error("Error: Could Not Fetch Dashboard Data");
    return <div>ERROR</div>;
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
        <Formik
          initialValues={{
            query: "",
          }}
          onSubmit={(values: { query: string }) => {
            void router.push(`/search?q=${values.query}`);
          }}
        >
          {() => (
            <Form className="mb-4 w-full">
              <div className="flex items-center rounded-md border border-gray-300 bg-gray-200 p-2">
                <PiMagnifyingGlass className="text-2xl text-gray-400" />
                <Field
                  className="ml-2 w-full bg-transparent text-sm focus:outline-none sm:text-base"
                  id="query"
                  name="query"
                  placeholder="Search for artists, albums, playlists, tracks..."
                  autoComplete="off"
                  autoCorrect="off"
                />
              </div>
            </Form>
          )}
        </Formik>
        <div
          ref={containerRef}
          className="mt-4 flex-1 border-t border-gray-300 pt-4"
        >
          <ul className="w-full">
            {sloops.map((sloop, index) => (
              <li
                className={clsx(
                  "flex cursor-pointer gap-4 rounded-lg border border-gray-300 bg-gray-200 p-2",
                  index !== sloops.length - 1 &&
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
                      {sloop.userId === session?.user.id
                        ? calcRelativeTime(sloop.updatedAt)
                        : sloop.userUsername}
                    </p>
                    <p className="flex items-center gap-2">
                      {sloop.likes.length.toLocaleString(undefined, {
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

export default WithAuth(Home);
