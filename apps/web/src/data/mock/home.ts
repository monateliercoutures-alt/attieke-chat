import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  type DeliveryStepMock,
  type FaqItemMock,
  type Locale,
  type ProductMock,
  type TestimonialMock,
} from '@attieke-chat/shared';

import zhHome from '@/locales/zh/home.json';
import frHome from '@/locales/fr/home.json';
import enHome from '@/locales/en/home.json';

export type HomeDictionary = typeof zhHome;

const DICTIONARIES: Record<Locale, HomeDictionary> = {
  zh: zhHome,
  fr: frHome,
  en: enHome,
};

export function isValidLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function resolveLocale(value: string | undefined): Locale {
  if (value && isValidLocale(value)) {
    return value;
  }
  return DEFAULT_LOCALE;
}

export function getHomeDictionary(locale: Locale): HomeDictionary {
  return DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE];
}

export const MOCK_PRODUCTS: readonly ProductMock[] = [
  {
    id: 'prod-attieke-solo',
    slug: 'attieke-1kg',
    weightKg: 1,
    priceYuan: 28,
    currency: 'CNY',
    imageSrc: '/images/products/attieke-solo.jpg',
    featured: false,
    translationKey: 'attiekeSolo',
  },
  {
    id: 'prod-attieke-tilapia',
    slug: 'tilapia-attieke-1kg',
    weightKg: 1,
    priceYuan: 42,
    currency: 'CNY',
    imageSrc: '/images/products/attieke-tilapia.jpg',
    featured: true,
    translationKey: 'attiekeTilapia',
  },
  {
    id: 'prod-attieke-kedjenou',
    slug: 'kedjenou-attieke-1kg',
    weightKg: 1,
    priceYuan: 36,
    currency: 'CNY',
    imageSrc: '/images/products/attieke-kedjenou.jpg',
    featured: false,
    translationKey: 'attiekeKedjenou',
  },
] as const;

export const MOCK_DELIVERY_STEPS: readonly DeliveryStepMock[] = [
  {
    id: 'step-abidjan',
    stepNumber: 1,
    icon: 'origin',
    status: 'completed',
    translationKey: 'abidjan',
  },
  {
    id: 'step-departure',
    stepNumber: 2,
    icon: 'departure',
    status: 'completed',
    translationKey: 'departure',
  },
  {
    id: 'step-air-freight',
    stepNumber: 3,
    icon: 'airFreight',
    status: 'completed',
    translationKey: 'airFreight',
  },
  {
    id: 'step-customs',
    stepNumber: 4,
    icon: 'customs',
    status: 'active',
    translationKey: 'customs',
  },
  {
    id: 'step-china-delivery',
    stepNumber: 5,
    icon: 'delivered',
    status: 'upcoming',
    translationKey: 'chinaDelivery',
  },
] as const;

export const MOCK_TESTIMONIALS: readonly TestimonialMock[] = [
  {
    id: 'testi-1',
    rating: 5,
    avatarInitials: 'AK',
    translationKey: 'review1',
  },
  {
    id: 'testi-2',
    rating: 5,
    avatarInitials: 'KM',
    translationKey: 'review2',
  },
  {
    id: 'testi-3',
    rating: 5,
    avatarInitials: 'FB',
    translationKey: 'review3',
  },
] as const;

export const MOCK_FAQ_ITEMS: readonly FaqItemMock[] = [
  {
    id: 'faq-shipping-time',
    translationKey: 'shippingTime',
  },
  {
    id: 'faq-storage',
    translationKey: 'storage',
  },
  {
    id: 'faq-payment-methods',
    translationKey: 'paymentMethods',
  },
  {
    id: 'faq-delivery-zones',
    translationKey: 'deliveryZones',
  },
  {
    id: 'faq-order-tracking',
    translationKey: 'orderTracking',
  },
] as const;
