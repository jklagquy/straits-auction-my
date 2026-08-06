import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/ui";
import NewsBannerCarousel from "@/components/NewsBannerCarousel";
import { getArticles, getNewsBanners } from "@/lib/cms/repository";
import { dict, isLocale, type Locale } from "@/lib/i18n";

export const revalidate = 300;

export default async function NewsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  if (!isLocale(raw)) notFound();
  const lang = raw as Locale;
  const t = dict[lang];

  const [articles, newsBanners] = await Promise.all([
    getArticles(),
    getNewsBanners(),
  ]);

  return (
    <>
      <div className="pt-[var(--nav-h)]" />
      <NewsBannerCarousel images={newsBanners.map((b) => b.image)} />
      <section className="bg-ink text-paper py-12 border-b border-white/10">
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
          <span className="gold-rule !w-12 block mb-4" />
          <h1 className="font-display text-3xl lg:text-4xl">{t.pages.newsTitle}</h1>
          {t.pages.newsDesc && (
            <p className="mt-3 text-ivory/70 max-w-2xl">{t.pages.newsDesc}</p>
          )}
        </div>
      </section>
      <section className="py-20 bg-ivory">
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} lang={lang} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
