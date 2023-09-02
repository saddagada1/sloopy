import clsx from "clsx";
import { motion } from "framer-motion";
import { type Dispatch, type SetStateAction, useEffect } from "react";

interface PopoverProps {
  setVisible: Dispatch<SetStateAction<boolean>>;
  children?: React.ReactNode;
  className?: string;
  x?: "left" | "right";
  y?: "top" | "bottom";
  animate?: string;
}

const Popover: React.FC<PopoverProps> = ({
  setVisible,
  children,
  className,
  x,
  y,
  animate,
}) => {
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if ((event.target as HTMLElement).closest("button")) {
        return;
      }
      setVisible(false);
    };

    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [setVisible]);

  return (
    <motion.div
      initial={{ translateY: "0%", opacity: 0 }}
      animate={{ translateY: animate ?? "-25%", opacity: 1 }}
      exit={{ translateY: "0%", opacity: 0 }}
      transition={{ type: "tween", duration: 0.2 }}
      className={clsx(
        "absolute z-50 rounded-md border border-gray-300 bg-primary p-2",
        x === "left" && "right-full",
        x === "right" && "left-full",
        y === "top" && "bottom-full",
        y === "bottom" && "top-full",
        className
      )}
    >
      {children}
    </motion.div>
  );
};
export default Popover;
