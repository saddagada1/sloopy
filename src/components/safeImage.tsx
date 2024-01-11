import { pitchClassColours } from "~/utils/constants";
import Image from "next/image";
import { type HTMLAttributes, useState } from "react";
import { cn } from "~/utils/shadcn/utils";
import { randomBytes } from "crypto";
import Gradient from "./gradient";

const fallbackAlt = randomBytes(32).toString();

interface SafeImageProps extends HTMLAttributes<HTMLDivElement> {
  url?: string | null;
  alt?: string;
  width: number;
  square?: boolean;
  colours?: string[];
  animated?: boolean;
}

const SafeImage: React.FC<SafeImageProps> = ({
  url,
  alt,
  width,
  square,
  colours,
  animated,
  ...props
}) => {
  const { className, style, ...rest } = props;
  const [error, setError] = useState(false);

  return (
    <div
      style={{ width, ...style }}
      {...rest}
      className={cn(
        "relative",
        square ? "rounded-md" : "rounded-full",
        className
      )}
    >
      {url && !error ? (
        <Image
          unoptimized
          src={url}
          alt={alt ?? fallbackAlt}
          sizes={`${width}px`}
          fill
          className="object-cover"
          onError={() => setError(true)}
        />
      ) : (
        <Gradient
          colours={
            colours ??
            Object.values(pitchClassColours).filter((_, i) => i % 2 === 0)
          }
          className="absolute left-0 top-0"
          animated={animated}
        />
      )}
    </div>
  );
};
export default SafeImage;
