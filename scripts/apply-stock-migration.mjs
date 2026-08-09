/**
 * Apply stock_quantity column via Supabase SQL REST (pgmeta) if available,
 * otherwise verify column and print instructions.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");
const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
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

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing Supabase env");
  process.exit(1);
}

const sb = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Probe: select stock_quantity
const probe = await sb.from("products").select("id, stock_quantity").limit(1);
if (!probe.error) {
  console.log("Column stock_quantity already exists.");
} else {
  console.log("Probe error:", probe.error.message);
  console.log(
    "Attempting REST SQL via /pg/query is not available with service role alone."
  );
  console.log("Will try Management API if SUPABASE_ACCESS_TOKEN is set…");
  const token = process.env.SUPABASE_ACCESS_TOKEN || env.SUPABASE_ACCESS_TOKEN;
  const projectRef = url.replace("https://", "").split(".")[0];
  if (!token) {
    console.error(
      "\nPlease run this SQL in Supabase SQL Editor:\n\n" +
        "alter table products add column if not exists stock_quantity integer not null default 1;\n"
    );
    process.exit(2);
  }
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query:
          "alter table products add column if not exists stock_quantity integer not null default 1;",
      }),
    }
  );
  const text = await res.text();
  console.log("Management API status", res.status, text);
  if (!res.ok) process.exit(1);
}

// Backfill known limited edition
const { data: lots, error: listErr } = await sb
  .from("products")
  .select("id, lot_no, title_cn, stock_quantity")
  .or("lot_no.eq.CJ-41,title_cn.ilike.%3000%");

if (listErr) {
  console.error("List error", listErr);
} else {
  for (const row of lots || []) {
    if ((row.stock_quantity ?? 1) === 1) {
      const { error } = await sb
        .from("products")
        .update({ stock_quantity: 3000 })
        .eq("id", row.id);
      console.log(
        error
          ? `Fail backfill ${row.lot_no}: ${error.message}`
          : `Backfilled stock 3000 for ${row.lot_no}`
      );
    } else {
      console.log(`Skip ${row.lot_no}, stock=${row.stock_quantity}`);
    }
  }
}

console.log("Done.");
