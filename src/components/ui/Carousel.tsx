import clsx from "clsx";
import { type DetailedHTMLProps, type HTMLAttributes } from "react";

interface CarouselProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  children?: React.ReactNode;
}

const Carousel: React.FC<CarouselProps> = ({
  children,
  ...DetailedHTMLProps
}) => {
  return (
    <div
      {...DetailedHTMLProps}
      className={clsx(
        "no-scrollbar grid auto-cols-max grid-flow-col grid-rows-1 gap-4 overflow-scroll",
        DetailedHTMLProps.className
      )}
    >
      {children}
    </div>
  );
};
export default Carousel;
