import Link from "next/link";
import SafeImage from "./SafeImage";
import { type Playlist as SpotifyPlaylist } from "spotify-types";
import { type Playlist } from "~/contexts/Spotify";

interface PlaylistCardProps {
  width: number;
  playlist: SpotifyPlaylist | Playlist;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ width, playlist }) => {
  return (
    <Link style={{ width: width / 3 }} href={`/playlist/${playlist.id}`}>
      <SafeImage
        className="relative mb-2 aspect-square overflow-hidden rounded-md"
        url={playlist.images[0]?.url}
        alt={playlist.name}
        square
        width={width / 3}
      />
      <p className="truncate text-sm font-semibold sm:text-base">
        {playlist.name}
      </p>
    </Link>
  );
};
export default PlaylistCard;
