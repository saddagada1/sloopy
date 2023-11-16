import { Loader2 } from "lucide-react";
import { type HTMLAttributes } from "react";
import { cn } from "~/utils/shadcn/utils";

const Loading: React.FC<HTMLAttributes<HTMLDivElement>> = ({ ...props }) => {
  const { className, ...rest } = props;

  return (
    <div
      {...rest}
      className={cn(
        "section flex h-full w-full flex-1 items-center justify-center",
        className
      )}
    >
      <Loader2 className="h-10 w-10 animate-spin" />
    </div>
  );
};

export default Loading;
