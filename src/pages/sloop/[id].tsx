import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import ErrorView from "~/components/utils/errorView";
import Loading from "~/components/utils/loading";
import { api } from "~/utils/api";
import {
  calcCompactValue,
  calcRelativeTime,
  calcSloopColours,
} from "~/utils/calc";
import {
  colourMod,
  domain,
  lgBreakpoint,
  mode,
  pitchClass,
  pitchClassColours,
  timeSignature,
} from "~/utils/constants";
import { type Tab, type Loop } from "~/utils/types";
import NoData from "~/components/noData";
import Marquee from "~/components/marquee";
import ImageSection from "~/components/imageSection";
import TrackButton from "~/components/trackButton";
import SpotifyButton from "~/components/spotifyButton";
import { Button } from "~/components/ui/button";
import { Heart } from "lucide-react";
import { cn } from "~/utils/shadcn/utils";
import { CheckIcon } from "@radix-ui/react-icons";
import TabViewer from "~/components/sloops/tabViewer";
import { ScrollArea } from "~/components/ui/scroll-area";
import { useElementSize, useWindowSize } from "usehooks-ts";
import ConfirmModal from "~/components/sloops/confirmModal";

const Sloop: NextPage = ({}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [container, { height }] = useElementSize();
  const { width: windowWidth } = useWindowSize();
  const [selectedLoop, setSelectedLoop] = useState(0);
  const t3 = api.useContext();
  const {
    data: sloop,
    isLoading: fetchingSloop,
    error: sloopError,
  } = api.sloops.get.useQuery(
    {
      id: router.query.id as string,
      getPrivate: router.query.private === "true" ? true : undefined,
    },
    { enabled: typeof router.query.id === "string" }
  );
  const { mutateAsync: like, isLoading: liking } = api.sloops.like.useMutation({
    onMutate: async () => {
      if (!session || !sloop) return;
      await t3.sloops.get.cancel({ id: sloop.id });
      const cachedSloop = t3.sloops.get.getData({
        id: sloop.id,
      });
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
          likes: [
            {
              userId: session.user.id,
              sloopId: sloop.id,
            },
          ],
        };
      });
      return { cachedSloop };
    },
    onError: (err, _args, ctx) => {
      if (!sloop) return;
      t3.sloops.get.setData({ id: sloop.id }, () => ctx?.cachedSloop);
      toast.error(err.message);
    },
  });

  const { mutateAsync: unlike, isLoading: unliking } =
    api.sloops.unlike.useMutation({
      onMutate: async () => {
        if (!session || !sloop) return;
        await t3.sloops.get.cancel({ id: sloop.id });
        const cachedSloop = t3.sloops.get.getData({
          id: sloop.id,
        });
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
        return { cachedSloop };
      },
      onError: (err, _args, ctx) => {
        if (!sloop) return;
        t3.sloops.get.setData({ id: sloop.id }, () => ctx?.cachedSloop);
        toast.error(err.message);
      },
    });

  const liked = useMemo(() => {
    return sloop?.likes.some((like) => like.userId === session?.user.id);
  }, [sloop, session?.user.id]);
  const { mutateAsync: deleteSloop } = api.sloops.delete.useMutation();

  const handleDeleteSloop = async (id: string) => {
    await deleteSloop({ id: id });
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
      <main className="flex flex-1 flex-col gap-2 overflow-scroll lg:grid lg:grid-cols-5 lg:grid-rows-5 lg:overflow-hidden">
        <Marquee className="lg:col-span-4" label="Sloop">
          {sloop.name}
        </Marquee>
        <div className="flex flex-col gap-2 lg:row-span-5">
          <ImageSection
            alt={sloop.name}
            square
            colours={calcSloopColours(sloop)}
          />
          <TrackButton
            renderImage
            track={{ ...sloop.track, artists: sloop.artists }}
          />
          <SpotifyButton uri={`spotify:track:${sloop.trackId}`} />
          <div className="section">
            <h1 className="section-label">Creator</h1>
            <Link
              className="p-lg hover:underline"
              href={`/${sloop.userUsername}`}
            >
              {sloop.userUsername}
            </Link>
          </div>
          <div className="section flex-1 overflow-y-scroll">
            <h1 className="section-label">Description</h1>
            {sloop.description.length > 0 ? (
              <p className="p-lg text-left">{sloop.description}</p>
            ) : (
              <NoData />
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 lg:col-span-4 lg:row-span-4">
          <div className="flex gap-2">
            <div className="lg:section mono flex flex-1 justify-between gap-2">
              <Button asChild className="flex-1 lg:flex-none">
                <Link
                  href={`/player/${sloop.id}?private=${
                    session?.user.id === sloop.userId ? sloop.isPrivate : false
                  }`}
                >
                  Play
                  <span className="hidden sm:inline-block">&nbsp;Sloop</span>
                </Link>
              </Button>
              <div className="flex gap-2">
                {session?.user.id === sloop.userId && (
                  <Button variant="outline" asChild>
                    <Link
                      href={`/editor/${sloop.id}?private=${sloop.isPrivate}`}
                    >
                      Edit
                    </Link>
                  </Button>
                )}
                <Button
                  onClick={() => {
                    void navigator.clipboard.writeText(
                      `${domain}${router.asPath}`
                    );
                    toast.success("Copied!");
                  }}
                  variant="outline"
                  className="mono"
                >
                  Share
                </Button>
                {session?.user.id === sloop.userId && (
                  <ConfirmModal
                    message="This action cannot be undone. This will permanently
                  delete your sloop and remove the data from our servers."
                    withTrigger
                    trigger={
                      <Button variant="destructive" className="mono">
                        Delete
                      </Button>
                    }
                    confirmLabel="Delete"
                    onConfirm={() => void handleDeleteSloop(sloop.id)}
                    confirmDestructive
                  />
                )}
              </div>
            </div>
            <Button
              onClick={() => {
                if (liking || unliking) return;
                try {
                  if (liked) {
                    void unlike({ id: sloop.id });
                  } else {
                    void like({ id: sloop.id });
                  }
                } catch (error) {
                  return;
                }
              }}
              className="p-2 lg:h-auto lg:px-4 lg:py-2"
              variant="outline"
            >
              <Heart
                strokeWidth={1}
                className={cn(liked ? "animate-like" : "animate-unlike")}
              />
            </Button>
          </div>
          <div className="p-lg flex flex-col gap-2">
            <div className="flex gap-2">
              <div className="section basis-1/4">
                <h1 className="section-label">Plays</h1>
                <p>{calcCompactValue(sloop.rankedSloop?.plays ?? 0)}</p>
              </div>
              <div className="section basis-1/4">
                <h1 className="section-label">Likes</h1>
                <p>{calcCompactValue(sloop.rankedSloop?.likes ?? 0)}</p>
              </div>
              <div className="section flex-1">
                <h1 className="section-label">Updated</h1>
                <p>{calcRelativeTime(sloop.updatedAt)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="section flex-1">
                <h1 className="section-label">Key</h1>
                <p>{`${pitchClass[sloop.key]} ${mode[sloop.mode]}`}</p>
              </div>
              <div className="section flex-1">
                <h1 className="section-label">Tempo</h1>
                <p>{`${Math.round(sloop.tempo)} BPM`}</p>
              </div>
              <div className="section flex-1">
                <h1 className="section-label">Time</h1>
                <p>{timeSignature[sloop.timeSignature]}</p>
              </div>
              <div className="section flex-1">
                <h1 className="section-label">Complete</h1>
                <p>
                  {loops.length > 0
                    ? `${Math.round(
                        (loops[loops.length - 1]!.end / sloop.duration) * 100
                      )}%`
                    : "0%"}
                </p>
              </div>
            </div>
          </div>
          {loops.length > 0 ? (
            <div
              ref={container}
              className="p-lg flex flex-1 flex-col gap-2 overflow-hidden lg:flex-row"
            >
              <div
                style={{ maxHeight: windowWidth > lgBreakpoint ? height : 350 }}
                className="flex flex-1 flex-col gap-2"
              >
                <div className="section">
                  <h1 className="section-label">Chord</h1>
                  <p>{loops[selectedLoop]?.chord}</p>
                </div>
                <div className="section flex flex-1 flex-col overflow-hidden">
                  <h1 className="section-label flex-none">Loops</h1>
                  <ScrollArea className="section flex-1">
                    {loops.map((loop, index) => (
                      <Button
                        key={loop.id}
                        style={{
                          backgroundColor:
                            pitchClassColours[loop.key] + colourMod,
                        }}
                        variant="outline"
                        size="base"
                        className={cn("h-10", index !== 0 && "mt-2")}
                        onClick={() => setSelectedLoop(index)}
                      >
                        <span className="flex-1 text-left">{`${
                          pitchClass[loop.key]
                        } ${mode[loop.mode]}`}</span>
                        {selectedLoop === index && <CheckIcon />}
                      </Button>
                    ))}
                  </ScrollArea>
                </div>
              </div>
              <div
                style={{ maxHeight: windowWidth > lgBreakpoint ? height : 350 }}
                className="section flex flex-1 flex-col overflow-hidden"
              >
                <h1 className="section-label flex-none">Composition</h1>
                <TabViewer
                  tabs={
                    loops[selectedLoop]
                      ? (JSON.parse(loops[selectedLoop]!.composition) as Tab[])
                      : []
                  }
                />
              </div>
            </div>
          ) : (
            <NoData className="section">No loops have been made :(</NoData>
          )}
        </div>
      </main>
    </>
  );
};

export default Sloop;
