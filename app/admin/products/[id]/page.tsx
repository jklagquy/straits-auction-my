import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/admin-guard";
import { deleteProductAction, saveProductAction } from "../../actions";
import { loadAdminStore } from "@/lib/cms/repository";
import { enrichProduct, formatMoney, resolveUplift } from "@/lib/cms/pricing";
import PricePreview from "./PricePreview";
import MediaUploader from "@/components/admin/MediaUploader";
import SavedBanner from "@/components/admin/SavedBanner";
import SaveButton from "@/components/admin/SaveButton";

export default async function AdminProductEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireAdminPage();
  const { id } = await params;
  const { saved } = await searchParams;
  const store = await loadAdminStore();
  const product = store.products.find((p) => p.id === id);
  if (!product) notFound();
  const live = enrichProduct(product, store.priceRules);
  const original = product.basePriceLow || product.basePriceHigh || 0;
  const currentSeed =
    product.manualCurrentPrice && product.manualCurrentPrice > 0
      ? product.manualCurrentPrice
      : live.displayPriceLow || original;
  const usingOverride = product.upliftEnabled !== null;
  const effective = resolveUplift(product, store.priceRules);
  const orphanUplift =
    !usingOverride && product.upliftValue != null && product.upliftValue !== effective.value;

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">编辑拍品 · {product.lotNo}</h1>
      <SavedBanner saved={saved} />
      <div className="rounded-lg border bg-amber-50 p-4 text-sm space-y-1">
        <div>
          原价（前台划线）：
          <span className="text-zinc-400 line-through ml-1">
            {formatMoney(original, product.currency || "MYR", "cn")}
          </span>
        </div>
        <div>
          上浮起点（本页「当前价格」栏）：
          {formatMoney(currentSeed, product.currency || "MYR", "cn")}
        </div>
        <div>
          前台现价（起点 + 每日上浮，访客看到的是这个）：
          <strong className="ml-1">
            {formatMoney(live.displayPriceLow, product.currency || "MYR", "cn")}
          </strong>
        </div>
        <div className="text-zinc-600">
          实际规则：
          {effective.enabled
            ? `${usingOverride ? "单品" : "全局"} ${effective.mode === "percent_daily" ? `每天 +${effective.value}%` : `每天 +RM ${effective.value}`}，自 ${effective.startAt} 起`
            : "上浮已关闭，前台等于起点"}
        </div>
        {orphanUplift ? (
          <div className="text-red-700">
            库里有旧残留上浮值 {product.upliftValue}
            %，但未勾选「使用单品上浮规则」，前台不会用它，正在用全局{" "}
            {store.priceRules.defaultUpliftValue}%。
          </div>
        ) : null}
        <div>库存：{product.stockQuantity ?? 0}</div>
        <PricePreview productId={product.id} />
      </div>

      <form
        action={saveProductAction}
        noValidate
        className="space-y-4 rounded-xl border bg-white p-6"
      >
        <input type="hidden" name="id" value={product.id} />

        <MediaUploader name="image" defaultValue={product.image} folder="products" label="主图" />
        <div>
          <label className="text-xs text-zinc-500 block mb-1">图集（每行一个 URL，可选）</label>
          <textarea
            name="gallery"
            rows={3}
            defaultValue={product.gallery.join("\n")}
            className="w-full border rounded px-3 py-2 text-sm font-mono"
          />
        </div>

        <Field label="Lot 编号" name="lot_no" defaultValue={product.lotNo} />
        <Field label="Slug（URL）" name="slug" defaultValue={product.slug} />
        <Field label="标题（简）" name="title_cn" defaultValue={product.title.cn} />
        <Field label="标题（繁）" name="title_zh" defaultValue={product.title.zh} />
        <Field label="标题（英文）" name="title_en" defaultValue={product.title.en} />
        <Field label="分类（简）" name="cat_cn" defaultValue={product.category.cn} />
        <Field label="分类（繁）" name="cat_zh" defaultValue={product.category.zh} />
        <Field label="分类（英文）" name="cat_en" defaultValue={product.category.en} />

        <div>
          <label className="text-xs text-zinc-500">摘要（简）</label>
          <textarea name="excerpt_cn" rows={2} defaultValue={product.excerpt.cn} className="w-full border rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-zinc-500">摘要（繁）</label>
          <textarea name="excerpt_zh" rows={2} defaultValue={product.excerpt.zh} className="w-full border rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-zinc-500">摘要（英文）</label>
          <textarea name="excerpt_en" rows={2} defaultValue={product.excerpt.en} className="w-full border rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-zinc-500">详情（简）</label>
          <textarea name="desc_cn" rows={4} defaultValue={product.description.cn} className="w-full border rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-zinc-500">详情（繁）</label>
          <textarea name="desc_zh" rows={4} defaultValue={product.description.zh} className="w-full border rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-zinc-500">详情（英文）</label>
          <textarea name="desc_en" rows={4} defaultValue={product.description.en} className="w-full border rounded px-3 py-2 text-sm" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            label="原价 / 划线价 (RM)"
            name="base_low"
            type="number"
            defaultValue={original ? String(original) : ""}
          />
          <Field
            label="上浮起点 (RM)，不是前台现价"
            name="current_price"
            type="number"
            defaultValue={currentSeed ? String(currentSeed) : ""}
          />
        </div>
        <Field
          label="库存数量"
          name="stock"
          type="number"
          defaultValue={String(product.stockQuantity ?? 0)}
        />
        <p className="text-xs text-zinc-500 -mt-2">
          原价 = 前台划线。上浮关闭时，前台现价等于起点；上浮开启时 = 起点 × (1 + 日上浮% ×
          天数)。未填库存时前台显示 0。
        </p>

        <Field label="上浮起始日" name="uplift_start" type="date" defaultValue={product.upliftStartAt} />
        <Field label="封顶价 (可选)" name="price_cap" type="number" defaultValue={product.priceCapHigh ? String(product.priceCapHigh) : ""} />

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="uplift_override" defaultChecked={usingOverride} />
          使用单品上浮规则（不勾选则继承全局，下面三栏不生效）
        </label>
        {!usingOverride ? (
          <p className="text-xs text-amber-800">
            当前继承全局：
            {store.priceRules.defaultUpliftEnabled
              ? `每天 +${store.priceRules.defaultUpliftValue}%（后台「价格规则」）`
              : "全站上浮已关闭，前台等于起点"}
            。若要单独开/关或改百分比，必须勾选「使用单品上浮规则」后再保存。
          </p>
        ) : null}

        <div className="grid sm:grid-cols-3 gap-4 pl-4 border-l">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="uplift_enabled"
              defaultChecked={
                usingOverride
                  ? product.upliftEnabled === true
                  : store.priceRules.defaultUpliftEnabled
              }
            />
            启用上浮
          </label>
          <div>
            <label className="text-xs text-zinc-500">模式</label>
            <select name="uplift_mode" defaultValue={product.upliftMode || "percent_daily"} className="w-full border rounded px-2 py-1 text-sm">
              <option value="percent_daily">每日百分比 %</option>
              <option value="fixed_daily">每日固定 RM</option>
            </select>
          </div>
          <Field label="上浮值" name="uplift_value" type="number" defaultValue={String(product.upliftValue ?? store.priceRules.defaultUpliftValue)} />
        </div>

        <div>
          <label className="text-xs text-zinc-500">状态</label>
          <select name="status" defaultValue={product.status} className="w-full border rounded px-2 py-2 text-sm">
            <option value="preview">预展中</option>
            <option value="available">可询价</option>
            <option value="reserved">已预留</option>
            <option value="sold">已成交</option>
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={product.featured} /> 精选
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked={product.active} /> 上架
        </label>

        <div className="flex gap-3 pt-2">
          <SaveButton />
        </div>
      </form>

      <form action={deleteProductAction} className="rounded-xl border border-red-200 bg-red-50 p-4">
        <input type="hidden" name="id" value={product.id} />
        <button type="submit" className="text-sm text-red-700">
          删除此拍品
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs text-zinc-500 block mb-1">{label}</label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        step={type === "number" ? "any" : undefined}
        className="w-full border rounded px-3 py-2 text-sm"
      />
    </div>
  );
}
