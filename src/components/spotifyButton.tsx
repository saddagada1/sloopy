import { type HTMLAttributes } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { Icons } from "./ui/icons";

interface SpotifyButtonProps extends HTMLAttributes<HTMLButtonElement> {
  uri: string;
}

const SpotifyButton: React.FC<SpotifyButtonProps> = ({ uri, ...props }) => {
  return (
    <Button {...props} variant="outline" size="base" asChild>
      <Link href={uri}>
        <Icons.spotify className="h-10 w-10" />
        <p className="mono mx-auto font-medium">Listen on Spotify</p>
      </Link>
    </Button>
  );
};
export default SpotifyButton;
