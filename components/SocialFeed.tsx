"use client";

import { useState } from "react";
import type { Post } from "@/lib/cms/types";
import { tr, type Locale } from "@/lib/i18n";

function fmt(n: number) {
  if (n >= 10000) return (n / 10000).toFixed(1).replace(/\.0$/, "") + "w";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
}

export default function SocialFeed({
  posts,
  lang,
}: {
  posts: Post[];
  lang: Locale;
}) {
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 [column-fill:_balance]">
      {posts.map((p) => (
        <FeedCard key={p.id} post={p} lang={lang} />
      ))}
    </div>
  );
}

function FeedCard({ post, lang }: { post: Post; lang: Locale }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);

  const toggle = () => {
    setLiked((v) => !v);
    setLikes((n) => (liked ? n - 1 : n + 1));
  };

  return (
    <div className="mb-6 break-inside-avoid bg-paper border border-line hover-lift overflow-hidden">
      <div className="relative overflow-hidden bg-ivory-deep">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={post.image} alt="" className="w-full object-cover" />
        <span className="absolute top-3 right-3 bg-ink/60 text-ivory text-[10px] tracking-wide-2 px-2 py-1 rounded-full backdrop-blur">
          ◉ {fmt(post.views)}
        </span>
      </div>

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
            <span className="text-[12px] text-ink-soft">
              {tr(post.author, lang)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowComments((v) => !v)}
              className="flex items-center gap-1 text-[12px] text-muted hover:text-ink-soft transition-colors"
              aria-label="comments"
            >
              <CommentIcon />
              {post.comments.length}
            </button>
            <button
              onClick={toggle}
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

        {showComments && (
          <div className="mt-4 pt-4 border-t border-line space-y-2.5">
            {post.comments.map((c, i) => (
              <p key={i} className="text-[12.5px] leading-snug">
                <span className="text-gold-deep font-medium">{c.user}</span>
                <span className="text-ink-soft"> {c.text}</span>
              </p>
            ))}
          </div>
        )}
      </div>
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
