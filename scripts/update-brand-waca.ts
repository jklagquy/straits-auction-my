/** Push WACA brand fields into Supabase site_settings. */
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  const p = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let val = m[2]!;
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[m[1]!]) process.env[m[1]!] = val;
  }
}

async function main() {
  loadEnvLocal();
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { error } = await sb.from("site_settings").upsert({
    id: 1,
    brand_cn: "万国古董文博协会",
    brand_zh: "萬國古董文博協會",
    brand_en: "WACA",
    brand_sub_cn: "World Antique Cultural-Heritage Association",
    brand_sub_zh: "World Antique Cultural-Heritage Association",
    brand_sub_en: "World Antique Cultural-Heritage Association",
    company_cn: "万国古董文博协会",
    company_zh: "萬國古董文博協會",
    company_en: "World Antique Cultural-Heritage Association",
    address_cn: "马来西亚吉隆坡 · 槟城",
    address_zh: "馬來西亞吉隆坡 · 檳城",
    address_en: "Kuala Lumpur · Penang, Malaysia",
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
  console.log("WACA brand updated in site_settings.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
