import clsx from "clsx";
import { useRouter } from "next/router";
import { useElementSize } from "usehooks-ts";
import SafeImage from "./SafeImage";
import { type Playlist } from "~/contexts/Spotify";

interface PlaylistListProps {
  playlists: Playlist[];
  noImages?: boolean;
  numbered?: boolean;
}

const PlaylistList: React.FC<PlaylistListProps> = ({
  playlists,
  noImages,
  numbered,
}) => {
  const router = useRouter();
  const [imageContainerRef, { width }] = useElementSize();
  return (
    <ul ref={imageContainerRef} className="w-full flex-1">
      {playlists.map((playlist, index) => {
        return (
          <li
            key={playlist.id}
            className={clsx(
              "flex cursor-pointer",
              index !== playlists.length - 1 &&
                "mb-2 border-b border-gray-300 pb-2"
            )}
            onClick={() => void router.push(`/playlist/${playlist.id}`)}
          >
            {numbered && (
              <div
                style={{ width: width * 0.13 }}
                className={clsx(
                  "mr-4 flex aspect-square flex-shrink-0 items-center justify-center rounded text-lg font-semibold sm:text-xl",
                  !noImages
                    ? "absolute left-4 z-10 bg-gray-200/25"
                    : "bg-gray-200"
                )}
              >
                {index + 1}
              </div>
            )}
            {!noImages && (
              <SafeImage
                url={playlist.images[0]?.url}
                alt={playlist.name}
                width={width * 0.13}
                className="relative mr-4 aspect-square flex-shrink-0 overflow-hidden rounded"
                square
              />
            )}
            <div
              style={{ height: width * 0.13 }}
              className="flex flex-col justify-between overflow-hidden"
            >
              <h3 className="truncate font-display text-lg font-semibold sm:text-xl">
                {playlist.name}
              </h3>
              <p className="truncate text-sm text-gray-400 sm:text-base">
                {playlist.owner.display_name}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
};
export default PlaylistList;
