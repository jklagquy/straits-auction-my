import Link from "next/link";
import { notFound } from "next/navigation";
import PriceTrend from "@/components/PriceTrend";
import ProductGallery from "@/components/ProductGallery";
import {
  getPriceHistory,
  getProductBySlug,
  getProducts,
  getSiteSettings,
} from "@/lib/cms/repository";
import { dict, isLocale, tr, type Locale } from "@/lib/i18n";

export const revalidate = 300;

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductDetail({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const lang = raw as Locale;
  const t = dict[lang];
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [allProducts, history, settings] = await Promise.all([
    getProducts(),
    getPriceHistory(product.id),
    getSiteSettings(),
  ]);
  const related = allProducts.filter((p) => p.id !== product.id).slice(0, 3);
  const wa = settings.whatsappNumber.replace(/\D/g, "");
  const inquireHref = wa
    ? `https://wa.me/${wa}?text=${encodeURIComponent(
        `${lang === "en" ? "Enquiry about" : "咨询藏品"}: ${tr(product.title, lang)} (${product.slug})`
      )}`
    : `/${lang}/about`;

  const statusLabel: Record<
    string,
    { cn: string; zh: string; en: string }
  > = {
    preview: { cn: "预展中", zh: "預展中", en: "Preview" },
    available: { cn: "可询价", zh: "可詢價", en: "Available" },
    reserved: { cn: "已预留", zh: "已預留", en: "Reserved" },
    sold: { cn: "已成交", zh: "已成交", en: "Sold" },
  };
  const badge = product.status ? tr(statusLabel[product.status], lang) : null;

  return (
    <>
      <div className="pt-[var(--nav-h)] bg-ink" />
      <section className="bg-ink text-paper">
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8 py-14 grid lg:grid-cols-2 gap-12">
          <ProductGallery
            title={tr(product.title, lang)}
            image={product.image}
            gallery={product.gallery}
          />

          <div className="flex flex-col justify-center">
            <Link
              href={`/${lang}/products`}
              className="text-[12px] tracking-wide-2 text-ivory/50 hover:text-gold-soft mb-6"
            >
              ← {t.pages.productsTitle}
            </Link>
            <span className="eyebrow !text-gold-soft">
              {tr(product.category, lang)}
            </span>
            <h1 className="font-display text-3xl lg:text-4xl leading-tight mt-4 text-paper">
              {tr(product.title, lang)}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-[12px] tracking-wide-2 text-ivory/50">
              <span>
                {t.common.lotNo} {product.lotNo}
              </span>
              {badge && (
                <span className="px-2 py-0.5 border border-gold-soft/50 text-gold-soft">
                  {badge}
                </span>
              )}
            </div>

            <div className="mt-8 py-6 border-y border-white/10">
              <div className="text-[11px] tracking-wide-2 text-ivory/50 uppercase">
                {t.common.estimate}
              </div>
              <div className="font-display text-2xl text-gold-soft mt-1">
                {product.estimate}
              </div>
              <PriceTrend history={history} />
            </div>

            <p className="mt-8 text-ivory/75 leading-[1.9]">
              {tr(product.description, lang)}
            </p>

            <dl className="mt-8 border-t border-white/10">
              {product.specs.map((s, i) => (
                <div
                  key={i}
                  className="flex gap-4 py-3 border-b border-white/10 text-sm"
                >
                  <dt className="w-32 shrink-0 text-ivory/45 tracking-wide-2">
                    {tr(s.label, lang)}
                  </dt>
                  <dd className="text-ivory/85">{tr(s.value, lang)}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-10">
              <a
                href={inquireHref}
                target={wa ? "_blank" : undefined}
                rel={wa ? "noopener noreferrer" : undefined}
                className="btn-gold !border-gold-soft !text-paper hover:!bg-gold hover:!text-ink"
              >
                {t.common.inquire}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-ivory">
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
          <h2 className="font-display text-2xl text-ink mb-10">
            {t.sections.featuredKicker}
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <RelatedCard
                key={p.id}
                slug={p.slug}
                lang={lang}
                image={p.image}
                title={tr(p.title, lang)}
                estimate={p.estimate}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function RelatedCard({
  slug,
  lang,
  image,
  title,
  estimate,
}: {
  slug: string;
  lang: Locale;
  image: string;
  title: string;
  estimate: string;
}) {
  return (
    <Link
      href={`/${lang}/products/${slug}`}
      className="group block bg-paper border border-line hover-lift"
    >
      <div className="aspect-[4/5] overflow-hidden bg-ivory-deep">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg text-ink group-hover:text-bordeaux transition-colors line-clamp-1">
          {title}
        </h3>
        <div className="mt-2 text-sm text-bordeaux">{estimate}</div>
      </div>
    </Link>
  );
}
