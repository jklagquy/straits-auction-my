import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  readFileSync(resolve(__dirname, "../.env.local"), "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      let v = l.slice(i + 1).trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      return [l.slice(0, i).trim(), v];
    })
);

const sb = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

function parseStockFromTitle(title) {
  const m = String(title || "").match(/限量[，,\s]*(\d+)\s*个?/);
  return m ? Number(m[1]) : null;
}

function withStock(specs, qty) {
  const list = Array.isArray(specs) ? specs : [];
  const cleaned = list.filter((s) => s?.label?.cn !== "__stock");
  return [
    ...cleaned,
    {
      label: { cn: "__stock", zh: "__stock", en: "__stock" },
      value: { cn: String(qty), zh: String(qty), en: String(qty) },
    },
  ];
}

const { data: products, error } = await sb
  .from("products")
  .select("id, lot_no, title_cn, specs");
if (error) {
  console.error(error);
  process.exit(1);
}

let updated = 0;
for (const p of products || []) {
  const existing = (p.specs || []).find((s) => s?.label?.cn === "__stock");
  const fromTitle = parseStockFromTitle(p.title_cn);
  const qty = existing
    ? Number(existing.value?.cn)
    : fromTitle != null
      ? fromTitle
      : 1;
  if (existing && Number(existing.value?.cn) === qty && fromTitle == null) {
    continue;
  }
  // Always write meta for titles with limited counts, or missing meta
  if (!existing || (fromTitle != null && Number(existing.value?.cn) !== fromTitle)) {
    const nextQty = fromTitle ?? qty;
    const { error: upErr } = await sb
      .from("products")
      .update({ specs: withStock(p.specs, nextQty) })
      .eq("id", p.id);
    if (upErr) console.error(p.lot_no, upErr.message);
    else {
      updated++;
      console.log(`OK ${p.lot_no} stock=${nextQty}`);
    }
  }
}
console.log(`Updated ${updated} products`);
