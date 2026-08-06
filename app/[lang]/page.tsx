import Link from "next/link";
import { notFound } from "next/navigation";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import SocialFeed from "@/components/SocialFeed";
import { SectionHeader, ProductCard, ArticleCard } from "@/components/ui";
import {
  getArticles,
  getFeaturedProducts,
  getHeroBanners,
  getMarqueeMessages,
  getPosts,
  getSiteSettings,
} from "@/lib/cms/repository";
import { stats } from "@/lib/data";
import { dict, isLocale, type Locale } from "@/lib/i18n";

export const revalidate = 300;

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  if (!isLocale(raw)) notFound();
  const lang = raw as Locale;
  const t = dict[lang];

  const [featured, articles, posts, banners, marquee, settings] = await Promise.all([
    getFeaturedProducts(),
    getArticles(),
    getPosts(),
    getHeroBanners(),
    getMarqueeMessages(),
    getSiteSettings(),
  ]);

  return (
    <>
      <Hero lang={lang} banners={banners} />
      <Marquee lang={lang} messages={marquee} />

      <section className="py-24 bg-ivory">
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
          <SectionHeader
            kicker={t.sections.featuredKicker}
            title={t.sections.featuredTitle}
            desc={t.sections.featuredDesc}
          />
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} lang={lang} />
            ))}
          </div>
          <div className="mt-14 text-center">
            <Link href={`/${lang}/products`} className="btn-gold">
              {t.common.viewAll}
            </Link>
          </div>
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

      <section className="py-24 bg-paper">
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8 grid lg:grid-cols-2 gap-14 items-center">
          <div className="relative">
            <div className="aspect-[4/3] overflow-hidden bg-ivory-deep">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/products/about-main.png"
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 hidden sm:block w-40 h-40 border border-gold" />
          </div>
          <div>
            <SectionHeader
              kicker={t.sections.aboutKicker}
              title={t.sections.aboutTitle}
              desc={t.sections.aboutDesc}
              align="left"
            />
            <div className="mt-8">
              <Link href={`/${lang}/about`} className="btn-solid">
                {t.nav.about}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-ivory">
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
          <SectionHeader
            kicker={t.sections.newsKicker}
            title={t.sections.newsTitle}
            desc={t.sections.newsDesc}
          />
          <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {articles.slice(0, 3).map((a) => (
              <ArticleCard key={a.id} article={a} lang={lang} />
            ))}
          </div>
          <div className="mt-14 text-center">
            <Link href={`/${lang}/news`} className="btn-gold">
              {t.common.viewAll}
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 bg-paper">
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
          <SectionHeader
            kicker={t.sections.postsKicker}
            title={t.sections.postsTitle}
          />
          <div className="mt-14">
            <SocialFeed
              posts={posts.slice(0, 6)}
              lang={lang}
              commentsEnabled={settings.commentsEnabled}
              likesEnabled={settings.likesEnabled}
            />
          </div>
          <div className="mt-14 text-center">
            <Link href={`/${lang}/posts`} className="btn-gold">
              {t.common.viewAll}
            </Link>
          </div>
        </div>
      </section>

      <section className="relative py-28 bg-bordeaux overflow-hidden">
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8 text-center relative z-10">
          <span className="gold-rule !w-16 mx-auto block" />
          <h2 className="font-display text-3xl lg:text-5xl text-paper mt-6">
            {t.sections.aboutTitle}
          </h2>
          <p className="mt-5 text-ivory/70 max-w-xl mx-auto">{t.sections.aboutDesc}</p>
          <div className="mt-10">
            <Link
              href={`/${lang}/about`}
              className="btn-gold !border-gold-soft !text-paper hover:!bg-gold hover:!text-ink"
            >
              {t.nav.about}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
