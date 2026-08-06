import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Legacy coinjsht used /ja — redirect to Simplified Chinese default. */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/ja" || pathname.startsWith("/ja/")) {
    const dest = pathname.replace(/^\/ja/, "/cn");
    return NextResponse.redirect(new URL(dest, request.url));
  }
}

export const config = {
  matcher: ["/ja", "/ja/:path*"],
};
