import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  closedSiteResponse,
  isAdminPath,
  isPublicSiteEnabled,
} from "@/lib/site-gate";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/ja" || pathname.startsWith("/ja/")) {
    const dest = pathname.replace(/^\/ja/, "/cn");
    return NextResponse.redirect(new URL(dest, request.url));
  }

  if (isAdminPath(pathname)) {
    return NextResponse.next();
  }

  if (!(await isPublicSiteEnabled())) {
    if (pathname === "/robots.txt") {
      return new NextResponse("User-agent: *\nDisallow: /\n", {
        status: 200,
        headers: {
          "content-type": "text/plain; charset=utf-8",
          "cache-control": "no-store",
        },
      });
    }
    const wantsJson =
      pathname.startsWith("/api/") ||
      (request.headers.get("accept") || "").includes("application/json");
    return closedSiteResponse(wantsJson ? "json" : "html");
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|brand/).*)",
  ],
};
