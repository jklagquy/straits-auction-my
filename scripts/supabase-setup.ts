/**
 * Run after SQL migration: npx tsx scripts/supabase-setup.ts
 * Loads .env.local, verifies tables, seeds CMS data from default store.
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import { buildDefaultStore } from "../lib/cms/seed";
import { seedFullStore } from "../lib/cms/supabase-sync";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) throw new Error(".env.local not found");
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

async function main() {
  loadEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars in .env.local");

  const sb = createClient(url, key, { auth: { persistSession: false } });

  const { error: tableErr } = await sb.from("price_rules").select("id").limit(1);
  if (tableErr) {
    console.error("\n❌ 数据库表尚未创建。请先在 Supabase SQL Editor 运行迁移文件：");
    console.error("   product-site/supabase/migrations/001_auction_cms.sql\n");
    console.error("错误:", tableErr.message);
    process.exit(1);
  }

  const storePath = resolve(process.cwd(), ".data/cms-store.json");
  let store = buildDefaultStore();
  if (existsSync(storePath)) {
    const local = JSON.parse(readFileSync(storePath, "utf8")) as typeof store;
    // Shallow merge would drop new siteSettings fields (logo/brandSub/company)
    store = {
      ...store,
      ...local,
      siteSettings: {
        ...store.siteSettings,
        ...(local.siteSettings || {}),
        brand: { ...store.siteSettings.brand, ...(local.siteSettings?.brand || {}) },
        brandSub: {
          ...store.siteSettings.brandSub,
          ...(local.siteSettings?.brandSub || {}),
        },
        company: {
          ...store.siteSettings.company,
          ...(local.siteSettings?.company || {}),
        },
        address: {
          ...store.siteSettings.address,
          ...(local.siteSettings?.address || {}),
        },
        logoUrl: local.siteSettings?.logoUrl ?? store.siteSettings.logoUrl,
      },
    };
    console.log("📂 合并本地 .data/cms-store.json 数据");
  } else {
    console.log("📦 使用默认种子数据（18 件拍品 + 新闻/帖子/跑马灯）");
  }

  console.log("⬆️  正在写入 Supabase …");
  await seedFullStore(store);

  const { count } = await sb
    .from("products")
    .select("*", { count: "exact", head: true });
  console.log(`✅ 完成！products 表共 ${count ?? 0} 条记录`);
  console.log(`   项目: ${url}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
