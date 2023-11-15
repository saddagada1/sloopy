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
import { env } from "~/env.mjs";
import { api } from "~/utils/api";

const UserMenu: React.FC = ({}) => {
  const { data: user } = api.users.getSessionUser.useQuery();
  if (!user) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="w-full">
          <SafeImage
            url={env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN + user?.image}
            alt={user?.name ?? user?.username}
            width={40}
            className="aspect-square shrink-0 overflow-hidden rounded-full"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 font-mono uppercase tracking-tight"
        align="end"
        forceMount
      >
        <DropdownMenuLabel>
          <p className="p-lg">{user?.name ?? user?.username}</p>
          <p className="p-sm font-normal">{user?.email}</p>
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
        <SearchInput className="h-full" renderButton />
      </div>
      {sessionStatus !== "loading" && (
        <div className="section flex h-full items-center justify-center gap-2">
          {sessionStatus === "authenticated" ? (
            <UserMenu />
          ) : (
            <>
              <Button
                variant="outline"
                asChild
                className={cn(
                  "uppercase",
                  router.pathname === "/sign-up" && "bg-accent"
                )}
              >
                <Link href="/sign-up">Sign Up</Link>
              </Button>
              <Button
                asChild
                className={cn(
                  "uppercase",
                  router.pathname === "/login" && "bg-primary/90"
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
