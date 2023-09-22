import Link from "next/link";
import { type Track as SpotifyTrack } from "spotify-types";
import SafeImage from "./SafeImage";
import { type Track } from "@prisma/client";

interface TrackCardProps {
  width: number;
  track: SpotifyTrack | Track;
}

const TrackCard: React.FC<TrackCardProps> = ({ width, track }) => {
  return (
    <Link style={{ width: width / 3 }} href={`/track/${track.id}`}>
      <SafeImage
        className="relative mb-2 aspect-square overflow-hidden rounded-md"
        url={"album" in track ? track.album.images[0]?.url : track.image}
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
