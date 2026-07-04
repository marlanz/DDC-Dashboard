import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const defaultChildRoutes: Record<string, string> = {
  "/statistics": "/statistics/dashboard",
  "/factoryreport": "/factoryreport/electricity",
  "/eqreport": "/eqreport/overall",
};

export default function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);

  const isLoggedIn = !!sessionCookie;

  const { pathname } = request.nextUrl;

  const protectedRoutes = ["/eqreport", "/factoryreport", "/statistics"];

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
    return NextResponse.redirect(new URL("/statistics/dashboard", request.url));
  }

  // Đã login mà vẫn vào login
  if (pathname === "/login" && isLoggedIn) {
    return NextResponse.redirect(new URL("/statistics/dashboard", request.url));
  }

  //nếu user chỉ access parent url mà không provide children thì sẽ mặc định children ở [0]
  if (pathname in defaultChildRoutes) {
    return NextResponse.redirect(
      new URL(defaultChildRoutes[pathname], request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/statistics",
    "/statistics/:path",
    "/factoryreport",
    "/factoryreport/:path",
    "/eqreport",
    "/eqreport/:path",
  ],
};
