"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { dict, localeNames, locales, tr, type Locale } from "@/lib/i18n";
import type { SiteSettings } from "@/lib/cms/types";

export default function Header({
  lang,
  settings,
}: {
  lang: Locale;
  settings: SiteSettings;
}) {
  const t = dict[lang];
  const brand = tr(settings.brand, lang) || t.brand;
  const brandSub = tr(settings.brandSub, lang) || t.brandSub;
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setLangOpen(false);
  }, [pathname]);

  const desktopNav = [
    { href: `/${lang}`, label: t.nav.home },
    { href: `/${lang}/products`, label: t.nav.products },
    { href: `/${lang}/news`, label: t.nav.news },
    { href: `/${lang}/posts`, label: t.nav.posts },
    { href: `/${lang}/about`, label: t.nav.about },
  ];
  // 手机汉堡：藏家动态改到底栏，避免与底栏重复
  const mobileNav = desktopNav.filter((n) => n.href !== `/${lang}/posts`);

  const swapLang = (target: Locale) => {
    const rest = pathname.split("/").slice(2).join("/");
    return `/${target}${rest ? "/" + rest : ""}`;
  };

  const isActive = (href: string) =>
    href === `/${lang}` ? pathname === href : pathname.startsWith(href);

  // 首页可透明叠在深色 Hero 上；内页（资讯等）浅底时强制实心深色字
  const onHome = pathname === `/${lang}` || pathname === `/${lang}/`;
  const solid = scrolled || open || !onHome;

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        solid
          ? "bg-paper/95 backdrop-blur border-b border-line shadow-[0_10px_40px_-30px_rgba(26,21,18,0.5)]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
        <div className="flex items-center justify-between h-[var(--nav-h)]">
          <Link href={`/${lang}`} className="flex items-center gap-3 min-w-0">
            {settings.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.logoUrl}
                alt={brand}
                className="h-10 w-auto max-w-[140px] object-contain"
              />
            ) : null}
            <span className="flex flex-col leading-none min-w-0">
              <span
                className={`font-display text-lg sm:text-xl lg:text-2xl tracking-wide-2 truncate max-w-[10rem] sm:max-w-[16rem] lg:max-w-none ${
                  solid ? "text-bordeaux" : "text-paper"
                }`}
              >
                {brand}
              </span>
              <span
                className={`text-[9px] sm:text-[10px] tracking-luxe mt-1 truncate max-w-[12rem] sm:max-w-[20rem] ${
                  solid ? "text-gold-deep" : "text-gold-soft"
                }`}
              >
                {brandSub}
              </span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {desktopNav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`link-underline text-[13px] tracking-wide-2 transition-colors ${
                  solid ? "text-ink-soft hover:text-bordeaux" : "text-paper/90 hover:text-white"
                } ${isActive(n.href) ? "!text-gold-deep" : ""}`}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setLangOpen((v) => !v)}
                className={`flex items-center gap-1.5 text-[12px] tracking-wide-2 ${
                  solid ? "text-ink-soft" : "text-paper/90"
                }`}
              >
                <GlobeIcon />
                {localeNames[lang]}
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-3 w-40 bg-paper border border-line shadow-xl py-1">
                  {locales.map((l) => (
                    <Link
                      key={l}
                      href={swapLang(l)}
                      className={`block px-4 py-2.5 text-[13px] hover:bg-ivory-deep ${
                        l === lang ? "text-gold-deep" : "text-ink-soft"
                      }`}
                    >
                      {localeNames[l]}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <button
              className="lg:hidden flex flex-col gap-1.5 w-6"
              onClick={() => setOpen((v) => !v)}
              aria-label="menu"
            >
              <span className={`h-px transition-all ${solid ? "bg-ink" : "bg-paper"} ${open ? "translate-y-2 rotate-45" : ""}`} />
              <span className={`h-px transition-all ${solid ? "bg-ink" : "bg-paper"} ${open ? "opacity-0" : ""}`} />
              <span className={`h-px transition-all ${solid ? "bg-ink" : "bg-paper"} ${open ? "-translate-y-2 -rotate-45" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="lg:hidden bg-paper border-t border-line">
          <nav className="flex flex-col px-5 py-3">
            {mobileNav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`py-3 text-[15px] border-b border-line/60 ${
                  isActive(n.href) ? "text-gold-deep" : "text-ink-soft"
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

function GlobeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
    </svg>
  );
}
