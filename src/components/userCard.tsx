import Link from "next/link";
import SafeImage from "./safeImage";
import { Button } from "./ui/button";
import React, { type HTMLAttributes } from "react";
import { useWindowSize } from "usehooks-ts";
import { lgBreakpoint, lgCardSize, smCardSize } from "~/utils/constants";
import { cn } from "~/utils/shadcn/utils";

interface UserCardProps extends HTMLAttributes<HTMLButtonElement> {
  user: {
    username: string;
    image: string | null;
  };
}

const UserCard = React.forwardRef<HTMLButtonElement, UserCardProps>(
  ({ className, user, ...props }, ref) => {
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
        <Link className="space-y-2" href={`/${user.username}`}>
          <SafeImage
            className="aspect-square overflow-hidden rounded-full"
            url={user.image}
            alt={user.username}
            width={width}
          />
          <p style={{ maxWidth: width }} className="p-lg truncate">
            {user.username}
          </p>
        </Link>
      </Button>
    );
  }
);
UserCard.displayName = "UserCard";

export default UserCard;
