import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import MobileBottomNav from "@/components/MobileBottomNav";
import { getSiteSettings } from "@/lib/cms/repository";
import { isLocale, locales, tr, type Locale } from "@/lib/i18n";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const revalidate = 300;

/** Keep share previews (Telegram / WhatsApp) in sync with CMS brand settings */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang: raw } = await params;
  if (!isLocale(raw)) return {};
  const lang = raw as Locale;
  const settings = await getSiteSettings();
  const brand = tr(settings.brand, lang) || "万国古董文博协会";
  const brandSub = tr(settings.brandSub, lang) || "WACA";
  const title = `${brand} · ${brandSub}`;
  const description =
    lang === "en"
      ? "World Antique Cultural-Heritage Association — private collecting and cultural exchange."
      : lang === "zh"
        ? "萬國古董文博協會（WACA）— 私人收藏與文博交流平台。"
        : "万国古董文博协会（WACA）— 私人收藏与文博交流平台。";

  return {
    title: { absolute: title },
    description,
    openGraph: {
      title,
      description,
      siteName: brand,
      locale: lang === "en" ? "en_MY" : lang === "zh" ? "zh_TW" : "zh_CN",
      url: `/${lang}`,
      images: [{ url: "/brand/waca-og.png", width: 1200, height: 630, alt: brand }],
    },
    twitter: {
      title,
      description,
      images: ["/brand/waca-og.png"],
    },
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const settings = await getSiteSettings();
  const locale = lang as Locale;

  return (
    <>
      <Header lang={locale} settings={settings} />
      <main className="flex-1">{children}</main>
      <Footer lang={locale} settings={settings} />
      <MobileBottomNav lang={locale} whatsappNumber={settings.whatsappNumber} />
      <ChatWidget settings={settings} />
    </>
  );
}
