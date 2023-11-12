import { TRPCClientError } from "@trpc/client";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { useEffectOnce } from "usehooks-ts";
import Loading from "~/components/utils/loading";
import { api } from "~/utils/api";

const AccountVerification: NextPage = ({}) => {
  const router = useRouter();
  const { mutateAsync: verifyAccount } = api.users.verifyAccount.useMutation();

  const verify = async () => {
    const verifying = toast.loading("Verifying Account...");
    try {
      await verifyAccount({ token: router.query.token as string });
      toast.remove(verifying);
      toast.success("Success: Your Account Has Been Verified", {
        duration: 4000,
      });
      void router.replace("/");
    } catch (error) {
      if (error instanceof TRPCClientError) {
        toast.error(`Error: ${error.message}. Please Try Again`);
      } else {
        toast.error(`Error: Something Went Wrong. Please Try Again`);
      }
      void router.replace("/settings");
    }
  };

  useEffectOnce(() => {
    void verify();
  });

  return (
    <>
      <Head>
        <title>Sloopy - Account Verification</title>
      </Head>
      <Loading />
    </>
  );
};

export default AccountVerification;
