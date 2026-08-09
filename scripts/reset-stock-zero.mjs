/**
 * Reset all product stock meta to 0 (remove title-inferred / default-1 stocks).
 */
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

function withMeta(specs, stock, price) {
  const list = Array.isArray(specs) ? specs : [];
  const cleaned = list.filter(
    (s) => s?.label?.cn !== "__stock" && s?.label?.cn !== "__price"
  );
  const next = [
    ...cleaned,
    {
      label: { cn: "__stock", zh: "__stock", en: "__stock" },
      value: { cn: String(stock), zh: String(stock), en: String(stock) },
    },
  ];
  if (price != null && price > 0) {
    next.push({
      label: { cn: "__price", zh: "__price", en: "__price" },
      value: { cn: String(price), zh: String(price), en: String(price) },
    });
  }
  return next;
}

const { data: products, error } = await sb
  .from("products")
  .select("id, lot_no, specs");
if (error) {
  console.error(error);
  process.exit(1);
}

let n = 0;
for (const p of products || []) {
  const priceMeta = (p.specs || []).find((s) => s?.label?.cn === "__price");
  const price = priceMeta ? Number(priceMeta.value?.cn) : null;
  const { error: upErr } = await sb
    .from("products")
    .update({ specs: withMeta(p.specs, 0, price) })
    .eq("id", p.id);
  if (upErr) console.error(p.lot_no, upErr.message);
  else {
    n++;
    console.log(`OK ${p.lot_no} stock=0`);
  }
}
console.log(`Reset ${n} products to stock 0`);
