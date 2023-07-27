import Link from "next/link";
import { type Dispatch, type SetStateAction, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PiList, PiSmileyBlank } from "react-icons/pi";
import { useSession } from "next-auth/react";
import clsx from "clsx";

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
  const { data: session } = useSession();
  const [showSideMenu, setShowSideMenu] = useState(false);
  return (
    <>
      <nav
        className={clsx(
          "fixed z-40 flex h-16 w-full items-center bg-primary p-4 sm:justify-center",
          session ? "justify-between" : "justify-end"
        )}
      >
        {session && (
          <button onClick={() => setShowSideMenu(true)} className="text-3xl">
            <PiList />
          </button>
        )}
        <Link
          href="/"
          className="font-display text-3xl font-extrabold sm:flex-1 sm:text-center sm:text-4xl"
        >
          sloopy
        </Link>
        {session && (
          <Link href="/profile" className="hidden text-3xl sm:block">
            <PiSmileyBlank />
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
