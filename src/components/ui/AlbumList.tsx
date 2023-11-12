import clsx from "clsx";
import { type Album } from "spotify-types";
import { useRouter } from "next/router";
import { useElementSize } from "usehooks-ts";
import SafeImage from "../safeImage";

interface AlbumListProps {
  albums: Album[];
  noImages?: boolean;
  numbered?: boolean;
}

const AlbumList: React.FC<AlbumListProps> = ({
  albums,
  noImages,
  numbered,
}) => {
  const router = useRouter();
  const [imageContainerRef, { width }] = useElementSize();
  return (
    <ul ref={imageContainerRef} className="w-full flex-1">
      {albums.map((album, index) => {
        return (
          <li
            key={album.id}
            className={clsx(
              "flex cursor-pointer",
              index !== albums.length - 1 &&
                "mb-2 border-b border-gray-300 pb-2"
            )}
            onClick={() => void router.push(`/album/${album.id}`)}
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
                url={album.images[0]?.url}
                alt={album.name}
                width={width * 0.13}
                className="relative mr-4 aspect-square flex-shrink-0 overflow-hidden rounded"
                square
              />
            )}
            <div
              style={{ height: width * 0.13 }}
              className="flex flex-col justify-between overflow-hidden"
            >
              <h3 className="truncate text-lg font-semibold leading-tight sm:text-xl">
                {album.name}
              </h3>
              <p className="truncate text-sm text-gray-400 sm:text-base">
                {album.artists.map((artist, index) =>
                  index === album.artists.length - 1
                    ? artist.name
                    : `${artist.name}, `
                )}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
};
export default AlbumList;
