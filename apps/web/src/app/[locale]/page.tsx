import { notFound, redirect } from 'next/navigation';
import type { Locale } from '@attieke-chat/shared';
import { isValidLocale } from '@/lib/i18n';

interface RootLocalePageProps {
  params: {
    locale: string;
  };
}

export default function RootLocalePage({
  params,
}: RootLocalePageProps): never {
  if (!isValidLocale(params.locale)) {
    notFound();
  }

  const locale: Locale = params.locale;
  redirect(`/${locale}/chat`);
}
