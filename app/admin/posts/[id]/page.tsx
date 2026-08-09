import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminPage } from "@/lib/admin-guard";
import { loadAdminStore } from "@/lib/cms/repository";
import { getCommentCount } from "@/lib/cms/comment-store";
import { savePostAction } from "../../actions";
import MediaUploader from "@/components/admin/MediaUploader";
import MultiImageUploader from "@/components/admin/MultiImageUploader";
import LanguageTabs from "@/components/admin/LanguageTabs";
import SaveButton from "@/components/admin/SaveButton";
import SavedBanner from "@/components/admin/SavedBanner";

export default async function AdminPostEditPage({
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
  const post = isNew
    ? {
        id: crypto.randomUUID(),
        author: { cn: "", zh: "", en: "" },
        avatar: "",
        content: { cn: "", zh: "", en: "" },
        image: "",
        images: [] as string[],
        date: new Date().toISOString().slice(0, 10),
        likes: 0,
        views: 0,
        commentCount: 0,
        comments: [],
        active: true,
        sortOrder: 0,
      }
    : store.posts.find((p) => p.id === id);
  if (!post) notFound();
  const commentCount = isNew ? 0 : await getCommentCount(post.id);
  const images = post.images?.length ? post.images : post.image ? [post.image] : [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <SavedBanner saved={saved} />
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{isNew ? "新增藏家动态" : "编辑藏家动态"}</h1>
        <div className="flex gap-3">
          {!isNew && (
            <Link
              href={`/admin/posts/${post.id}/comments`}
              className="rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50"
            >
              管理评论（{commentCount}）
            </Link>
          )}
          <Link href="/admin/posts" className="rounded-lg border px-3 py-2 text-sm hover:bg-zinc-50">
            返回列表
          </Link>
        </div>
      </div>

      <form action={savePostAction} className="grid gap-6 lg:grid-cols-2">
        <input type="hidden" name="id" value={post.id} />

        <div className="space-y-4 rounded-xl border bg-white p-6">
          <h2 className="font-semibold">发布者信息</h2>
          <MediaUploader name="avatar" defaultValue={post.avatar} folder="avatars" label="头像" />
          <Field name="date" label="日期" type="date" defaultValue={post.date} />

          <LanguageTabs
            cn={
              <div className="space-y-3">
                <Field name="author_cn" label="用户名" defaultValue={post.author.cn} />
                <Area name="content_cn" label="动态内容" rows={8} defaultValue={post.content.cn} />
              </div>
            }
            zh={
              <div className="space-y-3">
                <Field name="author_zh" label="用户名" defaultValue={post.author.zh} />
                <Area name="content_zh" label="动态内容" rows={8} defaultValue={post.content.zh} />
              </div>
            }
            en={
              <div className="space-y-3">
                <Field name="author_en" label="用户名" defaultValue={post.author.en} />
                <Area name="content_en" label="动态内容" rows={8} defaultValue={post.content.en} />
              </div>
            }
          />

          <div className="grid grid-cols-2 gap-4">
            <Field name="likes" label="点赞数" type="number" defaultValue={String(post.likes)} />
            <Field name="views" label="浏览量" type="number" defaultValue={String(post.views)} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="active" defaultChecked={post.active} /> 启用此动态
          </label>
        </div>

        <div className="space-y-4 rounded-xl border bg-white p-6">
          <h2 className="font-semibold">动态图片</h2>
          <MultiImageUploader
            name="images"
            defaultUrls={images}
            folder="posts"
            label="选择图片（可多选），详情页九宫格展示"
          />
          <p className="text-xs text-zinc-400">第一张图会自动作为列表封面。</p>
        </div>

        <div className="lg:col-span-2 flex justify-center">
          <SaveButton className="rounded-lg bg-blue-600 px-8 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
            {isNew ? "创建动态" : "保存修改"}
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
  rows = 4,
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
        className="w-full rounded border px-3 py-2 text-sm"
      />
    </div>
  );
}
