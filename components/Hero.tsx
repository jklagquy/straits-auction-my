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
    <section className="relative w-full overflow-x-hidden bg-ink">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 70% 45%, rgba(180,140,70,0.18), transparent 55%), radial-gradient(ellipse 50% 40% at 20% 80%, rgba(90,40,40,0.25), transparent 50%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(201,168,108,0.12)_1px,transparent_0)] [background-size:28px_28px] opacity-40" />

      {/*
        Below lg: always stack (matches hamburger / bottom-nav).
        No min-h-screen race — copy and stage share normal document flow.
      */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1280px] flex-col gap-5 px-5 pb-32 pt-24 sm:gap-6 sm:pb-28 sm:pt-28 lg:min-h-[100svh] lg:flex-row lg:items-center lg:gap-14 lg:px-8 lg:py-24 lg:pb-24">
        <div className="relative z-30 w-full shrink-0 bg-ink/80 lg:w-[42%] lg:max-w-xl lg:bg-transparent">
          <div key={`${idx}-${lang}`} className="animate-fade-up">
            <div className="mb-3 flex items-center gap-3 sm:mb-5 sm:gap-4">
              <span className="gold-rule !w-12" />
              <span className="eyebrow !text-gold-soft">{t.heroTag}</span>
            </div>
            <h1 className="font-display text-[1.75rem] leading-[1.15] text-paper sm:text-4xl md:text-5xl lg:text-[3.25rem]">
              {tr(current.headline, lang)}
            </h1>
            <p className="mt-2 text-[14px] font-light leading-relaxed text-ivory/80 sm:mt-4 sm:text-lg">
              {tr(current.sub, lang)}
            </p>
          </div>
          <div className="relative z-30 mt-5 flex flex-wrap gap-3 animate-fade-up delay-2 sm:mt-8 sm:gap-4">
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
          Fixed stage height + overflow clip.
          Pillar seals scale with max-h/max-w (never forced to fill height alone),
          so tall silhouettes shrink the same way landscape shots do.
        */}
        <div className="relative z-10 w-full shrink-0 lg:flex-1">
          <div className="relative mx-auto h-[280px] w-full max-w-[360px] overflow-hidden sm:h-[300px] sm:max-w-[400px] md:h-[320px] lg:mx-0 lg:h-[min(68vh,620px)] lg:max-w-none">
            {slides.map((b, i) => (
              <div
                key={b.id}
                className={`absolute inset-0 flex items-end justify-center pb-2 transition-opacity duration-700 sm:items-center sm:pb-0 ${
                  i === idx ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                <div className="pointer-events-none absolute bottom-[4%] left-1/2 h-10 w-[60%] -translate-x-1/2 rounded-[100%] bg-gold/15 blur-2xl" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={b.image}
                  alt={tr(b.headline, lang)}
                  className="relative z-[1] max-h-full max-w-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.55)]"
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-[5.5rem] left-1/2 z-20 flex -translate-x-1/2 gap-3 lg:bottom-8">
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
