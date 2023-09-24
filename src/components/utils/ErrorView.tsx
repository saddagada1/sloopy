import { type DetailedHTMLProps, type HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

interface ErrorViewProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  code?: string;
  message?: string;
}

const ErrorView: React.FC<ErrorViewProps> = ({
  code,
  message,
  ...DetailedHTMLProps
}) => {
  return (
    <div
      {...DetailedHTMLProps}
      className={twMerge(
        "flex flex-1 flex-col items-center justify-center gap-4 font-display",
        DetailedHTMLProps.className
      )}
    >
      <h1 className="text-3xl font-extrabold sm:text-4xl">{code ?? "404"}</h1>
      <p className="mx-12 text-center font-display text-base text-gray-400 sm:text-lg">
        {message ??
          "We couldn't find what you were looking for. If you are sure it exists please refresh the page and try again or check that the url is valid."}
      </p>
    </div>
  );
};

export default ErrorView;
