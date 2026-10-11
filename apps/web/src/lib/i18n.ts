import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  type Locale,
} from '@attieke-chat/shared';
import zhCommon from '@/locales/zh/common.json';
import frCommon from '@/locales/fr/common.json';
import enCommon from '@/locales/en/common.json';
import zhChat from '@/locales/zh/chat.json';
import frChat from '@/locales/fr/chat.json';
import enChat from '@/locales/en/chat.json';
import zhCatalog from '@/locales/zh/catalog.json';
import frCatalog from '@/locales/fr/catalog.json';
import enCatalog from '@/locales/en/catalog.json';
import zhOrders from '@/locales/zh/orders.json';
import frOrders from '@/locales/fr/orders.json';
import enOrders from '@/locales/en/orders.json';
import zhProfile from '@/locales/zh/profile.json';
import frProfile from '@/locales/fr/profile.json';
import enProfile from '@/locales/en/profile.json';

export type CommonDictionary = typeof zhCommon;
export type ChatDictionary = typeof zhChat;
export type CatalogDictionary = typeof zhCatalog;
export type OrdersDictionary = typeof zhOrders;
export type ProfileDictionary = typeof zhProfile;

const COMMON_DICTIONARIES: Record<Locale, CommonDictionary> = {
  zh: zhCommon,
  fr: frCommon,
  en: enCommon,
};

const CHAT_DICTIONARIES: Record<Locale, ChatDictionary> = {
  zh: zhChat,
  fr: frChat,
  en: enChat,
};

const CATALOG_DICTIONARIES: Record<Locale, CatalogDictionary> = {
  zh: zhCatalog,
  fr: frCatalog,
  en: enCatalog,
};

const ORDERS_DICTIONARIES: Record<Locale, OrdersDictionary> = {
  zh: zhOrders,
  fr: frOrders,
  en: enOrders,
};

const PROFILE_DICTIONARIES: Record<Locale, ProfileDictionary> = {
  zh: zhProfile,
  fr: frProfile,
  en: enProfile,
};

export function isValidLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function getCommonDictionary(locale: Locale): CommonDictionary {
  return COMMON_DICTIONARIES[locale] ?? COMMON_DICTIONARIES[DEFAULT_LOCALE];
}

export function getChatDictionary(locale: Locale): ChatDictionary {
  return CHAT_DICTIONARIES[locale] ?? CHAT_DICTIONARIES[DEFAULT_LOCALE];
}

export function getCatalogDictionary(locale: Locale): CatalogDictionary {
  return CATALOG_DICTIONARIES[locale] ?? CATALOG_DICTIONARIES[DEFAULT_LOCALE];
}

export function getOrdersDictionary(locale: Locale): OrdersDictionary {
  return ORDERS_DICTIONARIES[locale] ?? ORDERS_DICTIONARIES[DEFAULT_LOCALE];
}

export function getProfileDictionary(locale: Locale): ProfileDictionary {
  return PROFILE_DICTIONARIES[locale] ?? PROFILE_DICTIONARIES[DEFAULT_LOCALE];
}

export function formatPriceYuan(amount: number, _locale?: Locale): string {
  return `¥ ${amount.toFixed(2)}`;
}

export function formatDateTime(isoString: string, locale: Locale): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return isoString;
  }

  const intlMap: Record<Locale, string> = {
    zh: 'zh-CN',
    fr: 'fr-FR',
    en: 'en-US',
  };

  return new Intl.DateTimeFormat(intlMap[locale], {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

export function formatTimeShort(isoString: string, locale: Locale): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const intlMap: Record<Locale, string> = {
    zh: 'zh-CN',
    fr: 'fr-FR',
    en: 'en-US',
  };

  return new Intl.DateTimeFormat(intlMap[locale], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

/**
 * Formate l'horodatage pour la liste des conversations façon WhatsApp :
 * - Si même jour que la date de référence (2026-10-11 ou aujourd'hui) -> HH:mm
 * - Si veille -> "Hier" / "昨天" / "Yesterday"
 * - Sinon -> JJ/MM/AAAA selon la langue
 */
export function formatConversationTimestamp(
  isoString: string,
  locale: Locale,
  labels: { today: string; yesterday: string }
): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const refNow = new Date('2026-10-11T12:00:00.000Z');
  const realNow = new Date();
  const effectiveNow =
    Math.abs(realNow.getTime() - date.getTime()) < 48 * 3600 * 1000
      ? realNow
      : refNow;

  const isSameDay =
    date.getUTCFullYear() === effectiveNow.getUTCFullYear() &&
    date.getUTCMonth() === effectiveNow.getUTCMonth() &&
    date.getUTCDate() === effectiveNow.getUTCDate();

  if (isSameDay) {
    return formatTimeShort(isoString, locale);
  }

  const yesterday = new Date(effectiveNow);
  yesterday.setUTCDate(effectiveNow.getUTCDate() - 1);
  const isYesterday =
    date.getUTCFullYear() === yesterday.getUTCFullYear() &&
    date.getUTCMonth() === yesterday.getUTCMonth() &&
    date.getUTCDate() === yesterday.getUTCDate();

  if (isYesterday) {
    return labels.yesterday;
  }

  const intlMap: Record<Locale, string> = {
    zh: 'zh-CN',
    fr: 'fr-FR',
    en: 'en-US',
  };

  return new Intl.DateTimeFormat(intlMap[locale], {
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/**
 * Formate les séparateurs de date du fil de discussion ("Aujourd'hui", "Hier", date complète).
 */
export function formatDateSeparator(
  isoString: string,
  locale: Locale,
  labels: { today: string; yesterday: string }
): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const refNow = new Date('2026-10-11T12:00:00.000Z');
  const realNow = new Date();
  const effectiveNow =
    Math.abs(realNow.getTime() - date.getTime()) < 48 * 3600 * 1000
      ? realNow
      : refNow;

  const isSameDay =
    date.getUTCFullYear() === effectiveNow.getUTCFullYear() &&
    date.getUTCMonth() === effectiveNow.getUTCMonth() &&
    date.getUTCDate() === effectiveNow.getUTCDate();

  if (isSameDay) {
    return labels.today;
  }

  const yesterday = new Date(effectiveNow);
  yesterday.setUTCDate(effectiveNow.getUTCDate() - 1);
  const isYesterday =
    date.getUTCFullYear() === yesterday.getUTCFullYear() &&
    date.getUTCMonth() === yesterday.getUTCMonth() &&
    date.getUTCDate() === yesterday.getUTCDate();

  if (isYesterday) {
    return labels.yesterday;
  }

  const intlMap: Record<Locale, string> = {
    zh: 'zh-CN',
    fr: 'fr-FR',
    en: 'en-US',
  };

  return new Intl.DateTimeFormat(intlMap[locale], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

