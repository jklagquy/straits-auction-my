/**
 * Fix product names from list HTML + import initialPosts from home.
 * Usage: node scripts/finish-coinjsht-import.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "scripts", "coinjsht-import");
const IMG_DIR = path.join(ROOT, "public", "products");
const BASE = "https://coinjsht.com";

function extractJsonArrayAfter(html, key) {
  const keyIdx = html.indexOf(key);
  if (keyIdx < 0) return null;
  const start = html.indexOf("[", keyIdx);
  if (start < 0) return null;
  const markers = [
    '],"consultLink"',
    '],\\"consultLink',
    '],"rushBuyLink"',
    '],\\"rushBuyLink',
    '],"marquee"',
    '],\\"marquee',
    '],"lang"',
    '],\\"lang',
  ];
  let end = -1;
  for (const mk of markers) {
    const j = html.indexOf(mk, start);
    if (j > start) {
      end = j;
      break;
    }
  }
  if (end < 0) return null;
  const raw = html.slice(start, end + 1);
  for (const c of [raw, raw.replace(/\\"/g, '"')]) {
    try {
      const p = JSON.parse(c);
      if (Array.isArray(p)) return p;
    } catch {
      /* next */
    }
  }
  return null;
}

function absUrl(u) {
  if (!u) return "";
  if (u.startsWith("http")) return u;
  return `${BASE}${u.startsWith("/") ? "" : "/"}${u}`;
}

function extOf(url) {
  const m = String(url).match(/\.(png|jpe?g|webp|gif)(?:\?|$)/i);
  return m ? m[1].toLowerCase().replace("jpeg", "jpg") : "jpg";
}

async function download(url, filename) {
  const dest = path.join(IMG_DIR, filename);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 800) {
    return `/products/${filename}`;
  }
  const res = await fetch(absUrl(url), {
    headers: { "User-Agent": "Mozilla/5.0 Chrome/120" },
  });
  if (!res.ok) throw new Error(`dl ${res.status} ${url}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  console.log("IMG", filename);
  return `/products/${filename}`;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

const productsPath = path.join(OUT_DIR, "products.json");
const products = JSON.parse(fs.readFileSync(productsPath, "utf8"));
const listHtml = fs.readFileSync(path.join(OUT_DIR, "_tw_products.html"), "utf8");
const rows = extractJsonArrayAfter(listHtml, "initialRows") || [];
const byId = new Map(rows.map((r) => [String(r.id), r]));

for (const p of products) {
  const row = byId.get(String(p.remoteId));
  if (!row) continue;
  if (!p.nameTw || p.nameTw === "Loading...") p.nameTw = row.name || p.nameTw;
  if (!p.descriptionTw || p.descriptionTw.length < 10) {
    p.descriptionTw = row.description || p.descriptionTw;
  }
  p.priceUsd = String(row.price || p.priceUsd || "");
  p.originalPrice = String(row.originalPrice || p.originalPrice || "");
  p.category = row.category || p.category;
}

fs.writeFileSync(productsPath, JSON.stringify(products, null, 2), "utf8");
console.log(
  "Fixed names:",
  products.map((p) => `${p.remoteId}:${p.nameTw}`).join(" | ")
);

const homeHtml = fs.readFileSync(path.join(OUT_DIR, "home.html"), "utf8");
const posts = extractJsonArrayAfter(homeHtml, "initialPosts") || [];
console.log("initialPosts", posts.length);

const postsOut = [];
for (let pi = 0; pi < posts.length; pi++) {
  const p = posts[pi];
  if (!p?.isActive && p?.isActive !== undefined) continue;
  const imgs = Array.isArray(p.images) ? p.images : [];
  const localImgs = [];
  for (let i = 0; i < imgs.length && localImgs.length < 9; i++) {
    try {
      localImgs.push(
        await download(imgs[i], `post-cj-${p.id || pi + 1}-${i + 1}.${extOf(imgs[i])}`)
      );
      await sleep(80);
    } catch (e) {
      console.warn("post img fail", e.message);
    }
  }
  if (!localImgs.length) continue;
  let avatarLocal = "";
  if (p.avatar) {
    try {
      avatarLocal = await download(
        p.avatar,
        `post-cj-av-${p.id || pi + 1}.${extOf(p.avatar)}`
      );
    } catch {
      avatarLocal = "";
    }
  }
  const date = String(p.createdAt || "2026-03-29")
    .replace(/^\$D/, "")
    .slice(0, 10);
  postsOut.push({
    id: `po-cj-${p.id || pi + 1}`,
    remoteId: String(p.id || pi + 1),
    authorTw: p.username || p.userName || `藏家${pi + 1}`,
    contentTw: String(p.content || "").slice(0, 2500),
    images: localImgs,
    avatar: avatarLocal,
    likes: Number(p.likes) || 1000 + pi * 100,
    commentsHint: Number(p.comments) || 500 + pi * 50,
    date,
  });
  console.log(
    "POST",
    postsOut[postsOut.length - 1].id,
    postsOut[postsOut.length - 1].authorTw,
    "imgs",
    localImgs.length
  );
}

fs.writeFileSync(
  path.join(OUT_DIR, "posts.json"),
  JSON.stringify(postsOut, null, 2),
  "utf8"
);
console.log("DONE posts", postsOut.length, "products", products.length);
