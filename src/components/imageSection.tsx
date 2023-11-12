import { type HTMLAttributes } from "react";
import { useElementSize } from "usehooks-ts";
import SafeImage from "./safeImage";
import { cn } from "~/utils/shadcn/utils";

interface ImageSectionProps extends HTMLAttributes<HTMLDivElement> {
  url?: string | null;
  alt?: string;
  square?: boolean;
  colours?: string[];
}

const ImageSection: React.FC<ImageSectionProps> = ({
  url,
  alt,
  square,
  colours,
  ...props
}) => {
  const [container, { width }] = useElementSize();
  const { className, ...rest } = props;
  return (
    <div {...rest} className={cn("section", className)}>
      <div
        ref={container}
        className={cn(
          "overflow-hidden",
          square ? "rounded-md" : "rounded-full"
        )}
      >
        <SafeImage
          url={url}
          alt={alt}
          width={width}
          square={square}
          className="aspect-square"
          colours={colours}
        />
      </div>
    </div>
  );
};
export default ImageSection;
