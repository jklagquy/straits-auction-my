import Link from "next/link";
import { requireAdminPage } from "@/lib/admin-guard";
import { loadAdminStore } from "@/lib/cms/repository";
import { deletePostAction } from "../actions";

export default async function AdminPostsPage() {
  await requireAdminPage();
  const items = (await loadAdminStore()).posts;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">藏家动态</h1>
        <Link href="/admin/posts/new" className="bg-zinc-900 text-white px-3 py-1.5 rounded-lg text-sm">
          新建动态
        </Link>
      </div>
      <ul className="rounded-xl border bg-white divide-y">
        {items.map((p) => (
          <li key={p.id} className="p-4 flex justify-between gap-4 text-sm items-center">
            <div>
              <div className="font-medium">{p.author.cn}</div>
              <div className="text-zinc-500 line-clamp-1 mt-1">{p.content.cn}</div>
            </div>
            <div className="flex gap-3 shrink-0 items-center">
              <span className="text-zinc-400 text-xs">{p.commentCount ?? 0} 评</span>
              <Link href={`/admin/posts/${p.id}/comments`} className="text-zinc-700">评论</Link>
              <Link href={`/admin/posts/${p.id}`} className="text-blue-700">编辑</Link>
              <form action={deletePostAction}>
                <input type="hidden" name="id" value={p.id} />
                <button type="submit" className="text-red-600">删除</button>
              </form>
            </div>
          </li>
        ))}
        {!items.length && <li className="p-6 text-zinc-400 text-sm">暂无动态</li>}
      </ul>
    </div>
  );
}
