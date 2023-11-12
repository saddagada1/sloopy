import Avatar from "boring-avatars";
import { pitchClassColours } from "~/utils/constants";
import Image from "next/image";
import { type HTMLAttributes, useState, Suspense } from "react";
import { cn } from "~/utils/shadcn/utils";
import { randomBytes } from "crypto";

const fallbackAlt = randomBytes(32).toString();

interface SafeImageProps extends HTMLAttributes<HTMLDivElement> {
  url?: string | null;
  alt?: string;
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
  ...props
}) => {
  const { className, style, ...rest } = props;
  const [error, setError] = useState(false);

  return (
    <div
      style={{ width, ...style }}
      {...rest}
      className={cn("relative", className)}
    >
      {url && !error ? (
        <Suspense
          fallback={
            <div className="absolute h-full w-full animate-pulse bg-muted-foreground" />
          }
        >
          <Image
            unoptimized
            src={url}
            alt={alt ?? fallbackAlt}
            sizes={`${width}px`}
            fill
            className="object-cover"
            onError={() => setError(true)}
          />
        </Suspense>
      ) : (
        <Avatar
          size={width}
          name={alt}
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
