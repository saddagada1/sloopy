import { type DetailedHTMLProps, type HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";
import StyledLoadingButton from "./form/StyledLoadingButton";

interface ScrollPaginationProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  children: React.ReactNode;
  onClickNext: () => void;
  hasNext: boolean;
  fetchingNext: boolean;
}

const ScrollPagination: React.FC<ScrollPaginationProps> = ({
  children,
  onClickNext,
  hasNext,
  fetchingNext,
  ...DetailedHTMLProps
}) => {
  return (
    <>
      <div
        {...DetailedHTMLProps}
        className={twMerge(
          "flex w-full flex-col items-center gap-4",
          DetailedHTMLProps.className
        )}
      >
        {children}
        {hasNext && (
          <StyledLoadingButton
            label="Show More"
            loading={fetchingNext}
            disabled={fetchingNext}
            onClick={() => onClickNext()}
            className="w-1/2"
          />
        )}
      </div>
    </>
  );
};

export default ScrollPagination;
