/**
 * Import products (with per-SKU galleries) + community posts from coinjsht.com/tw
 * Usage: node scripts/import-coinjsht-tw.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "scripts", "coinjsht-import");
const IMG_DIR = path.join(ROOT, "public", "products");
const BASE = "https://coinjsht.com";

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(IMG_DIR, { recursive: true });

async function fetchText(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
    },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

/**
 * Extract JSON array after a key inside Next.js RSC flight payloads.
 * Quotes are often stored as \" (backslash-quote) inside the pushed string.
 */
function extractJsonArrayAfter(html, key) {
  const keyIdx = html.indexOf(key);
  if (keyIdx < 0) return null;
  const start = html.indexOf("[", keyIdx);
  if (start < 0) return null;

  // Prefer end marker used on coinjsht products pages
  const markers = [
    '],"consultLink"',
    '],\\"consultLink',
    '],\\\\"consultLink',
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

  let raw;
  if (end > start) {
    raw = html.slice(start, end + 1);
  } else {
    // Balanced scan; treat \" as a string delimiter in RSC-escaped blobs
    let depth = 0;
    let inStr = false;
    for (let i = start; i < html.length; i++) {
      const ch = html[i];
      const prev = i > 0 ? html[i - 1] : "";
      if (ch === '"' && prev === "\\") {
        // escaped quote — toggle string only when pattern is \" not \\"
        const prev2 = i > 1 ? html[i - 2] : "";
        if (prev2 !== "\\") {
          inStr = !inStr;
        }
        continue;
      }
      if (inStr) continue;
      if (ch === "[") depth++;
      else if (ch === "]") {
        depth--;
        if (depth === 0) {
          raw = html.slice(start, i + 1);
          break;
        }
      }
    }
  }
  if (!raw) return null;

  const candidates = [
    raw,
    raw.replace(/\\"/g, '"'),
    raw.replace(/\\\\"/g, '"').replace(/\\"/g, '"'),
  ];
  for (const c of candidates) {
    try {
      const parsed = JSON.parse(c);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      /* try next */
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
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
  console.log("IMG", filename, buf.length);
  return `/products/${filename}`;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchProductDetail(id) {
  const html = await fetchText(`${BASE}/tw/product/${id}`);
  fs.writeFileSync(path.join(OUT_DIR, `product-${id}.html`), html);

  // Try product prop object
  const keys = ["product", "initialProduct", "detail", "item"];
  for (const key of keys) {
    const arrNeedle = `"${key}":{`;
    const idx = html.indexOf(arrNeedle);
    if (idx < 0) continue;
    // balanced object parse is hard; fall through to image scrape
  }

  // Collect upload images in page order — detail pages usually only list this SKU's photos
  const imgs = [
    ...html.matchAll(/\/uploads\/products\/[^"'\\s>]+?\.(?:png|jpe?g|webp)/gi),
  ].map((m) => m[0]);
  const gallery = [...new Set(imgs)];

  // Name from title / h1 / name field
  let name = "";
  const nameM = html.match(/"name":"((?:\\.|[^"\\])*)"/);
  if (nameM) {
    try {
      name = JSON.parse(`"${nameM[1]}"`);
    } catch {
      name = nameM[1];
    }
  }
  if (!name) {
    const t = html.match(/<title>([^<]+)<\/title>/i);
    name = t ? t[1].replace(/\s*[|·].*$/, "").trim() : `Product ${id}`;
  }

  let description = "";
  const descM = html.match(/"description":"((?:\\.|[^"\\]){20,2000})"/);
  if (descM) {
    try {
      description = JSON.parse(`"${descM[1]}"`);
    } catch {
      description = descM[1];
    }
  }

  let price = "";
  const priceM = html.match(/"price":"([^"]+)"/);
  if (priceM) price = priceM[1];

  let category = "";
  const catM = html.match(/"category":"([^"]+)"/);
  if (catM) category = catM[1];

  return {
    id: String(id),
    name,
    description,
    price,
    category,
    image: gallery[0] || "",
    gallery,
  };
}

/** Community posts from home RSC — look for feed items with images arrays */
function extractPosts(html) {
  const posts = [];
  // Pattern: objects with content + images array of /uploads/
  const re =
    /\{[^{}]*?"(?:content|text|body)":"((?:\\.|[^"\\])*)"[^{}]*?"(?:images|photos|gallery)":\[((?:[^\]]|\[[^\]]*\])*)\]/g;
  let m;
  while ((m = re.exec(html)) && posts.length < 100) {
    const content = (() => {
      try {
        return JSON.parse(`"${m[1]}"`);
      } catch {
        return m[1];
      }
    })();
    const imgChunk = m[2];
    const imgs = [
      ...imgChunk.matchAll(/\/uploads\/[^"'\\]+?\.(?:png|jpe?g|webp)/gi),
    ].map((x) => x[0]);
    if (!imgs.length || content.length < 8) continue;
    posts.push({ content, images: [...new Set(imgs)] });
  }

  // Broader: scan for userName + content blocks nearby images
  if (posts.length < 5) {
    const chunks = html.split(/"userName":"/).slice(1);
    for (const chunk of chunks) {
      const authorEnd = chunk.indexOf('"');
      const author = chunk.slice(0, authorEnd);
      const contentM = chunk.match(/"(?:content|text)":"((?:\\.|[^"\\])*)"/);
      if (!contentM) continue;
      let content;
      try {
        content = JSON.parse(`"${contentM[1]}"`);
      } catch {
        content = contentM[1];
      }
      const window = chunk.slice(0, 8000);
      const imgs = [
        ...window.matchAll(/\/uploads\/[^"'\\]+?\.(?:png|jpe?g|webp)/gi),
      ].map((x) => x[0]);
      if (imgs.length < 1 || content.length < 8) continue;
      posts.push({
        author,
        content,
        images: [...new Set(imgs)].slice(0, 9),
      });
      if (posts.length >= 60) break;
    }
  }
  return posts;
}

async function main() {
  console.log("Fetching category lists…");
  const categories = [
    "/tw/products",
    "/tw/products/tianzhu",
    "/tw/products/beads",
    "/tw/products/buddha",
    "/tw/products/antique",
  ];
  const byId = new Map();

  for (const cat of categories) {
    try {
      const html = await fetchText(`${BASE}${cat}`);
      const file = path.join(OUT_DIR, `${cat.replace(/\//g, "_")}.html`);
      fs.writeFileSync(file, html);
      const rows = extractJsonArrayAfter(html, "initialRows") || [];
      console.log(cat, "rows", rows.length);
      for (const r of rows) {
        if (r?.id == null) continue;
        byId.set(String(r.id), { ...byId.get(String(r.id)), ...r, _cat: cat });
      }
    } catch (e) {
      console.warn("cat fail", cat, e.message);
    }
  }

  // Prefer TW products.html already saved if fetch somehow empty
  if (byId.size === 0) {
    const fallback = path.join(OUT_DIR, "_tw_products.html");
    if (fs.existsSync(fallback)) {
      const rows = extractJsonArrayAfter(fs.readFileSync(fallback, "utf8"), "initialRows") || [];
      console.log("fallback rows", rows.length);
      for (const r of rows) {
        if (r?.id != null) byId.set(String(r.id), r);
      }
    }
  }

  let homeHtml = "";
  try {
    homeHtml = await fetchText(`${BASE}/tw`);
    fs.writeFileSync(path.join(OUT_DIR, "home.html"), homeHtml);
  } catch (e) {
    console.warn("home fail", e.message);
  }

  const rawPosts = extractPosts(homeHtml);
  console.log("raw posts", rawPosts.length);

  const ids = [...byId.keys()];
  console.log("Unique product ids", ids.length);

  const products = [];
  for (const id of ids) {
    try {
      const list = byId.get(id) || {};
      const detail = await fetchProductDetail(id);
      const badName = (n) =>
        !n || n === "Loading..." || /^Product\s/i.test(n);
      const name = !badName(list.name)
        ? list.name
        : !badName(detail.name)
          ? detail.name
          : `Product ${id}`;
      const description = list.description || detail.description || "";
      // Gallery: detail page images ONLY (same SKU). Never mix list covers from other items.
      let galleryRemote = detail.gallery.length
        ? detail.gallery
        : list.image
          ? [list.image]
          : [];
      // If detail scraped many unrelated uploads (rare), keep images that share a filename prefix
      // or simply take first N from detail page (order = product gallery order on coinjsht).
      galleryRemote = galleryRemote.slice(0, 12);

      const coverSrc = list.image || galleryRemote[0];
      const coverLocal = await download(coverSrc, `cj-${id}-cover.${extOf(coverSrc)}`);
      const galleryLocal = [];
      const seen = new Set([absUrl(coverSrc)]);
      galleryLocal.push(coverLocal);
      for (let i = 0; i < galleryRemote.length && galleryLocal.length < 10; i++) {
        const u = galleryRemote[i];
        const key = absUrl(u);
        if (seen.has(key)) continue;
        seen.add(key);
        try {
          galleryLocal.push(
            await download(u, `cj-${id}-g${galleryLocal.length}.${extOf(u)}`)
          );
        } catch (e) {
          console.warn("gallery skip", id, e.message);
        }
      }

      products.push({
        remoteId: id,
        nameTw: name,
        descriptionTw: String(description).slice(0, 4000),
        priceUsd: String(list.price || detail.price || ""),
        originalPrice: String(list.originalPrice || ""),
        sku: `CJ-${id}`,
        category: list.category || detail.category || "tianzhu",
        image: coverLocal,
        gallery: galleryLocal,
      });
      console.log(
        "PRODUCT",
        id,
        name.slice(0, 36),
        "gallery",
        galleryLocal.length
      );
      await sleep(180);
    } catch (e) {
      console.warn("product fail", id, e.message);
    }
  }

  const postsOut = [];
  for (let pi = 0; pi < rawPosts.length && pi < 80; pi++) {
    const p = rawPosts[pi];
    const localImgs = [];
    for (let i = 0; i < (p.images || []).length && localImgs.length < 9; i++) {
      try {
        localImgs.push(
          await download(p.images[i], `post-cj-${pi + 1}-${i + 1}.${extOf(p.images[i])}`)
        );
      } catch {
        /* skip */
      }
    }
    if (!localImgs.length) continue;
    postsOut.push({
      id: `po-cj-${pi + 1}`,
      authorTw: p.author || `藏家${pi + 1}`,
      contentTw: String(p.content || "").slice(0, 2000),
      images: localImgs,
      likes: 800 + ((pi * 97) % 9000),
      commentsHint: 500 + ((pi * 53) % 7000),
      date: "2026-01-15",
    });
  }

  fs.writeFileSync(
    path.join(OUT_DIR, "products.json"),
    JSON.stringify(products, null, 2),
    "utf8"
  );
  fs.writeFileSync(
    path.join(OUT_DIR, "posts.json"),
    JSON.stringify(postsOut, null, 2),
    "utf8"
  );
  console.log("DONE products", products.length, "posts", postsOut.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
