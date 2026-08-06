import fs from "fs";
import path from "path";
import { createServiceClient, isSupabaseConfigured } from "./supabase";
import { virtualCommentCount, virtualCommentsPage } from "./virtual-comments";

export type StoredComment = {
  id: string;
  user: string;
  text: string;
  langTag: string;
  sortOrder: number;
};

const DATA_DIR = path.join(process.cwd(), ".data", "post-comments");

function postFile(postId: string) {
  return path.join(DATA_DIR, `${postId}.json`);
}

function readLocal(postId: string): StoredComment[] {
  try {
    const p = postFile(postId);
    if (!fs.existsSync(p)) return [];
    return JSON.parse(fs.readFileSync(p, "utf8")) as StoredComment[];
  } catch {
    return [];
  }
}

function writeLocal(postId: string, comments: StoredComment[]) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(postFile(postId), JSON.stringify(comments), "utf8");
  } catch {
    // read-only host (Vercel) — ignore
  }
}

export async function listCommentsPage(
  postId: string,
  offset = 0,
  limit = 30
): Promise<{ comments: StoredComment[]; total: number }> {
  if (isSupabaseConfigured()) {
    const sb = createServiceClient();
    const countRes = await sb
      .from("post_comments")
      .select("id", { count: "exact", head: true })
      .eq("post_id", postId);

    // Table missing or empty → serve localized virtual comments (water-army heat)
    if (countRes.error || !countRes.count) {
      return virtualCommentsPage(postId, offset, limit);
    }

    const { data } = await sb
      .from("post_comments")
      .select("id,user_name,body,lang_tag,sort_order")
      .eq("post_id", postId)
      .order("sort_order", { ascending: true })
      .range(offset, offset + limit - 1);

    return {
      total: countRes.count,
      comments: (data || []).map((r) => ({
        id: String(r.id),
        user: String(r.user_name),
        text: String(r.body),
        langTag: String(r.lang_tag || "my"),
        sortOrder: Number(r.sort_order || 0),
      })),
    };
  }

  const all = readLocal(postId);
  if (!all.length) return virtualCommentsPage(postId, offset, limit);
  return {
    total: all.length,
    comments: all.slice(offset, offset + limit),
  };
}

export async function getCommentCount(postId: string): Promise<number> {
  if (isSupabaseConfigured()) {
    const sb = createServiceClient();
    const { count, error } = await sb
      .from("post_comments")
      .select("id", { count: "exact", head: true })
      .eq("post_id", postId);
    if (error || !count) return virtualCommentCount(postId);
    return count;
  }
  const n = readLocal(postId).length;
  return n || virtualCommentCount(postId);
}

export async function upsertComment(input: {
  id: string;
  postId: string;
  user: string;
  text: string;
  langTag?: string;
  sortOrder?: number;
}): Promise<void> {
  const langTag = input.langTag || "my";
  if (isSupabaseConfigured()) {
    const sb = createServiceClient();
    const sortOrder =
      input.sortOrder ??
      (await (async () => {
        const { data } = await sb
          .from("post_comments")
          .select("sort_order")
          .eq("post_id", input.postId)
          .order("sort_order", { ascending: false })
          .limit(1);
        return Number(data?.[0]?.sort_order ?? -1) + 1;
      })());
    await sb.from("post_comments").upsert({
      id: input.id,
      post_id: input.postId,
      user_name: input.user,
      body: input.text,
      lang_tag: langTag,
      sort_order: sortOrder,
    });
    const total = await getCommentCount(input.postId);
    await sb.from("posts").update({ comment_count: total, comments: [] }).eq("id", input.postId);
    return;
  }

  const all = readLocal(input.postId);
  const idx = all.findIndex((c) => c.id === input.id);
  const row: StoredComment = {
    id: input.id,
    user: input.user,
    text: input.text,
    langTag,
    sortOrder: input.sortOrder ?? (idx >= 0 ? all[idx]!.sortOrder : all.length),
  };
  if (idx >= 0) all[idx] = row;
  else all.push(row);
  writeLocal(input.postId, all);
}

export async function deleteComment(postId: string, commentId: string): Promise<void> {
  if (isSupabaseConfigured()) {
    const sb = createServiceClient();
    await sb.from("post_comments").delete().eq("id", commentId).eq("post_id", postId);
    const total = await getCommentCount(postId);
    await sb.from("posts").update({ comment_count: total }).eq("id", postId);
    return;
  }
  writeLocal(
    postId,
    readLocal(postId).filter((c) => c.id !== commentId)
  );
}

export async function replaceAllComments(
  postId: string,
  comments: Omit<StoredComment, "sortOrder">[]
): Promise<void> {
  const rows = comments.map((c, i) => ({ ...c, sortOrder: i }));
  if (isSupabaseConfigured()) {
    const sb = createServiceClient();
    await sb.from("post_comments").delete().eq("post_id", postId);
    const batch = 400;
    for (let i = 0; i < rows.length; i += batch) {
      const chunk = rows.slice(i, i + batch).map((c) => ({
        id: c.id,
        post_id: postId,
        user_name: c.user,
        body: c.text,
        lang_tag: c.langTag,
        sort_order: c.sortOrder,
      }));
      const { error } = await sb.from("post_comments").insert(chunk);
      if (error) throw new Error(error.message);
    }
    await sb
      .from("posts")
      .update({ comment_count: rows.length, comments: [] })
      .eq("id", postId);
    return;
  }
  writeLocal(postId, rows);
}
