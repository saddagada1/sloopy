import Link from "next/link";
import { type Track as SpotifyTrack } from "spotify-types";
import SafeImage from "./safeImage";
import { type Track } from "@prisma/client";
import { Button } from "./ui/button";
import React, { type HTMLAttributes } from "react";
import { cn } from "~/utils/shadcn/utils";
import { useWindowSize } from "usehooks-ts";
import { lgBreakpoint, lgCardSize, smCardSize } from "~/utils/constants";

interface TrackCardProps extends HTMLAttributes<HTMLButtonElement> {
  track: SpotifyTrack | Track;
}

const TrackCard = React.forwardRef<HTMLButtonElement, TrackCardProps>(
  ({ className, track, ...props }, ref) => {
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
        <Link className="space-y-2" href={`/track/${track.id}`}>
          <SafeImage
            className="overflow-hidden rounded-md pt-[100%]"
            url={"album" in track ? track.album.images[0]?.url : track.image}
            alt={track.name}
            square
            width={width}
          />
          <p style={{ maxWidth: width }} className="p-lg truncate text-left">
            {track.name}
          </p>
        </Link>
      </Button>
    );
  }
);
TrackCard.displayName = "TrackCard";
export default TrackCard;
