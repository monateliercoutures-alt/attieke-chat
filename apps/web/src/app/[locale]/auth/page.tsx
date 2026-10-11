import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { Locale } from '@attieke-chat/shared';
import { getProfileDictionary, isValidLocale } from '@/lib/i18n';
import { AuthView } from '@/components/auth/AuthView';

interface AuthPageProps {
  params: {
    locale: string;
  };
}

export function generateMetadata({ params }: AuthPageProps): Metadata {
  const locale: Locale = isValidLocale(params.locale) ? params.locale : 'zh';
  const dict = getProfileDictionary(locale);
  return {
    title: dict.meta.title,
  };
}

export default function AuthPage({ params }: AuthPageProps): React.JSX.Element {
  if (!isValidLocale(params.locale)) {
    notFound();
  }

  const locale: Locale = params.locale;
  const dict = getProfileDictionary(locale);

  return <AuthView locale={locale} dict={dict} />;
}
