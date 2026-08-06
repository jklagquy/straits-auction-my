import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "public", "products");

const pages = [
  "https://coinjsht.com/jp/products/tianzhu",
  "https://coinjsht.com/jp/news",
  "https://coinjsht.com/jp",
];

const headers = { "User-Agent": "Mozilla/5.0 (compatible; product-site/1.0)" };

async function fetchText(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.text();
}

function extractPaths(html) {
  const re = /\/uploads\/products\/[A-Za-z0-9._-]+/g;
  return [...new Set(html.match(re) || [])];
}

async function download(urlPath, destName) {
  const url = `https://coinjsht.com${urlPath}`;
  const dest = path.join(outDir, destName);
  if (fs.existsSync(dest)) {
    console.log("skip", destName);
    return;
  }
  const res = await fetch(url, { headers });
  if (!res.ok) {
    console.warn("fail", url, res.status);
    return;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
  console.log("saved", destName, buf.length);
}

fs.mkdirSync(outDir, { recursive: true });

const all = new Set();
for (const page of pages) {
  try {
    const html = await fetchText(page);
    extractPaths(html).forEach((p) => all.add(p));
    fs.writeFileSync(path.join(root, `tmp-${page.split("/").pop() || "home"}.html`), html);
  } catch (e) {
    console.warn(page, e.message);
  }
}

console.log("unique uploads:", all.size);
[...all].forEach((p) => console.log(p));

const mapping = [...all].slice(0, 20);
let i = 0;
for (const p of mapping) {
  const ext = path.extname(p) || ".jpg";
  await download(p, `ss-${String(++i).padStart(2, "0")}${ext}`);
}

// hero / about from known news covers
const extras = [
  "/uploads/products/1782909343523-xnfjx.png",
  "/uploads/products/1782908516876-d7z27gx.png",
  "/uploads/products/1782905977869-xvjbnk.png",
  "/uploads/products/1782907781369-ag4ux.png",
];
for (const p of extras) {
  const ext = path.extname(p);
  await download(p, `news-${path.basename(p, ext)}${ext}`);
}

console.log("done");
