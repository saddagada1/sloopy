import { useRef, type HTMLAttributes, type RefObject, useEffect } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "~/utils/shadcn/utils";
import { useIntersectionObserver } from "usehooks-ts";

interface InfinitePaginationProps extends HTMLAttributes<HTMLDivElement> {
  lastItem: RefObject<Element>;
  onLastItem: () => void;
}

const InfinitePagination: React.FC<InfinitePaginationProps> = ({
  lastItem,
  onLastItem,
  ...props
}) => {
  const { className, children, ...rest } = props;
  const container = useRef<HTMLDivElement>(null!);
  const observer = useIntersectionObserver(lastItem, {
    root: container.current,
  });

  useEffect(() => {
    if (observer?.isIntersecting) {
      onLastItem();
    }
  }, [onLastItem, observer]);
  return (
    <ScrollArea
      {...rest}
      dir="ltr"
      ref={container}
      className={cn("section flex-1", className)}
    >
      {children}
    </ScrollArea>
  );
};
export default InfinitePagination;
