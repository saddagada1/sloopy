import clsx from "clsx";
import { type Track } from "spotify-types";
import { useRouter } from "next/router";
import { useElementSize } from "usehooks-ts";
import SafeImage from "./SafeImage";

interface TrackListProps {
  tracks: Track[];
}

const TrackList: React.FC<TrackListProps> = ({ tracks }) => {
  const router = useRouter();
  const [imageContainerRef, { width }] = useElementSize();
  return (
    <ul ref={imageContainerRef} className="w-full">
      {tracks.map((track, index) => {
        return (
          <li
            key={track.id}
            className={clsx(
              "flex",
              index !== tracks.length - 1 &&
                "mb-2 border-b border-gray-300 pb-2"
            )}
            onClick={() => void router.push(`/track/${track.id}`)}
          >
            <SafeImage
              url={track.album.images[0]?.url}
              alt={track.name}
              width={width * 0.13}
              className="relative aspect-square overflow-hidden rounded"
              square
            />
            <div className="ml-4 flex flex-col justify-between overflow-hidden">
              <h3 className="truncate font-display text-lg font-semibold sm:text-xl">
                {track.name}
              </h3>
              <p className="truncate text-sm text-gray-400 sm:text-base">
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
