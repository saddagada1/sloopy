import { motion } from "framer-motion";
import { type DetailedHTMLProps, type HTMLAttributes, useState } from "react";
import { PiCaretDown, PiCaretUp } from "react-icons/pi";

interface LoopButtonProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  label: string;
  height: number;
  open?: boolean;
  children: React.ReactNode;
}

const LoopButton: React.FC<LoopButtonProps> = ({
  children,
  label,
  height,
  open,
  ...DetailedHTMLProps
}) => {
  const [expand, setExpand] = useState(false);
  return (
    <div
      {...DetailedHTMLProps}
      className="flex flex-col rounded text-sm font-semibold sm:text-base"
    >
      <div className="flex items-center justify-between p-1.5">
        <p>{label}</p>
        {!open && (
          <button
            className="text-xl sm:text-2xl"
            onClick={() => setExpand(!expand)}
          >
            {expand ? <PiCaretUp /> : <PiCaretDown />}
          </button>
        )}
      </div>
      <motion.div
        className="overflow-hidden"
        initial={{ height: 0 }}
        animate={{ height: expand || open ? height : 0 }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default LoopButton;
