import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/admin-guard";
import { loadAdminStore } from "@/lib/cms/repository";
import { saveArticleAction } from "../../actions";
import MediaUploader from "@/components/admin/MediaUploader";
import LanguageTabs from "@/components/admin/LanguageTabs";
import SaveButton from "@/components/admin/SaveButton";
import SavedBanner from "@/components/admin/SavedBanner";

export default async function AdminNewsEditPage({
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
    <div className="mx-auto max-w-3xl space-y-6">
      <SavedBanner saved={saved} />
      <div>
        <h1 className="text-2xl font-bold">{isNew ? "新增资讯" : "编辑资讯"}</h1>
        <p className="mt-1 text-sm text-zinc-500">点击语言 Tab 分别编辑简体 / 繁体 / 英文版本</p>
      </div>
      <form action={saveArticleAction} className="space-y-5 rounded-xl border bg-white p-6">
        <input type="hidden" name="id" value={article.id} />

        <div className="grid gap-4 rounded-xl border bg-zinc-50 p-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-zinc-500">排序（数字越小越靠前）</label>
            <input
              name="sort_order"
              type="number"
              defaultValue={String(article.sortOrder ?? 0)}
              className="w-full rounded border bg-white px-3 py-2 text-sm"
            />
          </div>
          <label className="flex items-end gap-2 pb-2 text-sm">
            <input type="checkbox" name="active" defaultChecked={article.active} className="h-4 w-4" />
            显示此资讯
          </label>
        </div>

        <MediaUploader name="cover" defaultValue={article.cover} folder="news" label="封面图片" />
        <Field name="slug" label="Slug（URL）" defaultValue={article.slug || article.id} />
        <Field name="date" label="日期" type="date" defaultValue={article.date} />

        <div className="rounded-xl border p-4">
          <h2 className="mb-3 text-sm font-semibold">语言版本</h2>
          <LanguageTabs
            cn={
              <div className="space-y-3">
                <Field name="title_cn" label="标题" defaultValue={article.title.cn} />
                <Field name="cat_cn" label="分类" defaultValue={article.category.cn} />
                <Area name="excerpt_cn" label="摘要" rows={3} defaultValue={article.excerpt.cn} />
                <Area
                  name="body_cn"
                  label="正文（支持换行；可粘贴 HTML 简单排版）"
                  rows={12}
                  defaultValue={article.body.cn}
                />
              </div>
            }
            zh={
              <div className="space-y-3">
                <Field name="title_zh" label="标题" defaultValue={article.title.zh} />
                <Field name="cat_zh" label="分类" defaultValue={article.category.zh} />
                <Area name="excerpt_zh" label="摘要" rows={3} defaultValue={article.excerpt.zh} />
                <Area
                  name="body_zh"
                  label="正文（支持换行；可粘贴 HTML 简单排版）"
                  rows={12}
                  defaultValue={article.body.zh}
                />
              </div>
            }
            en={
              <div className="space-y-3">
                <Field name="title_en" label="标题" defaultValue={article.title.en} />
                <Field name="cat_en" label="分类" defaultValue={article.category.en} />
                <Area name="excerpt_en" label="摘要" rows={3} defaultValue={article.excerpt.en} />
                <Area
                  name="body_en"
                  label="正文（支持换行；可粘贴 HTML 简单排版）"
                  rows={12}
                  defaultValue={article.body.en}
                />
              </div>
            }
          />
        </div>

        <div className="flex justify-end gap-3">
          <a href="/admin/news" className="rounded-lg border px-4 py-2 text-sm hover:bg-zinc-50">
            取消
          </a>
          <SaveButton className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-60">
            保存修改
          </SaveButton>
        </div>
      </form>
    </div>
  );
}

function Field({
  name,
  label,
  defaultValue,
  type = "text",
}: {
  name: string;
  label: string;
  defaultValue?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs text-zinc-500">{label}</label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        className="w-full rounded border px-3 py-2 text-sm"
      />
    </div>
  );
}

function Area({
  name,
  label,
  defaultValue,
  rows = 3,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  rows?: number;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs text-zinc-500">{label}</label>
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        className="w-full rounded border px-3 py-2 text-sm leading-relaxed"
      />
    </div>
  );
}
