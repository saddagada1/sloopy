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
import { type User } from "@prisma/client";
import { toast } from "sonner";

const UserMenu: React.FC<{ user: Partial<User> }> = ({ user }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="w-full">
          <SafeImage
            url={
              user.image
                ? env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN + user.image
                : undefined
            }
            alt={user.name ?? user.username}
            width={40}
            className="shrink-0 overflow-hidden rounded-full pt-[100%]"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="ml-2">
          <p>{user.name ?? user.username}</p>
          <p className="p-sm font-normal">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Button variant="ghost" asChild className="w-full justify-start">
              <Link href="/profile">Profile</Link>
            </Button>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Button variant="ghost" asChild className="w-full justify-start">
              <Link href="/likes">Likes</Link>
            </Button>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Button variant="ghost" asChild className="w-full justify-start">
              <Link href="/settings">Settings</Link>
            </Button>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Button
            onClick={() => void signOut()}
            variant="ghost"
            className="mono w-full justify-start hover:bg-destructive hover:text-background"
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
  const { data: user, isLoading: fetchingUser } =
    api.users.getSessionUser.useQuery(undefined, {
      enabled: sessionStatus === "authenticated",
    });
  const router = useRouter();

  if (!fetchingUser && !user) {
    toast.error("Something went wrong. Please refresh.");
  }
  return (
    <header className="hidden items-center gap-2 lg:flex">
      <div className="section flex-1">
        <SearchInput className="h-full" renderButton />
      </div>
      {sessionStatus !== "loading" && (
        <div
          className={cn(
            "section flex h-full items-center justify-center gap-2",
            sessionStatus !== "authenticated" && "bg-muted"
          )}
        >
          {sessionStatus === "authenticated" ? (
            <>{user ? <UserMenu user={user} /> : null}</>
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
