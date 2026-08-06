import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/admin-guard";
import { loadAdminStore } from "@/lib/cms/repository";
import { saveBannerAction } from "../../actions";
import MediaUploader from "@/components/admin/MediaUploader";

export default async function AdminBannerEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();
  const { id } = await params;
  const store = await loadAdminStore();
  const isNew = id === "new";
  const banner = isNew
    ? {
        id: crypto.randomUUID(),
        image: "",
        headline: { cn: "", zh: "", en: "" },
        sub: { cn: "", zh: "", en: "" },
        linkSlug: "",
        category: "hero" as const,
        active: true,
        sortOrder: 0,
      }
    : store.banners.find((b) => b.id === id);
  if (!banner) notFound();

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">{isNew ? "新建横幅" : "编辑横幅"}</h1>
      <form action={saveBannerAction} className="space-y-4 rounded-xl border bg-white p-6">
        <input type="hidden" name="id" value={banner.id} />
        <MediaUploader name="image" defaultValue={banner.image} folder="banners" label="横幅图片" />
        <div>
          <label className="text-xs text-zinc-500">类型</label>
          <select name="category" defaultValue={banner.category} className="w-full border rounded px-3 py-2 text-sm">
            <option value="hero">首页 Hero</option>
            <option value="news">新闻横幅</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-zinc-500 block mb-1">链接藏品 slug（首页轮播点击跳转）</label>
          <input
            name="link_slug"
            defaultValue={banner.linkSlug || ""}
            placeholder="例如 tianhuang-seal"
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>
        <input name="headline_cn" defaultValue={banner.headline.cn} placeholder="标题简体" className="w-full border rounded px-3 py-2 text-sm" />
        <input name="headline_zh" defaultValue={banner.headline.zh} placeholder="标题繁體" className="w-full border rounded px-3 py-2 text-sm" />
        <input name="headline_en" defaultValue={banner.headline.en} placeholder="Headline EN" className="w-full border rounded px-3 py-2 text-sm" />
        <input name="sub_cn" defaultValue={banner.sub.cn} placeholder="副标题简体" className="w-full border rounded px-3 py-2 text-sm" />
        <input name="sub_zh" defaultValue={banner.sub.zh} placeholder="副标题繁體" className="w-full border rounded px-3 py-2 text-sm" />
        <input name="sub_en" defaultValue={banner.sub.en} placeholder="Sub EN" className="w-full border rounded px-3 py-2 text-sm" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked={banner.active} /> 启用
        </label>
        <button type="submit" className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm">保存</button>
      </form>
    </div>
  );
}
