import Link from "next/link";
import { requireAdminPage } from "@/lib/admin-guard";
import { loadAdminStore } from "@/lib/cms/repository";
import { enrichProduct } from "@/lib/cms/pricing";
import type { LotStatus } from "@/lib/cms/types";
import { createProductAction, deleteProductAction, moveProductSortAction } from "../actions";

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
  const products = [...store.products].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">拍品管理</h1>
          <p className="mt-1 text-sm text-zinc-500">共 {products.length} 件 · 可用箭头调整前台排序</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/price-rules" className="text-sm text-blue-700">
            全局价格规则
          </Link>
          <form action={createProductAction}>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
            >
              + 新建拍品
            </button>
          </form>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-zinc-500">
            <tr>
              <th className="p-3">图</th>
              <th className="p-3">名称</th>
              <th className="p-3">估价</th>
              <th className="p-3">排序</th>
              <th className="p-3">状态</th>
              <th className="p-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => {
              const e = enrichProduct(p, rules);
              return (
                <tr key={p.id} className="border-t">
                  <td className="p-3">
                    {p.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image} alt="" className="h-14 w-14 rounded object-cover" />
                    ) : (
                      <span className="text-xs text-zinc-300">无图</span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="font-medium">{p.title.cn}</div>
                    <div className="mt-0.5 font-mono text-xs text-zinc-400">{p.lotNo}</div>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <div className="text-amber-800 font-medium">{e.estimate}</div>
                    <div className="text-xs text-zinc-400">
                      原价 RM {(p.basePriceLow || p.basePriceHigh).toLocaleString()}
                      {" · "}库存 {p.stockQuantity ?? 0}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <form action={moveProductSortAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="dir" value="up" />
                        <button
                          type="submit"
                          disabled={i === 0}
                          className="rounded border px-2 py-0.5 text-xs disabled:opacity-30"
                          title="上移"
                        >
                          ↑
                        </button>
                      </form>
                      <form action={moveProductSortAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="dir" value="down" />
                        <button
                          type="submit"
                          disabled={i === products.length - 1}
                          className="rounded border px-2 py-0.5 text-xs disabled:opacity-30"
                          title="下移"
                        >
                          ↓
                        </button>
                      </form>
                      <span className="ml-1 text-xs text-zinc-400">{p.sortOrder ?? i}</span>
                    </div>
                  </td>
                  <td className="p-3">{statusLabel[p.status]}</td>
                  <td className="p-3">
                    <div className="flex gap-3">
                      <Link href={`/admin/products/${p.id}`} className="text-blue-700">
                        编辑
                      </Link>
                      <form action={deleteProductAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <button type="submit" className="text-red-600" title="删除">
                          删除
                        </button>
                      </form>
                    </div>
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
