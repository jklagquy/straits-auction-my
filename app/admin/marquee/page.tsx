import Link from "next/link";
import { requireAdminPage } from "@/lib/admin-guard";
import { loadAdminStore } from "@/lib/cms/repository";
import {
  createMarqueeInlineAction,
  deleteMarqueeAction,
  saveMarqueeInlineAction,
  toggleMarqueeActiveAction,
} from "../actions";

import SavedBanner from "@/components/admin/SavedBanner";
import SaveButton from "@/components/admin/SaveButton";

export default async function AdminMarqueePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireAdminPage();
  const { saved } = await searchParams;
  const items = [...(await loadAdminStore()).marquee].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
  );

  return (
    <div className="space-y-6">
      <SavedBanner saved={saved} />
      <div>
        <h1 className="text-2xl font-bold">滚动公告</h1>
        <p className="mt-1 text-sm text-zinc-500">
          三语并排编辑；开关可立即控制前台是否显示
        </p>
      </div>

      <form action={createMarqueeInlineAction} className="space-y-3 rounded-xl border bg-white p-5">
        <h2 className="text-sm font-semibold">新增公告</h2>
        <div className="grid gap-3 lg:grid-cols-3">
          <textarea
            name="text_cn"
            rows={2}
            placeholder="简体中文内容"
            className="w-full rounded border px-3 py-2 text-sm"
          />
          <textarea
            name="text_zh"
            rows={2}
            placeholder="繁體中文內容"
            className="w-full rounded border px-3 py-2 text-sm"
          />
          <textarea
            name="text_en"
            rows={2}
            placeholder="English content"
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
        >
          + 添加公告
        </button>
      </form>

      <ul className="space-y-3">
        {items.map((m) => (
          <li key={m.id} className="rounded-xl border bg-white p-4">
            <form action={saveMarqueeInlineAction} className="space-y-3">
              <input type="hidden" name="id" value={m.id} />
              <div className="grid gap-3 lg:grid-cols-3">
                <textarea
                  name="text_cn"
                  rows={2}
                  defaultValue={m.text.cn}
                  className="w-full rounded border px-3 py-2 text-sm"
                />
                <textarea
                  name="text_zh"
                  rows={2}
                  defaultValue={m.text.zh}
                  className="w-full rounded border px-3 py-2 text-sm"
                />
                <textarea
                  name="text_en"
                  rows={2}
                  defaultValue={m.text.en}
                  className="w-full rounded border px-3 py-2 text-sm"
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="active" defaultChecked={m.active} />
                  启用
                </label>
                <div className="flex gap-3">
                  <SaveButton className="rounded border px-3 py-1 text-sm hover:bg-zinc-50 disabled:opacity-60">
                    保存
                  </SaveButton>
                  <Link href={`/admin/marquee/${m.id}`} className="text-sm text-blue-700">
                    详情
                  </Link>
                </div>
              </div>
            </form>
            <div className="mt-3 flex items-center justify-between border-t pt-3">
              <form action={toggleMarqueeActiveAction} className="flex items-center gap-2 text-sm">
                <input type="hidden" name="id" value={m.id} />
                <input type="hidden" name="active" value={m.active ? "" : "on"} />
                <button
                  type="submit"
                  className={`rounded-full px-3 py-1 text-xs ${
                    m.active ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-500"
                  }`}
                >
                  {m.active ? "已启用 · 点此停用" : "已停用 · 点此启用"}
                </button>
              </form>
              <form action={deleteMarqueeAction}>
                <input type="hidden" name="id" value={m.id} />
                <button type="submit" className="text-sm text-red-600">
                  删除
                </button>
              </form>
            </div>
          </li>
        ))}
        {!items.length && (
          <li className="rounded-xl border bg-white p-8 text-center text-sm text-zinc-400">
            暂无公告
          </li>
        )}
      </ul>
    </div>
  );
}
