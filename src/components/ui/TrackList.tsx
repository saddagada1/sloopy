import clsx from "clsx";
import {
  type SimplifiedTrack as SimplifiedSpotifyTrack,
  type Track as SpotifyTrack,
} from "spotify-types";
import { useRouter } from "next/router";
import { useElementSize } from "usehooks-ts";
import SafeImage from "./SafeImage";
import { type ListTrack } from "~/utils/types";

interface TrackListProps {
  tracks: SpotifyTrack[] | SimplifiedSpotifyTrack[] | ListTrack[];
  noImages?: boolean;
  numbered?: boolean;
}

const TrackList: React.FC<TrackListProps> = ({
  tracks,
  noImages,
  numbered,
}) => {
  const router = useRouter();
  const [imageContainerRef, { width }] = useElementSize();
  return (
    <ul ref={imageContainerRef} className="w-full flex-1">
      {tracks.map((track, index) => {
        return (
          <li
            key={track.id}
            className={clsx(
              "flex cursor-pointer",
              index !== tracks.length - 1 &&
                "mb-2 border-b border-gray-300 pb-2"
            )}
            onClick={() => void router.push(`/track/${track.id}`)}
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
                url={
                  "album" in track
                    ? track.album.images[0]?.url
                    : "image" in track
                    ? track.image
                    : undefined
                }
                alt={track.name}
                width={width * 0.13}
                className="relative mr-4 aspect-square flex-shrink-0 overflow-hidden rounded"
                square
              />
            )}
            <div
              style={{ height: width * 0.13 }}
              className="flex flex-col justify-between overflow-hidden"
            >
              <p className="truncate text-lg font-semibold leading-tight sm:text-xl">
                {track.name}
              </p>
              <p className="truncate text-sm leading-tight text-gray-400 sm:text-base">
                {track.artists.map((artist, index) =>
                  index === track.artists.length - 1
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
export default TrackList;
