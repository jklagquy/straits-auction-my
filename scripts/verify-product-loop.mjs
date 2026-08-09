/**
 * Verify product save/read loop: stock + manual current price.
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

function readMeta(specs, marker) {
  const m = (specs || []).find((s) => s?.label?.cn === marker);
  return m ? Number(m.value?.cn) : null;
}

const { data: before, error } = await sb
  .from("products")
  .select("id, lot_no, specs, base_price_low")
  .eq("lot_no", "CJ-41")
  .maybeSingle();
if (error || !before) {
  console.error("CJ-41 not found", error);
  process.exit(1);
}

const testStock = 10;
const testPrice = 200000;
const cleaned = (before.specs || []).filter(
  (s) => s?.label?.cn !== "__stock" && s?.label?.cn !== "__price"
);
const specs = [
  ...cleaned,
  {
    label: { cn: "__stock", zh: "__stock", en: "__stock" },
    value: { cn: String(testStock), zh: String(testStock), en: String(testStock) },
  },
  {
    label: { cn: "__price", zh: "__price", en: "__price" },
    value: { cn: String(testPrice), zh: String(testPrice), en: String(testPrice) },
  },
];

const { error: upErr } = await sb
  .from("products")
  .update({ specs })
  .eq("id", before.id);
if (upErr) {
  console.error("update failed", upErr);
  process.exit(1);
}

const { data: after } = await sb
  .from("products")
  .select("id, lot_no, specs")
  .eq("id", before.id)
  .single();

const stock = readMeta(after.specs, "__stock");
const price = readMeta(after.specs, "__price");
console.log({
  lot: after.lot_no,
  stock,
  price,
  ok: stock === testStock && price === testPrice,
});

// restore stock 0, keep price for demo or clear
const restore = (after.specs || []).filter((s) => s?.label?.cn !== "__stock");
restore.push({
  label: { cn: "__stock", zh: "__stock", en: "__stock" },
  value: { cn: "0", zh: "0", en: "0" },
});
await sb.from("products").update({ specs: restore }).eq("id", before.id);
console.log("Restored CJ-41 stock to 0 (price meta left if set)");
