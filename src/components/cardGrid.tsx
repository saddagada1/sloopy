import { type HTMLAttributes } from "react";
import { cn } from "~/utils/shadcn/utils";

const CardGrid: React.FC<HTMLAttributes<HTMLDivElement>> = ({ ...props }) => {
  const { className, children, ...rest } = props;
  return (
    <div
      {...rest}
      className={cn(
        "grid grid-flow-row grid-cols-3 gap-2 lg:grid-cols-8",
        className
      )}
    >
      {children}
    </div>
  );
};
export default CardGrid;
