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
    const id = setInterval(() => setIdx((i) => (i + 1) % slides.length), 7000);
    return () => clearInterval(id);
  }, [slides.length]);

  if (!slides.length) return null;
  const current = slides[idx]!;
  const href = current.linkSlug
    ? `/${lang}/products/${current.linkSlug}`
    : `/${lang}/products`;

  return (
    <section className="relative w-full overflow-hidden bg-ink lg:min-h-[100svh]">
      {/* Soft studio atmosphere — not a cropped full-bleed product crop */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 70% 45%, rgba(180,140,70,0.18), transparent 55%), radial-gradient(ellipse 50% 40% at 20% 80%, rgba(90,40,40,0.25), transparent 50%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(201,168,108,0.12)_1px,transparent_0)] [background-size:28px_28px] opacity-40" />

      {/*
        Stack below lg (hamburger / bottom-nav range).
        Side-by-side only at lg+ so tall seals never compete with copy mid-widths.
      */}
      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1280px] flex-col justify-start gap-6 px-5 pb-28 pt-28 sm:gap-8 sm:pb-24 lg:min-h-[100svh] lg:flex-row lg:items-center lg:justify-center lg:gap-16 lg:px-8 lg:py-24 lg:pb-24">
        {/* Copy — always above the stage in paint order on stacked layouts */}
        <div className="relative z-20 w-full max-w-xl shrink-0 lg:w-[42%]">
          <div key={`${idx}-${lang}`} className="animate-fade-up">
            <div className="mb-4 flex items-center gap-4 sm:mb-6">
              <span className="gold-rule !w-12" />
              <span className="eyebrow !text-gold-soft">{t.heroTag}</span>
            </div>
            <h1 className="font-display text-3xl leading-[1.12] text-paper sm:text-4xl md:text-5xl lg:text-[3.25rem]">
              {tr(current.headline, lang)}
            </h1>
            <p className="mt-3 text-[15px] font-light leading-relaxed text-ivory/80 sm:mt-5 sm:text-lg">
              {tr(current.sub, lang)}
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3 animate-fade-up delay-2 sm:mt-9 sm:gap-4">
            <Link
              href={href}
              className="btn-gold !border-gold-soft !text-paper hover:!bg-gold hover:!text-ink"
            >
              {t.common.viewDetail}
            </Link>
            <Link href={`/${lang}/products`} className="btn-solid">
              {t.hero.enter}
            </Link>
          </div>
        </div>

        {/*
          Stage keeps an in-flow height at every breakpoint so absolute
          crossfade slides cannot collapse the box and paint over the copy.
          Heights stay modest below lg for tall pillar seals.
        */}
        <div className="relative z-10 mx-auto w-full max-w-[420px] shrink-0 sm:max-w-[480px] lg:mx-0 lg:max-w-none lg:min-h-0 lg:flex-1">
          <div className="relative h-[min(42vh,340px)] w-full sm:h-[min(44vh,380px)] lg:h-[min(70vh,640px)]">
            {slides.map((b, i) => (
              <div
                key={b.id}
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ${
                  i === idx ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                {/* Soft pedestal glow */}
                <div className="absolute bottom-[6%] left-1/2 h-12 w-[65%] -translate-x-1/2 rounded-[100%] bg-gold/15 blur-2xl sm:h-16" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={b.image}
                  alt={tr(b.headline, lang)}
                  className="relative z-[1] h-full w-auto max-w-full object-contain drop-shadow-[0_24px_48px_rgba(0,0,0,0.55)]"
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-20 left-1/2 z-20 flex -translate-x-1/2 gap-3 lg:bottom-8">
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
