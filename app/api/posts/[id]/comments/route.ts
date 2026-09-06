import { NextResponse } from "next/server";
import { listCommentsPage } from "@/lib/cms/comment-store";
import { isPublicSiteEnabled } from "@/lib/site-gate";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isPublicSiteEnabled())) {
    return NextResponse.json({}, { status: 404 });
  }
  const { id } = await params;
  const url = new URL(req.url);
  const offset = Math.max(0, Number(url.searchParams.get("offset") || 0) || 0);
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit") || 20) || 20));
  const { comments, total } = await listCommentsPage(id, offset, limit);
  return NextResponse.json({
    total,
    offset,
    limit,
    comments: comments.map((c) => ({
      id: c.id,
      user: c.user,
      text: c.text,
      langTag: c.langTag,
    })),
  });
}
