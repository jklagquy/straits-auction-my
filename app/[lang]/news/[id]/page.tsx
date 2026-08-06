import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleById, getArticles } from "@/lib/cms/repository";
import { dict, isLocale, tr, type Locale } from "@/lib/i18n";

export const revalidate = 300;

export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map((a) => ({ id: a.id }));
}

export default async function ArticleDetail({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang: raw, id } = await params;
  if (!isLocale(raw)) notFound();
  const lang = raw as Locale;
  const t = dict[lang];
  const article = await getArticleById(id);
  if (!article) notFound();

  const articles = await getArticles();
  const more = articles.filter((a) => a.id !== id).slice(0, 3);

  return (
    <>
      <div className="pt-[var(--nav-h)]" />
      <article className="bg-paper">
        <div className="mx-auto max-w-3xl px-5 lg:px-8 pt-14">
          <Link
            href={`/${lang}/news`}
            className="text-[12px] tracking-wide-2 text-muted hover:text-bordeaux"
          >
            ← {t.pages.newsTitle}
          </Link>
          <div className="mt-6 flex items-center gap-3 text-[12px] tracking-wide-2 text-muted">
            <span className="text-gold-deep">{tr(article.category, lang)}</span>
            <span>·</span>
            <span>
              {t.common.published} {article.date}
            </span>
          </div>
          <h1 className="font-display text-3xl lg:text-[2.7rem] leading-tight mt-4 text-ink">
            {tr(article.title, lang)}
          </h1>
        </div>

        <div className="mx-auto max-w-4xl px-5 lg:px-8 mt-10">
          <div className="aspect-[16/9] overflow-hidden bg-ivory-deep">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.cover}
              alt={tr(article.title, lang)}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-5 lg:px-8 py-12">
          <p className="font-display text-xl text-ink-soft leading-relaxed italic">
            {tr(article.excerpt, lang)}
          </p>
          <div className="gold-rule !w-16 my-8" />
          <div className="space-y-6 text-ink-soft leading-[2] text-[1.02rem]">
            {tr(article.body, lang)
              .split("\n\n")
              .map((para, i) => (
                <p key={i}>{para}</p>
              ))}
          </div>
        </div>
      </article>

      <section className="py-16 bg-ivory border-t border-line">
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
          <h2 className="font-display text-2xl text-ink mb-8">
            {t.sections.newsKicker}
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {more.map((a) => (
              <Link
                key={a.id}
                href={`/${lang}/news/${a.id}`}
                className="group block bg-paper border border-line hover-lift"
              >
                <div className="aspect-[16/10] overflow-hidden bg-ivory-deep">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={a.cover}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <div className="text-[11px] tracking-wide-2 text-muted">
                    {a.date}
                  </div>
                  <h3 className="font-display text-lg mt-2 text-ink group-hover:text-bordeaux transition-colors line-clamp-2">
                    {tr(a.title, lang)}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
