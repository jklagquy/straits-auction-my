import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const envPath = path.join(root, ".env.local");
const env = {};
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, "");
  }
}
const url = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  env.SUPABASE_SERVICE_ROLE_KEY ||
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing Supabase env");
  process.exit(1);
}
const sb = createClient(url, key);
const { data, error } = await sb
  .from("products")
  .select(
    "id,slug,lot_no,title_cn,title_zh,title_en,category_cn,category_zh,category_en,featured,active,image,sort_order"
  )
  .order("sort_order");
if (error) {
  console.error(error);
  process.exit(1);
}
console.log("count", data.length, "featured", data.filter((p) => p.featured).length);
for (const p of data) {
  console.log(
    [
      p.featured ? "F" : " ",
      p.active ? "A" : "x",
      (p.lot_no || "").padEnd(18),
      "|",
      (p.category_cn || "").padEnd(12),
      "|",
      p.title_cn,
      "|",
      p.slug,
      "|",
      p.image || "",
    ].join(" ")
  );
}
fs.writeFileSync(
  path.join(root, "scripts", "coinjsht-live", "products-audit.json"),
  JSON.stringify(data, null, 2),
  "utf8"
);
console.log("wrote products-audit.json");
