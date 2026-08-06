/**
 * Upload local public/products/{cj-*,post-cj-*} to Supabase Storage media bucket
 * so production can load images even if Vercel static deploy lags.
 *
 * Usage: node scripts/upload-media-to-supabase.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync, existsSync } from "fs";
import { join, extname } from "path";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const eq = t.indexOf("=");
  if (eq < 0) continue;
  const k = t.slice(0, eq).trim();
  const v = t.slice(eq + 1).trim();
  if (!process.env[k]) process.env[k] = v;
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Missing Supabase env");

const sb = createClient(url, key, { auth: { persistSession: false } });
const dir = join(process.cwd(), "public", "products");
const files = readdirSync(dir).filter(
  (f) =>
    (f.startsWith("cj-") || f.startsWith("post-cj-") || f.startsWith("banner-h")) &&
    /\.(jpe?g|png|webp)$/i.test(f)
);

const mime = (f) => {
  const e = extname(f).toLowerCase();
  if (e === ".png") return "image/png";
  if (e === ".webp") return "image/webp";
  return "image/jpeg";
};

let ok = 0;
let fail = 0;
for (const f of files) {
  const path = `products/${f}`;
  const body = readFileSync(join(dir, f));
  const { error } = await sb.storage.from("media").upload(path, body, {
    contentType: mime(f),
    upsert: true,
  });
  if (error) {
    console.warn("FAIL", f, error.message);
    fail++;
  } else {
    ok++;
    if (ok % 20 === 0) console.log("uploaded", ok);
  }
}

const { data: pub } = sb.storage.from("media").getPublicUrl("products/cj-41-cover.jpg");
console.log("DONE ok", ok, "fail", fail);
console.log("sample public URL", pub?.publicUrl);
console.log(
  "Tip: after upload, either point site at Supabase URLs or ensure Vercel fork has the static files."
);
