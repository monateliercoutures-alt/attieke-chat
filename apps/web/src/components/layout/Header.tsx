'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { SUPPORTED_LOCALES, type Locale } from '@attieke-chat/shared';
import type { HomeDictionary } from '@/data/mock/home';
import type { CommonDictionary } from '@/lib/i18n';
import { useAppStore } from '@/store/useAppStore';

interface HeaderProps {
  locale: Locale;
  dict: HomeDictionary['header'];
  navDict?: CommonDictionary['nav'];
}

const LOCALE_STORAGE_KEY = 'attieke_preferred_locale';
const LOCALE_SESSION_SYNC_KEY = 'attieke_locale_synced';

export function Header({ locale, dict, navDict }: HeaderProps): React.JSX.Element {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();
  const unreadChatCount = useAppStore((s) => s.unreadChatCount);

  useEffect(() => {
    try {
      const savedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
      const alreadySynced = window.sessionStorage.getItem(LOCALE_SESSION_SYNC_KEY);

      if (
        !alreadySynced &&
        savedLocale &&
        (SUPPORTED_LOCALES as readonly string[]).includes(savedLocale) &&
        savedLocale !== locale
      ) {
        window.sessionStorage.setItem(LOCALE_SESSION_SYNC_KEY, '1');
        const segments = pathname.split('/');
        segments[1] = savedLocale;
        router.replace(segments.join('/') || `/${savedLocale}`);
        return;
      }

      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
      document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      // Ignore storage access errors
    }
  }, [locale, pathname, router]);

  const handleLocaleSwitch = (targetLocale: Locale): void => {
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, targetLocale);
      window.sessionStorage.setItem(LOCALE_SESSION_SYNC_KEY, '1');
      document.cookie = `NEXT_LOCALE=${targetLocale}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      // Ignore storage errors
    }
    setMobileMenuOpen(false);
    const segments = pathname.split('/');
    segments[1] = targetLocale;
    router.push(segments.join('/') || `/${targetLocale}`);
  };

  const navItems: ReadonlyArray<{ href: string; label: string; badge?: number }> = navDict
    ? [
        { href: `/${locale}`, label: navDict.home },
        { href: `/${locale}/catalog`, label: navDict.catalog },
        { href: `/${locale}/chat`, label: navDict.chat, badge: unreadChatCount },
        { href: `/${locale}/orders`, label: navDict.orders },
        { href: `/${locale}/profile`, label: navDict.profile },
      ]
    : [
        { href: `/${locale}#products`, label: dict.nav.products },
        { href: `/${locale}#how-it-works`, label: dict.nav.howItWorks },
        { href: `/${locale}#delivery`, label: dict.nav.delivery },
        { href: `/${locale}#faq`, label: dict.nav.faq },
      ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-brand-ink/10 bg-brand-cream/90 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo style WhatsApp + Bol d'Attiéké */}
        <Link
          href={`/${locale}`}
          className="group flex items-center gap-3 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green"
        >
          <span
            role="img"
            aria-label={dict.logoAlt}
            className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-green text-white shadow-sm transition-transform duration-200 group-hover:scale-105"
          >
            <svg
              viewBox="0 0 40 40"
              fill="none"
              className="h-8 w-8"
              aria-hidden="true"
            >
              <path
                d="M20 5C11.7 5 5 11.2 5 18.8c0 3.1 1.1 6 3 8.3L6.2 34l7.2-1.9c2 .8 4.2 1.3 6.6 1.3 8.3 0 15-6.2 15-13.8S28.3 5 20 5z"
                stroke="#F4B41A"
                strokeWidth="2.2"
                fill="#0F4C3A"
              />
              <path
                d="M12.5 20.5C13.8 16.5 16.6 14.5 20 14.5c3.4 0 6.2 2 7.5 6H12.5z"
                fill="#F4B41A"
              />
              <path
                d="M11 20.5h18c-.7 4.6-4.4 7.5-9 7.5s-8.3-2.9-9-7.5z"
                fill="#FFFFFF"
              />
            </svg>
          </span>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold tracking-tight text-brand-green sm:text-xl">
              {dict.brandName}
            </span>
            <span className="text-[11px] font-medium text-brand-ink-muted line-clamp-1">
              {dict.brandTagline}
            </span>
          </div>
        </Link>

        {/* Navigation centrale Desktop */}
        <nav
          aria-label={dict.navAriaLabel}
          className="hidden items-center gap-7 md:flex"
        >
          {navItems.map((item) => {
            const isActive =
              item.href === `/${locale}`
                ? pathname === `/${locale}`
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative inline-flex items-center gap-1.5 py-1 text-sm font-semibold transition-colors hover:text-brand-green focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green rounded-md ${
                  isActive ? 'text-brand-green font-extrabold' : 'text-brand-ink'
                }`}
              >
                <span>{item.label}</span>
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-gold px-1.5 text-[11px] font-extrabold text-brand-ink">
                    {item.badge}
                  </span>
                )}
                <span
                  aria-hidden="true"
                  className={`absolute bottom-0 left-0 h-0.5 bg-brand-green transition-all duration-200 ${
                    isActive ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Sélecteur de langue + Bouton pilule bordé façon WhatsApp.com */}
        <div className="hidden items-center gap-3.5 md:flex">
          <div
            role="group"
            aria-label={dict.languageSwitcher.ariaLabel}
            className="inline-flex items-center rounded-full border border-brand-ink/15 bg-white/80 p-1"
          >
            {SUPPORTED_LOCALES.map((loc) => {
              const isActive = loc === locale;
              return (
                <button
                  key={loc}
                  type="button"
                  onClick={() => handleLocaleSwitch(loc)}
                  aria-pressed={isActive}
                  className={`min-h-[32px] rounded-full px-3 text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-brand-green text-white shadow-sm'
                      : 'text-brand-ink-muted hover:text-brand-ink'
                  }`}
                >
                  {dict.languageSwitcher[loc]}
                </button>
              );
            })}
          </div>

          <Link
            href={`/${locale}/chat`}
            className="inline-flex min-h-[46px] items-center gap-2.5 rounded-full border border-brand-ink bg-brand-gold px-6 py-2.5 text-sm font-bold text-brand-ink transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-gold-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green"
          >
            <span>{dict.ctaChat}</span>
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.22 14.78a.75.75 0 0 0 1.06 0l7.22-7.22v5.69a.75.75 0 0 0 1.5 0v-7.5a.75.75 0 0 0-.75-.75h-7.5a.75.75 0 0 0 0 1.5h5.69l-7.22 7.22a.75.75 0 0 0 0 1.06z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>

        {/* Contrôles Mobile : Langues + Menu Hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <div
            role="group"
            aria-label={dict.languageSwitcher.ariaLabel}
            className="inline-flex items-center rounded-full border border-brand-ink/15 bg-white p-0.5"
          >
            {SUPPORTED_LOCALES.map((loc) => {
              const isActive = loc === locale;
              return (
                <button
                  key={loc}
                  type="button"
                  onClick={() => handleLocaleSwitch(loc)}
                  aria-pressed={isActive}
                  className={`min-h-[32px] min-w-[34px] rounded-full px-2 text-xs font-bold transition-colors ${
                    isActive
                      ? 'bg-brand-green text-white'
                      : 'text-brand-ink-muted hover:text-brand-ink'
                  }`}
                >
                  {dict.languageSwitcher[loc]}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-menu"
            aria-label={mobileMenuOpen ? dict.mobileMenuClose : dict.mobileMenuOpen}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-brand-ink/15 bg-white text-brand-ink transition-colors hover:bg-brand-green-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green"
          >
            {mobileMenuOpen ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Menu Mobile Déroulant */}
      {mobileMenuOpen && (
        <nav
          id="mobile-navigation-menu"
          aria-label={dict.navAriaLabel}
          className="border-t border-brand-ink/10 bg-brand-cream px-4 pb-6 pt-3 shadow-xl md:hidden"
        >
          <ul className="divide-y divide-brand-ink/10">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex min-h-[52px] items-center justify-between px-2 text-lg font-bold text-brand-ink transition-colors hover:text-brand-green"
                >
                  <span>{item.label}</span>
                  <span aria-hidden="true" className="text-brand-ink-muted">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-5">
            <Link
              href={`/${locale}/chat`}
              onClick={() => setMobileMenuOpen(false)}
              className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full border border-brand-ink bg-brand-gold px-6 py-3.5 text-base font-extrabold text-brand-ink shadow-cta"
            >
              <span>{dict.ctaChat}</span>
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
