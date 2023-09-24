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
  PiPencilSimpleLine,
  PiPlayFill,
  PiShareNetwork,
  PiTrash,
} from "react-icons/pi";
import { useElementSize } from "usehooks-ts";
import Chord from "~/components/sloops/Chord";
import LoadingButton from "~/components/ui/LoadingButton";
import Modal from "~/components/ui/Modal";
import Popover from "~/components/ui/Popover";
import StyledTitle from "~/components/ui/form/StyledTitle";
import ErrorView from "~/components/utils/ErrorView";
import Loading from "~/components/utils/Loading";
import { api } from "~/utils/api";
import { calcRelativeTime, calcSloopColours } from "~/utils/calc";
import {
  mode,
  paginationLimit,
  pitchClass,
  pitchClassColours,
} from "~/utils/constants";
import { type Chords, type Loop } from "~/utils/types";
import chordsData from "public/chords.json";
import SafeImage from "~/components/ui/SafeImage";

const chords = chordsData as Chords;

const Sloop: NextPage = ({}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [containerRef, { width }] = useElementSize();
  const t3 = api.useContext();
  const [previewLoop, setPreviewLoop] = useState(0);
  const [showShare, setShowShare] = useState(false);
  const {
    data: sloop,
    isLoading: fetchingSloop,
    error: sloopError,
  } = api.sloops.get.useQuery({
    id: router.query.id as string,
  });
  const { mutateAsync: like, isLoading: creatingLike } =
    api.sloops.like.useMutation();
  const { mutateAsync: unlike, isLoading: deletingLike } =
    api.sloops.unlike.useMutation();
  const [showDelete, setShowDelete] = useState(false);
  const { mutateAsync: deleteSloop, isLoading: deletingSloop } =
    api.sloops.delete.useMutation();

  const handleLike = async () => {
    if (!sloop) return;
    if (!session?.user) {
      void router.push("/login");
      return;
    }
    try {
      const response = await like({ id: sloop.id });
      t3.sloops.get.setData({ id: sloop.id }, (cachedData) => {
        if (!cachedData) return;
        return {
          ...cachedData,
          rankedSloop: cachedData.rankedSloop
            ? {
                ...cachedData.rankedSloop,
                likes: cachedData.rankedSloop.likes + 1,
              }
            : null,
          likes: [response],
        };
      });
      t3.sloops.getUserSloops.setData(
        { username: sloop.userUsername, limit: paginationLimit },
        (cachedData) => {
          if (!cachedData) return;
          return {
            ...cachedData,
            items: cachedData.items.map((item) => {
              if (item.id === sloop.id) {
                if (item.rankedSloop) {
                  item.rankedSloop.likes = item.rankedSloop.likes + 1;
                }
              }
              return item;
            }),
          };
        }
      );
      await t3.users.getLikes.reset();
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
      t3.sloops.get.setData({ id: sloop.id }, (cachedData) => {
        if (!cachedData) return;
        return {
          ...cachedData,
          rankedSloop: cachedData.rankedSloop
            ? {
                ...cachedData.rankedSloop,
                likes: cachedData.rankedSloop.likes - 1,
              }
            : null,
          likes: [],
        };
      });
      t3.sloops.getUserSloops.setData(
        { username: sloop.userUsername, limit: paginationLimit },
        (cachedData) => {
          if (!cachedData) return;
          return {
            ...cachedData,
            items: cachedData.items.map((item) => {
              if (item.id === sloop.id) {
                if (item.rankedSloop) {
                  item.rankedSloop.likes = item.rankedSloop.likes - 1;
                }
              }
              return item;
            }),
          };
        }
      );
      await t3.users.getLikes.reset();
    } catch (error) {
      if (error instanceof TRPCClientError) {
        toast.error(`Error: ${error.message}`);
      }
      return;
    }
  };

  const handleDeleteSloop = async (id: string) => {
    await deleteSloop({ id: id });
    setShowDelete(false);
    void router.replace("/profile");
  };

  if (fetchingSloop) {
    return <Loading />;
  }

  if (!sloop || sloopError) {
    return <ErrorView />;
  }

  const loops = sloop.loops as Loop[];

  return (
    <>
      <Head>
        <title>Sloopy - {sloop.name}</title>
      </Head>
      <AnimatePresence>
        {showDelete && (
          <Modal setVisible={setShowDelete}>
            <StyledTitle title="Delete Sloop" />
            <p className="mb-6 font-sans text-sm font-medium sm:text-base">
              Are you sure you want to delete this sloop? This can not be
              undone.
            </p>
            <div className="flex h-14 gap-2 font-display text-base font-bold sm:text-lg">
              <button
                className="flex-1 rounded-md border border-gray-300 bg-gray-200"
                onClick={() => setShowDelete(false)}
              >
                Cancel
              </button>
              <LoadingButton
                onClick={() => {
                  void handleDeleteSloop(sloop.id);
                }}
                loading={deletingSloop}
                disabled={deletingSloop}
                className="flex flex-1 items-center justify-center rounded-md border border-red-500 bg-red-100 text-red-500"
              >
                Confirm
              </LoadingButton>
            </div>
          </Modal>
        )}
      </AnimatePresence>
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
            variant="marble"
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
          <Link
            className="flex-1"
            href={`/player/${sloop.id}?private=${
              session?.user.id === sloop.userId ? sloop.isPrivate : false
            }`}
          >
            <PiPlayFill />
          </Link>
          {session?.user.id === sloop.userId && (
            <Link href={`/editor/${sloop.id}?private=${sloop.isPrivate}`}>
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
          {session?.user.id === sloop.userId && (
            <button
              onClick={() => setShowDelete(true)}
              className="text-red-500"
            >
              <PiTrash />
            </button>
          )}
        </div>
        <div className="mb-4 flex w-full flex-col items-start gap-2 border-b border-gray-300 pb-4">
          <p className="font-display text-xs text-gray-400 sm:text-sm">Track</p>
          <Link className="flex" href={`/track/${sloop.trackId}`}>
            <SafeImage
              url={sloop.track.image}
              alt={sloop.track.name}
              width={width * 0.1}
              className="relative mr-4 aspect-square flex-shrink-0 overflow-hidden rounded"
              square
            />
            <div
              style={{ height: width * 0.1 }}
              className="flex flex-col justify-between overflow-hidden"
            >
              <p className="truncate text-sm font-semibold leading-tight sm:text-base">
                {sloop.track.name}
              </p>
              <p className="truncate text-xs leading-tight text-gray-400 sm:text-sm">
                {sloop.artists.map((artist, index) =>
                  index === sloop.artists.length - 1
                    ? artist.name
                    : `${artist.name}, `
                )}
              </p>
            </div>
          </Link>
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
              Plays
            </p>
            <p className="w-full text-center text-sm font-semibold sm:text-base">
              {sloop.rankedSloop?.plays.toLocaleString(undefined, {
                notation: "compact",
              })}
            </p>
          </div>
          <div className="flex basis-1/4 flex-col items-start gap-1 border-r border-gray-300">
            <p className="pl-2 font-display text-xs text-gray-400 sm:text-sm">
              Likes
            </p>
            <p className="w-full text-center text-sm font-semibold sm:text-base">
              {sloop.rankedSloop?.likes.toLocaleString(undefined, {
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
          <div className="flex flex-1 flex-col items-start gap-1 border-r border-gray-300">
            <p className="pl-2 font-display text-xs text-gray-400 sm:text-sm">
              Time
            </p>
            <p className="w-full text-center text-sm font-semibold sm:text-base">
              {`${sloop.timeSignature} / 4`}
            </p>
          </div>
          <div className="flex flex-1 flex-col items-start gap-1">
            <p className="pl-2 font-display text-xs text-gray-400 sm:text-sm">
              Complete
            </p>
            <p className="w-full text-center text-sm font-semibold sm:text-base">
              {loops.length > 0
                ? `${Math.round(
                    (loops[loops.length - 1]!.end / sloop.duration) * 100
                  )}%`
                : "0%"}
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
                      chords[loops[previewLoop]!.chord]![
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
