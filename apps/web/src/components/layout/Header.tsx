'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { SUPPORTED_LOCALES, type Locale } from '@attieke-chat/shared';
import type { HomeDictionary } from '@/data/mock/home';
import type { CommonDictionary } from '@/lib/i18n';
import { useAppStore } from '@/store/useAppStore';
import { useTheme } from './ThemeProvider';

interface HeaderProps {
  locale: Locale;
  dict: HomeDictionary['header'];
  navDict: CommonDictionary['nav'];
}

const LOCALE_STORAGE_KEY = 'attieke_preferred_locale';
const LOCALE_SESSION_SYNC_KEY = 'attieke_locale_synced';

export function Header({
  locale,
  dict,
  navDict,
}: HeaderProps): React.JSX.Element {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();
  const unreadChatCount = useAppStore((s) => s.unreadChatCount);
  const activeOrdersCount = useAppStore((s) => s.activeOrdersCount);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    try {
      const savedLocale = window.localStorage.getItem(
        LOCALE_STORAGE_KEY
      ) as Locale | null;
      const alreadySynced = window.sessionStorage.getItem(
        LOCALE_SESSION_SYNC_KEY
      );

      if (
        !alreadySynced &&
        savedLocale &&
        (SUPPORTED_LOCALES as readonly string[]).includes(savedLocale) &&
        savedLocale !== locale
      ) {
        window.sessionStorage.setItem(LOCALE_SESSION_SYNC_KEY, '1');
        const segments = pathname.split('/');
        segments[1] = savedLocale;
        router.replace(segments.join('/') || `/${savedLocale}/chat`);
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
    router.push(segments.join('/') || `/${targetLocale}/chat`);
  };

  const cycleNextLocale = (): void => {
    const idx = SUPPORTED_LOCALES.indexOf(locale);
    const nextLocale =
      SUPPORTED_LOCALES[(idx + 1) % SUPPORTED_LOCALES.length] ?? 'fr';
    handleLocaleSwitch(nextLocale);
  };

  // Uniquement les 4 onglets : Chat, Catalogue, Commandes, Profil
  const navItems: ReadonlyArray<{
    href: string;
    label: string;
    badge?: number;
  }> = [
    { href: `/${locale}/chat`, label: navDict.chat, badge: unreadChatCount },
    { href: `/${locale}/catalog`, label: navDict.catalog },
    {
      href: `/${locale}/orders`,
      label: navDict.orders,
      badge: activeOrdersCount,
    },
    { href: `/${locale}/profile`, label: navDict.profile },
  ];

  const isChatActive = pathname.startsWith(`/${locale}/chat`);
  const isCatalogActive = pathname.startsWith(`/${locale}/catalog`);
  const isOrdersActive = pathname.startsWith(`/${locale}/orders`);
  const isProfileActive =
    pathname.startsWith(`/${locale}/profile`) ||
    pathname.startsWith(`/${locale}/auth`);

  const themeToggleLabel =
    locale === 'zh'
      ? theme === 'dark'
        ? '切换到浅色模式'
        : '切换到深色模式'
      : locale === 'en'
      ? theme === 'dark'
        ? 'Switch to light theme'
        : 'Switch to dark theme'
      : theme === 'dark'
      ? 'Passer au thème clair'
      : 'Passer au thème sombre';

  return (
    <>
      {/* 1. RAIL VERTICAL GAUCHE SUR ORDINATEUR (Desktop >= 768 px, comme sur la capture WhatsApp Web/Desktop) */}
      <aside
        aria-label={dict.navAriaLabel}
        className="hidden md:flex md:h-screen md:w-[60px] md:shrink-0 md:flex-col md:items-center md:justify-between md:border-r md:border-wa-border md:bg-wa-composer md:py-3 md:select-none"
      >
        {/* Icônes du haut : Discussions (Chat), Commandes (Suivi), Catalogue (Boutique) */}
        <div className="flex flex-col items-center gap-2.5">
          {/* 1. Discussions / Chat */}
          <Link
            href={`/${locale}/chat`}
            title={navDict.chat}
            aria-label={navDict.chat}
            aria-current={isChatActive ? 'page' : undefined}
            className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-fast ${
              isChatActive
                ? 'bg-black/10 text-wa-text-primary dark:bg-white/15'
                : 'text-wa-text-secondary hover:bg-black/5 hover:text-wa-text-primary dark:hover:bg-white/10'
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill={isChatActive ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H9l-4.5 3.5V16H6.5A2.5 2.5 0 0 1 4 13.5v-8Z"
              />
              <path
                strokeLinecap="round"
                stroke="currentColor"
                d="M8 8.5h8M8 11.5h5"
              />
            </svg>
            {unreadChatCount > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-wa-accent px-1 text-[10px] font-bold text-white shadow-xs">
                {unreadChatCount > 99 ? '99+' : unreadChatCount}
              </span>
            )}
          </Link>

          {/* 2. Commandes (icône suivi / appels) */}
          <Link
            href={`/${locale}/orders`}
            title={navDict.orders}
            aria-label={navDict.orders}
            aria-current={isOrdersActive ? 'page' : undefined}
            className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-fast ${
              isOrdersActive
                ? 'bg-black/10 text-wa-text-primary dark:bg-white/15'
                : 'text-wa-text-secondary hover:bg-black/5 hover:text-wa-text-primary dark:hover:bg-white/10'
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 9.4 7.55 4.24M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
              />
              <polyline
                strokeLinecap="round"
                strokeLinejoin="round"
                points="3.29 7 12 12 20.71 7"
              />
              <line
                strokeLinecap="round"
                strokeLinejoin="round"
                x1="12"
                y1="22"
                x2="12"
                y2="12"
              />
            </svg>
            {activeOrdersCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-wa-accent px-1 text-[10px] font-bold text-white">
                {activeOrdersCount}
              </span>
            )}
          </Link>

          {/* 3. Catalogue (icône statut / anneau avec pastille verte comme sur la capture) */}
          <Link
            href={`/${locale}/catalog`}
            title={navDict.catalog}
            aria-label={navDict.catalog}
            aria-current={isCatalogActive ? 'page' : undefined}
            className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-fast ${
              isCatalogActive
                ? 'bg-black/10 text-wa-text-primary dark:bg-white/15'
                : 'text-wa-text-secondary hover:bg-black/5 hover:text-wa-text-primary dark:hover:bg-white/10'
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="8.5" strokeDasharray="14 4" />
              <circle cx="12" cy="12" r="3.5" />
            </svg>
            <span
              aria-hidden="true"
              className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-wa-accent"
            />
          </Link>
        </div>

        {/* Icônes du bas : Langue, Thème Clair/Sombre, et Avatar rond Profil */}
        <div className="flex flex-col items-center gap-2.5">
          {/* Sélecteur de langue compact */}
          <button
            type="button"
            onClick={cycleNextLocale}
            title={dict.languageSwitcher.ariaLabel}
            aria-label={dict.languageSwitcher.ariaLabel}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-wa-border bg-wa-panel text-wa-meta font-bold uppercase text-wa-text-secondary transition-colors duration-fast hover:text-wa-text-primary"
          >
            {locale.toUpperCase()}
          </button>

          {/* Bascule Thème Clair / Sombre */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={themeToggleLabel}
            title={themeToggleLabel}
            className="flex h-10 w-10 items-center justify-center rounded-full text-wa-text-secondary transition-colors duration-fast hover:bg-black/5 hover:text-wa-text-primary dark:hover:bg-white/10"
          >
            {theme === 'dark' ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="4" />
                <path
                  strokeLinecap="round"
                  d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
                />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                />
              </svg>
            )}
          </button>

          {/* 4. Avatar rond Profil tout en bas (exactement comme sur la capture WhatsApp Desktop) */}
          <Link
            href={`/${locale}/profile`}
            title={navDict.profile}
            aria-label={navDict.profile}
            aria-current={isProfileActive ? 'page' : undefined}
            className={`relative h-9 w-9 overflow-hidden rounded-full border-2 transition-transform duration-fast hover:scale-105 ${
              isProfileActive
                ? 'border-wa-accent ring-2 ring-wa-accent/30'
                : 'border-wa-border'
            }`}
          >
            <Image
              src="/images/avatars/vendor.jpg"
              alt={navDict.profile}
              fill
              sizes="36px"
              className="object-cover"
            />
          </Link>
        </div>
      </aside>

      {/* 2. BARRE SUPÉRIEURE SUR MOBILE (< 768 px, façon Android / iOS) */}
      <header className="wa-mobile-hide-in-thread sticky top-0 z-40 w-full border-b border-wa-border bg-wa-header text-white transition-colors duration-normal md:hidden">
        <div className="mx-auto flex h-14 items-center justify-between px-4">
          <Link
            href={`/${locale}/chat`}
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(
                  new CustomEvent('attieke:show-conversation-list')
                );
              }
            }}
            className="group flex items-center gap-2.5 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-wa-accent"
          >
            <span
              role="img"
              aria-label={dict.logoAlt}
              className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-wa-accent/20 text-wa-accent ring-1 ring-wa-accent/40"
            >
              <svg
                viewBox="0 0 40 40"
                fill="none"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  stroke="currentColor"
                  strokeWidth="2.2"
                />
                <path
                  d="M12.5 20.5C13.8 16.5 16.6 14.5 20 14.5c3.4 0 6.2 2 7.5 6H12.5z"
                  fill="currentColor"
                  fillOpacity="0.35"
                />
                <path
                  d="M11 20.5h18c-.7 4.6-4.4 7.5-9 7.5s-8.3-2.9-9-7.5z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <span className="wa-text-title font-semibold tracking-tight text-white">
              {dict.brandName}
            </span>
          </Link>

          <div className="flex items-center gap-1.5">
            <div
              role="group"
              aria-label={dict.languageSwitcher.ariaLabel}
              className="inline-flex items-center rounded-full bg-white/10 p-0.5"
            >
              {SUPPORTED_LOCALES.map((loc) => {
                const isActive = loc === locale;
                return (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => handleLocaleSwitch(loc)}
                    aria-pressed={isActive}
                    className={`min-h-[28px] min-w-[28px] rounded-full px-2 text-wa-meta font-semibold transition-colors duration-fast ${
                      isActive
                        ? 'bg-wa-accent text-wa-commerce-text'
                        : 'text-white/80 hover:text-white'
                    }`}
                  >
                    {dict.languageSwitcher[loc]}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={themeToggleLabel}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white/90 hover:bg-white/10"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-label={
                mobileMenuOpen ? dict.mobileMenuClose : dict.mobileMenuOpen
              }
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white/90 hover:bg-white/10"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <circle cx="12" cy="5" r="1.8" />
                <circle cx="12" cy="12" r="1.8" />
                <circle cx="12" cy="19" r="1.8" />
              </svg>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav
            aria-label={dict.navAriaLabel}
            className="absolute right-3 top-14 z-50 w-52 overflow-hidden rounded-2xl border border-wa-border bg-wa-composer py-1.5 text-wa-text-primary shadow-wa-panel"
          >
            <ul>
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex min-h-[44px] items-center justify-between px-4 py-2 text-wa-preview font-medium text-wa-text-primary hover:bg-wa-panel"
                  >
                    <span>{item.label}</span>
                    {typeof item.badge === 'number' && item.badge > 0 && (
                      <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-wa-accent px-1.5 text-wa-meta font-bold text-wa-commerce-text">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>
    </>
  );
}
