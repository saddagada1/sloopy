import Link from "next/link";
import { type Artist as SpotifyArtist } from "spotify-types";
import SafeImage from "./safeImage";
import { type Artist } from "@prisma/client";
import { Button } from "./ui/button";
import React, { type HTMLAttributes } from "react";
import { cn } from "~/utils/shadcn/utils";
import { lgBreakpoint, lgCardSize, smCardSize } from "~/utils/constants";
import { useWindowSize } from "usehooks-ts";

interface ArtistCardProps extends HTMLAttributes<HTMLButtonElement> {
  artist: SpotifyArtist | Artist;
}

const ArtistCard = React.forwardRef<HTMLButtonElement, ArtistCardProps>(
  ({ className, artist, ...props }, ref) => {
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
        <Link className="space-y-2" href={`/artist/${artist.id}?tab=sloopy`}>
          <SafeImage
            className="aspect-square overflow-hidden rounded-full"
            url={"images" in artist ? artist.images[0]?.url : artist.image}
            alt={artist.name}
            width={width}
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
