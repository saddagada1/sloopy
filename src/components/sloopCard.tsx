import Avatar from "boring-avatars";
import Link from "next/link";
import { calcSloopColours } from "~/utils/calc";
import { type ListSloop } from "~/utils/types";
import { Button } from "./ui/button";
import { Heart } from "lucide-react";
import React, { type HTMLAttributes } from "react";
import { cn } from "~/utils/shadcn/utils";
import { useWindowSize } from "usehooks-ts";
import { lgBreakpoint, lgCardSize, smCardSize } from "~/utils/constants";

interface SloopCardProps extends HTMLAttributes<HTMLButtonElement> {
  sloop: ListSloop;
}

const SloopCard = React.forwardRef<HTMLButtonElement, SloopCardProps>(
  ({ className, sloop, ...props }, ref) => {
    const { width: windowWidth } = useWindowSize();
    const width = windowWidth > lgBreakpoint ? lgCardSize : smCardSize;
    return (
      <Button
        {...props}
        ref={ref}
        variant="outline"
        size="base"
        className={cn("block p-2", className)}
        asChild
      >
        <Link href={`/sloop/${sloop.id}?private=${sloop.isPrivate}`}>
          <div className="relative mb-2 aspect-square overflow-hidden rounded-md">
            <Avatar
              size={width}
              name={sloop.name}
              square
              colors={calcSloopColours(sloop)}
            />
            <p className="absolute right-2 top-2 flex items-center gap-2 rounded bg-background/50 p-1 px-2 text-xs backdrop-blur-md">
              {sloop.rankedSloop?.likes.toLocaleString(undefined, {
                notation: "compact",
              })}
              <Heart strokeWidth={1} className="h-3 w-3 fill-foreground" />
            </p>
          </div>
          <p style={{ maxWidth: width }} className="p-lg truncate text-left">
            {sloop.name}
          </p>
          <p style={{ maxWidth: width }} className="p-sm truncate text-left">
            {sloop.track.name}
          </p>
          <p style={{ maxWidth: width }} className="p-xs truncate text-left">
            {sloop.artists.map((artist, index) =>
              index === sloop.artists.length - 1
                ? artist.name
                : `${artist.name}, `
            )}
          </p>
        </Link>
      </Button>
    );
  }
);
SloopCard.displayName = "SloopCard";

export default SloopCard;
