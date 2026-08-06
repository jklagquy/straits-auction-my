import type { Localized } from "../i18n";
import type {
  Article,
  Banner,
  Post,
  Product,
} from "../data";
import {
  articles,
  banners,
  marqueeMessages,
  posts,
  products,
} from "../data";
import type { CmsStore, SpecRow } from "./types";

function L(cn: string, zh: string, en: string): Localized {
  return { cn, zh, en };
}

function parseRmEstimate(s: string): { low: number; high: number } {
  const nums = s.match(/[\d,]+/g)?.map((n) => Number(n.replace(/,/g, ""))) || [];
  if (nums.length >= 2) return { low: nums[0], high: nums[1] };
  if (nums.length === 1) return { low: nums[0], high: nums[0] };
  return { low: 0, high: 0 };
}

function mapProduct(p: Product, i: number) {
  const { low, high } = parseRmEstimate(p.estimate);
  return {
    id: p.id,
    slug: p.slug,
    lotNo: p.lotNo,
    category: p.category,
    title: p.title,
    excerpt: p.excerpt,
    description: p.description,
    image: p.image,
    gallery: p.gallery,
    specs: p.specs as SpecRow[],
    featured: Boolean(p.featured),
    status: "preview" as const,
    basePriceLow: low,
    basePriceHigh: high,
    currency: "MYR",
    upliftEnabled: null,
    upliftMode: null,
    upliftValue: null,
    upliftStartAt: new Date().toISOString().slice(0, 10),
    priceCapHigh: null,
    saleSessionId: null,
    sortOrder: i,
    active: true,
  };
}

function mapArticle(a: Article, i: number) {
  return {
    id: a.id,
    slug: a.id,
    title: a.title,
    excerpt: a.excerpt,
    body: a.body,
    cover: a.cover,
    category: a.category,
    date: a.date,
    active: true,
    sortOrder: i,
  };
}

function mapPost(p: Post, i: number) {
  return {
    id: p.id,
    author: p.author,
    avatar: p.avatar,
    content: p.content,
    image: p.image,
    date: p.date,
    likes: p.likes,
    views: p.views,
    comments: p.comments,
    active: true,
    sortOrder: i,
  };
}

export function buildDefaultStore(): CmsStore {
  return {
    version: 1,
    priceRules: {
      defaultUpliftEnabled: true,
      defaultUpliftMode: "percent_daily",
      defaultUpliftValue: 0.3,
      currency: "MYR",
    },
    siteSettings: {
      brand: L("海峡金石拍卖", "海峽金石拍賣", "Straits Scholar's Auction"),
      brandSub: L("Straits Scholar's Auction", "Straits Scholar's Auction", "Straits Scholar's Auction"),
      logoUrl: "",
      company: L("海峡金石拍卖有限公司", "海峽金石拍賣有限公司", "Straits Scholar's Auction Sdn. Bhd."),
      whatsappNumber: "60321488800",
      tawkPropertyId: "",
      tawkWidgetId: "",
      contactEmail: "info@straitsscholars.com.my",
      contactPhone: "+60 3-2148 8800",
      address: L(
        "马来西亚吉隆坡武吉免登区 · 槟城乔治市展厅",
        "馬來西亞吉隆坡武吉免登區 · 檳城喬治市展廳",
        "Bukit Bintang, Kuala Lumpur · George Town, Penang"
      ),
    },
    saleSessions: [
      {
        id: "ss-kl-autumn-2026",
        slug: "kl-autumn-2026",
        title: L("吉隆坡秋季拍卖 2026", "吉隆坡秋季拍賣 2026", "KL Autumn Auction 2026"),
        description: L(
          "寿山石与南洋珍品专场",
          "壽山石與南洋珍品專場",
          "Shoushan stones & Nanyang treasures"
        ),
        previewStart: "2026-11-08",
        previewEnd: "2026-11-14",
        saleDate: "2026-11-15",
        location: L("吉隆坡武吉免登", "吉隆坡武吉免登", "Bukit Bintang, KL"),
        active: true,
        sortOrder: 0,
      },
    ],
    products: products.map(mapProduct),
    articles: articles.map(mapArticle),
    posts: posts.map(mapPost),
    marquee: marqueeMessages.map((m, i) => ({
      id: `mq${i + 1}`,
      text: m,
      active: true,
      sortOrder: i,
    })),
    banners: [
      ...banners.map((b, i) => ({
        id: b.id,
        image: b.image,
        headline: b.headline,
        sub: b.sub,
        category: "hero" as const,
        active: true,
        sortOrder: i,
      })),
      {
        id: "nb1",
        image: "/products/news-1782909343523-xnfjx.png",
        headline: L("田黄石市场洞察", "田黃石市場洞察", "Tianhuang Market Insight"),
        sub: L("东南亚藏家关注", "東南亞藏家關注", "SEA collector focus"),
        category: "news" as const,
        active: true,
        sortOrder: 0,
      },
    ],
    inquiries: [],
    priceSnapshots: {},
  };
}
