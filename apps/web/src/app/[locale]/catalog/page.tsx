import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { Locale } from '@attieke-chat/shared';
import { getCatalogDictionary, isValidLocale } from '@/lib/i18n';
import { CatalogView } from '@/components/catalog/CatalogView';

interface CatalogPageProps {
  params: {
    locale: string;
  };
}

export function generateMetadata({ params }: CatalogPageProps): Metadata {
  const locale: Locale = isValidLocale(params.locale) ? params.locale : 'zh';
  const dict = getCatalogDictionary(locale);
  return {
    title: dict.meta.title,
    description: dict.header.subtitle,
  };
}

export default function CatalogPage({
  params,
}: CatalogPageProps): React.JSX.Element {
  if (!isValidLocale(params.locale)) {
    notFound();
  }

  const locale: Locale = params.locale;
  const dict = getCatalogDictionary(locale);

  return <CatalogView locale={locale} dict={dict} />;
}
