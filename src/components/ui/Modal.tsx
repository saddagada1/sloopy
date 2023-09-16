import { motion } from "framer-motion";
import { type Dispatch, type SetStateAction } from "react";

interface ModalProps {
  setVisible: Dispatch<SetStateAction<boolean>>;
  disabled?: boolean;
  children?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ setVisible, disabled, children }) => {
  return (
    <div className="fixed top-0 z-50 flex h-screen w-screen items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        onClick={() => !disabled && setVisible(false)}
        className="absolute h-full w-full bg-secondary opacity-50"
      />
      <motion.div
        initial={{ translateY: "-25%", opacity: 0 }}
        animate={{ translateY: "0%", opacity: 1 }}
        exit={{ translateY: "25%", opacity: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="z-10 w-11/12 rounded-md bg-primary p-4 sm:w-10/12"
      >
        {children}
      </motion.div>
    </div>
  );
};

export default Modal;
