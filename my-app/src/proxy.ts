import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/images") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Get session from cookies - check for both secure (production) and non-secure (dev) cookie names
  const sessionCookie =
    request.cookies.get("__Secure-better-auth.session_token") ||
    request.cookies.get("__Secure-better-auth.session_token.0") ||
    request.cookies.get("better-auth.session_token") ||
    request.cookies.get("better-auth.session_token.0");

  // No session - can only access landing, register, login
  if (!sessionCookie) {
    const allowedRoutes = [
      "/",
      "/about",
      "/login",
      "/register",
      "/verify-your-email",
      "/verify-your-email/success",
    ];
    if (!allowedRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // Has session - redirect away from auth pages to choose-role
  // Let client-side handle role-based routing from choose-role
  if (sessionCookie && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/choose-role", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
