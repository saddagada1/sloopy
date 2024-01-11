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
  imageSize?: number;
  imageOnly?: boolean;
}

const TrackButton = React.forwardRef<HTMLButtonElement, TrackButtonProps>(
  ({ track, renderImage, imageSize, imageOnly, ...props }, ref) => {
    return (
      <Button {...props} ref={ref} variant="outline" size="base" asChild>
        <Link
          className="relative flex items-center gap-2"
          href={`/track/${track.id}`}
        >
          {renderImage && (
            <SafeImage
              className="shrink-0 overflow-hidden rounded"
              style={{ height: imageSize ?? 50 }}
              url={
                "album" in track
                  ? track.album.images[0]?.url
                  : "image" in track
                  ? track.image
                  : undefined
              }
              alt={track.name}
              square
              width={imageSize ?? 50}
            />
          )}
          {!imageOnly && (
            <>
              <div className="flex-1 space-y-2 overflow-hidden">
                <p className="p-lg truncate text-left">{track.name}</p>
                <p className="p-sm truncate text-left">
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
            </>
          )}
        </Link>
      </Button>
    );
  }
);
TrackButton.displayName = "TrackButton";
export default TrackButton;
