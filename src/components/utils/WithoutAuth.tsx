import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { type NextPage } from "next";
import Loading from "./loading";
import { useSession } from "next-auth/react";

const WithoutAuth = (Page: NextPage) => {
  const UnauthenticatedComponent = () => {
    const { status: sessionStatus } = useSession();
    const router = useRouter();
    const [isOk, setIsOk] = useState(false);

    useEffect(() => {
      if (sessionStatus === "authenticated") {
        void router.replace("/");
      } else {
        setIsOk(true);
      }
    }, [router, sessionStatus]);

    return isOk ? <Page /> : <Loading />;
  };

  return UnauthenticatedComponent;
};

export default WithoutAuth;
