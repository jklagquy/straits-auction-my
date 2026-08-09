import type { Localized } from "../i18n";

export type UpliftMode = "percent_daily" | "fixed_daily";
export type LotStatus = "preview" | "available" | "reserved" | "sold";
export type InquiryStatus = "new" | "following" | "closed" | "won";

export type SpecRow = { label: Localized; value: Localized };

export type PriceRules = {
  defaultUpliftEnabled: boolean;
  defaultUpliftMode: UpliftMode;
  defaultUpliftValue: number;
  currency: string;
};

export type SiteSettings = {
  brand: Localized;
  brandSub: Localized;
  logoUrl: string;
  company: Localized;
  whatsappNumber: string;
  tawkPropertyId: string;
  tawkWidgetId: string;
  contactEmail: string;
  contactPhone: string;
  address: Localized;
  /** When false, main-site comment clicks show member-only prompt */
  commentsEnabled: boolean;
  /** When false, main-site like clicks show member-only prompt */
  likesEnabled: boolean;
};

export type PostComment = {
  id: string;
  user: string;
  text: string;
  langTag?: string;
};

export type ProductRecord = {
  id: string;
  slug: string;
  lotNo: string;
  category: Localized;
  title: Localized;
  excerpt: Localized;
  description: Localized;
  image: string;
  gallery: string[];
  specs: SpecRow[];
  featured: boolean;
  status: LotStatus;
  basePriceLow: number;
  basePriceHigh: number;
  /** Available units / limited-edition count */
  stockQuantity: number;
  currency: string;
  upliftEnabled: boolean | null;
  upliftMode: UpliftMode | null;
  upliftValue: number | null;
  upliftStartAt: string;
  priceCapHigh: number | null;
  saleSessionId: string | null;
  sortOrder: number;
  active: boolean;
  /** Computed at read time — current (uplifted) price */
  displayPriceLow: number;
  displayPriceHigh: number;
  /** Formatted current price, e.g. "RM 51,000" */
  estimate: string;
};

export type ArticleRecord = {
  id: string;
  slug: string;
  title: Localized;
  excerpt: Localized;
  body: Localized;
  cover: string;
  category: Localized;
  date: string;
  active: boolean;
  sortOrder: number;
};

export type PostRecord = {
  id: string;
  author: Localized;
  avatar: string;
  content: Localized;
  image: string;
  /** Multi-photo lifestyle gallery */
  images: string[];
  date: string;
  likes: number;
  views: number;
  /** Denormalized total; full rows live in post_comments / comment-store */
  commentCount: number;
  /** Legacy/preview only — prefer comment-store for full lists */
  comments: PostComment[];
  active: boolean;
  sortOrder: number;
};

export type BannerRecord = {
  id: string;
  image: string;
  headline: Localized;
  sub: Localized;
  /** Optional product slug — hero slide links to this collection piece */
  linkSlug: string;
  category: "hero" | "news";
  active: boolean;
  sortOrder: number;
};

export type MarqueeRecord = {
  id: string;
  text: Localized;
  active: boolean;
  sortOrder: number;
};

export type SaleSessionRecord = {
  id: string;
  slug: string;
  title: Localized;
  description: Localized;
  previewStart: string | null;
  previewEnd: string | null;
  saleDate: string | null;
  location: Localized;
  active: boolean;
  sortOrder: number;
};

export type InquiryRecord = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  source: string;
  lotSlug: string | null;
  locale: string;
  status: InquiryStatus;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
};

export type PriceSnapshot = {
  date: string;
  priceLow: number;
  priceHigh: number;
};

export type CmsStore = {
  version: number;
  priceRules: PriceRules;
  siteSettings: SiteSettings;
  saleSessions: SaleSessionRecord[];
  products: Omit<ProductRecord, "displayPriceLow" | "displayPriceHigh" | "estimate">[];
  articles: ArticleRecord[];
  posts: PostRecord[];
  marquee: MarqueeRecord[];
  banners: BannerRecord[];
  inquiries: InquiryRecord[];
  priceSnapshots: Record<string, PriceSnapshot[]>;
};

/** Front-end compatible product (matches legacy lib/data Product) */
export type Product = {
  id: string;
  slug: string;
  category: Localized;
  title: Localized;
  excerpt: Localized;
  description: Localized;
  estimate: string;
  originalPrice?: number;
  currentPrice?: number;
  stockQuantity?: number;
  currency?: string;
  lotNo: string;
  image: string;
  gallery: string[];
  specs: SpecRow[];
  featured?: boolean;
  status?: LotStatus;
  displayPriceLow?: number;
  displayPriceHigh?: number;
};

export type Article = {
  id: string;
  title: Localized;
  excerpt: Localized;
  body: Localized;
  cover: string;
  date: string;
  category: Localized;
};

export type Post = {
  id: string;
  author: Localized;
  avatar: string;
  content: Localized;
  image: string;
  images?: string[];
  date: string;
  likes: number;
  views: number;
  commentCount: number;
  comments: PostComment[];
};

export type Banner = {
  id: string;
  image: string;
  headline: Localized;
  sub: Localized;
  linkSlug?: string;
};
