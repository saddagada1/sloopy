import Avatar from "boring-avatars";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { PiHeartFill } from "react-icons/pi";
import { calcRelativeTime, calcSloopColours } from "~/utils/calc";
import { type ListSloop } from "~/utils/types";

interface SloopCardProps {
  width: number;
  sloop: ListSloop;
}

const SloopCard: React.FC<SloopCardProps> = ({ width, sloop }) => {
  const { data: session } = useSession();
  return (
    <Link
      style={{ width: width / 3 }}
      href={`/sloop/${sloop.id}`}
      className="rounded-md border border-gray-300 bg-gray-200 p-2"
    >
      <div className="mb-2 aspect-square overflow-hidden rounded-md">
        <Avatar
          size={width / 3}
          name={sloop.name}
          variant="pixel"
          square
          colors={calcSloopColours(sloop)}
        />
      </div>
      <p className="truncate text-sm font-semibold sm:text-base">
        {sloop.name}
      </p>
      <p className="truncate text-xs sm:text-sm">
        {sloop.userId === session?.user.id
          ? session.user.username
          : sloop.userUsername}
      </p>
      <div className="mt-2 flex items-center gap-4 text-xs sm:text-sm">
        <p className="flex-1 truncate">{calcRelativeTime(sloop.updatedAt)}</p>
        <p className="flex items-center gap-2">
          {sloop._count.likes.toLocaleString(undefined, {
            notation: "compact",
          })}
          <PiHeartFill className="text-base sm:text-lg" />
        </p>
      </div>
    </Link>
  );
};

export default SloopCard;
