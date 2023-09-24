import Avatar from "boring-avatars";
import { pitchClassColours } from "~/utils/constants";
import Image from "next/image";
import { type DetailedHTMLProps, type HTMLAttributes, useState } from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

interface LoadingImageProps {
  url: string;
  alt: string;
  width: number;
}

const LoadingImage: React.FC<LoadingImageProps> = ({ url, alt, width }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      <Image
        src={url}
        alt={alt}
        sizes={`${width}px`}
        fill
        className={clsx("object-cover", !loaded && "opacity-0")}
        onLoadingComplete={() => setLoaded(true)}
      />
      {!loaded && (
        <div className="absolute h-full w-full animate-pulse bg-gray-200" />
      )}
    </>
  );
};

interface SafeImageProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  url?: string | null;
  alt: string;
  width: number;
  square?: boolean;
  colours?: string[];
}

const SafeImage: React.FC<SafeImageProps> = ({
  url,
  alt,
  width,
  square,
  colours,
  ...DetailedHTMLProps
}) => {
  const { className, ...props } = DetailedHTMLProps;
  return (
    <div
      style={{ width }}
      {...props}
      className={twMerge("relative", className)}
    >
      {url ? (
        <LoadingImage url={url} alt={alt} width={width} />
      ) : (
        <Avatar
          size={width}
          name={alt}
          variant="marble"
          square={square}
          colors={
            colours ??
            Object.keys(pitchClassColours).map(
              (key) => pitchClassColours[parseInt(key)]!
            )
          }
        />
      )}
    </div>
  );
};
export default SafeImage;
