import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "coinjsht-import");
const IMG_DIR = path.join(__dirname, "..", "public", "products");
const BASE = "https://coinjsht.com";

const posts = JSON.parse(fs.readFileSync(path.join(OUT_DIR, "posts-raw.json"), "utf8"));

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
  if (fs.existsSync(dest) && fs.statSync(dest).size > 800) return `/products/${filename}`;
  const res = await fetch(absUrl(url), { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  console.log("IMG", filename);
  return `/products/${filename}`;
}

const out = [];
for (let i = 0; i < posts.length; i++) {
  const p = posts[i];
  const localImgs = [];
  for (let j = 0; j < (p.images || []).length && localImgs.length < 9; j++) {
    try {
      localImgs.push(await download(p.images[j], `post-cj-${p.id}-${j + 1}.${extOf(p.images[j])}`));
    } catch (e) {
      console.warn("skip", e.message);
    }
  }
  let avatar = "";
  if (p.avatar) {
    try {
      avatar = await download(p.avatar, `post-cj-av-${p.id}.${extOf(p.avatar)}`);
    } catch {
      avatar = "";
    }
  }
  if (!localImgs.length) continue;
  out.push({
    id: `po-cj-${p.id}`,
    remoteId: String(p.id),
    authorTw: p.username,
    contentTw: p.content,
    images: localImgs,
    avatar,
    likes: p.likes,
    commentsHint: p.comments,
    date: "2026-03-29",
  });
  console.log("POST", out.at(-1).id, p.username, localImgs.length);
}

fs.writeFileSync(path.join(OUT_DIR, "posts.json"), JSON.stringify(out, null, 2), "utf8");
console.log("DONE", out.length);
