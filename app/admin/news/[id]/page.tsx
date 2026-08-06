import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/admin-guard";
import { loadAdminStore } from "@/lib/cms/repository";
import { saveArticleAction } from "../../actions";
import MediaUploader from "@/components/admin/MediaUploader";

export default async function AdminNewsEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();
  const { id } = await params;
  const store = await loadAdminStore();
  const isNew = id === "new";
  const article = isNew
    ? {
        id: crypto.randomUUID(),
        slug: "",
        title: { cn: "", zh: "", en: "" },
        excerpt: { cn: "", zh: "", en: "" },
        body: { cn: "", zh: "", en: "" },
        cover: "",
        category: { cn: "市场", zh: "市場", en: "Market" },
        date: new Date().toISOString().slice(0, 10),
        active: true,
        sortOrder: 0,
      }
    : store.articles.find((a) => a.id === id);
  if (!article) notFound();

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">{isNew ? "新建新闻" : "编辑新闻"}</h1>
      <form action={saveArticleAction} className="space-y-4 rounded-xl border bg-white p-6">
        <input type="hidden" name="id" value={article.id} />
        <MediaUploader name="cover" defaultValue={article.cover} folder="news" label="封面图" />
        <Field name="slug" label="Slug" defaultValue={article.slug || article.id} />
        <Field name="date" label="日期" type="date" defaultValue={article.date} />
        <Field name="title_cn" label="标题（简）" defaultValue={article.title.cn} />
        <Field name="title_zh" label="标题（繁）" defaultValue={article.title.zh} />
        <Field name="title_en" label="标题（英文）" defaultValue={article.title.en} />
        <Field name="cat_cn" label="分类（简）" defaultValue={article.category.cn} />
        <Field name="cat_zh" label="分类（繁）" defaultValue={article.category.zh} />
        <Field name="cat_en" label="分类（英文）" defaultValue={article.category.en} />
        <Area name="excerpt_cn" label="摘要（简）" defaultValue={article.excerpt.cn} />
        <Area name="excerpt_zh" label="摘要（繁）" defaultValue={article.excerpt.zh} />
        <Area name="excerpt_en" label="摘要（英文）" defaultValue={article.excerpt.en} />
        <Area name="body_cn" label="正文（简）" rows={6} defaultValue={article.body.cn} />
        <Area name="body_zh" label="正文（繁）" rows={6} defaultValue={article.body.zh} />
        <Area name="body_en" label="正文（英文）" rows={6} defaultValue={article.body.en} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked={article.active} /> 上架
        </label>
        <button type="submit" className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm">保存</button>
      </form>
    </div>
  );
}

function Field({ name, label, defaultValue, type = "text" }: { name: string; label: string; defaultValue?: string; type?: string }) {
  return (
    <div>
      <label className="text-xs text-zinc-500 block mb-1">{label}</label>
      <input name={name} type={type} defaultValue={defaultValue} className="w-full border rounded px-3 py-2 text-sm" />
    </div>
  );
}

function Area({ name, label, defaultValue, rows = 3 }: { name: string; label: string; defaultValue?: string; rows?: number }) {
  return (
    <div>
      <label className="text-xs text-zinc-500 block mb-1">{label}</label>
      <textarea name={name} rows={rows} defaultValue={defaultValue} className="w-full border rounded px-3 py-2 text-sm" />
    </div>
  );
}
