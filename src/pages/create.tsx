import { Form, Formik } from "formik";
import type { NextPage } from "next";
import * as yup from "yup";
import Head from "next/head";
import StyledTitle from "~/components/ui/form/StyledTitle";
import StyledLabel from "~/components/ui/form/StyledLabel";
import StyledField from "~/components/ui/form/StyledField";
import StyledTextArea from "~/components/ui/form/StyledTextArea";
import StyledLoadingButton from "~/components/ui/form/StyledLoadingButton";
import { useRouter } from "next/router";
import { useSpotifyContext } from "~/contexts/Spotify";
import { useQuery } from "@tanstack/react-query";
import Loading from "~/components/utils/Loading";
import { api } from "~/utils/api";
import { TRPCClientError } from "@trpc/client";
import toast from "react-hot-toast";
import WithAuth from "~/components/utils/WithAuth";
import { useElementSize } from "usehooks-ts";
import SafeImage from "~/components/ui/SafeImage";
import ErrorView from "~/components/utils/ErrorView";

interface SloopValues {
  name: string;
  description: string;
}

const Create: NextPage = ({}) => {
  const router = useRouter();
  const spotify = useSpotifyContext();
  const [imageContainerRef, { width }] = useElementSize();
  const { mutateAsync: createSloop } = api.sloops.create.useMutation();
  const {
    data: track,
    isFetching: fetchingTrack,
    error: trackError,
  } = useQuery(
    ["track", router.query.track_id],
    async () => {
      const id = router.query.track_id;
      if (typeof id !== "string") {
        throw new Error("404");
      }
      const trackResponse = await spotify.fetchTrack(id);
      if (!trackResponse?.ok) {
        toast.error("Error: Could Not Fetch Spotify Data");
        throw new Error("Error: Could Not Fetch Spotify Data");
      }
      return trackResponse.data;
    },
    {
      enabled: !!spotify.auth,
    }
  );
  const {
    data: analysis,
    isLoading: fetchingAnalysis,
    error: analysisError,
  } = useQuery(
    ["analysis", router.query.track_id],
    async () => {
      const id = router.query.track_id;
      if (typeof id !== "string") {
        throw new Error("404");
      }
      const analysisResponse = await spotify.fetchTrackAnalysis(id);
      if (!analysisResponse?.ok) {
        toast.error("Error: Could Not Fetch Spotify Data");
        throw new Error("Error: Could Not Fetch Spotify Data");
      }
      return analysisResponse.data;
    },
    {
      enabled: !!spotify.auth,
    }
  );
  const {
    data: artists,
    isLoading: fetchingArtists,
    error: artistsError,
  } = useQuery(
    ["artists", track?.artists.map((artist) => artist.id)],
    async () => {
      if (!track) {
        throw new Error("404");
      }
      const artistsResponse = await spotify.fetchArtists(
        track.artists.map((artist) => artist.id)
      );
      if (!artistsResponse?.ok) {
        toast.error("Error: Could Not Fetch Spotify Data");
        throw new Error("Error: Could Not Fetch Spotify Data");
      }
      return artistsResponse.data;
    },
    {
      enabled: !!spotify.auth && !fetchingTrack,
    }
  );

  if (fetchingTrack || fetchingAnalysis || fetchingArtists) {
    return <Loading />;
  }

  if (
    (!track || trackError) ??
    (!analysis || analysisError) ??
    (!artists || artistsError)
  ) {
    return <ErrorView />;
  }

  return (
    <>
      <Head>
        <title>Create Sloop</title>
      </Head>
      <div className="flex flex-1 flex-col px-4 py-6">
        <h2 className="font-display text-xl text-gray-400 sm:text-2xl">
          Create
        </h2>
        <h1 className="mb-4 border-b border-gray-300 pb-4 text-4xl font-semibold sm:text-5xl">
          Sloop
        </h1>
        <div ref={imageContainerRef} className="flex">
          <SafeImage
            url={track.album.images[0]?.url}
            alt={track.name}
            width={width * 0.15}
            square
            className="relative aspect-square flex-shrink-0 overflow-hidden rounded-md"
          />
          <div className="ml-4 flex flex-1 flex-col justify-between overflow-hidden">
            <h3 className="truncate font-display text-lg font-semibold sm:text-xl">
              {track.name}
            </h3>
            <p className="truncate text-sm text-gray-400 sm:text-base">
              {track.artists.map((artist, index) =>
                index === track.artists.length - 1
                  ? artist.name
                  : `${artist.name}, `
              )}
            </p>
          </div>
        </div>
        <Formik
          initialValues={{
            name: "",
            description: "",
          }}
          validationSchema={yup.object().shape({
            name: yup.string().required("Required"),
            description: yup.string().max(500, "Max 500 Chars"),
          })}
          onSubmit={async (values: SloopValues) => {
            try {
              const response = await createSloop({
                ...values,
                trackId: track.id,
                trackName: track.name,
                trackImage: track.album.images[0]?.url,
                artists: artists.artists.map((artist) => {
                  return {
                    spotifyId: artist.id,
                    image: artist.images[0]?.url,
                    name: artist.name,
                  };
                }),
                duration: analysis.track.duration,
                key: analysis.track.key,
                mode: analysis.track.mode,
                tempo: analysis.track.tempo,
                timeSignature: analysis.track.time_signature,
              });
              void router.replace(`/editor/${response}?private=true`);
            } catch (error) {
              if (error instanceof TRPCClientError) {
                toast.error(`Error: ${error.message}`);
                if (error.message.includes("Verify")) {
                  void router.push("/settings");
                }
              }
              return;
            }
          }}
        >
          {({ errors, touched, isSubmitting, values }) => (
            <Form className="mt-12 w-full">
              <StyledTitle title="General" />
              <StyledLabel
                label="Name"
                error={errors.name}
                touched={touched.name}
              />
              <StyledField id="name" name="name" />
              <StyledLabel
                label="Description"
                error={errors.description}
                touched={touched.description}
              />
              <StyledTextArea
                id="description"
                name="description"
                style={{ marginBottom: 0 }}
              />
              <p className="mb-6 w-full text-right text-xs text-gray-400 sm:text-sm">
                {`${
                  values.description ? 500 - values.description.length : 500
                } Chars Left`}
              </p>
              <StyledLoadingButton
                label="create"
                loading={isSubmitting}
                disabled={isSubmitting}
              />
            </Form>
          )}
        </Formik>
      </div>
    </>
  );
};

export default WithAuth(Create, { linked: true });
