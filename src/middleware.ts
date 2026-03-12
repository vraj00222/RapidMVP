import { auth } from "@/lib/auth/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const protectedRoutes = ["/dashboard", "/chat"];
  const authRoutes = ["/login", "/signup"];

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return Response.redirect(loginUrl);
  }

  if (isAuthRoute && isLoggedIn) {
    return Response.redirect(new URL("/dashboard", req.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/chat/:path*", "/login", "/signup"],
};
