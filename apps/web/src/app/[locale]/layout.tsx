import React from 'react';
import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { SUPPORTED_LOCALES, type Locale } from '@attieke-chat/shared';
import { getHomeDictionary } from '@/data/mock/home';
import { getCommonDictionary, isValidLocale } from '@/lib/i18n';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { FloatingChatButton } from '@/components/layout/FloatingChatButton';
import '@/app/globals.css';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}

export function generateStaticParams(): Array<{ locale: Locale }> {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0F4C3A',
};

export function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Metadata {
  const locale: Locale = isValidLocale(params.locale) ? params.locale : 'zh';
  const dict = getHomeDictionary(locale);

  const localeMap: Record<Locale, string> = {
    zh: 'zh_CN',
    fr: 'fr_CI',
    en: 'en_US',
  };

  return {
    metadataBase: new URL('https://attieke.cn'),
    title: dict.meta.title,
    description: dict.meta.description,
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'zh-CN': '/zh',
        fr: '/fr',
        en: '/en',
        'x-default': '/zh',
      },
    },
    openGraph: {
      title: dict.meta.ogTitle,
      description: dict.meta.ogDescription,
      url: `/${locale}`,
      siteName: dict.meta.siteName,
      locale: localeMap[locale],
      type: 'website',
      images: [
        {
          url: '/images/hero/hero-bowl.jpg',
          width: 840,
          height: 532,
          alt: dict.hero.bowlImageAlt,
        },
      ],
    },
  };
}

export default function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps): React.JSX.Element {
  if (!isValidLocale(params.locale)) {
    notFound();
  }

  const locale: Locale = params.locale;
  const homeDict = getHomeDictionary(locale);
  const commonDict = getCommonDictionary(locale);

  return (
    <html lang={locale}>
      <body className="min-h-screen flex flex-col bg-brand-cream text-brand-ink font-sans antialiased pb-16 md:pb-0 selection:bg-brand-gold selection:text-brand-ink">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:border-2 focus:border-brand-ink focus:bg-brand-gold focus:px-5 focus:py-2.5 focus:text-xs focus:font-extrabold focus:text-brand-ink focus:shadow-cta"
        >
          {commonDict.nav.skipToContent}
        </a>
        <Header
          locale={locale}
          dict={homeDict.header}
          navDict={commonDict.nav}
        />
        <main id="main-content" className="flex-1 focus:outline-none">
          {children}
        </main>
        <Footer
          locale={locale}
          footerDict={homeDict.footer}
          headerDict={homeDict.header}
        />
        <FloatingChatButton locale={locale} dict={homeDict.floatingChat} />
        <BottomNav locale={locale} dict={commonDict.nav} />
      </body>
    </html>
  );
}
