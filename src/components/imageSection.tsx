import { type HTMLAttributes } from "react";
import { useElementSize } from "usehooks-ts";
import SafeImage from "./safeImage";
import { cn } from "~/utils/shadcn/utils";

interface ImageSectionProps extends HTMLAttributes<HTMLDivElement> {
  url?: string | null;
  alt?: string;
  square?: boolean;
  colours?: string[];
  animated?: boolean;
}

const ImageSection: React.FC<ImageSectionProps> = ({
  url,
  alt,
  square,
  colours,
  animated,
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
          className="pt-[100%]"
          colours={colours}
          animated={animated}
        />
      </div>
    </div>
  );
};
export default ImageSection;
