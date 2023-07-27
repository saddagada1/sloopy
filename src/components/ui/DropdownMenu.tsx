import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { Children, useEffect, useState } from "react";
import { PiDotsThreeOutlineVerticalFill } from "react-icons/pi";

interface DropdownMenuProps {
  icon?: JSX.Element;
  children?: React.ReactNode;
  menuX?: "left" | "right";
  menuY?: "top" | "bottom";
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  icon,
  children,
  menuX,
  menuY,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if ((event.target as HTMLElement).closest("button")) {
        return;
      }
      setShowMenu(false);
    };
    if (showMenu) {
      document.addEventListener("click", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [showMenu]);

  return (
    <div className="relative flex items-center">
      <button onClick={() => setShowMenu(!showMenu)}>
        {icon ?? <PiDotsThreeOutlineVerticalFill className="text-xl" />}
      </button>
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ translateY: "-25%", opacity: 0 }}
            animate={{ translateY: "0%", opacity: 1 }}
            exit={{ translateY: "-25%", opacity: 0 }}
            transition={{ type: "tween", duration: 0.2 }}
            className={clsx(
              "absolute z-50 whitespace-nowrap rounded-md bg-primary p-1 shadow-md",
              menuX === "left" ? "right-full" : "left-full",
              menuY === "top" ? "bottom-full" : "top-full"
            )}
          >
            {Children.map(children, (child) => (
              <div className="rounded px-1.5 py-0.5 text-sm font-semibold transition-colors hover:bg-gray-300">
                {child}
              </div>
            )) ?? <p className="text-sm">No Options</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default DropdownMenu;
