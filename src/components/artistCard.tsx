import Link from "next/link";
import { type Artist as SpotifyArtist } from "spotify-types";
import SafeImage from "./safeImage";
import { type Artist } from "@prisma/client";
import { Button } from "./ui/button";
import React, { type HTMLAttributes } from "react";
import { cn } from "~/utils/shadcn/utils";
import { lgBreakpoint, lgCardSize, smCardSize } from "~/utils/constants";
import { useElementSize, useWindowSize } from "usehooks-ts";

interface ArtistCardProps extends HTMLAttributes<HTMLButtonElement> {
  artist: SpotifyArtist | Artist;
  ignoreWidth?: boolean;
}

const ArtistCard = React.forwardRef<HTMLButtonElement, ArtistCardProps>(
  ({ className, artist, ignoreWidth, ...props }, ref) => {
    const { width: windowWidth } = useWindowSize();
    const width = windowWidth > lgBreakpoint ? lgCardSize : smCardSize;
    const [cardRef, { width: cardWidth }] = useElementSize();
    return (
      <Button
        {...props}
        ref={ref}
        variant="outline"
        size="base"
        className={cn("block", className)}
        asChild
      >
        <Link
          ref={cardRef}
          className="space-y-2 overflow-hidden"
          href={`/artist/${artist.id}?tab=sloopy`}
        >
          <SafeImage
            className="overflow-hidden rounded-full pt-[100%]"
            url={"images" in artist ? artist.images[0]?.url : artist.image}
            alt={artist.name}
            width={ignoreWidth ? cardWidth : width}
          />
          <p style={{ maxWidth: width }} className="p-lg truncate text-left">
            {artist.name}
          </p>
        </Link>
      </Button>
    );
  }
);
ArtistCard.displayName = "ArtistCard";

export default ArtistCard;
