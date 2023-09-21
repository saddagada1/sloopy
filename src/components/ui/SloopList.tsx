import Avatar from "boring-avatars";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { PiHeartFill } from "react-icons/pi";
import { useElementSize } from "usehooks-ts";
import { calcRelativeTime, calcSloopColours } from "~/utils/calc";
import { type ListSloop } from "~/utils/types";

interface SloopListProps {
  sloops: ListSloop[];
  profile?: boolean;
}

const SloopList: React.FC<SloopListProps> = ({ sloops, profile }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [imageContainerRef, { width }] = useElementSize();

  return (
    <ul ref={imageContainerRef} className="flex w-full flex-1 flex-col gap-2">
      {sloops.map((sloop, index) => (
        <li
          className="flex cursor-pointer gap-4 rounded-lg border border-gray-300 bg-gray-200 p-2"
          key={index}
          onClick={() =>
            void router.push(
              profile ? `/profile/sloop/${sloop.id}` : `/sloop/${sloop.id}`
            )
          }
        >
          <div
            style={{ width: width * 0.25, height: width * 0.25 }}
            className="aspect-square overflow-hidden rounded-md"
          >
            <Avatar
              size={width * 0.25}
              name={sloop.name}
              variant="pixel"
              square
              colors={calcSloopColours(sloop)}
            />
          </div>
          <div className="flex flex-1 flex-col justify-between overflow-hidden">
            <div>
              <h3 className="truncate font-display text-lg font-semibold sm:text-xl">
                {sloop.name}
              </h3>
              <p className="truncate text-sm sm:text-base">
                {sloop.userId === session?.user.id
                  ? session.user.username
                  : sloop.userUsername}
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm sm:text-base">
              <p className="flex-1 truncate">
                {calcRelativeTime(sloop.updatedAt)}
              </p>
              <p className="flex items-center gap-2">
                {sloop._count.likes.toLocaleString(undefined, {
                  notation: "compact",
                })}
                <PiHeartFill className="text-xl sm:text-2xl" />
              </p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};
export default SloopList;
