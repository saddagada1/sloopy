import { TRPCClientError } from "@trpc/client";
import { Form, Formik, type FormikHelpers } from "formik";
import { AnimatePresence } from "framer-motion";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  PiAppleLogo,
  PiCheckCircle,
  PiSpotifyLogo,
  PiXCircle,
} from "react-icons/pi";
import * as yup from "yup";
import LabelValueBar from "~/components/ui/LabelValueBar";
import Modal from "~/components/ui/Modal";
import StyledField from "~/components/ui/form/StyledField";
import StyledLabel from "~/components/ui/form/StyledLabel";
import StyledLoadingButton from "~/components/ui/form/StyledLoadingButton";
import StyledTextArea from "~/components/ui/form/StyledTextArea";
import StyledTitle from "~/components/ui/form/StyledTitle";
import { useSpotifyContext } from "~/contexts/Spotify";
import { env } from "~/env.mjs";
import { api } from "~/utils/api";
import { spotifyScopes } from "~/utils/constants";

interface GeneralValues {
  username: string;
  email: string;
}

interface SecurityValues {
  password: string;
  confirmPassword: string;
}

interface AboutValues {
  name: string;
  bio: string;
}

const Settings: NextPage = ({}) => {
  const params = useSearchParams();
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const spotify = useSpotifyContext();
  const [editProvider, setEditProvider] = useState(false);
  const [providerToEdit, setProviderToEdit] = useState<string | null>(null);
  const { mutateAsync: unlinkSpotifyAccount, isLoading: isUnlinking } =
    api.spotify.unlinkSpotifyAccount.useMutation();

  useEffect(() => {
    if (params.get("code")) {
      void spotify?.linkAccount(params);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSpotifyAccountChange = async () => {
    if (!session?.user.spotifyLinked) {
      const state = Math.random().toString(36);
      localStorage.setItem("spotify_state", state);
      void router.push(
        `https://accounts.spotify.com/authorize?response_type=code&client_id=${env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID}&scope=${spotifyScopes}&redirect_uri=http://localhost:3000/settings&state=${state}`
      );
      return;
    } else {
      const unlinkSpotify = toast.loading("Unlinking Spotify Account...");
      try {
        await unlinkSpotifyAccount();
        toast.remove(unlinkSpotify);
        spotify?.setAuth(null);
        toast.success("Success: Unlinked Spotify Account", { duration: 4000 });
        await router.replace("/settings", undefined, { shallow: true });
        await updateSession();
        return;
      } catch (error) {
        toast.remove(unlinkSpotify);
        if (error instanceof TRPCClientError) {
          toast.error(`Error: ${error.message}. Please Try Again`);
        }
        return;
      }
    }
  };

  return (
    <>
      <Head>
        <title>Sloopy - Settings</title>
      </Head>
      <AnimatePresence>
        {editProvider && providerToEdit === "spotify" && (
          <Modal setVisible={setEditProvider}>
            <StyledTitle title="spotify" />
            <LabelValueBar
              label="status"
              value={
                session?.user.spotifyLinked ? (
                  <>
                    Account Linked
                    <PiCheckCircle className="ml-2 text-xl text-green-500" />
                  </>
                ) : (
                  <>
                    Not Linked
                    <PiXCircle className="ml-2 text-xl text-red-500" />
                  </>
                )
              }
              style="bg-gray-200 mb-4"
            />
            <StyledLoadingButton
              onClick={() => void handleSpotifyAccountChange()}
              label={
                session?.user.spotifyLinked ? "unlink account" : "link account"
              }
              loading={isUnlinking}
              disabled={isUnlinking}
            />
          </Modal>
        )}
      </AnimatePresence>
      <div className="flex flex-col px-4 pb-12 pt-6">
        <StyledTitle title="providers" />
        <div className="flex w-full gap-2">
          <button
            onClick={() => {
              setEditProvider(true);
              setProviderToEdit("spotify");
            }}
            className="relative flex aspect-video flex-1 flex-col items-center justify-center rounded-md border border-secondary bg-secondary p-2 font-display text-lg font-medium text-primary sm:text-xl"
          >
            <PiSpotifyLogo className="mr-2 text-3xl sm:text-4xl" /> spotify
            {session?.user.spotifyLinked ? (
              <PiCheckCircle className="text-md absolute right-1 top-1 text-green-500" />
            ) : (
              <PiXCircle className="text-md absolute right-1 top-1 text-red-500" />
            )}
          </button>
          <button
            // implement apple music
            disabled
            className="relative flex aspect-video flex-1 flex-col items-center justify-center rounded-md border border-secondary bg-secondary p-2 font-display text-lg font-medium text-primary disabled:opacity-75 sm:text-xl"
          >
            <PiAppleLogo className="mr-2 text-3xl sm:text-4xl" /> music
            <PiXCircle className="text-md absolute right-1 top-1 text-red-500" />
          </button>
        </div>
        <Formik
          initialValues={{
            username: "",
            email: "",
          }}
          validationSchema={yup.object().shape({
            email: yup.string().email("Invalid Format"),
            username: yup
              .string()
              .min(3, "Min 3 Chars Required")
              .matches(/^[A-Za-z0-9]*$/, "Only ABC's & Numbers")
              .max(20, "Max 20 Chars"),
          })}
          onSubmit={(
            values: GeneralValues,
            { setErrors, resetForm }: FormikHelpers<GeneralValues>
          ) => {
            if (values.username) {
            }

            if (values.email) {
            }
          }}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form className="mt-12 w-full">
              <StyledTitle title="general" />
              <StyledLabel
                label="Username"
                error={errors.username}
                touched={touched.username}
              />
              <StyledField
                id="username"
                name="username"
                placeholder={session!.user.username}
              />
              <StyledLabel
                label="Email"
                error={errors.email}
                touched={touched.email}
              />
              <StyledField
                id="email"
                name="email"
                placeholder={session!.user.email}
                type="email"
                style={{ marginBottom: "24px" }}
              />
              <StyledLoadingButton
                label="update"
                loading={isSubmitting}
                disabled={isSubmitting}
              />
            </Form>
          )}
        </Formik>
        <Formik
          initialValues={{
            password: "",
            confirmPassword: "",
          }}
          validationSchema={yup.object().shape({
            password: yup
              .string()
              .min(8, "Min 8 Chars Required")
              .required("Required"),
            confirmPassword: yup
              .string()
              .oneOf([yup.ref("password"), undefined], "Does Not Match"),
          })}
          onSubmit={(
            values: SecurityValues,
            { setErrors, resetForm }: FormikHelpers<SecurityValues>
          ) => {
            return;
          }}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form className="mt-12 w-full">
              <StyledTitle title="security" />
              <StyledLabel
                label="Password"
                error={errors.password}
                touched={touched.password}
              />
              <StyledField
                id="password"
                name="password"
                placeholder="********"
                type="password"
              />
              <StyledLabel
                label="Confirm Password"
                error={errors.confirmPassword}
                touched={touched.confirmPassword}
              />
              <StyledField
                id="confirmPassword"
                name="confirmPassword"
                placeholder="********"
                type="password"
                style={{ marginBottom: "24px" }}
              />
              <StyledLoadingButton
                label="update"
                loading={isSubmitting}
                disabled={isSubmitting}
              />
            </Form>
          )}
        </Formik>
        <Formik
          initialValues={{
            name: session!.user.name ?? "",
            bio: session!.user.name ?? "",
          }}
          validationSchema={yup.object().shape({
            name: yup.string().max(20, "Max 20 Chars"),
            bio: yup.string().max(500, "Max 500 Chars"),
          })}
          onSubmit={(
            values: AboutValues,
            { setErrors, resetForm }: FormikHelpers<AboutValues>
          ) => {
            return;
          }}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form className="mt-12 w-full">
              <StyledTitle title="about" />
              <StyledLabel
                label="Name"
                error={errors.name}
                touched={touched.name}
              />
              <StyledField id="name" name="name" />
              <StyledLabel
                label="Bio"
                error={errors.bio}
                touched={touched.bio}
              />
              <StyledTextArea
                id="bio"
                name="bio"
                style={{ marginBottom: "24px" }}
              />
              <StyledLoadingButton
                label="update"
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
export default Settings;
