import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Extract the access token from cookies
  const accessToken = request.cookies.get("accessToken")?.value;

  const loginUrl = new URL("/login", request.url);
  const homeUrl = new URL("/dashboard", request.url);

  // If no accessToken and trying to access protected routes, redirect to /login
  if (!accessToken && request.nextUrl.pathname !== "/login") {
    return NextResponse.redirect(loginUrl);
  }

  // If accessToken exists and trying to access /login or root /, redirect to dashboard
  if (accessToken && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/")) {
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg)$).*)",
  ],
};
