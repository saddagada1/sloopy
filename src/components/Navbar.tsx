import Link from "next/link";
import { Button } from "./ui/button";
import Avatar from "boring-avatars";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import SearchInput from "./searchInput";
import { useRouter } from "next/router";
import { cn } from "~/utils/shadcn/utils";
import { pitchClassColours } from "~/utils/constants";
import ImageSection from "./imageSection";

interface NavButtonProps {
  href: string;
  label: string;
  description: string;
}

const NavButton: React.FC<NavButtonProps> = ({ href, label, description }) => {
  const router = useRouter();
  return (
    <Button
      variant="outline"
      size="base"
      asChild
      className={cn("uppercase", router.pathname === href && "bg-accent")}
    >
      <Link href={href} className="flex gap-2">
        <Avatar
          size={40}
          name={label}
          colors={Object.keys(pitchClassColours).map(
            (key) => pitchClassColours[parseInt(key)]!
          )}
        />
        <div>
          <p className="p-lg">{label}</p>
          <p className="p-sm font-normal">{description}</p>
        </div>
      </Link>
    </Button>
  );
};

const SideNavbar: React.FC = () => {
  return (
    <nav className="mono hidden w-[300px] shrink-0 flex-col justify-end gap-2 lg:flex">
      <ImageSection alt="Sloopy" />
      <div className="section flex flex-1 flex-col">
        <Link href="/" className="t3 mb-6 font-extrabold uppercase">
          sloopy
        </Link>
        <p className="p-sm w-3/4">
          Empowering musicians to create, connect, and embrace their own unique
          sound.
        </p>
        <div className="mt-12 flex-1 space-y-2">
          <NavButton href="/" label="Discover" description="Something New" />
          <NavButton
            href="/trending"
            label="Trending"
            description="Something Popular"
          />
          <NavButton
            href="/favourites"
            label="Favourites"
            description="Something Loved"
          />
          <NavButton
            href="/library"
            label="Library"
            description="Something Personal"
          />
        </div>
        <p className="p-sm">2@23</p>
      </div>
    </nav>
  );
};

const Navbar: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="flex h-[80px] w-full shrink-0 gap-2 lg:hidden">
      <ImageSection
        className="aspect-square h-full w-fit"
        alt="Sloopy for Spotify"
      />
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex gap-2">
          <div className="flex-1 rounded-md border">hello</div>
          <Sheet open={open} onOpenChange={(o) => setOpen(o)}>
            <SheetTrigger asChild>
              <Button variant="outline">Menu</Button>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="mono flex h-5/6 flex-col p-2"
            >
              <Link href="/" className="t3 font-extrabold uppercase">
                sloopy
              </Link>
              <p className="p-sm w-3/4">
                Empowering musicians to create, connect, and embrace their own
                unique sound.
              </p>
              <div className="mt-12 flex-1 space-y-2">
                <NavButton
                  href="/"
                  label="Discover"
                  description="Something New"
                />
                <NavButton
                  href="/trending"
                  label="Trending"
                  description="Something Popular"
                />
                <NavButton
                  href="/favourites"
                  label="Favourites"
                  description="Something Loved"
                />
                <NavButton
                  href="/library"
                  label="Library"
                  description="Something Personal"
                />
              </div>
              <p className="p-sm">2@23</p>
            </SheetContent>
          </Sheet>
        </div>
        <SearchInput className="flex" />
      </div>
    </nav>
  );
};

export { SideNavbar, Navbar };
