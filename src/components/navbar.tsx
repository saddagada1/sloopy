import Link from "next/link";
import { Button } from "./ui/button";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import SearchInput from "./searchInput";
import { useRouter } from "next/router";
import { cn } from "~/utils/shadcn/utils";
import ImageSection from "./imageSection";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { LogOut, Moon, Sun, SunMoon } from "lucide-react";

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
      <Link href={href} className="flex flex-col space-y-2 text-left">
        <p className="p-lg w-full">{label}</p>
        <p className="p-sm w-full truncate font-normal">{description}</p>
      </Link>
    </Button>
  );
};

const SideNavbar: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <nav className="mono hidden w-[200px] shrink-0 flex-col justify-end gap-2 lg:flex 2xl:w-[300px]">
      <ImageSection className="aspect-square" animated />
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
        <div className="flex items-end">
          <p className="p-sm flex-1">2@23</p>
          <Button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            variant="outline"
            size="icon"
          >
            <SunMoon strokeWidth={1} />
          </Button>
        </div>
      </div>
    </nav>
  );
};

const Navbar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { status: sessionStatus } = useSession();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  return (
    <nav className="section flex w-full shrink-0 gap-2 lg:hidden">
      <ImageSection
        onClick={() => void router.push("/")}
        className="aspect-square h-full w-fit"
        animated
      />
      <div className="flex flex-1 flex-col gap-2">
        <div className="mono flex gap-2">
          {sessionStatus !== "loading" && (
            <>
              {sessionStatus === "authenticated" ? (
                <Button
                  variant="outline"
                  asChild
                  className={cn(
                    "flex-1 uppercase",
                    router.pathname === "/profile" && "bg-accent"
                  )}
                >
                  <Link href="/profile">Your Profile</Link>
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    asChild
                    className={cn(
                      "flex-1 uppercase",
                      router.pathname === "/sign-up" && "bg-accent"
                    )}
                  >
                    <Link href="/sign-up">Sign Up</Link>
                  </Button>
                  <Button
                    asChild
                    className={cn(
                      "flex-1 uppercase",
                      router.pathname === "/login" && "bg-primary/90"
                    )}
                  >
                    <Link href="/login">Login</Link>
                  </Button>
                </>
              )}
            </>
          )}
          <Sheet open={open} onOpenChange={(o) => setOpen(o)}>
            <SheetTrigger asChild>
              <Button variant="outline" className="mono">
                Menu
              </Button>
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
              <div className="flex items-end gap-2">
                <p className="p-sm flex-1">2@23</p>
                <Button
                  onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                  variant="outline"
                  size="icon"
                >
                  {theme === "light" ? (
                    <Moon strokeWidth={1} />
                  ) : (
                    <Sun strokeWidth={1} />
                  )}
                </Button>
                <Button
                  onClick={() => void signOut()}
                  variant="outline"
                  size="icon"
                >
                  <LogOut strokeWidth={1} />
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <SearchInput className="flex h-10" />
      </div>
    </nav>
  );
};

export { SideNavbar, Navbar };
