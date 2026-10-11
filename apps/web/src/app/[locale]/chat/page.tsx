import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { Locale } from '@attieke-chat/shared';
import {
  getChatDictionary,
  getCommonDictionary,
  isValidLocale,
} from '@/lib/i18n';
import { ChatWindow } from '@/components/chat/ChatWindow';

interface ChatPageProps {
  params: {
    locale: string;
  };
  searchParams?: {
    product?: string;
  };
}

export function generateMetadata({ params }: ChatPageProps): Metadata {
  const locale: Locale = isValidLocale(params.locale) ? params.locale : 'zh';
  const dict = getChatDictionary(locale);
  return {
    title: dict.header.vendorName,
  };
}

export default function ChatPage({
  params,
  searchParams,
}: ChatPageProps): React.JSX.Element {
  if (!isValidLocale(params.locale)) {
    notFound();
  }

  const locale: Locale = params.locale;
  const chatDict = getChatDictionary(locale);
  const commonDict = getCommonDictionary(locale);

  return (
    <section className="mx-auto max-w-7xl sm:px-4">
      <ChatWindow
        locale={locale}
        initialProductSlug={searchParams?.product}
        chatDict={chatDict}
        commonDict={commonDict}
      />
    </section>
  );
}
