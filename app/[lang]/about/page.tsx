import { notFound } from "next/navigation";
import { PageBanner, SectionHeader } from "@/components/ui";
import { stats } from "@/lib/data";
import { dict, isLocale, type Locale } from "@/lib/i18n";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  if (!isLocale(raw)) notFound();
  const lang = raw as Locale;
  const t = dict[lang];

  return (
    <>
      <PageBanner
        title={t.pages.aboutTitle}
        image="/products/hero-main.jpg"
      />

      <section className="py-24 bg-paper">
        <div className="mx-auto max-w-3xl px-5 lg:px-8 text-center">
          <SectionHeader
            kicker={t.sections.aboutKicker}
            title={t.sections.aboutTitle}
            desc={t.sections.aboutDesc}
          />
        </div>
      </section>

      <section className="bg-ink text-paper py-20">
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
            {stats.map((s) => (
              <div key={s.key} className="text-center">
                <div className="font-display text-4xl lg:text-5xl text-gold-soft">
                  {s.value}
                </div>
                <div className="mt-3 text-[12px] tracking-wide-2 text-ivory/60">
                  {t.stats[s.key]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-ivory">
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8 grid lg:grid-cols-2 gap-14 items-center">
          <div className="aspect-[4/3] overflow-hidden bg-ivory-deep">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/products/about-main.png"
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <SectionHeader
              kicker={t.sections.postsKicker}
              title={t.sections.postsTitle}
              align="left"
            />
            <p className="mt-6 text-ink-soft leading-[1.9]">
              {t.sections.aboutDesc}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
