import { signIn } from "next-auth/react";
import { PiFacebookLogo, PiGoogleLogo } from "react-icons/pi";

const OAuthButtons: React.FC = ({}) => {
  return (
    <div className="relative my-6 flex w-full justify-center gap-2 border-t border-gray-300 pt-6">
      <p className="absolute top-0 -translate-y-1/2 bg-primary px-4 text-xs text-gray-400 sm:text-sm">
        Or With
      </p>
      <button
        onClick={() =>
          void signIn("google", {
            redirect: false,
            emailVerified: true,
            callbackUrl: "/",
          })
        }
        className="flex flex-1 items-center justify-center rounded border border-secondary p-2 font-display text-sm font-medium sm:text-base"
      >
        <PiGoogleLogo className="mr-2 text-xl sm:text-2xl" /> Google
      </button>
      <button
        onClick={() =>
          void signIn("facebook", {
            redirect: false,
            emailVerified: true,
            callbackUrl: "/",
          })
        }
        className="flex flex-1 items-center justify-center rounded border border-secondary p-2 font-display text-sm font-medium sm:text-base"
      >
        <PiFacebookLogo className="mr-2 text-xl sm:text-2xl" /> Facebook
      </button>
    </div>
  );
};

export default OAuthButtons;
