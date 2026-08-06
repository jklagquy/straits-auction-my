import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/admin-guard";
import { loadAdminStore } from "@/lib/cms/repository";
import { listCommentsPage } from "@/lib/cms/comment-store";
import {
  deletePostCommentAction,
  savePostCommentAction,
} from "../../../actions";

const PAGE_SIZE = 40;

export default async function AdminPostCommentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  await requireAdminPage();
  const { id } = await params;
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page || 1) || 1);
  const store = await loadAdminStore();
  const post = store.posts.find((p) => p.id === id);
  if (!post) notFound();

  const offset = (page - 1) * PAGE_SIZE;
  const { comments, total } = await listCommentsPage(id, offset, PAGE_SIZE);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href={`/admin/posts/${id}`} className="text-sm text-zinc-500 hover:text-zinc-900">
            ← 返回动态
          </Link>
          <h1 className="text-2xl font-bold mt-1">评论管理</h1>
          <p className="text-sm text-zinc-500 mt-1">
            共 {total} 条 · 可编辑用户名与正文 · 支持多语言内容
          </p>
        </div>
      </div>

      <form action={savePostCommentAction} className="rounded-xl border bg-white p-4 space-y-3">
        <h2 className="font-semibold text-sm">新增评论</h2>
        <input type="hidden" name="post_id" value={id} />
        <input type="hidden" name="id" value={crypto.randomUUID()} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            name="user"
            placeholder="用户名"
            required
            className="border rounded px-3 py-2 text-sm"
          />
          <select name="lang_tag" className="border rounded px-3 py-2 text-sm" defaultValue="my">
            <option value="my">马来华人 / 华语</option>
            <option value="en">English</option>
            <option value="ms">Bahasa Melayu</option>
            <option value="ja">日本語</option>
            <option value="ko">한국어</option>
            <option value="th">ไทย</option>
            <option value="id">Bahasa Indonesia</option>
            <option value="vi">Tiếng Việt</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="ar">العربية</option>
          </select>
          <button type="submit" className="bg-zinc-900 text-white rounded-lg text-sm px-4 py-2">
            添加
          </button>
        </div>
        <textarea
          name="text"
          rows={2}
          required
          placeholder="评论内容"
          className="w-full border rounded px-3 py-2 text-sm"
        />
      </form>

      <div className="space-y-3">
        {comments.map((c) => (
          <form
            key={c.id}
            action={savePostCommentAction}
            className="rounded-xl border bg-white p-4 space-y-2"
          >
            <input type="hidden" name="post_id" value={id} />
            <input type="hidden" name="id" value={c.id} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                name="user"
                defaultValue={c.user}
                className="border rounded px-3 py-2 text-sm"
              />
              <input
                name="lang_tag"
                defaultValue={c.langTag}
                className="border rounded px-3 py-2 text-sm"
              />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 border rounded-lg text-sm px-3 py-2 hover:bg-zinc-50">
                  保存
                </button>
                <button
                  formAction={deletePostCommentAction}
                  className="rounded-lg text-sm px-3 py-2 text-red-700 border border-red-200 hover:bg-red-50"
                >
                  删除
                </button>
              </div>
            </div>
            <textarea
              name="text"
              rows={2}
              defaultValue={c.text}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </form>
        ))}
        {!comments.length && (
          <p className="text-sm text-zinc-500">暂无评论。可运行 npm run seed:comments 批量生成。</p>
        )}
      </div>

      {pages > 1 && (
        <div className="flex flex-wrap gap-2 text-sm">
          {Array.from({ length: Math.min(pages, 20) }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/posts/${id}/comments?page=${p}`}
              className={`px-3 py-1 rounded border ${
                p === page ? "bg-zinc-900 text-white" : "bg-white hover:bg-zinc-50"
              }`}
            >
              {p}
            </Link>
          ))}
          {pages > 20 && (
            <span className="text-zinc-500 self-center">… 共 {pages} 页，用 ?page= 跳转</span>
          )}
        </div>
      )}
    </div>
  );
}
