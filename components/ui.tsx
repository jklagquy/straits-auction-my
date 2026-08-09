import Link from "next/link";
import type { Product, Article } from "@/lib/cms/types";
import { dict, tr, type Locale } from "@/lib/i18n";

export function SectionHeader({
  kicker,
  title,
  desc,
  align = "center",
}: {
  kicker: string;
  title: string;
  desc?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "text-center" : "text-left"}>
      <div
        className={`flex items-center gap-4 ${
          align === "center" ? "justify-center" : ""
        }`}
      >
        <span className="gold-rule" />
        <span className="eyebrow">{kicker}</span>
        <span className="gold-rule" />
      </div>
      <h2 className="font-display text-3xl lg:text-[2.6rem] leading-tight mt-4 text-ink">
        {title}
      </h2>
      {desc && (
        <p
          className={`mt-4 text-ink-soft/80 leading-relaxed ${
            align === "center" ? "max-w-2xl mx-auto" : "max-w-2xl"
          }`}
        >
          {desc}
        </p>
      )}
    </div>
  );
}

export function ProductCard({
  product,
  lang,
}: {
  product: Product;
  lang: Locale;
}) {
  const t = dict[lang];
  return (
    <Link
      href={`/${lang}/products/${product.slug}`}
      className="group block bg-paper border border-line hover-lift"
    >
      <div className="relative overflow-hidden aspect-[4/5] bg-ivory-deep">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={tr(product.title, lang)}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <span className="absolute top-4 left-4 bg-ink/80 text-ivory text-[10px] tracking-wide-2 px-3 py-1.5">
          {tr(product.category, lang)}
        </span>
      </div>
      <div className="p-6">
        <div className="text-[11px] tracking-wide-2 text-muted">
          {t.common.lotNo} {product.lotNo}
        </div>
        <h3 className="font-display text-xl mt-2 leading-snug text-ink group-hover:text-bordeaux transition-colors">
          {tr(product.title, lang)}
        </h3>
        <p className="mt-3 text-sm text-ink-soft/70 line-clamp-2">
          {tr(product.excerpt, lang)}
        </p>
        <div className="mt-5 pt-4 border-t border-line flex items-center justify-between gap-3">
          <div>
            {(product.originalPrice ?? 0) > 0 &&
              product.originalPrice !== product.currentPrice && (
                <div className="text-xs text-muted line-through decoration-muted/70">
                  {product.currency === "MYR" || !product.currency ? "RM" : product.currency}{" "}
                  {product.originalPrice!.toLocaleString("en-MY", {
                    maximumFractionDigits: 0,
                  })}
                </div>
              )}
            <div className="text-[10px] tracking-wide-2 text-muted uppercase">
              {t.common.currentPrice}
            </div>
            <div className="text-sm text-bordeaux font-medium mt-0.5">
              {product.estimate}
            </div>
          </div>
          <span className="text-[11px] tracking-wide-2 text-gold-deep shrink-0">
            {t.common.viewDetail} →
          </span>
        </div>
      </div>
    </Link>
  );
}

export function ArticleCard({
  article,
  lang,
}: {
  article: Article;
  lang: Locale;
}) {
  const t = dict[lang];
  return (
    <Link
      href={`/${lang}/news/${article.id}`}
      className="group block bg-paper border border-line hover-lift"
    >
      <div className="relative overflow-hidden aspect-[16/10] bg-ivory-deep">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={article.cover}
          alt={tr(article.title, lang)}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="p-6">
        <div className="flex items-center gap-3 text-[11px] tracking-wide-2 text-muted">
          <span className="text-gold-deep">{tr(article.category, lang)}</span>
          <span>·</span>
          <span>{article.date}</span>
        </div>
        <h3 className="font-display text-xl mt-3 leading-snug text-ink group-hover:text-bordeaux transition-colors line-clamp-2">
          {tr(article.title, lang)}
        </h3>
        <p className="mt-3 text-sm text-ink-soft/70 line-clamp-2">
          {tr(article.excerpt, lang)}
        </p>
        <span className="inline-block mt-5 text-[11px] tracking-wide-2 text-gold-deep">
          {t.common.readMore} →
        </span>
      </div>
    </Link>
  );
}

export function PageBanner({
  title,
  desc,
  image,
}: {
  title: string;
  desc?: string;
  image: string;
}) {
  return (
    <section className="relative h-[46vh] min-h-[340px] bg-ink overflow-hidden mt-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/40" />
      <div className="relative z-10 h-full flex items-end">
        <div className="mx-auto max-w-[1280px] w-full px-5 lg:px-8 pb-14">
          <div className="animate-fade-up">
            <span className="gold-rule !w-12 block mb-5" />
            <h1 className="font-display text-4xl lg:text-5xl text-paper">{title}</h1>
            {desc && <p className="mt-4 text-ivory/70 max-w-xl">{desc}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
