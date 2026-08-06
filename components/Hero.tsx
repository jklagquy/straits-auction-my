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
  const t = dict[lang];  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % banners.length), 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative h-screen min-h-[640px] w-full overflow-hidden bg-ink">
      {banners.map((b, i) => (
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
          <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/45 to-ink/55" />
        </div>
      ))}

      <div className="relative z-10 h-full flex items-center">
        <div className="mx-auto max-w-[1280px] w-full px-5 lg:px-8">
          <div className="max-w-2xl">
            <div key={idx} className="animate-fade-up">
              <div className="flex items-center gap-4 mb-6">
                <span className="gold-rule !w-12" />
                <span className="eyebrow !text-gold-soft">
                  {t.heroTag}
                </span>
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.1] text-paper">
                {tr(banners[idx].headline, lang)}
              </h1>
              <p className="mt-6 text-lg text-ivory/75 font-light leading-relaxed">
                {tr(banners[idx].sub, lang)}
              </p>
            </div>
            <div className="mt-10 flex flex-wrap gap-4 animate-fade-up delay-2">
              <Link href={`/${lang}/products`} className="btn-gold !text-paper !border-gold-soft hover:!bg-gold hover:!text-ink">
                {t.hero.enter}
              </Link>
              <Link href={`/${lang}/about`} className="btn-solid">
                {t.nav.about}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex gap-3">
        {banners.map((_, i) => (
          <button
            key={i}
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
