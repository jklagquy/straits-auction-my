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
    s.brandSub = {
      cn: "Straits Scholar's Auction",
      zh: "Straits Scholar's Auction",
      en: "Straits Scholar's Auction",
    };
  }
  if (s.logoUrl == null) s.logoUrl = "";
  if (!s.company) {
    s.company = {
      cn: "海峡金石拍卖有限公司",
      zh: "海峽金石拍賣有限公司",
      en: "Straits Scholar's Auction Sdn. Bhd.",
    };
  }
  raw.siteSettings = s;
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

export function writeStore(store: CmsStore): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

export function isFileStoreReady(): boolean {
  return fs.existsSync(STORE_PATH);
}
