/**
 * Prefer Supabase Storage for imported coinjsht assets so production
 * does not depend on Vercel shipping every file under /public/products.
 * Falls back to the local /products/... path when Storage is unavailable.
 */
export function mediaUrl(path: string | undefined | null): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  // Only rewrite known imported prefixes (and banners we may host in media bucket)
  if (
    !normalized.startsWith("/products/cj-") &&
    !normalized.startsWith("/products/post-cj-") &&
    !normalized.startsWith("/products/banner-h")
  ) {
    return path;
  }
  return `${base}/storage/v1/object/public/media${normalized}`;
}

export function mediaUrls(paths: string[] | undefined | null): string[] {
  return (paths || []).map((p) => mediaUrl(p)).filter(Boolean);
}
