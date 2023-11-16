import { signIn } from "next-auth/react";
import { Button } from "./button";
import { Icons } from "./icons";

const OAuthButtons: React.FC = ({}) => {
  return (
    <div className="section relative my-8 flex w-full max-w-[600px] justify-center gap-2 pt-8">
      <p className="mono absolute top-0 -translate-y-1/2 bg-background px-2 text-muted-foreground lg:text-xs">
        Or Continue With
      </p>
      <Button
        onClick={() =>
          void signIn("google", {
            redirect: false,
            emailVerified: true,
            callbackUrl: "/",
          })
        }
        variant="outline"
        className="mono w-full"
      >
        <Icons.google className="mr-2 h-4 w-4" /> Google
      </Button>
      <Button
        onClick={() =>
          void signIn("facebook", {
            redirect: false,
            emailVerified: true,
            callbackUrl: "/",
          })
        }
        variant="outline"
        className="mono w-full"
      >
        <Icons.facebook className="mr-2 h-4 w-4" /> Facebook
      </Button>
    </div>
  );
};

export default OAuthButtons;
