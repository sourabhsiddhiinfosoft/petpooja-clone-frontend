import { NextResponse } from "next/server";

// Protected routes by role
const roleRoutes = {
  admin: ["/admin"],
  owner: ["/owner"],
  staff: ["/staff"],
};

export function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const role = req.cookies.get("role")?.value; // store role when login

  const { pathname } = req.nextUrl;
console.log("Middleware - Pathname:", pathname);
  // Allow auth pages without login
  if (pathname.startsWith("/auth")) {
    if (token) {
      // already logged in → redirect to dashboard based on role
      return NextResponse.redirect(new URL(`/${role}/dashboard`, req.url));
    }
    return NextResponse.next();
  }

  // Check if route belongs to a role
  for (const r in roleRoutes) {
    if (roleRoutes[r].some((route) => pathname.startsWith(route))) {
      if (!token || role !== r) {
        // not logged in or wrong role
        return NextResponse.redirect(new URL("/auth/login", req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/owner/:path*",
    "/staff/:path*",
    "/auth/:path*",
  ],
};
