import Link from "next/link";
import { requireAdminPage } from "@/lib/admin-guard";
import { loadAdminStore } from "@/lib/cms/repository";
import { deletePostAction } from "../actions";

export default async function AdminPostsPage() {
  await requireAdminPage();
  const items = [...(await loadAdminStore()).posts].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || b.date.localeCompare(a.date)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">藏家动态</h1>
          <p className="mt-1 text-sm text-zinc-500">
            共 {items.length} 条 · 支持多图生活流
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
        >
          + 新增动态
        </Link>
      </div>
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-zinc-500">
            <tr>
              <th className="p-3">头像</th>
              <th className="p-3">用户</th>
              <th className="p-3">内容</th>
              <th className="p-3">图</th>
              <th className="p-3">赞/评</th>
              <th className="p-3">状态</th>
              <th className="p-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => {
              const imgCount = p.images?.length || (p.image ? 1 : 0);
              return (
                <tr key={p.id} className="border-t">
                  <td className="p-3">
                    {p.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                    ) : (
                      <span className="inline-block h-9 w-9 rounded-full bg-zinc-200" />
                    )}
                  </td>
                  <td className="p-3 font-medium">{p.author.cn || p.author.en}</td>
                  <td className="max-w-xs p-3">
                    <div className="line-clamp-2 text-zinc-600">{p.content.cn || p.content.en}</div>
                  </td>
                  <td className="p-3 text-zinc-500">{imgCount}</td>
                  <td className="p-3 text-xs text-zinc-500">
                    {p.likes} / {p.commentCount ?? 0}
                  </td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        p.active ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-500"
                      }`}
                    >
                      {p.active ? "启用" : "停用"}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-3">
                      <Link href={`/admin/posts/${p.id}/comments`} className="text-zinc-700">
                        评论
                      </Link>
                      <Link href={`/admin/posts/${p.id}`} className="text-blue-700">
                        编辑
                      </Link>
                      <form action={deletePostAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <button type="submit" className="text-red-600">
                          删除
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!items.length && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-zinc-400">
                  暂无动态
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
