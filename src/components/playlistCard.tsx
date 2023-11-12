import Link from "next/link";
import SafeImage from "./safeImage";
import { type Playlist as SpotifyPlaylist } from "spotify-types";
import { type Playlist } from "~/contexts/Spotify";
import { Button } from "./ui/button";
import React, { type HTMLAttributes } from "react";
import { cn } from "~/utils/shadcn/utils";
import { useWindowSize } from "usehooks-ts";
import { lgBreakpoint, lgCardSize, smCardSize } from "~/utils/constants";

interface PlaylistCardProps extends HTMLAttributes<HTMLButtonElement> {
  playlist: SpotifyPlaylist | Playlist;
}

const PlaylistCard = React.forwardRef<HTMLButtonElement, PlaylistCardProps>(
  ({ className, playlist, ...props }, ref) => {
    const { width: windowWidth } = useWindowSize();
    const width = windowWidth > lgBreakpoint ? lgCardSize : smCardSize;
    return (
      <Button
        {...props}
        ref={ref}
        variant="outline"
        size="base"
        className={cn("block", className)}
        asChild
      >
        <Link className="space-y-2" href={`/playlist/${playlist.id}`}>
          <SafeImage
            className="aspect-square overflow-hidden rounded-md"
            url={playlist.images[0]?.url}
            alt={playlist.name}
            square
            width={width}
          />
          <p style={{ maxWidth: width }} className="p-lg truncate">
            {playlist.name}
          </p>
        </Link>
      </Button>
    );
  }
);
PlaylistCard.displayName = "PlaylistCard";
export default PlaylistCard;
