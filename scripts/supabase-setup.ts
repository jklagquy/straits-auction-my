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

  const fresh = buildDefaultStore();
  let store = fresh;
  const storePath = resolve(process.cwd(), ".data/cms-store.json");
  if (existsSync(storePath)) {
    const local = JSON.parse(readFileSync(storePath, "utf8")) as typeof store;
    // Keep local site settings / banners, but always refresh products + lifestyle posts
    store = {
      ...fresh,
      ...local,
      products: fresh.products,
      posts: fresh.posts,
      siteSettings: {
        ...fresh.siteSettings,
        ...(local.siteSettings || {}),
        brand: { ...fresh.siteSettings.brand, ...(local.siteSettings?.brand || {}) },
        brandSub: {
          ...fresh.siteSettings.brandSub,
          ...(local.siteSettings?.brandSub || {}),
        },
        company: {
          ...fresh.siteSettings.company,
          ...(local.siteSettings?.company || {}),
        },
        address: {
          ...fresh.siteSettings.address,
          ...(local.siteSettings?.address || {}),
        },
        logoUrl: local.siteSettings?.logoUrl ?? fresh.siteSettings.logoUrl,
      },
    };
    console.log("📂 合并本地设置；products/posts 使用最新 coinjsht 种子");
  } else {
    console.log("📦 使用默认种子（coinjsht 藏品 + 生活向藏家动态）");
  }

  console.log(
    "ℹ️  若动态多图未写入，请先在 SQL Editor 运行 supabase/migrations/006_post_images.sql"
  );
  console.log("⬆️  正在写入 Supabase …");
  await seedFullStore(store);

  // Remove obsolete catalogue rows not in the new seed
  const keepProductIds = store.products.map((p) => p.id);
  const keepPostIds = store.posts.map((p) => p.id);
  const { data: remoteProducts } = await sb.from("products").select("id");
  const staleProducts = (remoteProducts || [])
    .map((r) => r.id as string)
    .filter((id) => !keepProductIds.includes(id));
  if (staleProducts.length) {
    await sb.from("products").delete().in("id", staleProducts);
    console.log(`🗑️  删除旧藏品 ${staleProducts.length} 条`);
  }
  const { data: remotePosts } = await sb.from("posts").select("id");
  const stalePosts = (remotePosts || [])
    .map((r) => r.id as string)
    .filter((id) => !keepPostIds.includes(id));
  if (stalePosts.length) {
    await sb.from("posts").delete().in("id", stalePosts);
    console.log(`🗑️  删除旧动态 ${stalePosts.length} 条`);
  }

  const { count: pCount } = await sb
    .from("products")
    .select("*", { count: "exact", head: true });
  const { count: postCount } = await sb
    .from("posts")
    .select("*", { count: "exact", head: true });
  console.log(`✅ 完成！products=${pCount ?? 0}  posts=${postCount ?? 0}`);
  console.log(`   项目: ${url}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
