import { Button } from "./ui/button";
import SearchInput from "./searchInput";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { cn } from "~/utils/shadcn/utils";
import SafeImage from "./safeImage";

const UserMenu: React.FC = ({}) => {
  const { data: session } = useSession();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <SafeImage
            url={session?.user.image}
            alt={session?.user.name ?? session?.user.username}
            width={35}
            className="aspect-square overflow-hidden rounded-full"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 font-mono uppercase tracking-tight"
        align="end"
        forceMount
      >
        <DropdownMenuLabel>
          <p className="p-lg">{session?.user.name ?? session?.user.username}</p>
          <p className="p-sm font-normal">{session?.user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="p-lg">
          <DropdownMenuItem>
            <Link className="w-full" href="/profile">
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link className="w-full" href="/likes">
              Likes
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link className="w-full" href="/settings">
              Settings
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Button
            onClick={() => void signOut()}
            variant="ghost"
            className="p-0 uppercase"
          >
            Logout
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const Header: React.FC = ({}) => {
  const { status: sessionStatus } = useSession();
  const router = useRouter();
  return (
    <header className="hidden items-center gap-2 lg:flex">
      <div className="section flex-1">
        <SearchInput renderButton />
      </div>
      {sessionStatus !== "loading" && (
        <div className="section flex items-center justify-center gap-2">
          {sessionStatus === "authenticated" ? (
            <UserMenu />
          ) : (
            <>
              <Button
                variant="outline"
                asChild
                className={cn(
                  "uppercase",
                  router.pathname === "/register" && "bg-accent"
                )}
              >
                <Link href="/register">Sign Up</Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className={cn(
                  "uppercase",
                  router.pathname === "/login" && "bg-accent"
                )}
              >
                <Link href="/login">Login</Link>
              </Button>
            </>
          )}
        </div>
      )}
    </header>
  );
};
export default Header;
