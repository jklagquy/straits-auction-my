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
  currency: string;
  upliftEnabled: boolean | null;
  upliftMode: UpliftMode | null;
  upliftValue: number | null;
  upliftStartAt: string;
  priceCapHigh: number | null;
  saleSessionId: string | null;
  sortOrder: number;
  active: boolean;
  /** Computed at read time */
  displayPriceLow: number;
  displayPriceHigh: number;
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
  date: string;
  likes: number;
  views: number;
  comments: { user: string; text: string }[];
  active: boolean;
  sortOrder: number;
};

export type BannerRecord = {
  id: string;
  image: string;
  headline: Localized;
  sub: Localized;
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
  date: string;
  likes: number;
  views: number;
  comments: { user: string; text: string }[];
};

export type Banner = {
  id: string;
  image: string;
  headline: Localized;
  sub: Localized;
};
