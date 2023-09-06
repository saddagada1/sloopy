import Avatar from "boring-avatars";
import { rand } from "~/utils/calc";
import { pitchClassColours } from "~/utils/constants";
import Image from "next/image";

interface SafeImageProps {
  url?: string | null;
  alt: string;
  width: number;
  className: string;
  square?: boolean;
  colours?: string[];
}

const SafeImage: React.FC<SafeImageProps> = ({
  url,
  alt,
  width,
  className,
  square,
  colours,
}) => {
  return (
    <div style={{ width }} className={className}>
      {url ? (
        <Image
          src={url}
          alt={alt}
          sizes={`${width}px`}
          fill
          className="object-cover"
        />
      ) : (
        <Avatar
          size={width}
          name={alt}
          variant="marble"
          square={square}
          colors={
            colours ?? [
              pitchClassColours[rand(0, 5)]!,
              pitchClassColours[rand(6, 11)]!,
            ]
          }
        />
      )}
    </div>
  );
};
export default SafeImage;
