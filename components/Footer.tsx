import Link from "next/link";
import { dict, tr, type Locale } from "@/lib/i18n";
import type { SiteSettings } from "@/lib/cms/types";

export default function Footer({
  lang,
  settings,
}: {
  lang: Locale;
  settings: SiteSettings;
}) {
  const t = dict[lang];
  const brand = tr(settings.brand, lang) || t.brand;
  const brandSub = tr(settings.brandSub, lang) || t.brandSub;
  const company = tr(settings.company, lang) || t.footer.company;
  const addr = tr(settings.address, lang) || t.footer.addr;
  const phone = settings.contactPhone || "+60 3-2148 8800";
  const email = settings.contactEmail || "info@straitsscholars.com.my";

  const nav = [
    { href: `/${lang}/products`, label: t.nav.products },
    { href: `/${lang}/news`, label: t.nav.news },
    { href: `/${lang}/posts`, label: t.nav.posts },
    { href: `/${lang}/about`, label: t.nav.about },
    { href: `/${lang}/contact`, label: t.nav.contact },
  ];

  return (
    <footer className="bg-ink text-ivory/80 mt-auto pb-20 lg:pb-0">
      <div className="mx-auto max-w-[1280px] px-5 lg:px-8 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              {settings.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={settings.logoUrl} alt={brand} className="h-10 w-auto object-contain brightness-0 invert opacity-90" />
              ) : null}
              <div>
                <div className="font-display text-2xl tracking-wide-2 text-paper">{brand}</div>
                <div className="eyebrow mt-2 !text-gold-soft">{brandSub}</div>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-ivory/60">
              {t.footer.tagline}
            </p>
          </div>

          <div>
            <h4 className="text-[12px] tracking-luxe uppercase text-gold-soft mb-5">
              {t.footer.quickLinks}
            </h4>
            <ul className="space-y-3">
              {nav.map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    className="text-sm text-ivory/70 hover:text-gold-soft transition-colors"
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[12px] tracking-luxe uppercase text-gold-soft mb-5">
              {t.footer.contact}
            </h4>
            <p className="text-sm text-ivory/70 leading-relaxed">
              {company}
              <br />
              {addr}
              <br />
              {phone}
              <br />
              {email}
            </p>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-ivory/40">
            © {new Date().getFullYear()} {brand}. {t.footer.rights}.
          </p>
          <p className="text-xs text-ivory/40 tracking-wide-2">{brandSub}</p>
        </div>
      </div>
    </footer>
  );
}
