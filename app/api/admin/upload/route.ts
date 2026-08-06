import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { uploadMediaFile } from "@/lib/cms/storage";

const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

export async function POST(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  try {
    const form = await req.formData();
    const file = form.get("file");
    const folder = String(form.get("folder") || "uploads");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "缺少文件" }, { status: 400 });
    }
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json({ error: "仅支持图片格式" }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "文件不能超过 10MB" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const result = await uploadMediaFile({
      bytes,
      contentType: file.type,
      filename: file.name || "image.jpg",
      folder,
    });

    return NextResponse.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "上传失败";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
