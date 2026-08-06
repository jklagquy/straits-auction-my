import Link from "next/link";
import { requireAdminPage } from "@/lib/admin-guard";
import { loadAdminStore } from "@/lib/cms/repository";
import { deleteArticleAction } from "../actions";

export default async function AdminNewsPage() {
  await requireAdminPage();
  const items = (await loadAdminStore()).articles;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">新闻管理</h1>
        <Link href="/admin/news/new" className="bg-zinc-900 text-white px-3 py-1.5 rounded-lg text-sm">
          新建新闻
        </Link>
      </div>
      <ul className="rounded-xl border bg-white divide-y">
        {items.map((a) => (
          <li key={a.id} className="p-4 flex justify-between gap-4 text-sm items-center">
            <div>
              <div className="font-medium">{a.title.cn}</div>
              <div className="text-zinc-400 text-xs mt-1">{a.date} · {a.active ? "上架" : "下架"}</div>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link href={`/admin/news/${a.id}`} className="text-blue-700">编辑</Link>
              <form action={deleteArticleAction}>
                <input type="hidden" name="id" value={a.id} />
                <button type="submit" className="text-red-600">删除</button>
              </form>
            </div>
          </li>
        ))}
        {!items.length && <li className="p-6 text-zinc-400 text-sm">暂无新闻</li>}
      </ul>
    </div>
  );
}
