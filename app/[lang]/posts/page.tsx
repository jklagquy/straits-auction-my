import { notFound } from "next/navigation";
import { PageBanner } from "@/components/ui";
import SocialFeed from "@/components/SocialFeed";
import { getPosts, getSiteSettings } from "@/lib/cms/repository";
import { dict, isLocale, type Locale } from "@/lib/i18n";

export const revalidate = 300;

export default async function PostsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  if (!isLocale(raw)) notFound();
  const lang = raw as Locale;
  const t = dict[lang];
  const [posts, settings] = await Promise.all([getPosts(), getSiteSettings()]);

  return (
    <>
      <PageBanner
        title={t.pages.postsTitle}
        desc={t.pages.postsDesc}
        image="/products/ss-09.jpg"
      />
      <section className="py-20 bg-ivory">
        <div className="mx-auto max-w-[1180px] px-5 lg:px-8">
          <SocialFeed
            posts={posts}
            lang={lang}
            commentsEnabled={settings.commentsEnabled}
            likesEnabled={settings.likesEnabled}
          />
        </div>
      </section>
    </>
  );
}
