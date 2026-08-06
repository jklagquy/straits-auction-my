import { requireAdminPage } from "@/lib/admin-guard";
import { loadAdminStore } from "@/lib/cms/repository";

export default async function AdminSessionsPage() {
  await requireAdminPage();
  const items = (await loadAdminStore()).saleSessions;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">专场管理</h1>
      <p className="text-sm text-zinc-500">
        专场数据已接入；前台专场页与完整编辑器可后续扩展。当前可在种子数据/SQL 中维护。
      </p>
      <ul className="rounded-xl border bg-white divide-y">
        {items.map((s) => (
          <li key={s.id} className="p-4 flex justify-between gap-4 text-sm">
            <span>{s.title.cn}</span>
            <span className="text-zinc-400">{s.saleDate || ""}</span>
          </li>
        ))}
        {!items.length && <li className="p-6 text-zinc-400 text-sm">暂无专场</li>}
      </ul>
    </div>
  );
}
