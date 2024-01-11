import Link from "next/link";
import SafeImage from "./safeImage";
import { type SimplifiedAlbum } from "spotify-types";
import { type HTMLAttributes } from "react";
import React from "react";
import { Button } from "./ui/button";
import { cn } from "~/utils/shadcn/utils";
import { useWindowSize } from "usehooks-ts";
import { lgBreakpoint, lgCardSize, smCardSize } from "~/utils/constants";

interface AlbumCardProps extends HTMLAttributes<HTMLButtonElement> {
  album: SimplifiedAlbum;
}

const AlbumCard = React.forwardRef<HTMLButtonElement, AlbumCardProps>(
  ({ className, album, ...props }, ref) => {
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
        <Link className="space-y-2" href={`/album/${album.id}`}>
          <SafeImage
            className="relative overflow-hidden rounded-md pt-[100%]"
            url={album.images[0]?.url}
            alt={album.name}
            square
            width={width}
          />
          <p style={{ maxWidth: width }} className="p-lg truncate text-left">
            {album.name}
          </p>
        </Link>
      </Button>
    );
  }
);
AlbumCard.displayName = "AlbumCard";
export default AlbumCard;
