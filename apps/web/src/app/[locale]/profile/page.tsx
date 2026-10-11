import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { Locale } from '@attieke-chat/shared';
import { getProfileDictionary, isValidLocale } from '@/lib/i18n';
import { ProfileView } from '@/components/profile/ProfileView';

interface ProfilePageProps {
  params: {
    locale: string;
  };
}

export function generateMetadata({ params }: ProfilePageProps): Metadata {
  const locale: Locale = isValidLocale(params.locale) ? params.locale : 'zh';
  const dict = getProfileDictionary(locale);
  return {
    title: dict.meta.title,
  };
}

export default function ProfilePage({
  params,
}: ProfilePageProps): React.JSX.Element {
  if (!isValidLocale(params.locale)) {
    notFound();
  }

  const locale: Locale = params.locale;
  const dict = getProfileDictionary(locale);

  return <ProfileView locale={locale} dict={dict} />;
}
