import { type HTMLAttributes } from "react";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";

interface CarouselProps extends HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

const Carousel: React.FC<CarouselProps> = ({ children, ...props }) => {
  return (
    <ScrollArea {...props} dir="ltr">
      <div className="flex w-max gap-2">{children}</div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};
export default Carousel;
