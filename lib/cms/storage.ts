import { createServiceClient, isSupabaseConfigured } from "./supabase";

const BUCKET = "media";

function extFromMime(mime: string, fallbackName: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/svg+xml": "svg",
  };
  if (map[mime]) return map[mime];
  const m = fallbackName.match(/\.([a-z0-9]+)$/i);
  return m ? m[1].toLowerCase() : "bin";
}

/** Upload a file buffer to Supabase Storage `media` bucket. Returns public URL. */
export async function uploadMediaFile(opts: {
  bytes: ArrayBuffer | Buffer | Uint8Array;
  contentType: string;
  filename: string;
  folder?: string;
}): Promise<{ url: string; path: string }> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase 未配置，无法上传。请先设置环境变量。");
  }
  const sb = createServiceClient();
  const folder = (opts.folder || "uploads").replace(/^\/+|\/+$/g, "");
  const safeBase = opts.filename
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 80);
  const ext = extFromMime(opts.contentType, safeBase);
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const body =
    opts.bytes instanceof ArrayBuffer
      ? new Uint8Array(opts.bytes)
      : opts.bytes;

  const { error } = await sb.storage.from(BUCKET).upload(path, body, {
    contentType: opts.contentType,
    upsert: false,
  });
  if (error) throw new Error(error.message);

  const { data } = sb.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}
