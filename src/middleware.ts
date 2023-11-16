import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth((req) => {
  const token = req.nextauth.token;
  if (
    req.nextUrl.pathname === "/library" ||
    req.nextUrl.pathname.includes("saved")
  ) {
    if (!token?.spotifyId) {
      return NextResponse.redirect(new URL("/settings", req.url));
    }
  }
});

export const config = {
  matcher: [
    "/library",
    "/profile",
    "/settings",
    "/likes",
    "/followers",
    "/following",
    "/create",
    "/saved/:path*",
    "/editor",
  ],
};
