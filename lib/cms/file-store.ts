import fs from "fs";
import path from "path";
import type { CmsStore } from "./types";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_PATH = path.join(DATA_DIR, "cms-store.json");

export function storePath(): string {
  return STORE_PATH;
}

function normalizeStore(raw: CmsStore): CmsStore {
  const s = raw.siteSettings as CmsStore["siteSettings"] & {
    brandSub?: CmsStore["siteSettings"]["brandSub"];
    logoUrl?: string;
    company?: CmsStore["siteSettings"]["company"];
  };
  if (!s.brandSub) {
    s.brandSub = { cn: "WACA", zh: "WACA", en: "WACA" };
  }
  if (s.logoUrl == null || s.logoUrl === "") s.logoUrl = "/brand/waca-mark.png";
  if (!s.company) {
    s.company = {
      cn: "万国古董文博协会",
      zh: "萬國古董文博協會",
      en: "World Antique Cultural-Heritage Association",
    };
  }
  if (s.commentsEnabled == null) s.commentsEnabled = true;
  if (s.likesEnabled == null) s.likesEnabled = true;
  raw.siteSettings = s;
  for (const p of raw.posts || []) {
    if (p.commentCount == null) {
      p.commentCount = Array.isArray(p.comments) ? p.comments.length : 0;
    }
  }
  for (const b of raw.banners || []) {
    if (b.linkSlug == null) b.linkSlug = "";
  }
  return raw;
}

export function readStore(): CmsStore | null {
  try {
    if (!fs.existsSync(STORE_PATH)) return null;
    return normalizeStore(JSON.parse(fs.readFileSync(STORE_PATH, "utf8")) as CmsStore);
  } catch {
    return null;
  }
}

/** Best-effort write — never throw on read-only hosts (Vercel /var/task). */
export function writeStore(store: CmsStore): void {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
  } catch {
    // Serverless / read-only filesystem — ignore
  }
}

export function isFileStoreReady(): boolean {
  return fs.existsSync(STORE_PATH);
}
