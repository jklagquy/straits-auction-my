import Link from "next/link";
import { requireAdminPage } from "@/lib/admin-guard";
import { loadAdminStore } from "@/lib/cms/repository";
import { deleteMarqueeAction } from "../actions";

export default async function AdminMarqueePage() {
  await requireAdminPage();
  const items = (await loadAdminStore()).marquee;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">滚动公告</h1>
        <Link href="/admin/marquee/new" className="bg-zinc-900 text-white px-3 py-1.5 rounded-lg text-sm">
          新建公告
        </Link>
      </div>
      <ul className="rounded-xl border bg-white divide-y">
        {items.map((m) => (
          <li key={m.id} className="p-4 flex justify-between gap-4 text-sm items-center">
            <span>{m.text.cn}</span>
            <div className="flex gap-3 shrink-0">
              <Link href={`/admin/marquee/${m.id}`} className="text-blue-700">编辑</Link>
              <form action={deleteMarqueeAction}>
                <input type="hidden" name="id" value={m.id} />
                <button type="submit" className="text-red-600">删除</button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
