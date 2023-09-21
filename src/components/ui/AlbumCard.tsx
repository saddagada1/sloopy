import Link from "next/link";
import SafeImage from "./SafeImage";
import { type SimplifiedAlbum } from "spotify-types";

interface AlbumCardProps {
  width: number;
  album: SimplifiedAlbum;
}

const AlbumCard: React.FC<AlbumCardProps> = ({ width, album }) => {
  return (
    <Link style={{ width: width / 3 }} href={`/album/${album.id}`}>
      <SafeImage
        className="relative mb-2 aspect-square overflow-hidden rounded-md"
        url={album.images[0]?.url}
        alt={album.name}
        square
        width={width / 3}
      />
      <p className="truncate text-sm font-semibold sm:text-base">
        {album.name}
      </p>
    </Link>
  );
};

export default AlbumCard;
