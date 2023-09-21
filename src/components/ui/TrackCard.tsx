import Link from "next/link";
import { type Track } from "spotify-types";
import SafeImage from "./SafeImage";

interface TrackCardProps {
  width: number;
  track: Track;
}

const TrackCard: React.FC<TrackCardProps> = ({ width, track }) => {
  return (
    <Link style={{ width: width / 3 }} href={`/track/${track.id}`}>
      <SafeImage
        className="relative mb-2 aspect-square overflow-hidden rounded-md"
        url={track.album.images[0]?.url}
        alt={track.name}
        square
        width={width / 3}
      />
      <p className="truncate text-sm font-semibold sm:text-base">
        {track.name}
      </p>
    </Link>
  );
};
export default TrackCard;
