"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  clearAdminSession,
  isAdminAuthenticated,
  setAdminSession,
  verifyAdminPassword,
} from "@/lib/admin-auth";
import {
  loadAdminStore,
  getAdminInquiries,
  resetAdminStore,
  saveAdminStore,
} from "@/lib/cms/repository";
import {
  deleteArticleRemote,
  deleteBannerRemote,
  deleteMarqueeRemote,
  deletePostRemote,
  deleteProductRemote,
  seedFullStore,
  syncArticle,
  syncBanner,
  syncInquiry,
  syncMarquee,
  syncPost,
  syncPriceRules,
  syncProduct,
  syncSiteSettings,
} from "@/lib/cms/supabase-sync";
import type {
  ArticleRecord,
  BannerRecord,
  InquiryStatus,
  MarqueeRecord,
  PostRecord,
} from "@/lib/cms/types";
import { enrichProduct } from "@/lib/cms/pricing";
import { isSupabaseConfigured } from "@/lib/cms/supabase";
import {
  deleteComment,
  getCommentCount,
  upsertComment,
} from "@/lib/cms/comment-store";

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
}

function emptyL() {
  return { cn: "", zh: "", en: "" };
}

function revalidatePublic() {
  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");
}

export async function loginAction(formData: FormData) {
  const password = String(formData.get("password") || "");
  if (!verifyAdminPassword(password)) {
    return { error: "密码错误" };
  }
  await setAdminSession();
  redirect("/admin");
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function savePriceRulesAction(formData: FormData) {
  await requireAdmin();
  const store = await loadAdminStore();
  store.priceRules = {
    defaultUpliftEnabled: formData.get("enabled") === "on",
    defaultUpliftMode:
      (formData.get("mode") as "percent_daily" | "fixed_daily") || "percent_daily",
    defaultUpliftValue: Number(formData.get("value") || 0.3),
    currency: String(formData.get("currency") || "MYR"),
  };
  if (!isSupabaseConfigured()) saveAdminStore(store);
  await syncPriceRules(store.priceRules);
  revalidatePublic();
}

export async function saveSiteSettingsAction(formData: FormData) {
  await requireAdmin();
  const store = await loadAdminStore();
  store.siteSettings = {
    brand: {
      cn: String(formData.get("brand_cn") || ""),
      zh: String(formData.get("brand_zh") || ""),
      en: String(formData.get("brand_en") || ""),
    },
    brandSub: {
      cn: String(formData.get("brand_sub_cn") || ""),
      zh: String(formData.get("brand_sub_zh") || ""),
      en: String(formData.get("brand_sub_en") || ""),
    },
    logoUrl: String(formData.get("logo_url") || ""),
    company: {
      cn: String(formData.get("company_cn") || ""),
      zh: String(formData.get("company_zh") || ""),
      en: String(formData.get("company_en") || ""),
    },
    whatsappNumber: String(formData.get("whatsapp") || ""),
    tawkPropertyId: String(formData.get("tawk_property") || ""),
    tawkWidgetId: String(formData.get("tawk_widget") || ""),
    contactEmail: String(formData.get("email") || ""),
    contactPhone: String(formData.get("phone") || ""),
    address: {
      cn: String(formData.get("addr_cn") || ""),
      zh: String(formData.get("addr_zh") || ""),
      en: String(formData.get("addr_en") || ""),
    },
    commentsEnabled: formData.get("comments_enabled") === "on",
    likesEnabled: formData.get("likes_enabled") === "on",
  };
  if (!isSupabaseConfigured()) saveAdminStore(store);
  await syncSiteSettings(store.siteSettings);
  revalidatePublic();
}

export async function saveProductAction(formData: FormData) {
  await requireAdmin();
  const store = await loadAdminStore();
  const id = String(formData.get("id") || "");
  let idx = store.products.findIndex((p) => p.id === id);
  if (idx < 0) {
    // create
    const slug =
      String(formData.get("slug") || "").trim() ||
      `lot-${Date.now().toString(36)}`;
    store.products.push({
      id: id || crypto.randomUUID(),
      slug,
      lotNo: String(formData.get("lot_no") || "NEW"),
      category: {
        cn: String(formData.get("cat_cn") || "寿山石"),
        zh: String(formData.get("cat_zh") || "壽山石"),
        en: String(formData.get("cat_en") || "Shoushan Stone"),
      },
      title: emptyL(),
      excerpt: emptyL(),
      description: emptyL(),
      image: "",
      gallery: [],
      specs: [],
      featured: false,
      status: "preview",
      basePriceLow: 0,
      basePriceHigh: 0,
      currency: "MYR",
      upliftEnabled: null,
      upliftMode: null,
      upliftValue: null,
      upliftStartAt: new Date().toISOString().slice(0, 10),
      priceCapHigh: null,
      saleSessionId: null,
      sortOrder: store.products.length,
      active: true,
    });
    idx = store.products.length - 1;
  }

  const p = store.products[idx];
  p.lotNo = String(formData.get("lot_no") || p.lotNo);
  if (formData.get("slug")) p.slug = String(formData.get("slug"));
  p.title.cn = String(formData.get("title_cn") || p.title.cn);
  p.title.zh = String(formData.get("title_zh") || p.title.zh);
  p.title.en = String(formData.get("title_en") || p.title.en);
  p.excerpt.cn = String(formData.get("excerpt_cn") ?? p.excerpt.cn);
  p.excerpt.zh = String(formData.get("excerpt_zh") ?? p.excerpt.zh);
  p.excerpt.en = String(formData.get("excerpt_en") ?? p.excerpt.en);
  p.description.cn = String(formData.get("desc_cn") ?? p.description.cn);
  p.description.zh = String(formData.get("desc_zh") ?? p.description.zh);
  p.description.en = String(formData.get("desc_en") ?? p.description.en);
  p.category.cn = String(formData.get("cat_cn") || p.category.cn);
  p.category.zh = String(formData.get("cat_zh") || p.category.zh);
  p.category.en = String(formData.get("cat_en") || p.category.en);
  p.image = String(formData.get("image") ?? p.image);
  const galleryRaw = String(formData.get("gallery") || "").trim();
  if (galleryRaw) {
    p.gallery = galleryRaw
      .split(/\n|,/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  p.basePriceLow = Number(formData.get("base_low") || 0);
  p.basePriceHigh = Number(formData.get("base_high") || 0);
  p.upliftEnabled =
    formData.get("uplift_override") === "on"
      ? formData.get("uplift_enabled") === "on"
      : null;
  p.upliftValue =
    formData.get("uplift_override") === "on"
      ? Number(formData.get("uplift_value") || 0)
      : null;
  p.upliftMode =
    formData.get("uplift_override") === "on"
      ? (formData.get("uplift_mode") as "percent_daily" | "fixed_daily")
      : null;
  p.upliftStartAt = String(formData.get("uplift_start") || p.upliftStartAt);
  p.priceCapHigh = formData.get("price_cap")
    ? Number(formData.get("price_cap"))
    : null;
  p.featured = formData.get("featured") === "on";
  p.active = formData.get("active") === "on";
  p.status = (formData.get("status") as typeof p.status) || p.status;

  if (!isSupabaseConfigured()) saveAdminStore(store);
  await syncProduct(p);
  revalidatePublic();
}

export async function createProductAction() {
  await requireAdmin();
  const id = crypto.randomUUID();
  const store = await loadAdminStore();
  const product = {
    id,
    slug: `lot-${Date.now().toString(36)}`,
    lotNo: `LOT-${String(store.products.length + 1).padStart(3, "0")}`,
    category: { cn: "寿山石", zh: "壽山石", en: "Shoushan Stone" },
    title: { cn: "新拍品", zh: "新拍品", en: "New Lot" },
    excerpt: emptyL(),
    description: emptyL(),
    image: "",
    gallery: [] as string[],
    specs: [],
    featured: false,
    status: "preview" as const,
    basePriceLow: 0,
    basePriceHigh: 0,
    currency: "MYR",
    upliftEnabled: null,
    upliftMode: null,
    upliftValue: null,
    upliftStartAt: new Date().toISOString().slice(0, 10),
    priceCapHigh: null,
    saleSessionId: null,
    sortOrder: store.products.length,
    active: true,
  };
  store.products.push(product);
  if (!isSupabaseConfigured()) saveAdminStore(store);
  await syncProduct(product);
  revalidatePublic();
  redirect(`/admin/products/${id}`);
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const store = await loadAdminStore();
  store.products = store.products.filter((p) => p.id !== id);
  if (!isSupabaseConfigured()) saveAdminStore(store);
  await deleteProductRemote(id);
  revalidatePublic();
  redirect("/admin/products");
}

export async function saveArticleAction(formData: FormData) {
  await requireAdmin();
  const store = await loadAdminStore();
  const id = String(formData.get("id") || crypto.randomUUID());
  let article = store.articles.find((a) => a.id === id);
  if (!article) {
    article = {
      id,
      slug: String(formData.get("slug") || id),
      title: emptyL(),
      excerpt: emptyL(),
      body: emptyL(),
      cover: "",
      category: emptyL(),
      date: new Date().toISOString().slice(0, 10),
      active: true,
      sortOrder: store.articles.length,
    };
    store.articles.push(article);
  }
  article.slug = String(formData.get("slug") || article.slug);
  article.title = {
    cn: String(formData.get("title_cn") || ""),
    zh: String(formData.get("title_zh") || ""),
    en: String(formData.get("title_en") || ""),
  };
  article.excerpt = {
    cn: String(formData.get("excerpt_cn") || ""),
    zh: String(formData.get("excerpt_zh") || ""),
    en: String(formData.get("excerpt_en") || ""),
  };
  article.body = {
    cn: String(formData.get("body_cn") || ""),
    zh: String(formData.get("body_zh") || ""),
    en: String(formData.get("body_en") || ""),
  };
  article.cover = String(formData.get("cover") || "");
  article.category = {
    cn: String(formData.get("cat_cn") || ""),
    zh: String(formData.get("cat_zh") || ""),
    en: String(formData.get("cat_en") || ""),
  };
  article.date = String(formData.get("date") || article.date);
  article.active = formData.get("active") === "on";
  if (!isSupabaseConfigured()) saveAdminStore(store);
  await syncArticle(article as ArticleRecord);
  revalidatePublic();
  redirect("/admin/news");
}

export async function deleteArticleAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const store = await loadAdminStore();
  store.articles = store.articles.filter((a) => a.id !== id);
  if (!isSupabaseConfigured()) saveAdminStore(store);
  await deleteArticleRemote(id);
  revalidatePublic();
}

export async function savePostAction(formData: FormData) {
  await requireAdmin();
  const store = await loadAdminStore();
  const id = String(formData.get("id") || crypto.randomUUID());
  let post = store.posts.find((p) => p.id === id);
  if (!post) {
    post = {
      id,
      author: emptyL(),
      avatar: "",
      content: emptyL(),
      image: "",
      images: [],
      date: new Date().toISOString().slice(0, 10),
      likes: 0,
      views: 0,
      commentCount: 0,
      comments: [],
      active: true,
      sortOrder: store.posts.length,
    };
    store.posts.push(post);
  }
  post.author = {
    cn: String(formData.get("author_cn") || ""),
    zh: String(formData.get("author_zh") || ""),
    en: String(formData.get("author_en") || ""),
  };
  post.content = {
    cn: String(formData.get("content_cn") || ""),
    zh: String(formData.get("content_zh") || ""),
    en: String(formData.get("content_en") || ""),
  };
  post.avatar = String(formData.get("avatar") || "");
  post.image = String(formData.get("image") || "");
  const imagesRaw = String(formData.get("images") || "");
  const images = imagesRaw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  post.images = images.length ? images : post.image ? [post.image] : [];
  if (!post.image && post.images[0]) post.image = post.images[0];
  post.date = String(formData.get("date") || post.date);
  post.likes = Number(formData.get("likes") || post.likes);
  post.views = Number(formData.get("views") || post.views);
  post.active = formData.get("active") === "on";
  post.commentCount = await getCommentCount(id);
  if (!isSupabaseConfigured()) saveAdminStore(store);
  await syncPost(post as PostRecord);
  revalidatePublic();
  redirect("/admin/posts");
}

export async function deletePostAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const store = await loadAdminStore();
  store.posts = store.posts.filter((p) => p.id !== id);
  if (!isSupabaseConfigured()) saveAdminStore(store);
  await deletePostRemote(id);
  revalidatePublic();
}

export async function savePostCommentAction(formData: FormData) {
  await requireAdmin();
  const postId = String(formData.get("post_id") || "");
  const id = String(formData.get("id") || crypto.randomUUID());
  const user = String(formData.get("user") || "").trim();
  const text = String(formData.get("text") || "").trim();
  const langTag = String(formData.get("lang_tag") || "my");
  if (!postId || !user || !text) redirect(`/admin/posts/${postId}/comments`);
  await upsertComment({ id, postId, user, text, langTag });
  const store = await loadAdminStore();
  const post = store.posts.find((p) => p.id === postId);
  if (post) {
    post.commentCount = await getCommentCount(postId);
    if (!isSupabaseConfigured()) saveAdminStore(store);
    await syncPost(post as PostRecord);
  }
  revalidatePublic();
  redirect(`/admin/posts/${postId}/comments`);
}

export async function deletePostCommentAction(formData: FormData) {
  await requireAdmin();
  const postId = String(formData.get("post_id") || "");
  const id = String(formData.get("id") || "");
  await deleteComment(postId, id);
  const store = await loadAdminStore();
  const post = store.posts.find((p) => p.id === postId);
  if (post) {
    post.commentCount = await getCommentCount(postId);
    if (!isSupabaseConfigured()) saveAdminStore(store);
    await syncPost(post as PostRecord);
  }
  revalidatePublic();
  redirect(`/admin/posts/${postId}/comments`);
}

export async function saveMarqueeAction(formData: FormData) {
  await requireAdmin();
  const store = await loadAdminStore();
  const id = String(formData.get("id") || crypto.randomUUID());
  let msg = store.marquee.find((m) => m.id === id);
  if (!msg) {
    msg = {
      id,
      text: emptyL(),
      active: true,
      sortOrder: store.marquee.length,
    };
    store.marquee.push(msg);
  }
  msg.text = {
    cn: String(formData.get("text_cn") || ""),
    zh: String(formData.get("text_zh") || ""),
    en: String(formData.get("text_en") || ""),
  };
  msg.active = formData.get("active") === "on";
  if (!isSupabaseConfigured()) saveAdminStore(store);
  await syncMarquee(msg as MarqueeRecord);
  revalidatePublic();
  redirect("/admin/marquee");
}

export async function deleteMarqueeAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const store = await loadAdminStore();
  store.marquee = store.marquee.filter((m) => m.id !== id);
  if (!isSupabaseConfigured()) saveAdminStore(store);
  await deleteMarqueeRemote(id);
  revalidatePublic();
}

export async function saveBannerAction(formData: FormData) {
  await requireAdmin();
  const store = await loadAdminStore();
  const id = String(formData.get("id") || crypto.randomUUID());
  let banner = store.banners.find((b) => b.id === id);
  if (!banner) {
    banner = {
      id,
      image: "",
      headline: emptyL(),
      sub: emptyL(),
      linkSlug: "",
      category: "hero",
      active: true,
      sortOrder: store.banners.length,
    };
    store.banners.push(banner);
  }
  banner.image = String(formData.get("image") || "");
  banner.headline = {
    cn: String(formData.get("headline_cn") || ""),
    zh: String(formData.get("headline_zh") || ""),
    en: String(formData.get("headline_en") || ""),
  };
  banner.sub = {
    cn: String(formData.get("sub_cn") || ""),
    zh: String(formData.get("sub_zh") || ""),
    en: String(formData.get("sub_en") || ""),
  };
  banner.linkSlug = String(formData.get("link_slug") || "").trim();
  banner.category =
    formData.get("category") === "news" ? "news" : "hero";
  banner.active = formData.get("active") === "on";
  if (!isSupabaseConfigured()) saveAdminStore(store);
  await syncBanner(banner as BannerRecord);
  revalidatePublic();
  redirect("/admin/banners");
}

export async function deleteBannerAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const store = await loadAdminStore();
  store.banners = store.banners.filter((b) => b.id !== id);
  if (!isSupabaseConfigured()) saveAdminStore(store);
  await deleteBannerRemote(id);
  revalidatePublic();
}

export async function updateInquiryAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const status = (formData.get("status") as InquiryStatus) || "new";
  const adminNotes = String(formData.get("notes") || "");
  const updatedAt = new Date().toISOString();

  const store = await loadAdminStore();
  const inq = store.inquiries.find((i) => i.id === id);
  if (inq) {
    inq.status = status;
    inq.adminNotes = adminNotes;
    inq.updatedAt = updatedAt;
    if (!isSupabaseConfigured()) saveAdminStore(store);
    await syncInquiry(inq);
    return;
  }

  const remote = (await getAdminInquiries()).find((i) => i.id === id);
  if (!remote) return;
  remote.status = status;
  remote.adminNotes = adminNotes;
  remote.updatedAt = updatedAt;
  await syncInquiry(remote);
}

export async function resetStoreAction() {
  await requireAdmin();
  const store = resetAdminStore();
  await seedFullStore(store);
  revalidatePublic();
}

export async function previewProductPriceAction(productId: string) {
  await requireAdmin();
  const store = await loadAdminStore();
  const p = store.products.find((x) => x.id === productId);
  if (!p) return null;
  const enriched = enrichProduct(p, store.priceRules);
  return {
    estimate: enriched.estimate,
    low: enriched.displayPriceLow,
    high: enriched.displayPriceHigh,
  };
}

export async function getDashboardStatsAction() {
  await requireAdmin();
  const store = await loadAdminStore();
  const inquiries = await getAdminInquiries();
  return {
    products: store.products.filter((p) => p.active).length,
    news: store.articles.filter((a) => a.active).length,
    posts: store.posts.filter((p) => p.active).length,
    marquee: store.marquee.filter((m) => m.active).length,
    inquiriesNew: inquiries.filter((i) => i.status === "new").length,
    uplift: store.priceRules.defaultUpliftValue,
    backend: isSupabaseConfigured() ? "supabase" : "local-file",
  };
}
