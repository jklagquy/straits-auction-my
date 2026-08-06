import { notFound } from "next/navigation";
import { PageBanner } from "@/components/ui";
import ContactForm from "@/components/ContactForm";
import { getSiteSettings } from "@/lib/cms/repository";
import { dict, isLocale, tr, type Locale } from "@/lib/i18n";

export default async function ContactPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ lot?: string }>;
}) {
  const { lang: raw } = await params;
  const { lot } = await searchParams;
  if (!isLocale(raw)) notFound();
  const lang = raw as Locale;
  const t = dict[lang];
  const settings = await getSiteSettings();

  return (
    <>
      <PageBanner
        title={t.pages.contactTitle}
        desc={t.contact.desc}
        image="/products/ss-14.png"
      />
      <section className="py-24 bg-ivory">
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8 grid lg:grid-cols-2 gap-16">
          <div>
            <span className="eyebrow">{t.nav.contact}</span>
            <h2 className="font-display text-3xl mt-3 text-ink">
              {t.contact.title}
            </h2>
            <p className="mt-5 text-ink-soft leading-relaxed">{t.contact.desc}</p>

            <div className="mt-10 space-y-6">
              <InfoRow label={t.contact.address} value={tr(settings.address, lang)} />
              <InfoRow label={t.contact.phone} value={settings.contactPhone} />
              <InfoRow label="Email" value={settings.contactEmail} />
              <InfoRow
                label={t.contact.hours}
                value="10:00 – 18:00 (Mon – Sat)"
              />
            </div>
          </div>

          <div className="bg-paper border border-line p-8 lg:p-10">
            <ContactForm lang={lang} lotSlug={lot} />
          </div>
        </div>
      </section>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4">
      <div className="w-10 h-10 shrink-0 border border-gold flex items-center justify-center text-gold-deep">
        ◆
      </div>
      <div>
        <div className="text-[11px] tracking-wide-2 text-muted uppercase">
          {label}
        </div>
        <div className="text-sm text-ink mt-1">{value}</div>
      </div>
    </div>
  );
}
