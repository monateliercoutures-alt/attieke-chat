import React from 'react';
import Link from 'next/link';
import { SUPPORTED_LOCALES, type Locale } from '@attieke-chat/shared';
import type { HomeDictionary } from '@/data/mock/home';

interface FooterProps {
  locale: Locale;
  footerDict: HomeDictionary['footer'];
  headerDict: HomeDictionary['header'];
}

export function Footer({
  locale,
  footerDict,
  headerDict,
}: FooterProps): React.JSX.Element {
  return (
    <footer className="bg-brand-ink text-white pt-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Grande bannière d'appel à l'action style WhatsApp.com */}
        <div className="flex flex-col items-start justify-between gap-6 rounded-[2rem] bg-brand-green p-7 sm:flex-row sm:items-center sm:p-10 border border-white/10 shadow-card">
          <div className="max-w-xl space-y-2">
            <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              {footerDict.ctaBannerTitle}
            </h2>
            <p className="text-sm text-white/85 sm:text-base">
              {footerDict.ctaBannerSubtitle}
            </p>
          </div>

          <Link
            href={`/${locale}/chat`}
            className="inline-flex min-h-[52px] shrink-0 items-center gap-2.5 rounded-full border border-brand-ink bg-brand-gold px-7 py-3.5 text-sm font-extrabold text-brand-ink shadow-cta transition-transform hover:-translate-y-0.5 hover:bg-brand-gold-hover sm:text-base"
          >
            <span>{footerDict.ctaBannerButton}</span>
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

        {/* Colonnes Footer façon WhatsApp.com */}
        <div className="grid grid-cols-1 gap-10 py-14 md:grid-cols-12">
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <span
                role="img"
                aria-label={headerDict.logoAlt}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-green text-brand-gold ring-2 ring-brand-gold/40"
              >
                <svg
                  viewBox="0 0 40 40"
                  fill="none"
                  className="h-7 w-7"
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
              <span className="text-xl font-extrabold tracking-tight text-white">
                {footerDict.brandName}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-white/75 max-w-sm">
              {footerDict.brandDescription}
            </p>
            <p className="inline-flex items-center gap-2 text-sm font-bold text-brand-gold">
              <span>{footerDict.slogan}</span>
              <span aria-hidden="true">♡</span>
            </p>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/60">
              {footerDict.navigationTitle}
            </h3>
            <ul className="space-y-2.5 text-sm font-medium text-white/90">
              <li>
                <Link
                  href={`/${locale}#products`}
                  className="transition-colors hover:text-brand-gold"
                >
                  {headerDict.nav.products}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}#how-it-works`}
                  className="transition-colors hover:text-brand-gold"
                >
                  {headerDict.nav.howItWorks}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}#delivery`}
                  className="transition-colors hover:text-brand-gold"
                >
                  {headerDict.nav.delivery}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}#faq`}
                  className="transition-colors hover:text-brand-gold"
                >
                  {headerDict.nav.faq}
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/60">
              {footerDict.contactTitle}
            </h3>
            <ul className="space-y-2.5 text-sm text-white/85">
              <li className="flex items-start gap-2.5">
                <span className="text-brand-gold" aria-hidden="true">
                  📞
                </span>
                <span>{footerDict.phone}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-brand-gold" aria-hidden="true">
                  ✉️
                </span>
                <span>{footerDict.email}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-brand-gold" aria-hidden="true">
                  📍
                </span>
                <span>{footerDict.address}</span>
              </li>
              <li className="pt-1 text-xs text-white/65">
                {footerDict.hours}
              </li>
            </ul>
          </div>
        </div>

        {/* Barre inférieure WhatsApp.com : Copyright + Sélecteur de langue */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/15 py-7 sm:flex-row">
          <p className="text-xs text-white/70">{footerDict.copyright}</p>

          <nav
            aria-label={footerDict.languageTitle}
            className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/5 p-1"
          >
            {SUPPORTED_LOCALES.map((loc) => {
              const isActive = loc === locale;
              return (
                <Link
                  key={loc}
                  href={`/${loc}`}
                  aria-current={isActive ? 'page' : undefined}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
                    isActive
                      ? 'bg-brand-gold text-brand-ink'
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
