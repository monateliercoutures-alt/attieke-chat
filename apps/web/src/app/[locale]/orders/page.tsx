import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { Locale } from '@attieke-chat/shared';
import {
  getCommonDictionary,
  getOrdersDictionary,
  isValidLocale,
} from '@/lib/i18n';
import { OrdersView } from '@/components/orders/OrdersView';

interface OrdersPageProps {
  params: {
    locale: string;
  };
}

export function generateMetadata({ params }: OrdersPageProps): Metadata {
  const locale: Locale = isValidLocale(params.locale) ? params.locale : 'zh';
  const dict = getOrdersDictionary(locale);
  return {
    title: dict.meta.title,
  };
}

export default function OrdersPage({
  params,
}: OrdersPageProps): React.JSX.Element {
  if (!isValidLocale(params.locale)) {
    notFound();
  }

  const locale: Locale = params.locale;
  const ordersDict = getOrdersDictionary(locale);
  const commonDict = getCommonDictionary(locale);

  return (
    <OrdersView
      locale={locale}
      dict={ordersDict}
      statusDict={commonDict.orderStatus}
    />
  );
}
