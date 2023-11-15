import { type HTMLAttributes } from "react";
import { cn } from "~/utils/shadcn/utils";

const NoData: React.FC<HTMLAttributes<HTMLParagraphElement>> = ({
  ...props
}) => {
  const { className, children, ...rest } = props;
  return (
    <p
      {...rest}
      className={cn("p flex-1 text-left font-normal text-input", className)}
    >
      {children ?? "Nothing to show here :("}
    </p>
  );
};
export default NoData;
