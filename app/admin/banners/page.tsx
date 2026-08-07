import Link from "next/link";
import { requireAdminPage } from "@/lib/admin-guard";
import { loadAdminStore } from "@/lib/cms/repository";
import { deleteBannerAction } from "../actions";

export default async function AdminBannersPage() {
  await requireAdminPage();
  const items = (await loadAdminStore()).banners;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">轮播图管理</h1>
        <Link href="/admin/banners/new" className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700">
          + 新建轮播
        </Link>
      </div>
      <ul className="rounded-xl border bg-white divide-y">
        {items.map((b) => (
          <li key={b.id} className="p-4 flex justify-between gap-4 text-sm items-center">
            <div className="flex items-center gap-3 min-w-0">
              {b.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={b.image} alt="" className="h-12 w-20 object-cover rounded" />
              ) : null}
              <div className="min-w-0">
                <div className="font-medium truncate">{b.headline.cn || "(无标题)"}</div>
                <div className="text-xs text-zinc-400">{b.category}</div>
              </div>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link href={`/admin/banners/${b.id}`} className="text-blue-700">编辑</Link>
              <form action={deleteBannerAction}>
                <input type="hidden" name="id" value={b.id} />
                <button type="submit" className="text-red-600">删除</button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
