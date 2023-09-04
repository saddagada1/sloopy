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
import Image from "next/image";
import { PiXCircle } from "react-icons/pi";
import { api } from "~/utils/api";
import { TRPCClientError } from "@trpc/client";
import toast from "react-hot-toast";
import WithAuth from "~/components/utils/WithAuth";

interface SloopValues {
  name: string;
  description: string;
}

const Create: NextPage = ({}) => {
  const router = useRouter();
  const spotify = useSpotifyContext();
  const { mutateAsync: createSloop } = api.sloops.create.useMutation();
  const { data, isLoading, error } = useQuery(
    ["track", router.query.track_id],
    async () => {
      const id = router.query.track_id;
      if (typeof id !== "string") {
        throw new Error("404");
      }
      const trackResponse = await spotify.fetchTrack(id);
      const analysisResponse = await spotify.fetchTrackAnalysis(id);
      if (!trackResponse?.ok) {
        throw new Error(trackResponse?.message ?? "Fatal Error");
      }
      if (!analysisResponse?.ok) {
        throw new Error(analysisResponse?.message ?? "Fatal Error");
      }
      return { track: trackResponse.data, analysis: analysisResponse.data };
    },
    {
      enabled: !!spotify.auth,
    }
  );

  if (isLoading) {
    return <Loading />;
  }

  if (!data || error) {
    return <div>ERROR</div>;
  }
  return (
    <>
      <Head>
        <title>Create Sloop</title>
      </Head>
      <div className="flex flex-1 flex-col px-4 pb-12 pt-6">
        <h2 className="font-display text-xl text-gray-400 sm:text-2xl">
          Create
        </h2>
        <h1 className="mb-4 border-b border-gray-300 pb-4 text-4xl font-semibold sm:text-5xl">
          Sloop
        </h1>
        <div className="flex w-full">
          <div className="relative aspect-square w-1/6 flex-shrink-0 overflow-hidden rounded-md">
            <Image
              src={data.track.album.images[0]!.url}
              alt={data.track.name}
              sizes="13vw"
              fill
              className="object-cover"
            />
          </div>
          <div className="ml-4 flex flex-1 flex-col justify-between overflow-hidden">
            <h3 className="truncate font-display text-lg font-semibold sm:text-xl">
              {data.track.name}
            </h3>
            <p className="truncate text-sm text-gray-400 sm:text-base">
              {data.track.artists.map((artist, index) =>
                index === data.track.artists.length - 1
                  ? artist.name
                  : `${artist.name}, `
              )}
            </p>
          </div>
          <button>
            <PiXCircle className="text-3xl sm:text-4xl" />
          </button>
        </div>

        <Formik
          initialValues={{
            name: "",
            description: "",
          }}
          validationSchema={yup.object().shape({
            name: yup.string().max(20, "Max 20 Chars").required("Required"),
            description: yup.string().max(500, "Max 500 Chars"),
          })}
          onSubmit={async (values: SloopValues) => {
            try {
              const response = await createSloop({
                ...values,
                trackId: data.track.id,
                trackName: data.track.name,
                artists: data.track.artists.map((artist) => artist.name),
                duration: data.analysis.track.duration,
                key: data.analysis.track.key,
                mode: data.analysis.track.mode,
                tempo: data.analysis.track.tempo,
                timeSignature: data.analysis.track.time_signature,
              });
              void router.replace(`/editor/${response.id}`);
            } catch (error) {
              if (error instanceof TRPCClientError) {
                toast.error(`Error: ${error.message}`);
              }
              return;
            }
          }}
        >
          {({ errors, touched, isSubmitting }) => (
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
                style={{ marginBottom: "24px" }}
              />
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
