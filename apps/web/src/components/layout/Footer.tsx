'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SUPPORTED_LOCALES, type Locale } from '@attieke-chat/shared';
import type { HomeDictionary } from '@/data/mock/home';
import type { CommonDictionary } from '@/lib/i18n';

interface FooterProps {
  locale: Locale;
  footerDict: HomeDictionary['footer'];
  headerDict: HomeDictionary['header'];
  navDict: CommonDictionary['nav'];
}

export function Footer({
  locale,
  footerDict,
  headerDict,
  navDict,
}: FooterProps): React.JSX.Element | null {
  const pathname = usePathname();

  // Dans l'écran Chat, masquer le pied de page pour que la messagerie occupe tout l'écran
  if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/chat`)) {
    return null;
  }

  return (
    <footer className="border-t border-wa-border bg-wa-dark-green text-white pt-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 pb-8 md:grid-cols-12">
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-3">
              <span
                role="img"
                aria-label={headerDict.logoAlt}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-wa-header text-white ring-1 ring-white/25"
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
                    strokeWidth="2"
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
              <span className="wa-text-title text-white">
                {footerDict.brandName}
              </span>
            </div>
            <p className="text-wa-preview text-white/80 max-w-sm">
              {footerDict.brandDescription}
            </p>
          </div>

          <div className="md:col-span-3 space-y-2.5">
            <h3 className="text-wa-meta font-semibold uppercase tracking-wider text-white/60">
              {footerDict.navigationTitle}
            </h3>
            <ul className="space-y-2 text-wa-preview text-white/90">
              <li>
                <Link
                  href={`/${locale}/chat`}
                  className="transition-colors duration-fast hover:text-wa-accent"
                >
                  {navDict.chat}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/catalog`}
                  className="transition-colors duration-fast hover:text-wa-accent"
                >
                  {navDict.catalog}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/orders`}
                  className="transition-colors duration-fast hover:text-wa-accent"
                >
                  {navDict.orders}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/profile`}
                  className="transition-colors duration-fast hover:text-wa-accent"
                >
                  {navDict.profile}
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-2.5">
            <h3 className="text-wa-meta font-semibold uppercase tracking-wider text-white/60">
              {footerDict.contactTitle}
            </h3>
            <ul className="space-y-2 text-wa-preview text-white/85">
              <li className="flex items-start gap-2.5">
                <span aria-hidden="true">📞</span>
                <span>{footerDict.phone}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span aria-hidden="true">✉️</span>
                <span>{footerDict.email}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span aria-hidden="true">📍</span>
                <span>{footerDict.address}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Barre inférieure : Copyright + Sélecteur de langue */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/15 py-5 sm:flex-row">
          <p className="text-wa-meta text-white/70">{footerDict.copyright}</p>

          <nav
            aria-label={footerDict.languageTitle}
            className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/5 p-1"
          >
            {SUPPORTED_LOCALES.map((loc) => {
              const isActive = loc === locale;
              return (
                <Link
                  key={loc}
                  href={`/${loc}/chat`}
                  aria-current={isActive ? 'page' : undefined}
                  className={`rounded-full px-3.5 py-1.5 text-wa-meta font-semibold transition-colors duration-fast ${
                    isActive
                      ? 'bg-wa-accent text-white'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  {headerDict.languageSwitcher[loc]}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </footer>
  );
}
