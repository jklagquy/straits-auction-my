import {
  generateCommentsForPost,
  uniqueCommentCounts,
} from "./comment-generator";
import type { StoredComment } from "./comment-store";

/** Stable post ids used by seed catalogue (coinjsht lifestyle feed). */
export const CATALOGUE_POST_IDS = [
  "po-cj-58", "po-cj-35", "po-cj-42", "po-cj-49", "po-cj-45", "po-cj-34",
  "po-cj-38", "po-cj-64", "po-cj-63", "po-cj-44", "po-cj-40", "po-cj-51",
  "po-cj-65", "po-cj-50", "po-cj-52", "po-cj-55", "po-cj-56", "po-cj-37",
  "po-cj-59", "po-cj-47", "po-cj-39", "po-cj-41", "po-cj-60", "po-cj-43",
  "po-cj-36", "po-cj-48", "po-cj-57", "po-cj-53",
];

const COUNT_MAP = uniqueCommentCounts(CATALOGUE_POST_IDS, 2000, 8000);

export function virtualCommentCount(postId: string): number {
  if (COUNT_MAP[postId] != null) return COUNT_MAP[postId]!;
  // Unknown ids: deterministic count in range, unique-ish by hash
  let h = 2166136261;
  for (let i = 0; i < postId.length; i++) {
    h ^= postId.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return 2000 + (h % 6001);
}

export function virtualCommentsPage(
  postId: string,
  offset: number,
  limit: number
): { comments: StoredComment[]; total: number } {
  const total = virtualCommentCount(postId);
  const all = generateCommentsForPost(postId, total, 0.3).map((c, i) => ({
    id: c.id,
    user: c.user,
    text: c.text,
    langTag: c.langTag,
    sortOrder: i,
  }));
  return {
    total,
    comments: all.slice(offset, offset + limit),
  };
}
