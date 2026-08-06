"use client";

import { useEffect, useState } from "react";
import { dict, type Locale } from "@/lib/i18n";

type LoadedComment = { id: string; user: string; text: string; langTag?: string };

export default function PostCommentThread({
  postId,
  lang,
  initialTotal,
}: {
  postId: string;
  lang: Locale;
  initialTotal: number;
}) {
  const t = dict[lang];
  const [comments, setComments] = useState<LoadedComment[]>([]);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [loadedAll, setLoadedAll] = useState(false);

  const loadMore = async (reset = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const offset = reset ? 0 : comments.length;
      const res = await fetch(
        `/api/posts/${postId}/comments?offset=${offset}&limit=40`
      );
      if (!res.ok) {
        setLoadedAll(true);
        return;
      }
      const data = (await res.json()) as {
        total: number;
        comments: LoadedComment[];
      };
      setTotal(data.total);
      setComments((prev) => (reset ? data.comments : [...prev, ...data.comments]));
      if (offset + data.comments.length >= data.total) setLoadedAll(true);
    } catch {
      setLoadedAll(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadMore(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between gap-3 border-b border-line pb-3">
        <h2 className="font-display text-2xl text-ink">{t.feed.threadTitle}</h2>
        <span className="text-sm text-muted">
          {t.feed.viewAllComments.replace("{n}", String(total))}
        </span>
      </div>

      <div className="space-y-3.5">
        {comments.map((c) => (
          <div key={c.id} className="flex gap-3 items-start">
            <div className="mt-1 h-7 w-7 shrink-0 rounded-full bg-ivory-deep border border-line flex items-center justify-center text-[10px] text-gold-deep">
              {(c.user || "?").slice(0, 1)}
            </div>
            <p className="text-[13.5px] leading-relaxed">
              <span className="text-gold-deep font-medium">{c.user}</span>
              {c.langTag && c.langTag !== "my" ? (
                <span className="ml-2 text-[10px] uppercase tracking-wide text-muted">
                  {c.langTag}
                </span>
              ) : null}
              <span className="block text-ink-soft mt-0.5">{c.text}</span>
            </p>
          </div>
        ))}
      </div>

      {loading && <p className="text-sm text-muted">{t.feed.loadingComments}</p>}
      {!loading && total === 0 && (
        <p className="text-sm text-muted">{t.feed.noComments}</p>
      )}
      {!loading && !loadedAll && comments.length < total && (
        <button
          type="button"
          onClick={() => loadMore(false)}
          className="text-sm border border-line px-4 py-2 text-ink-soft hover:border-gold hover:text-gold-deep transition-colors"
        >
          {t.feed.loadMoreComments}
        </button>
      )}
    </div>
  );
}
