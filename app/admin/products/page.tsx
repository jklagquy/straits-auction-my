import Link from "next/link";
import { requireAdminPage } from "@/lib/admin-guard";
import { loadAdminStore } from "@/lib/cms/repository";
import { enrichProduct } from "@/lib/cms/pricing";
import type { LotStatus } from "@/lib/cms/types";
import { createProductAction } from "../actions";

const statusLabel: Record<LotStatus, string> = {
  preview: "预展中",
  available: "可询价",
  reserved: "已预留",
  sold: "已成交",
};

export default async function AdminProductsPage() {
  await requireAdminPage();
  const store = await loadAdminStore();
  const rules = store.priceRules;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">拍品管理</h1>
        <div className="flex items-center gap-3">
          <Link href="/admin/price-rules" className="text-sm text-blue-700">
            全局价格规则
          </Link>
          <form action={createProductAction}>
            <button type="submit" className="bg-zinc-900 text-white px-3 py-1.5 rounded-lg text-sm">
              新建拍品
            </button>
          </form>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left">
            <tr>
              <th className="p-3">图</th>
              <th className="p-3">Lot</th>
              <th className="p-3">标题</th>
              <th className="p-3">基础价</th>
              <th className="p-3">今日估价</th>
              <th className="p-3">状态</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {store.products.map((p) => {
              const e = enrichProduct(p, rules);
              return (
                <tr key={p.id} className="border-t">
                  <td className="p-3">
                    {p.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image} alt="" className="h-10 w-10 object-cover rounded" />
                    ) : (
                      <span className="text-zinc-300 text-xs">无图</span>
                    )}
                  </td>
                  <td className="p-3 font-mono text-xs">{p.lotNo}</td>
                  <td className="p-3">{p.title.cn}</td>
                  <td className="p-3 whitespace-nowrap">
                    RM {p.basePriceLow.toLocaleString()} - {p.basePriceHigh.toLocaleString()}
                  </td>
                  <td className="p-3 text-amber-800 font-medium">{e.estimate}</td>
                  <td className="p-3">{statusLabel[p.status]}</td>
                  <td className="p-3">
                    <Link href={`/admin/products/${p.id}`} className="text-blue-700">
                      编辑
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
