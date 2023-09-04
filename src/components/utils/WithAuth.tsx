import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { type NextPage } from "next";
import Loading from "./Loading";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

interface AuthRequirements {
  linked?: boolean;
  premium?: boolean;
}

const WithAuth = (Page: NextPage, requirements?: AuthRequirements) => {
  const AuthenticatedComponent = () => {
    const { data: session, status: sessionStatus } = useSession();
    const router = useRouter();
    const [isOk, setIsOk] = useState(false);

    useEffect(() => {
      if (sessionStatus !== "authenticated") {
        void router.push("/login");
      } else if (requirements?.linked && !session.user.spotifyLinked) {
        void router.push("/settings");
      } else if (requirements?.premium && !session.user.canPlaySpotify) {
        toast.error("Spotify Premium Required");
      } else {
        setIsOk(true);
      }
    }, [
      router,
      session?.user.canPlaySpotify,
      session?.user.spotifyLinked,
      sessionStatus,
    ]);

    return isOk ? <Page /> : <Loading />;
  };

  return AuthenticatedComponent;
};

export default WithAuth;
