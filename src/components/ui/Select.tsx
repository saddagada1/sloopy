import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { PiCaretDown, PiCaretUp } from "react-icons/pi";
import { useElementSize } from "usehooks-ts";

interface SelectProps {
  data: { label: string; value: string }[];
  value: string;
  onSelectFocus?: (isOpen: boolean) => void;
  onSelect?: ({
    label,
    value,
    index,
  }: {
    label: string;
    value: string;
    index: number;
  }) => void;
  searchable?: boolean;
}

const Select: React.FC<SelectProps> = ({
  data,
  value,
  onSelect,
  onSelectFocus,
  searchable,
}) => {
  const [containerRef, { height }] = useElementSize();
  const inputRef = useRef<HTMLInputElement>(null!);
  const buttonRef = useRef<HTMLButtonElement>(null!);
  const [showDropdown, setShowDropdown] = useState(false);
  const [query, setQuery] = useState(value);

  const filteredData = useMemo(() => {
    return data.filter((item) =>
      item.label.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, data]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        (event.target as HTMLElement).isSameNode(inputRef.current) ||
        (event.target as HTMLElement).isSameNode(buttonRef.current)
      ) {
        return;
      }
      setQuery(value);
      setShowDropdown(false);
      onSelectFocus && onSelectFocus(false);
    };
    if (showDropdown) {
      document.addEventListener("click", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDropdown]);

  return (
    <div
      ref={containerRef}
      className="relative flex text-sm font-medium sm:text-base"
    >
      {searchable ? (
        <div className="mb-4 flex w-full items-center justify-between rounded-md border border-gray-300 bg-gray-200 p-2">
          <input
            onClick={() => {
              setQuery(value);
              setShowDropdown(!showDropdown);
              onSelectFocus && onSelectFocus(!showDropdown);
            }}
            ref={inputRef}
            value={showDropdown ? query : value ?? "Select"}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            className="mr-2 flex-1 bg-transparent focus:outline-none"
          />
          <span className="text-sm sm:text-base">
            {showDropdown ? <PiCaretUp /> : <PiCaretDown />}
          </span>
        </div>
      ) : (
        <button
          className="mb-4 flex w-full items-center justify-between rounded-md border border-gray-300 bg-gray-200 p-2"
          onClick={() => {
            setShowDropdown(!showDropdown);
            onSelectFocus && onSelectFocus(!showDropdown);
          }}
          ref={buttonRef}
        >
          <span>{value ?? "Select"}</span>
          <span className="text-sm sm:text-base">
            {showDropdown ? <PiCaretUp /> : <PiCaretDown />}
          </span>
        </button>
      )}
      <AnimatePresence>
        {showDropdown && (
          <motion.ul
            initial={{ translateY: 0, opacity: 0 }}
            animate={{ translateY: height, opacity: 1 }}
            exit={{ translateY: 0, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="no-scrollbar absolute z-50 flex max-h-40 w-full flex-col gap-1 overflow-y-scroll whitespace-nowrap rounded-md border border-gray-300 bg-primary p-1 shadow-md"
          >
            {searchable && filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <li
                  key={index}
                  onClick={() => {
                    onSelect &&
                      onSelect({
                        label: item.label,
                        value: item.value,
                        index: index,
                      });
                    setQuery(item.label);
                    setShowDropdown(false);
                  }}
                  className={clsx(
                    "rounded p-2 transition-colors hover:bg-gray-200",
                    item.label === value && "bg-gray-300"
                  )}
                >
                  {item.label}
                </li>
              ))
            ) : !searchable && data.length > 0 ? (
              data.map((item, index) => (
                <li
                  key={index}
                  onClick={() => {
                    onSelect &&
                      onSelect({
                        label: item.label,
                        value: item.value,
                        index: index,
                      });
                    setShowDropdown(false);
                  }}
                  className={clsx(
                    "rounded p-2 transition-colors hover:bg-gray-200",
                    item.label === value && "bg-gray-300"
                  )}
                >
                  {item.label}
                </li>
              ))
            ) : (
              <p className="rounded p-2 transition-colors hover:bg-gray-200">
                No Options
              </p>
            )}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};
export default Select;
