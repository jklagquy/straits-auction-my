import Link from "next/link";
import { requireAdminPage } from "@/lib/admin-guard";
import { loadAdminStore } from "@/lib/cms/repository";
import { deleteArticleAction } from "../actions";

export default async function AdminNewsPage() {
  await requireAdminPage();
  const items = [...(await loadAdminStore()).articles].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || b.date.localeCompare(a.date)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">资讯</h1>
          <p className="mt-1 text-sm text-zinc-500">
            共 {items.length} 条，点击编辑可管理三种语言版本
          </p>
        </div>
        <Link
          href="/admin/news/new"
          className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
        >
          + 新增资讯
        </Link>
      </div>
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-zinc-500">
            <tr>
              <th className="p-3">封面</th>
              <th className="p-3">标题</th>
              <th className="p-3">语言</th>
              <th className="p-3">状态</th>
              <th className="p-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="p-3">
                  {a.cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.cover} alt="" className="h-12 w-12 rounded object-cover" />
                  ) : (
                    <span className="text-xs text-zinc-300">无图</span>
                  )}
                </td>
                <td className="p-3">
                  <div className="font-medium">{a.title.cn || a.title.zh || a.title.en}</div>
                  <div className="mt-0.5 text-xs text-zinc-400">{a.date}</div>
                </td>
                <td className="p-3">
                  <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                    简 繁 英
                  </span>
                </td>
                <td className="p-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      a.active ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    {a.active ? "启用" : "停用"}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex gap-3">
                    <Link href={`/admin/news/${a.id}`} className="text-blue-700">
                      编辑
                    </Link>
                    <form action={deleteArticleAction}>
                      <input type="hidden" name="id" value={a.id} />
                      <button type="submit" className="text-red-600">
                        删除
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {!items.length && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-zinc-400">
                  暂无资讯
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
