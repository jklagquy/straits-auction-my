import Link from "next/link";
import { notFound } from "next/navigation";
import PostCommentThread from "@/components/PostCommentThread";
import PostMediaGrid from "@/components/PostMediaGrid";
import { getPostById, getSiteSettings } from "@/lib/cms/repository";
import { dict, isLocale, tr, type Locale } from "@/lib/i18n";

export const revalidate = 300;

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang: raw, id } = await params;
  if (!isLocale(raw)) notFound();
  const lang = raw as Locale;
  const t = dict[lang];
  const [post, settings] = await Promise.all([getPostById(id), getSiteSettings()]);
  if (!post) notFound();

  const images =
    post.images && post.images.length > 0
      ? post.images
      : post.image
        ? [post.image]
        : [];

  return (
    <article className="bg-ivory min-h-screen">
      <div className="pt-[var(--nav-h)]" />
      <div className="mx-auto max-w-[720px] px-5 lg:px-8 py-8 space-y-8">
        <Link
          href={`/${lang}/posts`}
          className="text-[12px] tracking-wide-2 text-muted hover:text-ink"
        >
          ← {t.common.back}
        </Link>

        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.avatar}
            alt=""
            className="w-11 h-11 rounded-full border border-line object-cover"
          />
          <div>
            <div className="text-ink font-medium">{tr(post.author, lang)}</div>
            <div className="text-[12px] text-muted">{post.date}</div>
          </div>
        </div>

        <p className="text-[16px] leading-[1.9] text-ink whitespace-pre-line">
          {tr(post.content, lang)}
        </p>

        <PostMediaGrid images={images} />

        <div className="flex gap-6 text-sm text-muted border-y border-line py-4">
          <span>
            ♥ {post.likes}
            {!settings.likesEnabled ? ` · ${t.feed.memberLike}` : ""}
          </span>
          <span>◉ {post.views}</span>
          <span>
            {t.feed.viewAllComments.replace("{n}", String(post.commentCount ?? 0))}
          </span>
        </div>

        {settings.commentsEnabled ? (
          <PostCommentThread
            postId={post.id}
            lang={lang}
            initialTotal={post.commentCount ?? 0}
          />
        ) : (
          <p className="text-center text-ink-soft py-10 border border-line bg-paper">
            {t.feed.memberComment}
          </p>
        )}
      </div>
    </article>
  );
}
