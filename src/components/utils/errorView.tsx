import { type HTMLAttributes } from "react";
import { cn } from "~/utils/shadcn/utils";

interface ErrorViewProps extends HTMLAttributes<HTMLDivElement> {
  code?: string;
  message?: string;
}

const ErrorView: React.FC<ErrorViewProps> = ({ code, message, ...props }) => {
  const { className, ...rest } = props;
  return (
    <div
      {...rest}
      className={cn(
        "mono section flex flex-1 flex-col items-center justify-center gap-2",
        className
      )}
    >
      <h1 className="text-3xl font-extrabold sm:text-4xl">{code ?? "404"}</h1>
      <p className="mx-12 text-center text-muted-foreground">
        {message ??
          "We couldn't find what you were looking for. If you are sure it exists please refresh the page and try again or check that the url is valid."}
      </p>
    </div>
  );
};

export default ErrorView;
