import Link from "next/link";
import { type Artist as SpotifyArtist } from "spotify-types";
import SafeImage from "./SafeImage";
import { type Artist } from "@prisma/client";

interface ArtistCardProps {
  width: number;
  artist: SpotifyArtist | Artist;
}

const ArtistCard: React.FC<ArtistCardProps> = ({ width, artist }) => {
  return (
    <Link style={{ width: width / 3 }} href={`/artist/${artist.id}`}>
      <SafeImage
        className="relative mb-2 aspect-square overflow-hidden rounded-full"
        url={"images" in artist ? artist.images[0]?.url : artist.image}
        alt={artist.name}
        width={width / 3}
      />
      <p className="truncate text-sm font-semibold sm:text-base">
        {artist.name}
      </p>
    </Link>
  );
};

export default ArtistCard;
