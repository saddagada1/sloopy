import Avatar from "boring-avatars";
import Link from "next/link";
import { PiHeartFill } from "react-icons/pi";
import { calcSloopColours } from "~/utils/calc";
import { type ListSloop } from "~/utils/types";

interface SloopCardProps {
  width: number;
  sloop: ListSloop;
}

const SloopCard: React.FC<SloopCardProps> = ({ width, sloop }) => {
  return (
    <Link
      style={{ width: width * 0.3 }}
      href={`/sloop/${sloop.id}?private=${sloop.isPrivate}`}
    >
      <div className="relative mb-2 aspect-square overflow-hidden rounded-md">
        <Avatar
          size={width * 0.3}
          name={sloop.name}
          variant="marble"
          square
          colors={calcSloopColours(sloop)}
        />
        <p className="absolute right-0 top-0 flex items-center gap-2 rounded-es-lg bg-secondary px-2 py-0.5 text-xs text-primary sm:text-sm">
          {sloop.rankedSloop?.likes.toLocaleString(undefined, {
            notation: "compact",
          })}
          <PiHeartFill className="text-sm sm:text-base" />
        </p>
      </div>
      <p className="mb-1 truncate text-sm font-semibold sm:text-base">
        {sloop.name}
      </p>
      <p className="truncate text-xs font-medium text-gray-400 sm:text-sm">
        {sloop.track.name}
      </p>
      <p className="truncate text-[0.7rem] text-gray-400 sm:text-[0.825rem]">
        {sloop.artists.map((artist, index) =>
          index === sloop.artists.length - 1 ? artist.name : `${artist.name}, `
        )}
      </p>
    </Link>
  );
};

export default SloopCard;
