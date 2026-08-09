import { enrichProduct } from "./pricing";
import { readStore, writeStore } from "./file-store";
import { buildDefaultStore } from "./seed";
import { parseStockFromTitle, readStockFromRow } from "./stock";
import { createServiceClient, isSupabaseConfigured } from "./supabase";
import type {
  Article,
  ArticleRecord,
  Banner,
  CmsStore,
  InquiryRecord,
  MarqueeRecord,
  Post,
  PostRecord,
  PriceRules,
  PriceSnapshot,
  Product,
  ProductRecord,
  SiteSettings,
  SaleSessionRecord,
} from "./types";
import type { Localized } from "../i18n";
import { coinjshtPosts } from "../coinjsht-seed";
import { mediaUrl, mediaUrls } from "../media-url";
import { virtualCommentCount } from "./virtual-comments";

export const revalidateSeconds = 300;

/** Until migration 006, Supabase may lack posts.images — fall back to seed galleries. */
const SEED_POST_IMAGES = new Map(
  coinjshtPosts.map((p) => [p.id, p.images] as const)
);

function withPostImages<T extends { id: string; image: string; images?: string[]; avatar?: string }>(
  post: T
): T {
  let images = post.images && post.images.length > 0 ? post.images : undefined;
  if (!images) {
    const fromSeed = SEED_POST_IMAGES.get(post.id);
    if (fromSeed?.length) images = fromSeed;
    else if (post.image) images = [post.image];
    else images = [];
  }
  const image = mediaUrl(post.image || images[0] || "");
  return {
    ...post,
    image,
    images: mediaUrls(images),
    ...(post.avatar != null ? { avatar: mediaUrl(post.avatar) } : {}),
  };
}

function ensureStore(): CmsStore {
  const existing = readStore();
  if (existing) return existing;
  const store = buildDefaultStore();
  // Best-effort persist for local dev; never required on Vercel
  writeStore(store);
  return store;
}

function toProduct(p: ProductRecord): Product {
  const original =
    p.basePriceLow > 0 ? p.basePriceLow : p.basePriceHigh;
  return {
    id: p.id,
    slug: p.slug,
    category: p.category,
    title: p.title,
    excerpt: p.excerpt,
    description: p.description,
    estimate: p.estimate,
    originalPrice: original,
    currentPrice: p.displayPriceLow,
    stockQuantity: p.stockQuantity ?? 1,
    currency: p.currency || "MYR",
    lotNo: p.lotNo,
    image: mediaUrl(p.image),
    gallery: mediaUrls(p.gallery),
    specs: p.specs,
    featured: p.featured,
    status: p.status,
    displayPriceLow: p.displayPriceLow,
    displayPriceHigh: p.displayPriceHigh,
  };
}

function enrichAll(store: CmsStore): ProductRecord[] {
  return store.products
    .filter((p) => p.active)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((p) => enrichProduct(p, store.priceRules));
}

/* ---------- public reads ---------- */

export async function getPriceRules(): Promise<PriceRules> {
  if (isSupabaseConfigured()) {
    const sb = createServiceClient();
    const { data } = await sb.from("price_rules").select("*").eq("id", 1).single();
    if (data) {
      return {
        defaultUpliftEnabled: data.default_uplift_enabled,
        defaultUpliftMode: data.default_uplift_mode,
        defaultUpliftValue: Number(data.default_uplift_value),
        currency: data.currency,
      };
    }
  }
  return ensureStore().priceRules;
}

function mapSiteSettingsRow(data: Record<string, unknown>): SiteSettings {
  const fallback = ensureStore().siteSettings;
  return {
    brand: {
      cn: String(data.brand_cn ?? fallback.brand.cn),
      zh: String(data.brand_zh ?? fallback.brand.zh),
      en: String(data.brand_en ?? fallback.brand.en),
    },
    brandSub: {
      cn: String(data.brand_sub_cn ?? fallback.brandSub.cn),
      zh: String(data.brand_sub_zh ?? fallback.brandSub.zh),
      en: String(data.brand_sub_en ?? fallback.brandSub.en),
    },
    logoUrl: String(data.logo_url ?? fallback.logoUrl ?? ""),
    company: {
      cn: String(data.company_cn ?? fallback.company.cn),
      zh: String(data.company_zh ?? fallback.company.zh),
      en: String(data.company_en ?? fallback.company.en),
    },
    whatsappNumber: String(data.whatsapp_number || ""),
    tawkPropertyId: String(data.tawk_property_id || ""),
    tawkWidgetId: String(data.tawk_widget_id || ""),
    contactEmail: String(data.contact_email || ""),
    contactPhone: String(data.contact_phone || ""),
    address: {
      cn: String(data.address_cn || ""),
      zh: String(data.address_zh || ""),
      en: String(data.address_en || ""),
    },
    commentsEnabled:
      data.comments_enabled == null ? true : Boolean(data.comments_enabled),
    likesEnabled: data.likes_enabled == null ? true : Boolean(data.likes_enabled),
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  if (isSupabaseConfigured()) {
    const sb = createServiceClient();
    const { data } = await sb.from("site_settings").select("*").eq("id", 1).single();
    if (data) return mapSiteSettingsRow(data as Record<string, unknown>);
  }
  return ensureStore().siteSettings;
}

export async function getProducts(): Promise<Product[]> {
  const rules = await getPriceRules();
  if (isSupabaseConfigured()) {
    const sb = createServiceClient();
    const { data } = await sb
      .from("products")
      .select("*")
      .eq("active", true)
      .order("sort_order");
    if (data?.length) {
      return data.map((row) =>
        toProduct(
          enrichProduct(mapProductRow(row), rules)
        )
      );
    }
  }
  return enrichAll(ensureStore()).map(toProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const all = await getProducts();
  return all.find((p) => p.slug === slug) ?? null;
}

const MIN_FEATURED = 6;

function isPriorityFeaturedFill(p: Product): boolean {
  const cat = `${p.category.cn} ${p.category.zh} ${p.category.en}`;
  const lot = p.lotNo || "";
  return (
    lot.startsWith("MY-") ||
    /田黄|田黃|鸡血|雞血|娘惹|克力|峇峇|海峡|海峽|马来|馬來|Tianhuang|Keris|Nyonya|Baba|Straits/i.test(
      cat
    )
  );
}

/** Homepage 协会精选：优先 featured；不足 MIN_FEATURED 时用田黄/马来本地藏品补足 */
export async function getFeaturedProducts(): Promise<Product[]> {
  const all = await getProducts();
  const featured = all.filter((p) => p.featured);
  if (featured.length >= MIN_FEATURED) return featured;
  const seen = new Set(featured.map((p) => p.id));
  const fillers = all.filter(
    (p) => !seen.has(p.id) && isPriorityFeaturedFill(p)
  );
  const rest = all.filter(
    (p) => !seen.has(p.id) && !fillers.some((f) => f.id === p.id)
  );
  return [...featured, ...fillers, ...rest].slice(0, MIN_FEATURED);
}

export async function getArticles(): Promise<Article[]> {
  if (isSupabaseConfigured()) {
    const sb = createServiceClient();
    const { data } = await sb
      .from("articles")
      .select("*")
      .eq("active", true)
      .order("sort_order");
    if (data?.length) return data.map(mapArticleRow);
  }
  return ensureStore()
    .articles.filter((a) => a.active)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((a) => ({
      id: a.id,
      title: a.title,
      excerpt: a.excerpt,
      body: a.body,
      cover: a.cover,
      date: a.date,
      category: a.category,
    }));
}

export async function getArticleById(id: string): Promise<Article | null> {
  const all = await getArticles();
  return all.find((a) => a.id === id) ?? null;
}

export async function getPosts(): Promise<Post[]> {
  if (isSupabaseConfigured()) {
    const sb = createServiceClient();
    const { data } = await sb
      .from("posts")
      .select("*")
      .eq("active", true)
      .order("sort_order");
    if (data?.length) return data.map((row) => withPostImages(mapPostRow(row)));
  }
  return ensureStore()
    .posts.filter((p) => p.active)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((p) =>
      withPostImages({
        id: p.id,
        author: p.author,
        avatar: p.avatar,
        content: p.content,
        image: p.image,
        images: p.images?.length ? p.images : p.image ? [p.image] : [],
        date: p.date,
        likes: p.likes,
        views: p.views,
        commentCount: resolveCommentCount(p.id, p.commentCount ?? p.comments?.length ?? 0),
        comments: [],
      })
    );
}

export async function getPostById(id: string): Promise<Post | null> {
  if (isSupabaseConfigured()) {
    const sb = createServiceClient();
    const { data } = await sb
      .from("posts")
      .select("*")
      .eq("id", id)
      .eq("active", true)
      .maybeSingle();
    if (data) return withPostImages(mapPostRow(data as Record<string, unknown>));
  }
  const p = ensureStore().posts.find((x) => x.id === id && x.active);
  if (!p) return null;
  return withPostImages({
    id: p.id,
    author: p.author,
    avatar: p.avatar,
    content: p.content,
    image: p.image,
    images: p.images?.length ? p.images : p.image ? [p.image] : [],
    date: p.date,
    likes: p.likes,
    views: p.views,
    commentCount: resolveCommentCount(p.id, p.commentCount ?? p.comments?.length ?? 0),
    comments: [],
  });
}

function resolveCommentCount(postId: string, stored: number): number {
  return stored > 0 ? stored : virtualCommentCount(postId);
}

export async function getMarqueeMessages(): Promise<Localized[]> {
  if (isSupabaseConfigured()) {
    const sb = createServiceClient();
    const { data } = await sb
      .from("marquee_messages")
      .select("*")
      .eq("active", true)
      .order("sort_order");
    if (data?.length) {
      return data.map((r) => ({ cn: r.text_cn, zh: r.text_zh, en: r.text_en }));
    }
  }
  return ensureStore()
    .marquee.filter((m) => m.active)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((m) => m.text);
}

const HERO_LINK_BY_IMAGE: Record<string, string> = {
  "/products/ss-03.jpg": "tianhuang-seal",
  "/products/ss-17.png": "wulong-tianhuang-yuxi",
  "/products/my-nyonya.jpg": "nyonya-ware",
  "/products/my-keris.jpg": "malay-keris",
  "/products/hero-main.jpg": "tianhuang-seal",
  "/products/banner-h01.png": "tianhuang-jipin-limited",
  "/products/banner-h02.jpg": "tianhuang-jipin-limited",
  "/products/banner-h03.jpg": "shoushan-chicken-blood",
  "/products/banner-h04.jpg": "wulong-tianhuang-yuxi",
  "/products/banner-h05.jpg": "tianhuang-mid-grade",
  "/products/ss-41-cover.jpg": "tianhuang-jipin-limited",
  "/products/ss-21.png": "shoushan-chicken-blood",
};

function withHeroLink(b: Banner): Banner {
  if (b.linkSlug) return b;
  return { ...b, linkSlug: HERO_LINK_BY_IMAGE[b.image] || "" };
}

export async function getHeroBanners(): Promise<Banner[]> {
  if (isSupabaseConfigured()) {
    const sb = createServiceClient();
    const { data } = await sb
      .from("banners")
      .select("*")
      .eq("active", true)
      .eq("category", "hero")
      .order("sort_order");
    if (data?.length) return data.map((row) => withHeroLink(mapBannerRow(row as Record<string, unknown>)));
  }
  return ensureStore()
    .banners.filter((b) => b.active && b.category === "hero")
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((b) =>
      withHeroLink({
        id: b.id,
        image: mediaUrl(b.image),
        headline: b.headline,
        sub: b.sub,
        linkSlug: b.linkSlug || "",
      })
    );
}

export async function getNewsBanners(): Promise<{ image: string }[]> {
  if (isSupabaseConfigured()) {
    const sb = createServiceClient();
    const { data } = await sb
      .from("banners")
      .select("image")
      .eq("active", true)
      .eq("category", "news")
      .order("sort_order");
    if (data?.length) return data.map((b) => ({ image: b.image }));
  }
  return ensureStore()
    .banners.filter((b) => b.active && b.category === "news")
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((b) => ({ image: b.image }));
}

export async function getPriceHistory(
  productId: string,
  days = 30
): Promise<PriceSnapshot[]> {
  const { buildPriceHistory } = await import("./pricing");
  const rules = await getPriceRules();
  if (isSupabaseConfigured()) {
    const sb = createServiceClient();
    const { data: snaps } = await sb
      .from("price_snapshots")
      .select("*")
      .eq("product_id", productId)
      .order("snapshot_date", { ascending: false })
      .limit(days);
    if (snaps?.length) {
      return snaps
        .map((s) => ({
          date: s.snapshot_date,
          priceLow: Number(s.price_low),
          priceHigh: Number(s.price_high),
        }))
        .reverse();
    }
    const { data: prod } = await sb.from("products").select("*").eq("id", productId).single();
    if (prod) return buildPriceHistory(mapProductRow(prod), rules, days);
  }
  const store = ensureStore();
  const stored = store.priceSnapshots[productId];
  if (stored?.length) return stored.slice(-days);
  const prod = store.products.find((p) => p.id === productId);
  if (!prod) return [];
  return buildPriceHistory(prod, rules, days);
}

export async function createInquiry(input: {
  name: string;
  email: string;
  phone?: string;
  message: string;
  source?: string;
  lotSlug?: string;
  locale?: string;
}): Promise<void> {
  const row: InquiryRecord = {
    id: crypto.randomUUID(),
    name: input.name,
    email: input.email,
    phone: input.phone || "",
    message: input.message,
    source: input.source || "contact",
    lotSlug: input.lotSlug || null,
    locale: input.locale || "cn",
    status: "new",
    adminNotes: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured()) {
    const sb = createServiceClient();
    await sb.from("inquiries").insert({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      message: row.message,
      source: row.source,
      lot_slug: row.lotSlug,
      locale: row.locale,
      status: row.status,
    });
    return;
  }

  const store = ensureStore();
  store.inquiries.unshift(row);
  writeStore(store);
}

/* ---------- admin reads/writes (Supabase primary, file fallback) ---------- */

export async function getAdminInquiries(): Promise<InquiryRecord[]> {
  if (isSupabaseConfigured()) {
    const sb = createServiceClient();
    const { data } = await sb
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) {
      return data.map((row) => ({
        id: String(row.id),
        name: String(row.name),
        email: String(row.email),
        phone: String(row.phone || ""),
        message: String(row.message),
        source: String(row.source),
        lotSlug: row.lot_slug ? String(row.lot_slug) : null,
        locale: String(row.locale || "cn"),
        status: row.status as InquiryRecord["status"],
        adminNotes: String(row.admin_notes || ""),
        createdAt: String(row.created_at),
        updatedAt: String(row.updated_at),
      }));
    }
  }
  return ensureStore().inquiries;
}

/** Prefer Supabase as source of truth for admin; fall back to local file store. */
export async function loadAdminStore(): Promise<CmsStore> {
  if (!isSupabaseConfigured()) return ensureStore();

  const sb = createServiceClient();
  const [
    priceRules,
    siteSettings,
    productsRes,
    articlesRes,
    postsRes,
    marqueeRes,
    bannersRes,
    sessionsRes,
    inquiries,
  ] = await Promise.all([
    getPriceRules(),
    getSiteSettings(),
    sb.from("products").select("*").order("sort_order"),
    sb.from("articles").select("*").order("sort_order"),
    sb.from("posts").select("*").order("sort_order"),
    sb.from("marquee_messages").select("*").order("sort_order"),
    sb.from("banners").select("*").order("sort_order"),
    sb.from("sale_sessions").select("*").order("sort_order"),
    getAdminInquiries(),
  ]);

  const products = (productsRes.data || []).map((row) => mapProductRow(row as Record<string, unknown>));
  const articles = (articlesRes.data || []).map((row) => mapArticleRecord(row as Record<string, unknown>));
  const posts = (postsRes.data || []).map((row) => mapPostRecord(row as Record<string, unknown>));
  const marquee = (marqueeRes.data || []).map((row) => ({
    id: String(row.id),
    text: { cn: String(row.text_cn), zh: String(row.text_zh), en: String(row.text_en) },
    active: Boolean(row.active),
    sortOrder: Number(row.sort_order),
  }));
  const banners = (bannersRes.data || []).map((row) => ({
    id: String(row.id),
    image: String(row.image),
    headline: {
      cn: String(row.headline_cn || ""),
      zh: String(row.headline_zh || ""),
      en: String(row.headline_en || ""),
    },
    sub: {
      cn: String(row.sub_cn || ""),
      zh: String(row.sub_zh || ""),
      en: String(row.sub_en || ""),
    },
    linkSlug: String((row as { link_slug?: string }).link_slug || ""),
    category: (row.category === "news" ? "news" : "hero") as "hero" | "news",
    active: Boolean(row.active),
    sortOrder: Number(row.sort_order),
  }));
  const saleSessions = (sessionsRes.data || []).map((row) => ({
    id: String(row.id),
    slug: String(row.slug),
    title: { cn: String(row.title_cn), zh: String(row.title_zh), en: String(row.title_en) },
    description: {
      cn: String(row.description_cn || ""),
      zh: String(row.description_zh || ""),
      en: String(row.description_en || ""),
    },
    previewStart: row.preview_start ? String(row.preview_start).slice(0, 10) : null,
    previewEnd: row.preview_end ? String(row.preview_end).slice(0, 10) : null,
    saleDate: row.sale_date ? String(row.sale_date).slice(0, 10) : null,
    location: {
      cn: String(row.location_cn || ""),
      zh: String(row.location_zh || ""),
      en: String(row.location_en || ""),
    },
    active: Boolean(row.active),
    sortOrder: Number(row.sort_order),
  }));

  // If remote tables are empty, seed from local defaults for first-time setup
  if (!products.length && !articles.length) {
    return ensureStore();
  }

  return {
    version: 1,
    priceRules,
    siteSettings,
    saleSessions,
    products,
    articles,
    posts,
    marquee,
    banners,
    inquiries,
    priceSnapshots: {},
  };
}

/** @deprecated Prefer loadAdminStore(); kept for sync callers that only need file store. */
export function getAdminStore(): CmsStore {
  return ensureStore();
}

export function saveAdminStore(store: CmsStore): void {
  writeStore(store);
}

export function resetAdminStore(): CmsStore {
  const store = buildDefaultStore();
  writeStore(store);
  return store;
}

function mapArticleRecord(row: Record<string, unknown>): ArticleRecord {
  return {
    id: String(row.id),
    slug: String(row.slug || row.id),
    title: { cn: String(row.title_cn), zh: String(row.title_zh), en: String(row.title_en) },
    excerpt: {
      cn: String(row.excerpt_cn || ""),
      zh: String(row.excerpt_zh || ""),
      en: String(row.excerpt_en || ""),
    },
    body: {
      cn: String(row.body_cn || ""),
      zh: String(row.body_zh || ""),
      en: String(row.body_en || ""),
    },
    cover: String(row.cover || ""),
    category: {
      cn: String(row.category_cn || ""),
      zh: String(row.category_zh || ""),
      en: String(row.category_en || ""),
    },
    date: String(row.published_at || "").slice(0, 10),
    active: Boolean(row.active),
    sortOrder: Number(row.sort_order || 0),
  };
}

function mapPostRecord(row: Record<string, unknown>): PostRecord {
  const legacyComments = (row.comments as PostRecord["comments"]) || [];
  const images = Array.isArray(row.images)
    ? (row.images as string[])
    : row.image
      ? [String(row.image)]
      : [];
  return {
    id: String(row.id),
    author: { cn: String(row.author_cn), zh: String(row.author_zh), en: String(row.author_en) },
    avatar: String(row.avatar || ""),
    content: {
      cn: String(row.content_cn),
      zh: String(row.content_zh),
      en: String(row.content_en),
    },
    image: String(row.image || images[0] || ""),
    images,
    date: String(row.published_at || "").slice(0, 10),
    likes: Number(row.likes || 0),
    views: Number(row.views || 0),
    commentCount: resolveCommentCount(
      String(row.id),
      row.comment_count != null
        ? Number(row.comment_count)
        : legacyComments.length
    ),
    comments: [],
    active: Boolean(row.active),
    sortOrder: Number(row.sort_order || 0),
  };
}

/* ---------- row mappers ---------- */

function mapProductRow(row: Record<string, unknown>): Omit<ProductRecord, "displayPriceLow" | "displayPriceHigh" | "estimate"> {
  const { stockQuantity, specs } = readStockFromRow(
    row.specs as ProductRecord["specs"],
    row.stock_quantity
  );
  const fromTitle = parseStockFromTitle(String(row.title_cn || ""));
  return {
    id: String(row.id),
    slug: String(row.slug),
    lotNo: String(row.lot_no),
    category: { cn: row.category_cn, zh: row.category_zh, en: row.category_en } as Localized,
    title: { cn: row.title_cn, zh: row.title_zh, en: row.title_en } as Localized,
    excerpt: { cn: row.excerpt_cn, zh: row.excerpt_zh, en: row.excerpt_en } as Localized,
    description: { cn: row.description_cn, zh: row.description_zh, en: row.description_en } as Localized,
    image: String(row.image),
    gallery: (row.gallery as string[]) || [],
    specs,
    featured: Boolean(row.featured),
    status: row.status as ProductRecord["status"],
    basePriceLow: Number(row.base_price_low),
    basePriceHigh: Number(row.base_price_high),
    stockQuantity:
      stockQuantity > 1 || row.stock_quantity != null
        ? stockQuantity
        : fromTitle ?? stockQuantity,
    currency: String(row.currency || "MYR"),
    upliftEnabled: row.uplift_enabled as boolean | null,
    upliftMode: row.uplift_mode as ProductRecord["upliftMode"],
    upliftValue: row.uplift_value != null ? Number(row.uplift_value) : null,
    upliftStartAt: String(row.uplift_start_at).slice(0, 10),
    priceCapHigh: row.price_cap_high != null ? Number(row.price_cap_high) : null,
    saleSessionId: row.sale_session_id ? String(row.sale_session_id) : null,
    sortOrder: Number(row.sort_order),
    active: Boolean(row.active),
  };
}

function mapArticleRow(row: Record<string, unknown>): Article {
  return {
    id: String(row.id),
    title: { cn: row.title_cn, zh: row.title_zh, en: row.title_en } as Localized,
    excerpt: { cn: row.excerpt_cn, zh: row.excerpt_zh, en: row.excerpt_en } as Localized,
    body: { cn: row.body_cn, zh: row.body_zh, en: row.body_en } as Localized,
    cover: String(row.cover),
    date: String(row.published_at).slice(0, 10),
    category: { cn: row.category_cn, zh: row.category_zh, en: row.category_en } as Localized,
  };
}

function mapPostRow(row: Record<string, unknown>): Post {
  const legacy = (row.comments as Post["comments"]) || [];
  const images = Array.isArray(row.images)
    ? (row.images as string[])
    : row.image
      ? [String(row.image)]
      : [];
  return {
    id: String(row.id),
    author: { cn: row.author_cn, zh: row.author_zh, en: row.author_en } as Localized,
    avatar: String(row.avatar || ""),
    content: { cn: row.content_cn, zh: row.content_zh, en: row.content_en } as Localized,
    image: String(row.image || images[0] || ""),
    images,
    date: String(row.published_at).slice(0, 10),
    likes: Number(row.likes),
    views: Number(row.views),
    commentCount: resolveCommentCount(
      String(row.id),
      row.comment_count != null ? Number(row.comment_count) : legacy.length
    ),
    comments: [],
  };
}

function mapBannerRow(row: Record<string, unknown>): Banner {
  return {
    id: String(row.id),
    image: mediaUrl(String(row.image || "")),
    headline: { cn: row.headline_cn, zh: row.headline_zh, en: row.headline_en } as Localized,
    sub: { cn: row.sub_cn, zh: row.sub_zh, en: row.sub_en } as Localized,
    linkSlug: String(row.link_slug || ""),
  };
}

export type { MarqueeRecord, SaleSessionRecord, InquiryRecord, CmsStore };
