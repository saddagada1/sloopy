import Link from "next/link";
import { type Track, type SimplifiedTrack } from "spotify-types";
import { Button } from "./ui/button";
import React, { type HTMLAttributes } from "react";
import { calcVideoTimestamp } from "~/utils/calc";
import SafeImage from "./safeImage";
import { type ListTrack } from "~/utils/types";

interface TrackButtonProps extends HTMLAttributes<HTMLButtonElement> {
  track: SimplifiedTrack | Track | ListTrack;
  renderImage?: boolean;
}

const TrackButton = React.forwardRef<HTMLButtonElement, TrackButtonProps>(
  ({ track, renderImage, ...props }, ref) => {
    return (
      <Button {...props} ref={ref} variant="outline" size="base" asChild>
        <Link className="flex items-center gap-2" href={`/track/${track.id}`}>
          {renderImage && (
            <SafeImage
              className="aspect-square overflow-hidden rounded"
              url={
                "album" in track
                  ? track.album.images[0]?.url
                  : "image" in track
                  ? track.image
                  : undefined
              }
              alt={track.name}
              square
              width={50}
            />
          )}
          <div className="flex-1 space-y-2 overflow-hidden">
            <p className="p-lg truncate">{track.name}</p>
            <p className="p-sm truncate">
              {track.artists.map((artist, index) =>
                index === track.artists.length - 1
                  ? artist.name
                  : `${artist.name}, `
              )}
            </p>
          </div>
          {"duration_ms" in track && (
            <p className="p-lg text-muted-foreground">
              {calcVideoTimestamp(Math.round(track.duration_ms / 1000))}
            </p>
          )}
        </Link>
      </Button>
    );
  }
);
TrackButton.displayName = "TrackButton";
export default TrackButton;
