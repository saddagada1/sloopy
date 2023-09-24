import clsx from "clsx";
import { useRouter } from "next/router";
import { useElementSize } from "usehooks-ts";
import SafeImage from "./SafeImage";
import { type ListArtist } from "~/utils/types";

interface ArtistListProps {
  artists: ListArtist[];
}

const ArtistList: React.FC<ArtistListProps> = ({ artists }) => {
  const router = useRouter();
  const [imageContainerRef, { width }] = useElementSize();
  return (
    <ul ref={imageContainerRef} className="w-full flex-1">
      {artists.map((artist, index) => (
        <li
          key={index}
          className={clsx(
            "flex cursor-pointer items-center",
            index !== artists.length - 1 && "mb-4 border-b border-gray-300 pb-4"
          )}
          onClick={() => void router.push(`/artist/${artist.id}`)}
        >
          <SafeImage
            url={artist.image}
            alt={artist.name}
            width={width * 0.13}
            className="relative mr-4 aspect-square flex-shrink-0 overflow-hidden rounded-full"
          />

          <h1 className="truncate text-lg font-semibold sm:text-xl">
            {artist.name}
          </h1>
        </li>
      ))}
    </ul>
  );
};

export default ArtistList;
