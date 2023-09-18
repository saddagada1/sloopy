import Link from "next/link";
import { type Dispatch, type SetStateAction, useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  PiGear,
  PiHeart,
  PiHouse,
  PiList,
  PiSignOut,
  PiSmileyMeh,
  PiSpeakerHifi,
} from "react-icons/pi";
import { signOut, useSession } from "next-auth/react";
import clsx from "clsx";
import SearchInput from "./ui/SearchInput";
import Modal from "./ui/Modal";

interface MenuProps {
  setVisible: Dispatch<SetStateAction<boolean>>;
}

const Menu: React.FC<MenuProps> = ({ setVisible }) => {
  return (
    <Modal setVisible={setVisible}>
      <h1 className="mb-4 border-b border-gray-300 pb-4 font-display text-3xl font-extrabold sm:text-4xl">
        sloopy
      </h1>
      <SearchInput onSearch={() => setVisible(false)} />
      <div className="mb-6 flex justify-between text-3xl sm:text-4xl">
        <Link
          onClick={() => setVisible(false)}
          className="rounded-md border border-gray-300 bg-gray-200 p-2"
          href="/"
        >
          <PiHouse />
        </Link>
        <Link
          onClick={() => setVisible(false)}
          className="rounded-md border border-gray-300 bg-gray-200 p-2"
          href="/library"
        >
          <PiSpeakerHifi />
        </Link>
        <Link
          onClick={() => setVisible(false)}
          className="rounded-md border border-gray-300 bg-gray-200 p-2"
          href="/profile"
        >
          <PiSmileyMeh />
        </Link>
        <Link
          onClick={() => setVisible(false)}
          className="rounded-md border border-gray-300 bg-gray-200 p-2"
          href="/likes"
        >
          <PiHeart />
        </Link>
        <Link
          onClick={() => setVisible(false)}
          className="rounded-md border border-gray-300 bg-gray-200 p-2"
          href="/settings"
        >
          <PiGear />
        </Link>
        <button
          onClick={() => {
            void signOut();
            setVisible(false);
          }}
          className="rounded-md border border-red-500 bg-red-100 p-2 text-red-500"
        >
          <PiSignOut />
        </button>
      </div>
      <p className="w-full text-right text-xs text-gray-400 sm:text-sm">
        Sloopy &copy; 2023
      </p>
    </Modal>
  );
};

const Navbar: React.FC = () => {
  const { data: session } = useSession();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <>
      <nav
        className={clsx(
          "fixed top-0 z-40 flex h-16 w-full items-center bg-primary p-4",
          session ? "justify-between" : "justify-end"
        )}
      >
        {session && (
          <button onClick={() => setShowMenu(true)}>
            <PiList className="text-3xl sm:text-4xl" />
          </button>
        )}
        <Link
          href="/"
          className="font-display text-3xl font-extrabold sm:text-4xl"
        >
          sloopy
        </Link>
      </nav>
      <AnimatePresence>
        {showMenu && <Menu setVisible={setShowMenu} />}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
