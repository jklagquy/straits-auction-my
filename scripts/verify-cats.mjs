import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const env = Object.fromEntries(
  fs
    .readFileSync(path.join(root, ".env.local"), "utf8")
    .split(/\r?\n/)
    .map((l) => l.match(/^([^#=]+)=(.*)$/))
    .filter(Boolean)
    .map((m) => [m[1].trim(), m[2].trim().replace(/^['"]|['"]$/g, "")])
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const { data } = await sb
  .from("products")
  .select("lot_no,title_cn,category_cn,category_zh,category_en,featured")
  .order("sort_order");
for (const p of data) {
  console.log(
    `${p.featured ? "F" : " "} ${p.lot_no}\t${p.category_cn} | ${p.category_zh} | ${p.category_en}\t${p.title_cn}`
  );
}
