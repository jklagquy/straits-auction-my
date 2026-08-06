"use client";

import Link from "next/link";
import { useState } from "react";
import type { Post } from "@/lib/cms/types";
import { dict, tr, type Locale } from "@/lib/i18n";

const PREVIEW_LIMIT = 5;

function fmt(n: number) {
  if (n >= 10000) return (n / 10000).toFixed(1).replace(/\.0$/, "") + "w";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
}

export default function SocialFeed({
  posts,
  lang,
  commentsEnabled = true,
  likesEnabled = true,
}: {
  posts: Post[];
  lang: Locale;
  commentsEnabled?: boolean;
  likesEnabled?: boolean;
}) {
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 [column-fill:_balance]">
      {posts.map((p) => (
        <FeedCard
          key={p.id}
          post={p}
          lang={lang}
          commentsEnabled={commentsEnabled}
          likesEnabled={likesEnabled}
        />
      ))}
    </div>
  );
}

type LoadedComment = { id: string; user: string; text: string };

function FeedCard({
  post,
  lang,
  commentsEnabled,
  likesEnabled,
}: {
  post: Post;
  lang: Locale;
  commentsEnabled: boolean;
  likesEnabled: boolean;
}) {
  const t = dict[lang];
  const detailHref = `/${lang}/posts/${post.id}`;
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [preview, setPreview] = useState<LoadedComment[]>([]);
  const [total, setTotal] = useState(post.commentCount ?? 0);
  const [loading, setLoading] = useState(false);

  const showMember = (kind: "comment" | "like") => {
    setPrompt(kind === "comment" ? t.feed.memberComment : t.feed.memberLike);
  };

  const loadPreview = async () => {
    if (loading || preview.length > 0) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/posts/${post.id}/comments?offset=0&limit=${PREVIEW_LIMIT}`
      );
      if (!res.ok) return;
      const data = (await res.json()) as {
        total: number;
        comments: LoadedComment[];
      };
      setTotal(data.total);
      setPreview(data.comments.slice(0, PREVIEW_LIMIT));
    } finally {
      setLoading(false);
    }
  };

  const onCommentClick = async () => {
    if (!commentsEnabled) {
      showMember("comment");
      return;
    }
    const next = !showComments;
    setShowComments(next);
    if (next) await loadPreview();
  };

  const onLikeClick = () => {
    if (!likesEnabled) {
      showMember("like");
      return;
    }
    setLiked((v) => !v);
    setLikes((n) => (liked ? n - 1 : n + 1));
  };

  return (
    <div className="mb-6 break-inside-avoid bg-paper border border-line hover-lift overflow-hidden">
      <Link
        href={detailHref}
        className="relative block overflow-hidden bg-ivory-deep group"
        aria-label={t.feed.openThread}
      >
        {(() => {
          const imgs =
            post.images && post.images.length > 0
              ? post.images.slice(0, 4)
              : post.image
                ? [post.image]
                : [];
          if (imgs.length >= 4) {
            return (
              <div className="grid grid-cols-2 gap-0.5">
                {imgs.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={`${src}-${i}`}
                    src={src}
                    alt=""
                    className="aspect-square w-full object-cover"
                  />
                ))}
              </div>
            );
          }
          if (imgs.length === 3) {
            return (
              <div className="grid grid-cols-2 gap-0.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imgs[0]} alt="" className="row-span-2 h-full w-full object-cover min-h-[180px]" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imgs[1]} alt="" className="aspect-square w-full object-cover" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imgs[2]} alt="" className="aspect-square w-full object-cover" />
              </div>
            );
          }
          if (imgs.length === 2) {
            return (
              <div className="grid grid-cols-2 gap-0.5">
                {imgs.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={`${src}-${i}`} src={src} alt="" className="aspect-[3/4] w-full object-cover" />
                ))}
              </div>
            );
          }
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imgs[0] || post.image}
              alt=""
              className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
          );
        })()}
        <span className="absolute top-3 right-3 bg-ink/60 text-ivory text-[10px] tracking-wide-2 px-2 py-1 rounded-full backdrop-blur">
          ◉ {fmt(post.views)}
        </span>
        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/55 to-transparent px-4 py-3 text-[11px] text-ivory/90 opacity-0 group-hover:opacity-100 transition-opacity">
          {t.feed.openThread}
        </span>
      </Link>

      <div className="p-5">
        <p className="text-[14px] text-ink leading-relaxed">
          {tr(post.content, lang)}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.avatar}
              alt=""
              className="w-7 h-7 rounded-full object-cover border border-line"
            />
            <span className="text-[12px] text-ink-soft">{tr(post.author, lang)}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCommentClick}
              className="flex items-center gap-1 text-[12px] text-muted hover:text-ink-soft transition-colors"
              aria-label="comments"
            >
              <CommentIcon />
              {fmt(total)}
            </button>
            <button
              type="button"
              onClick={onLikeClick}
              className={`flex items-center gap-1 text-[12px] transition-colors ${
                liked ? "text-bordeaux" : "text-muted hover:text-bordeaux"
              }`}
              aria-label="like"
            >
              <HeartIcon filled={liked} />
              {fmt(likes)}
            </button>
          </div>
        </div>

        {showComments && commentsEnabled && (
          <div className="mt-4 pt-4 border-t border-line space-y-2.5">
            {preview.map((c) => (
              <p key={c.id} className="text-[12.5px] leading-snug">
                <span className="text-gold-deep font-medium">{c.user}</span>
                <span className="text-ink-soft"> {c.text}</span>
              </p>
            ))}
            {loading && (
              <p className="text-[12px] text-muted">{t.feed.loadingComments}</p>
            )}
            {!loading && total === 0 && (
              <p className="text-[12px] text-muted">{t.feed.noComments}</p>
            )}
            {!loading && total > PREVIEW_LIMIT && (
              <Link
                href={detailHref}
                className="inline-block text-[12px] text-gold-deep hover:underline"
              >
                {t.feed.viewAllComments.replace("{n}", fmt(total))}
              </Link>
            )}
          </div>
        )}
      </div>

      {prompt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-6"
          onClick={() => setPrompt(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-paper border border-line px-8 py-6 max-w-sm w-full text-center shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[16px] text-ink tracking-wide">{prompt}</p>
            <button
              type="button"
              className="mt-5 text-[13px] text-ivory bg-ink px-5 py-2 hover:bg-bordeaux transition-colors"
              onClick={() => setPrompt(null)}
            >
              {t.feed.memberOk}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.6-.8L3 21l1.9-5.7A8.38 8.38 0 0 1 12.5 3 8.5 8.5 0 0 1 21 11.5z" />
    </svg>
  );
}
