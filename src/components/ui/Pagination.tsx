import clsx from "clsx";
import { type DetailedHTMLProps, type HTMLAttributes } from "react";
import { PiArrowLeft, PiArrowRight } from "react-icons/pi";
import { twMerge } from "tailwind-merge";

interface PaginationProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  page: number;
  children: React.ReactNode;
  onClickNext: () => void;
  onClickPrevious: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  page,
  children,
  onClickNext,
  onClickPrevious,
  hasNext,
  hasPrevious,
  ...DetailedHTMLProps
}) => {
  return (
    <>
      {children}
      <div
        {...DetailedHTMLProps}
        className={twMerge(
          "mt-2 flex w-full items-center gap-4 border-t border-gray-300 pt-6 font-display text-3xl sm:text-4xl",
          DetailedHTMLProps.className
        )}
      >
        <p className="flex-1">{page + 1}</p>
        <button
          onClick={() => onClickPrevious()}
          disabled={!hasPrevious}
          className={clsx(!hasPrevious && "text-gray-300")}
        >
          <PiArrowLeft />
        </button>
        <button
          onClick={() => onClickNext()}
          disabled={!hasNext}
          className={clsx(!hasNext && "text-gray-300")}
        >
          <PiArrowRight />
        </button>
      </div>
    </>
  );
};
export default Pagination;
