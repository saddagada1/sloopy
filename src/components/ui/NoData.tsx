import { type DetailedHTMLProps, type HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

interface NoDataProps
  extends DetailedHTMLProps<
    HTMLAttributes<HTMLParagraphElement>,
    HTMLParagraphElement
  > {
  children: React.ReactNode;
}

const NoData: React.FC<NoDataProps> = ({ children, ...DetailedHTMLProps }) => {
  return (
    <p
      {...DetailedHTMLProps}
      className={twMerge(
        "flex flex-1 items-center justify-center p-8 text-center font-display text-base text-gray-400 sm:text-lg",
        DetailedHTMLProps.className
      )}
    >
      {children}
    </p>
  );
};
export default NoData;
