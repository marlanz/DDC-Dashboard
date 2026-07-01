import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export default function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  const isLoggedIn = !!sessionCookie;

  const { pathname } = request.nextUrl;

  const protectedRoutes = [
    "/dashboard",
    "/equipments",
    "/equipment-groups",
    "/factories",
    "/workcenters",
    "/maintenance",
    "/reports",
    "/settings",
  ];

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Chưa login -> redirect login
  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // User chưa login mà vào "/"
  if (pathname === "/" && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // User đã login mà vào "/"
  if (pathname === "/" && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Đã login mà vẫn vào login
  if (pathname === "/login" && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/dashboard/:path*",
    "/equipments/:path*",
    "/factories/:path*",
    "/workcenters/:path*",
    "/maintenance/:path*",
    "/reports/:path*",
    "/settings/:path*",
    "/equipment-groups/:path*",
  ],
};
