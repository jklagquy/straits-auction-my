import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/admin-guard";
import { loadAdminStore } from "@/lib/cms/repository";
import { savePostAction } from "../../actions";
import MediaUploader from "@/components/admin/MediaUploader";

export default async function AdminPostEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();
  const { id } = await params;
  const store = await loadAdminStore();
  const isNew = id === "new";
  const post = isNew
    ? {
        id: crypto.randomUUID(),
        author: { cn: "", zh: "", en: "" },
        avatar: "",
        content: { cn: "", zh: "", en: "" },
        image: "",
        date: new Date().toISOString().slice(0, 10),
        likes: 0,
        views: 0,
        comments: [],
        active: true,
        sortOrder: 0,
      }
    : store.posts.find((p) => p.id === id);
  if (!post) notFound();

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">{isNew ? "新建动态" : "编辑动态"}</h1>
      <form action={savePostAction} className="space-y-4 rounded-xl border bg-white p-6">
        <input type="hidden" name="id" value={post.id} />
        <MediaUploader name="image" defaultValue={post.image} folder="posts" label="配图" />
        <MediaUploader name="avatar" defaultValue={post.avatar} folder="avatars" label="头像" />
        <Field name="date" label="日期" type="date" defaultValue={post.date} />
        <Field name="author_cn" label="作者（简）" defaultValue={post.author.cn} />
        <Field name="author_zh" label="作者（繁）" defaultValue={post.author.zh} />
        <Field name="author_en" label="作者（英文）" defaultValue={post.author.en} />
        <Area name="content_cn" label="内容（简）" defaultValue={post.content.cn} />
        <Area name="content_zh" label="内容（繁）" defaultValue={post.content.zh} />
        <Area name="content_en" label="内容（英文）" defaultValue={post.content.en} />
        <div className="grid grid-cols-2 gap-4">
          <Field name="likes" label="点赞数" type="number" defaultValue={String(post.likes)} />
          <Field name="views" label="浏览量" type="number" defaultValue={String(post.views)} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked={post.active} /> 上架
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

function Area({ name, label, defaultValue }: { name: string; label: string; defaultValue?: string }) {
  return (
    <div>
      <label className="text-xs text-zinc-500 block mb-1">{label}</label>
      <textarea name={name} rows={4} defaultValue={defaultValue} className="w-full border rounded px-3 py-2 text-sm" />
    </div>
  );
}
