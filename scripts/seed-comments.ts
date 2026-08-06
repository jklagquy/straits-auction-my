/**
 * Seed 2000–8000 unique localized comments per post (~70% MY Chinese, ~30% intl).
 *
 * Usage:
 *   npx tsx scripts/seed-comments.ts
 *   npx tsx scripts/seed-comments.ts --lite   # 80–120 each (local smoke)
 */
import fs from "fs";
import path from "path";
import {
  generateCommentsForPost,
  uniqueCommentCounts,
} from "../lib/cms/comment-generator";
import { replaceAllComments } from "../lib/cms/comment-store";
import { createServiceClient, isSupabaseConfigured } from "../lib/cms/supabase";
import { buildDefaultStore } from "../lib/cms/seed";

function loadEnvLocal() {
  const p = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const key = m[1]!;
    let val = m[2]!;
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

async function resolvePostIds(): Promise<string[]> {
  if (isSupabaseConfigured()) {
    const sb = createServiceClient();
    const { data, error } = await sb.from("posts").select("id").order("sort_order");
    if (error) throw error;
    if (data?.length) return data.map((r) => String(r.id));
  }
  return buildDefaultStore().posts.map((p) => p.id);
}

async function main() {
  loadEnvLocal();
  const lite = process.argv.includes("--lite");
  const postIds = await resolvePostIds();
  if (!postIds.length) {
    console.error("No posts found. Seed posts first (npm run supabase:setup).");
    process.exit(1);
  }

  const counts = lite
    ? Object.fromEntries(
        postIds.map((id, i) => [id, 80 + ((i * 7) % 41)])
      )
    : uniqueCommentCounts(postIds, 2000, 8000);

  console.log(
    `Seeding comments for ${postIds.length} posts (${lite ? "lite" : "full 2000–8000"})…`
  );
  console.log(`Backend: ${isSupabaseConfigured() ? "supabase" : "local-file"}`);

  let total = 0;
  for (const postId of postIds) {
    const n = counts[postId]!;
    const generated = generateCommentsForPost(postId, n, 0.3);
    await replaceAllComments(
      postId,
      generated.map((c) => ({
        id: c.id,
        user: c.user,
        text: c.text,
        langTag: c.langTag,
      }))
    );
    total += n;
    console.log(`  ${postId}: ${n} comments`);
  }

  if (!isSupabaseConfigured()) {
    const storePath = path.join(process.cwd(), ".data", "cms-store.json");
    if (fs.existsSync(storePath)) {
      const store = JSON.parse(fs.readFileSync(storePath, "utf8"));
      for (const p of store.posts || []) {
        if (counts[p.id] != null) {
          p.commentCount = counts[p.id];
          p.comments = [];
        }
      }
      fs.writeFileSync(storePath, JSON.stringify(store, null, 2), "utf8");
    }
  }

  console.log(`Done. Total comments: ${total}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
