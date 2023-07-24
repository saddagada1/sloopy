import Link from "next/link";
import { type Dispatch, type SetStateAction, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PiListBold, PiSmileyBlankBold } from "react-icons/pi";
import { useSession } from "next-auth/react";

interface SideMenuProps {
  setVisible: Dispatch<SetStateAction<boolean>>;
}

const SideMenu: React.FC<SideMenuProps> = ({ setVisible }) => {
  return (
    <div className="fixed z-50 flex h-screen w-screen">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        onClick={() => setVisible(false)}
        className="absolute h-full w-full bg-secondary"
      />
      <motion.div
        initial={{ translateX: "-100%" }}
        animate={{ translateX: "0%" }}
        exit={{ translateX: "-100%" }}
        transition={{ type: "tween", duration: 0.2 }}
        className="relative z-10 flex h-full w-11/12 flex-col overflow-scroll rounded-e-3xl bg-primary shadow-2xl will-change-transform sm:w-5/6"
      >
        <h1 className="my-6 ml-6 font-display text-4xl font-black">sloopy</h1>
        <Link className="mb-6 ml-6 text-sm uppercase" href="/profile">
          Help
        </Link>
        <Link className="mb-6 ml-6 text-sm uppercase" href="/profile">
          FAQ
        </Link>
        <Link className="mb-10 ml-6 text-sm uppercase" href="/profile">
          About
        </Link>
        <p className="mb-6 ml-6 text-xs uppercase">Sloopy &copy; 2023</p>
      </motion.div>
    </div>
  );
};

const Navbar: React.FC = () => {
  const { data: sessionData } = useSession();
  const [showSideMenu, setShowSideMenu] = useState(false);
  return (
    <>
      <nav className="fixed z-40 flex h-16 w-full items-center justify-center bg-primary p-4">
        {sessionData && (
          <button onClick={() => setShowSideMenu(true)} className="text-3xl">
            <PiListBold />
          </button>
        )}
        <Link
          href="/"
          className="flex-1 text-center font-display text-3xl font-black"
        >
          sloopy
        </Link>
        {sessionData && (
          <Link href="/profile" className="text-3xl">
            <PiSmileyBlankBold />
          </Link>
        )}
      </nav>
      <AnimatePresence>
        {showSideMenu && <SideMenu setVisible={setShowSideMenu} />}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
