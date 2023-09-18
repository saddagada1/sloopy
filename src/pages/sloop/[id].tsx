import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";
import Avatar from "boring-avatars";
import { AnimatePresence, motion } from "framer-motion";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  PiCheck,
  PiHeart,
  PiHeartFill,
  PiLink,
  PiMusicNote,
  PiPencilSimpleLine,
  PiPlayFill,
  PiShareNetwork,
} from "react-icons/pi";
import { useElementSize } from "usehooks-ts";
import Chord from "~/components/sloops/Chord";
import Popover from "~/components/ui/Popover";
import ErrorView from "~/components/utils/ErrorView";
import Loading from "~/components/utils/Loading";
import { api } from "~/utils/api";
import { calcRelativeTime, calcSloopColours } from "~/utils/calc";
import { mode, pitchClass, pitchClassColours } from "~/utils/constants";
import { fetchChords } from "~/utils/helpers";
import { type CompleteUser, type Loop } from "~/utils/types";

const Sloop: NextPage = ({}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [containerRef, { width }] = useElementSize();
  const ctx = useQueryClient();
  const [previewLoop, setPreviewLoop] = useState(0);
  const [showShare, setShowShare] = useState(false);
  const {
    data: sloop,
    isLoading: fetchingSloop,
    error: sloopError,
  } = api.sloops.get.useQuery({
    id: router.query.id as string,
  });
  const {
    data: chords,
    isLoading: fetchingChords,
    error: chordsError,
  } = useQuery(["chords"], async () => {
    const response = await fetchChords();
    if (!response.ok) {
      throw new Error("Failed To Fetch Chords");
    }
    return response;
  });
  const { mutateAsync: like, isLoading: creatingLike } =
    api.sloops.like.useMutation();
  const { mutateAsync: unlike, isLoading: deletingLike } =
    api.sloops.unlike.useMutation();

  const handleLike = async () => {
    if (!sloop) return;
    if (!session?.user) {
      void router.push("/login");
      return;
    }
    try {
      const response = await like({ id: sloop.id });
      ctx.setQueryData(
        [["sloops", "get"], { input: { id: sloop.id }, type: "query" }],
        (cachedData: typeof sloop | undefined) => {
          if (!cachedData) return;
          return {
            ...cachedData,
            likes: [...cachedData.likes, response],
          };
        }
      );
      ctx.setQueryData(
        [["users", "getSessionUser"], { type: "query" }],
        (cachedData: CompleteUser | undefined) => {
          if (!cachedData) return;
          return {
            ...cachedData,
            likes: [
              ...cachedData.likes,
              {
                ...response,
                sloop: { ...sloop, likes: [...sloop.likes, response] },
              },
            ],
          };
        }
      );
    } catch (error) {
      if (error instanceof TRPCClientError) {
        toast.error(`Error: ${error.message}`);
      }
      return;
    }
  };

  const handleUnlike = async () => {
    if (!sloop) return;
    if (!session?.user) {
      void router.push("/login");
      return;
    }
    try {
      await unlike({ id: sloop.id });
      ctx.setQueryData(
        [["sloops", "get"], { input: { id: sloop.id }, type: "query" }],
        (cachedData: typeof sloop | undefined) => {
          if (!cachedData) return;
          return {
            ...cachedData,
            likes: cachedData.likes.filter(
              (like) => like.userId !== session.user.id
            ),
          };
        }
      );
      ctx.setQueryData(
        [["users", "getSessionUser"], { type: "query" }],
        (cachedData: CompleteUser | undefined) => {
          if (!cachedData) return;
          return {
            ...cachedData,
            likes: cachedData.likes.filter((like) => like.sloopId !== sloop.id),
          };
        }
      );
    } catch (error) {
      if (error instanceof TRPCClientError) {
        toast.error(`Error: ${error.message}`);
      }
      return;
    }
  };

  if (fetchingSloop || fetchingChords) {
    return <Loading />;
  }

  if ((!sloop || sloopError) ?? (!chords || chordsError)) {
    return <ErrorView />;
  }

  const loops = sloop.loops as Loop[];

  return (
    <>
      <Head>
        <title>Sloopy - {sloop.name}</title>
      </Head>
      <div
        ref={containerRef}
        className="flex flex-1 flex-col items-center px-4 pb-4 pt-6"
      >
        <div
          style={{ width: width * 0.6 }}
          className="mb-4 aspect-square overflow-hidden rounded-md"
        >
          <Avatar
            size={width * 0.6}
            name={sloop.name}
            variant="pixel"
            square
            colors={calcSloopColours(sloop)}
          />
        </div>
        <Link
          href={`/${sloop.userUsername}`}
          className="w-full truncate font-display text-lg text-gray-400 sm:text-xl"
        >
          {sloop.userUsername}
        </Link>
        <h1 className="mb-4 w-full text-3xl font-semibold sm:text-4xl">
          {sloop.name}
        </h1>
        <div className="mb-4 flex w-full gap-4 border-b border-gray-300 pb-4 text-3xl sm:text-4xl">
          <Link className="flex-1" href={`/player/${sloop.id}`}>
            <PiPlayFill />
          </Link>
          {session?.user.id === sloop.userId && (
            <Link href={`/editor/${sloop.id}`}>
              <PiPencilSimpleLine />
            </Link>
          )}
          {session?.user.id !== sloop.userId &&
            (sloop.likes.find((like) => like.userId === session?.user.id) ? (
              <motion.button
                initial={{ scale: "150%" }}
                animate={{ scale: "100%" }}
                disabled={deletingLike}
                onClick={() => void handleUnlike()}
                className="text-red-500"
              >
                <PiHeartFill />
              </motion.button>
            ) : (
              <button disabled={creatingLike} onClick={() => void handleLike()}>
                <PiHeart />
              </button>
            ))}
          <Link href={`/track/${sloop.trackId}`}>
            <PiMusicNote />
          </Link>
          <button className="relative" onClick={() => setShowShare(true)}>
            <PiShareNetwork />
            <AnimatePresence>
              {showShare && (
                <Popover
                  setVisible={setShowShare}
                  className="flex items-center gap-2 text-2xl text-secondary shadow-2xl sm:text-3xl"
                  x="left"
                >
                  <PiLink />
                  <input
                    type="text"
                    defaultValue={window.location.toString()}
                    className="rounded-md border border-gray-300 bg-gray-200 p-2 text-sm font-medium sm:text-base"
                  />
                </Popover>
              )}
            </AnimatePresence>
          </button>
        </div>
        {sloop.description !== "" && (
          <div className="mb-4 flex w-full flex-col items-start gap-1 border-b border-gray-300 pb-4">
            <p className="font-display text-xs text-gray-400 sm:text-sm">
              Description
            </p>
            <p className="w-full text-sm font-semibold sm:text-base">
              {sloop.description}
            </p>
          </div>
        )}
        <div className="mb-4 flex w-full border-b border-gray-300 pb-4">
          <div className="flex basis-1/4 flex-col items-start gap-1 border-r border-gray-300">
            <p className="font-display text-xs text-gray-400 sm:text-sm">
              Completed
            </p>
            <p className="w-full text-center text-sm font-semibold sm:text-base">
              {loops.length > 0
                ? `${Math.round(
                    (loops[loops.length - 1]!.end / sloop.duration) * 100
                  )}%`
                : "0%"}
            </p>
          </div>
          <div className="flex basis-1/4 flex-col items-start gap-1 border-r border-gray-300">
            <p className="pl-2 font-display text-xs text-gray-400 sm:text-sm">
              Likes
            </p>
            <p className="w-full text-center text-sm font-semibold sm:text-base">
              {sloop.likes.length.toLocaleString(undefined, {
                notation: "compact",
              })}
            </p>
          </div>
          <div className="flex flex-1 flex-col items-start gap-1">
            <p className="pl-2 font-display text-xs text-gray-400 sm:text-sm">
              Updated
            </p>
            <p className="w-full text-center text-sm font-semibold sm:text-base">
              {calcRelativeTime(sloop.updatedAt)}
            </p>
          </div>
        </div>
        <div className="mb-4 flex w-full border-b border-gray-300 pb-4">
          <div className="flex flex-1 flex-col items-start gap-1 border-r border-gray-300">
            <p className="font-display text-xs text-gray-400 sm:text-sm">Key</p>
            <p className="w-full text-center text-sm font-semibold sm:text-base">
              {`${pitchClass[sloop.key]} ${mode[sloop.mode]}`}
            </p>
          </div>
          <div className="flex flex-1 flex-col items-start gap-1 border-r border-gray-300">
            <p className="pl-2 font-display text-xs text-gray-400 sm:text-sm">
              Tempo
            </p>
            <p className="w-full text-center text-sm font-semibold sm:text-base">
              {`${Math.round(sloop.tempo)} BPM`}
            </p>
          </div>
          <div className="flex flex-1 flex-col items-start gap-1">
            <p className="pl-2 font-display text-xs text-gray-400 sm:text-sm">
              Time
            </p>
            <p className="w-full text-center text-sm font-semibold sm:text-base">
              {`${sloop.timeSignature} / 4`}
            </p>
          </div>
        </div>
        {loops.length > 0 ? (
          <>
            <div
              style={{ height: (width / 2) * 1.3 }}
              className="mb-4 flex w-full gap-4 border-b border-gray-300 pb-4"
            >
              <div className="flex flex-1 flex-col gap-4 overflow-hidden">
                <div className="flex flex-col items-start gap-1 border-b border-gray-300 pb-4">
                  <p className="font-display text-xs text-gray-400 sm:text-sm">
                    Chord
                  </p>
                  <p className="w-full text-center text-sm font-semibold sm:text-base">
                    {loops[previewLoop]?.chord}
                  </p>
                </div>
                <div className="flex flex-1 flex-col items-start gap-2 overflow-hidden">
                  <p className="font-display text-xs text-gray-400 sm:text-sm">
                    Loops
                  </p>
                  <div className="no-scrollbar flex h-full w-full flex-col gap-1.5 overflow-scroll">
                    {loops.map((loop, index) => (
                      <button
                        key={loop.id}
                        style={{
                          backgroundColor: pitchClassColours[loop.key] + "80",
                        }}
                        className="flex items-center justify-between rounded p-1.5 text-left text-sm font-semibold sm:text-base"
                        onClick={() => setPreviewLoop(index)}
                      >
                        {`${pitchClass[loop.key]} ${mode[loop.mode]}`}
                        {index === previewLoop && <PiCheck />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-1 flex-col items-start gap-1 border-l border-gray-300">
                <p className="pl-2 font-display text-xs text-gray-400 sm:text-sm">
                  Voicing
                </p>
                <div className="w-full flex-1 -translate-y-5 translate-x-2">
                  <Chord
                    chord={
                      chords.data[loops[previewLoop]!.chord]![
                        loops[previewLoop]!.voicing
                      ]
                    }
                  />
                </div>
              </div>
            </div>
            <div className="flex w-full flex-col items-start gap-2">
              <p className="font-display text-xs text-gray-400 sm:text-sm">
                Composition / Notes
              </p>
              <div className="no-scrollbar aspect-video w-full overflow-y-scroll rounded border border-gray-300 p-3 text-sm font-semibold sm:text-base">
                {loops[previewLoop]?.notes}
              </div>
            </div>
          </>
        ) : (
          <div className="flex w-full flex-1 items-center justify-center">
            <p className="w-2/3 px-1 text-center font-display text-base text-gray-300 sm:text-lg">
              No loops have been created :(
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default Sloop;
