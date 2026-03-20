import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Check for token in multiple places (in order of priority)
  const authTokenCookie = request.cookies.get("auth-token")?.value;
  const tokenCookie = request.cookies.get("token")?.value;
  const authHeader = request.headers.get("authorization");

  // Extract token from Authorization header if present
  const authHeaderToken = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : null;

  const token = authTokenCookie || tokenCookie || authHeaderToken;

  console.log("🔍 Middleware - Path:", request.nextUrl.pathname);
  console.log("🔍 Token sources - Cookie:", tokenCookie ? "exists" : "none",
    "Auth-Cookie:", authTokenCookie ? "exists" : "none",
    "Header:", authHeaderToken ? "exists" : "none");

  const isLoginPage = request.nextUrl.pathname === "/Authentication/signin";
  const isSignupPage = request.nextUrl.pathname === "/Authentication/signup";
  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");

  // If trying to access dashboard without ANY token → redirect to signin
  if (!token && isDashboard) {
    console.log("🚫 No token found in any source, redirecting to signin");
    return NextResponse.redirect(new URL("/Authentication/signin", request.url));
  }

  // If has token and visiting login/signup → redirect to dashboard
  if (token && (isLoginPage || isSignupPage)) {
    console.log("✅ Token found, redirecting to dashboard");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Add token to headers for API routes if it exists
  const response = NextResponse.next();

  if (token && !response.headers.has('authorization')) {
    response.headers.set('authorization', `Bearer ${token}`);
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/Authentication/signin",
    "/Authentication/signup",
    "/api/:path*" // Also protect API routes
  ],
};