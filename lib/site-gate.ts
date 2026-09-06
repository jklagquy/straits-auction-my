import { NextResponse } from "next/server";

export function isAdminPath(pathname: string): boolean {
  return (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname.startsWith("/api/admin/")
  );
}

export function closedSiteHtml(): string {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="robots" content="noindex,nofollow,noarchive">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title></title>
</head>
<body></body>
</html>`;
}

export function closedSiteResponse(kind: "html" | "json" = "html"): NextResponse {
  if (kind === "json") {
    return new NextResponse("{}", {
      status: 404,
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store, no-cache, must-revalidate",
        "x-robots-tag": "noindex, nofollow, noarchive",
      },
    });
  }
  return new NextResponse(closedSiteHtml(), {
    status: 404,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store, no-cache, must-revalidate",
      "x-robots-tag": "noindex, nofollow, noarchive",
    },
  });
}

/**
 * Fail-open: missing column, network blip, or local file mode
 * keeps the live site visible. Only an explicit false hides it.
 */
export async function isPublicSiteEnabled(): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return true;

  try {
    const res = await fetch(
      `${url.replace(/\/$/, "")}/rest/v1/site_settings?id=eq.1&select=site_public_enabled`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
        cache: "no-store",
      }
    );
    if (!res.ok) return true;
    const rows = (await res.json()) as Array<{ site_public_enabled?: boolean | null }>;
    const flag = rows?.[0]?.site_public_enabled;
    return flag == null ? true : Boolean(flag);
  } catch {
    return true;
  }
}
