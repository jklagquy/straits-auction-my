import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import MobileBottomNav from "@/components/MobileBottomNav";
import { getSiteSettings } from "@/lib/cms/repository";
import { isLocale, locales, type Locale } from "@/lib/i18n";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const revalidate = 300;

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
