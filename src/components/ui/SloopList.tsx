import Avatar from "boring-avatars";
import clsx from "clsx";
import { useRouter } from "next/router";
import { PiHeartFill } from "react-icons/pi";
import { useElementSize } from "usehooks-ts";
import { calcSloopColours } from "~/utils/calc";
import { type ListSloop } from "~/utils/types";

interface SloopListProps {
  sloops: ListSloop[];
  profile?: boolean;
}

const SloopList: React.FC<SloopListProps> = ({ sloops, profile }) => {
  const router = useRouter();
  const [imageContainerRef, { width }] = useElementSize();

  return (
    <ul ref={imageContainerRef} className="flex w-full flex-1 flex-col">
      {sloops.map((sloop, index) => (
        <li
          className={clsx(
            "flex cursor-pointer items-start gap-4",
            index !== sloops.length - 1 && "mb-2 border-b border-gray-300 pb-2"
          )}
          key={index}
          onClick={() =>
            void router.push(
              profile
                ? `/profile/sloop/${sloop.id}?private=${!!sloop.isPrivate}`
                : `/sloop/${sloop.id}`
            )
          }
        >
          <div
            style={{ width: width * 0.2 }}
            className="relative aspect-square overflow-hidden rounded-md"
          >
            <Avatar
              size={width * 0.2}
              name={sloop.name}
              variant="marble"
              square
              colors={calcSloopColours(sloop)}
            />
          </div>
          <div
            style={{ height: width * 0.2 }}
            className="flex flex-1 flex-col justify-between overflow-hidden"
          >
            <p className="truncate text-lg font-semibold leading-tight sm:text-xl">
              {sloop.name}
            </p>
            <div>
              <p className="truncate text-sm font-medium text-gray-400 sm:text-base">
                {sloop.track.name}
              </p>
              <p className="truncate text-xs leading-tight text-gray-400 sm:text-sm">
                {sloop.artists.map((artist, index) =>
                  index === sloop.artists.length - 1
                    ? artist.name
                    : `${artist.name}, `
                )}
              </p>
            </div>
          </div>
          <p className="flex items-center gap-2 rounded-lg bg-secondary px-2 py-0.5 text-xs text-primary sm:text-sm">
            {sloop.rankedSloop?.likes.toLocaleString(undefined, {
              notation: "compact",
            })}
            <PiHeartFill className="text-sm sm:text-base" />
          </p>
        </li>
      ))}
    </ul>
  );
};

export default SloopList;
