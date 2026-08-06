import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/admin-guard";
import { loadAdminStore } from "@/lib/cms/repository";
import { saveMarqueeAction } from "../../actions";

export default async function AdminMarqueeEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();
  const { id } = await params;
  const store = await loadAdminStore();
  const isNew = id === "new";
  const msg = isNew
    ? { id: crypto.randomUUID(), text: { cn: "", zh: "", en: "" }, active: true, sortOrder: 0 }
    : store.marquee.find((m) => m.id === id);
  if (!msg) notFound();

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">{isNew ? "新建公告" : "编辑公告"}</h1>
      <form action={saveMarqueeAction} className="space-y-4 rounded-xl border bg-white p-6">
        <input type="hidden" name="id" value={msg.id} />
        <textarea name="text_cn" rows={2} defaultValue={msg.text.cn} placeholder="简体" className="w-full border rounded px-3 py-2 text-sm" />
        <textarea name="text_zh" rows={2} defaultValue={msg.text.zh} placeholder="繁體" className="w-full border rounded px-3 py-2 text-sm" />
        <textarea name="text_en" rows={2} defaultValue={msg.text.en} placeholder="English" className="w-full border rounded px-3 py-2 text-sm" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked={msg.active} /> 启用
        </label>
        <button type="submit" className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm">保存</button>
      </form>
    </div>
  );
}
