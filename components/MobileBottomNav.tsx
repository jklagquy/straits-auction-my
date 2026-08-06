"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { dict, type Locale } from "@/lib/i18n";

/** Malaysia mobile-first bottom bar — common on MY commerce / catalogue sites. */
export default function MobileBottomNav({
  lang,
  whatsappNumber,
}: {
  lang: Locale;
  whatsappNumber: string;
}) {
  const t = dict[lang];
  const pathname = usePathname();
  const wa = whatsappNumber.replace(/\D/g, "");
  const waUrl = wa
    ? `https://wa.me/${wa}?text=${encodeURIComponent(
        lang === "en"
          ? "Hello, I would like to enquire about your lots."
          : "你好，想咨询拍品详情。"
      )}`
    : `/${lang}/contact`;

  const items = [
    { href: `/${lang}`, label: t.nav.home, icon: HomeIcon },
    { href: `/${lang}/products`, label: t.nav.products, icon: GridIcon },
    { href: waUrl, label: "WhatsApp", icon: WaIcon, external: Boolean(wa), highlight: true },
    { href: `/${lang}/news`, label: t.nav.news, icon: NewsIcon },
    { href: `/${lang}/contact`, label: t.nav.contact, icon: ContactIcon },
  ];

  const active = (href: string) =>
    href === `/${lang}` ? pathname === href : pathname.startsWith(href);

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 border-t border-line bg-paper/95 backdrop-blur safe-bottom">
      <ul className="grid grid-cols-5 h-16">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = !item.highlight && active(item.href);
          const className = `flex flex-col items-center justify-center gap-0.5 text-[10px] ${
            item.highlight
              ? "text-[#128C7E] font-semibold"
              : isActive
                ? "text-bordeaux"
                : "text-muted"
          }`;
          if (item.external) {
            return (
              <li key={item.label}>
                <a href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
                  <Icon />
                  <span>{item.label}</span>
                </a>
              </li>
            );
          }
          return (
            <li key={item.label}>
              <Link href={item.href} className={className}>
                <Icon />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-10.5z" />
    </svg>
  );
}
function GridIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
function WaIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.5 3.5A11 11 0 0 0 3.2 17.9L2 22l4.2-1.1A11 11 0 1 0 20.5 3.5zm-8.5 17a9 9 0 0 1-4.6-1.3l-.3-.2-2.7.7.7-2.6-.2-.3a9 9 0 1 1 7.1 3.7zm5-6.7c-.3-.1-1.6-.8-1.9-.9s-.4-.1-.6.1-.7.9-.8 1-.3.2-.6.1a7.3 7.3 0 0 1-2.1-1.3 8 8 0 0 1-1.5-1.8c-.2-.3 0-.4.1-.6l.4-.5.2-.4c.1-.2 0-.3 0-.4s-.6-1.4-.8-1.9-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3a2.3 2.3 0 0 0-.7 1.7 4 4 0 0 0 .8 2.1c.1.2 1.5 2.3 3.6 3.2a12 12 0 0 0 1.2.4 2.9 2.9 0 0 0 1.3.1c.4-.1 1.6-.7 1.8-1.3s.2-1.2.2-1.3-.2-.2-.4-.3z" />
    </svg>
  );
}
function NewsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 5h12v14H4zM16 8h4v11a2 2 0 0 1-2 2H6" />
      <path d="M7 9h6M7 13h6M7 17h4" />
    </svg>
  );
}
function ContactIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 6h16v12H4z" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}
