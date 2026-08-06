"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Banner } from "@/lib/cms/types";
import { dict, tr, type Locale } from "@/lib/i18n";

export default function Hero({
  lang,
  banners,
}: {
  lang: Locale;
  banners: Banner[];
}) {
  const t = dict[lang];
  const [idx, setIdx] = useState(0);
  const slides = banners.length ? banners : [];

  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(id);
  }, [slides.length]);

  if (!slides.length) return null;
  const current = slides[idx]!;
  const href = current.linkSlug
    ? `/${lang}/products/${current.linkSlug}`
    : `/${lang}/products`;

  return (
    <section className="relative h-screen min-h-[640px] w-full overflow-hidden bg-ink">
      {slides.map((b, i) => (
        <div
          key={b.id}
          className={`absolute inset-0 transition-opacity duration-[1400ms] ${
            i === idx ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={b.image}
            alt=""
            className={`h-full w-full object-cover ${i === idx ? "animate-kenburns" : ""}`}
          />
          {/* Darken baked-in foreign marketing copy on legacy banner art */}
          <div className="absolute inset-0 bg-gradient-to-r from-ink/92 via-ink/70 to-ink/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/35 to-ink/50" />
        </div>
      ))}

      <div className="relative z-10 h-full flex items-center">
        <div className="mx-auto max-w-[1280px] w-full px-5 lg:px-8">
          <div className="max-w-2xl">
            <div key={`${idx}-${lang}`} className="animate-fade-up">
              <div className="flex items-center gap-4 mb-6">
                <span className="gold-rule !w-12" />
                <span className="eyebrow !text-gold-soft">{t.heroTag}</span>
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.1] text-paper drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)]">
                {tr(current.headline, lang)}
              </h1>
              <p className="mt-6 text-lg text-ivory/85 font-light leading-relaxed drop-shadow-[0_1px_8px_rgba(0,0,0,0.45)]">
                {tr(current.sub, lang)}
              </p>
            </div>
            <div className="mt-10 flex flex-wrap gap-4 animate-fade-up delay-2">
              <Link
                href={href}
                className="btn-gold !text-paper !border-gold-soft hover:!bg-gold hover:!text-ink"
              >
                {t.common.viewDetail}
              </Link>
              <Link href={`/${lang}/products`} className="btn-solid">
                {t.hero.enter}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIdx(i)}
            aria-label={`slide ${i + 1}`}
            className={`h-[3px] transition-all duration-500 ${
              i === idx ? "w-10 bg-gold" : "w-5 bg-ivory/40"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
