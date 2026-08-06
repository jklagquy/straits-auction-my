import { createServiceClient, isSupabaseConfigured } from "./supabase";
import type {
  ArticleRecord,
  BannerRecord,
  CmsStore,
  InquiryRecord,
  MarqueeRecord,
  PriceRules,
  PostRecord,
  ProductRecord,
  SaleSessionRecord,
  SiteSettings,
} from "./types";

export async function syncPriceRules(rules: PriceRules): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const sb = createServiceClient();
  await sb.from("price_rules").upsert({
    id: 1,
    default_uplift_enabled: rules.defaultUpliftEnabled,
    default_uplift_mode: rules.defaultUpliftMode,
    default_uplift_value: rules.defaultUpliftValue,
    currency: rules.currency,
    updated_at: new Date().toISOString(),
  });
}

export async function syncSiteSettings(settings: SiteSettings): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const sb = createServiceClient();
  await sb.from("site_settings").upsert({
    id: 1,
    brand_cn: settings.brand.cn,
    brand_zh: settings.brand.zh,
    brand_en: settings.brand.en,
    brand_sub_cn: settings.brandSub.cn,
    brand_sub_zh: settings.brandSub.zh,
    brand_sub_en: settings.brandSub.en,
    logo_url: settings.logoUrl,
    company_cn: settings.company.cn,
    company_zh: settings.company.zh,
    company_en: settings.company.en,
    whatsapp_number: settings.whatsappNumber,
    tawk_property_id: settings.tawkPropertyId,
    tawk_widget_id: settings.tawkWidgetId,
    contact_email: settings.contactEmail,
    contact_phone: settings.contactPhone,
    address_cn: settings.address.cn,
    address_zh: settings.address.zh,
    address_en: settings.address.en,
    comments_enabled: settings.commentsEnabled,
    likes_enabled: settings.likesEnabled,
    updated_at: new Date().toISOString(),
  });
}

export async function syncProduct(
  product: Omit<ProductRecord, "displayPriceLow" | "displayPriceHigh" | "estimate">
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const sb = createServiceClient();
  await sb.from("products").upsert({
    id: product.id,
    slug: product.slug,
    lot_no: product.lotNo,
    category_cn: product.category.cn,
    category_zh: product.category.zh,
    category_en: product.category.en,
    title_cn: product.title.cn,
    title_zh: product.title.zh,
    title_en: product.title.en,
    excerpt_cn: product.excerpt.cn,
    excerpt_zh: product.excerpt.zh,
    excerpt_en: product.excerpt.en,
    description_cn: product.description.cn,
    description_zh: product.description.zh,
    description_en: product.description.en,
    image: product.image,
    gallery: product.gallery,
    specs: product.specs,
    featured: product.featured,
    status: product.status,
    base_price_low: product.basePriceLow,
    base_price_high: product.basePriceHigh,
    currency: product.currency,
    uplift_enabled: product.upliftEnabled,
    uplift_mode: product.upliftMode,
    uplift_value: product.upliftValue,
    uplift_start_at: product.upliftStartAt,
    price_cap_high: product.priceCapHigh,
    sale_session_id: product.saleSessionId,
    sort_order: product.sortOrder,
    active: product.active,
    updated_at: new Date().toISOString(),
  });
}

export async function deleteProductRemote(id: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const sb = createServiceClient();
  await sb.from("products").delete().eq("id", id);
}

export async function syncArticle(article: ArticleRecord): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const sb = createServiceClient();
  await sb.from("articles").upsert({
    id: article.id,
    slug: article.slug,
    title_cn: article.title.cn,
    title_zh: article.title.zh,
    title_en: article.title.en,
    excerpt_cn: article.excerpt.cn,
    excerpt_zh: article.excerpt.zh,
    excerpt_en: article.excerpt.en,
    body_cn: article.body.cn,
    body_zh: article.body.zh,
    body_en: article.body.en,
    cover: article.cover,
    category_cn: article.category.cn,
    category_zh: article.category.zh,
    category_en: article.category.en,
    published_at: article.date,
    active: article.active,
    sort_order: article.sortOrder,
  });
}

export async function deleteArticleRemote(id: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  await createServiceClient().from("articles").delete().eq("id", id);
}

export async function syncPost(post: PostRecord): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const sb = createServiceClient();
  const images =
    post.images?.length > 0 ? post.images : post.image ? [post.image] : [];
  const base = {
    id: post.id,
    author_cn: post.author.cn,
    author_zh: post.author.zh,
    author_en: post.author.en,
    avatar: post.avatar,
    content_cn: post.content.cn,
    content_zh: post.content.zh,
    content_en: post.content.en,
    image: post.image || images[0] || "",
    published_at: post.date,
    likes: post.likes,
    views: post.views,
    comments: [],
    comment_count: post.commentCount ?? 0,
    active: post.active,
    sort_order: post.sortOrder,
  };
  const { error } = await sb.from("posts").upsert({ ...base, images });
  // Fallback if migration 006 (images column) not applied yet
  if (error) await sb.from("posts").upsert(base);
}

export async function deletePostRemote(id: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  await createServiceClient().from("posts").delete().eq("id", id);
}

export async function syncMarquee(msg: MarqueeRecord): Promise<void> {
  if (!isSupabaseConfigured()) return;
  await createServiceClient().from("marquee_messages").upsert({
    id: msg.id,
    text_cn: msg.text.cn,
    text_zh: msg.text.zh,
    text_en: msg.text.en,
    active: msg.active,
    sort_order: msg.sortOrder,
  });
}

export async function deleteMarqueeRemote(id: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  await createServiceClient().from("marquee_messages").delete().eq("id", id);
}

export async function syncBanner(banner: BannerRecord): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const sb = createServiceClient();
  const base = {
    id: banner.id,
    image: banner.image,
    headline_cn: banner.headline.cn,
    headline_zh: banner.headline.zh,
    headline_en: banner.headline.en,
    sub_cn: banner.sub.cn,
    sub_zh: banner.sub.zh,
    sub_en: banner.sub.en,
    category: banner.category,
    active: banner.active,
    sort_order: banner.sortOrder,
  };
  const withLink = { ...base, link_slug: banner.linkSlug || "" };
  const { error } = await sb.from("banners").upsert(withLink);
  if (error) await sb.from("banners").upsert(base);
}

export async function deleteBannerRemote(id: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  await createServiceClient().from("banners").delete().eq("id", id);
}

export async function syncSaleSession(session: SaleSessionRecord): Promise<void> {
  if (!isSupabaseConfigured()) return;
  await createServiceClient().from("sale_sessions").upsert({
    id: session.id,
    slug: session.slug,
    title_cn: session.title.cn,
    title_zh: session.title.zh,
    title_en: session.title.en,
    description_cn: session.description.cn,
    description_zh: session.description.zh,
    description_en: session.description.en,
    preview_start: session.previewStart,
    preview_end: session.previewEnd,
    sale_date: session.saleDate,
    location_cn: session.location.cn,
    location_zh: session.location.zh,
    location_en: session.location.en,
    active: session.active,
    sort_order: session.sortOrder,
  });
}

export async function syncInquiry(inquiry: InquiryRecord): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const sb = createServiceClient();
  await sb.from("inquiries").upsert({
    id: inquiry.id,
    name: inquiry.name,
    email: inquiry.email,
    phone: inquiry.phone,
    message: inquiry.message,
    source: inquiry.source,
    lot_slug: inquiry.lotSlug,
    locale: inquiry.locale,
    status: inquiry.status,
    admin_notes: inquiry.adminNotes,
    updated_at: inquiry.updatedAt,
  });
}

export async function seedFullStore(store: CmsStore): Promise<void> {
  if (!isSupabaseConfigured()) return;

  await syncPriceRules(store.priceRules);
  await syncSiteSettings(store.siteSettings);

  for (const session of store.saleSessions) {
    await syncSaleSession(session);
  }
  for (const product of store.products) {
    await syncProduct(product);
  }
  for (const article of store.articles) {
    await syncArticle(article);
  }
  for (const post of store.posts) {
    await syncPost(post);
  }
  for (const msg of store.marquee) {
    await syncMarquee(msg);
  }
  for (const banner of store.banners) {
    await syncBanner(banner);
  }
}
