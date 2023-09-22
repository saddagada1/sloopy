import { useQuery } from "@tanstack/react-query";
import Avatar from "boring-avatars";
import { AnimatePresence } from "framer-motion";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import {
  PiCheck,
  PiLink,
  PiMusicNote,
  PiPencilSimpleLine,
  PiPlayFill,
  PiShareNetwork,
} from "react-icons/pi";
import { useElementSize } from "usehooks-ts";
import Chord from "~/components/sloops/Chord";
import LoadingButton from "~/components/ui/LoadingButton";
import Modal from "~/components/ui/Modal";
import Popover from "~/components/ui/Popover";
import StyledTitle from "~/components/ui/form/StyledTitle";
import ErrorView from "~/components/utils/ErrorView";
import Loading from "~/components/utils/Loading";
import WithAuth from "~/components/utils/WithAuth";
import { api } from "~/utils/api";
import { calcRelativeTime, calcSloopColours } from "~/utils/calc";
import { mode, pitchClass, pitchClassColours } from "~/utils/constants";
import { fetchChords } from "~/utils/helpers";
import { type Loop } from "~/utils/types";

const Sloop: NextPage = ({}) => {
  const router = useRouter();
  const [containerRef, { width }] = useElementSize();
  const [previewLoop, setPreviewLoop] = useState(0);
  const [showShare, setShowShare] = useState(false);
  const {
    data: sloop,
    isLoading: fetchingSloop,
    error: sloopError,
  } = api.sloops.get.useQuery({
    id: router.query.id as string,
    getPrivate: true,
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
  const [showDelete, setShowDelete] = useState(false);
  const { mutateAsync: deleteSloop, isLoading: deletingSloop } =
    api.sloops.delete.useMutation();

  const handleDeleteSloop = async (id: string) => {
    await deleteSloop({ id: id });
    setShowDelete(false);
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
      {showDelete && (
        <Modal>
          <StyledTitle title="Delete Loop" />
          <p className="mb-6 font-sans text-sm font-medium sm:text-base">
            Are you sure you want to delete this loop? This can not be undone.
          </p>
          <div className="flex h-14 gap-2">
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
          <Link className="flex-1" href={`/player/${sloop.id}?private=true`}>
            <PiPlayFill />
          </Link>
          <Link href={`/editor/${sloop.id}`}>
            <PiPencilSimpleLine />
          </Link>
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

export default WithAuth(Sloop);
