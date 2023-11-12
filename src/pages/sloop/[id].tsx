import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import Chord from "~/components/sloops/Chord";
import ErrorView from "~/components/utils/ErrorView";
import Loading from "~/components/utils/loading";
import { api } from "~/utils/api";
import {
  calcCompactValue,
  calcRelativeTime,
  calcSloopColours,
} from "~/utils/calc";
import { domain, mode, pitchClass, pitchClassColours } from "~/utils/constants";
import { type Chords, type Loop } from "~/utils/types";
import chordsData from "public/chords.json";
import NoData from "~/components/noData";
import Marquee from "~/components/marquee";
import ImageSection from "~/components/imageSection";
import TrackButton from "~/components/trackButton";
import SpotifyButton from "~/components/spotifyButton";
import { Button } from "~/components/ui/button";
import { Check, Heart } from "lucide-react";
import { ScrollArea } from "~/components/ui/scroll-area";
import { cn } from "~/utils/shadcn/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";

const chords = chordsData as unknown as Chords;

const Sloop: NextPage = ({}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const t3 = api.useContext();
  const [previewLoop, setPreviewLoop] = useState(0);
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
  const { mutateAsync: deleteSloop, isLoading: deletingSloop } =
    api.sloops.delete.useMutation();

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
          <div className="section">
            <h1 className="section-label">Creator</h1>
            <Link
              className="p-lg hover:underline"
              href={`/${sloop.userUsername}`}
            >
              {sloop.userUsername}
            </Link>
          </div>
          <TrackButton
            renderImage
            track={{ ...sloop.track, artists: sloop.artists }}
          />
          <SpotifyButton uri={`spotify:track:${sloop.trackId}`} />
          <div className="section flex-1 lg:block">
            <h1 className="section-label">Description</h1>
            {sloop.description.length > 0 ? (
              <p className="p">{sloop.description}</p>
            ) : (
              <NoData />
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 lg:col-span-4 lg:row-span-4">
          <div className="flex gap-2">
            <div className="lg:section mono flex flex-1 justify-between gap-2">
              <Button asChild>
                <Link
                  href={`/player/${sloop.id}?private=${
                    session?.user.id === sloop.userId ? sloop.isPrivate : false
                  }`}
                >
                  Play
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
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="mono">
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="font-sans">
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete your sloop and remove the data from our
                          servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="mono">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          disabled={deletingSloop}
                          onClick={() => void handleDeleteSloop(sloop.id)}
                          className="mono bg-destructive"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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
              className="max-lg:p-2 lg:h-auto"
              variant="outline"
            >
              <Heart
                strokeWidth={1}
                className={cn(liked ? "animate-like" : "animate-unlike")}
              />
            </Button>
          </div>
          <div className="flex flex-1 flex-col-reverse gap-2 lg:flex-row">
            <section className="section flex-1">
              <h1 className="section-label">Composition</h1>
            </section>
            <section className="p-lg flex flex-1 flex-col gap-2 text-right">
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
                  <p>{`${sloop.timeSignature} / 4`}</p>
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
              <div className="flex flex-1 gap-2">
                <div className="section flex-1">
                  <h1 className="section-label">Voicing</h1>
                  <Chord
                    className="-translate-y-5"
                    chord={
                      chords[loops[previewLoop]!.chord]![
                        loops[previewLoop]!.voicing
                      ]
                    }
                  />
                </div>
                <div className="flex flex-1 flex-col gap-2">
                  <div className="section">
                    <h1 className="section-label">Chord</h1>
                    <p>{loops[previewLoop]?.chord}</p>
                  </div>
                  <div className="section flex-1">
                    <h1 className="section-label">Loops</h1>
                    <ScrollArea>
                      <div className="flex flex-col gap-2">
                        {loops.map((loop, index) => (
                          <Button
                            key={loop.id}
                            style={{
                              backgroundColor:
                                pitchClassColours[loop.key] + "CC",
                            }}
                            variant="outline"
                            size="lg"
                            className="justify-between p-2"
                            onClick={() => setPreviewLoop(index)}
                          >
                            {`${pitchClass[loop.key]} ${mode[loop.mode]}`}
                            {index === previewLoop && <Check strokeWidth={1} />}
                          </Button>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
};

export default Sloop;
