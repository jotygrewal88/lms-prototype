// Phase II Epic 1: Development middleware for route debugging
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const isDev = process.env.NODE_ENV === "development";

  // Only log in development
  if (isDev) {
    const pathname = request.nextUrl.pathname;
    const timestamp = new Date().toISOString();
    
    // Skip logging for static assets and Next.js internals
    if (
      !pathname.startsWith("/_next") &&
      !pathname.startsWith("/api") &&
      !pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|json|woff|woff2)$/)
    ) {
      console.log(`[${timestamp}] 🔍 Route Request: ${pathname}`);
    }
  }

  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

