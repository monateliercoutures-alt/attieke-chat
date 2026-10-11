import React from 'react';
import { notFound } from 'next/navigation';
import type { Locale } from '@attieke-chat/shared';
import {
  getHomeDictionary,
  isValidLocale,
  MOCK_DELIVERY_STEPS,
  MOCK_FAQ_ITEMS,
  MOCK_TESTIMONIALS,
} from '@/data/mock/home';
import { Hero } from '@/components/home/Hero';
import { HowItWorks } from '@/components/home/HowItWorks';
import { ProductsPreview } from '@/components/home/ProductsPreview';
import { DeliveryTimeline } from '@/components/home/DeliveryTimeline';
import { Testimonials } from '@/components/home/Testimonials';
import { Faq } from '@/components/home/Faq';

interface HomePageProps {
  params: {
    locale: string;
  };
}

export default function HomePage({ params }: HomePageProps): React.JSX.Element {
  if (!isValidLocale(params.locale)) {
    notFound();
  }

  const locale: Locale = params.locale;
  const dict = getHomeDictionary(locale);

  return (
    <>
      <Hero locale={locale} dict={dict.hero} />
      <HowItWorks dict={dict.howItWorks} />
      <ProductsPreview locale={locale} dict={dict.products} />
      <DeliveryTimeline
        steps={MOCK_DELIVERY_STEPS}
        dict={dict.delivery}
      />
      <Testimonials
        testimonials={MOCK_TESTIMONIALS}
        dict={dict.testimonials}
      />
      <Faq locale={locale} items={MOCK_FAQ_ITEMS} dict={dict.faq} />
    </>
  );
}
