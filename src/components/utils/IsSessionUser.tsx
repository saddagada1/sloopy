import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { type NextPage } from "next";
import Loading from "./Loading";
import { useSession } from "next-auth/react";

const IsSessionUser = (Page: NextPage) => {
  const CheckedComponent = () => {
    const { data: session } = useSession();
    const router = useRouter();
    const [isOk, setIsOk] = useState(false);

    useEffect(() => {
      if (session?.user.username === (router.query.username as string)) {
        void router.replace("/profile");
      } else {
        setIsOk(true);
      }
    }, [router, session?.user.username]);

    return isOk ? <Page /> : <Loading />;
  };

  return CheckedComponent;
};

export default IsSessionUser;
