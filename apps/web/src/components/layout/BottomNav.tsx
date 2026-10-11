'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Locale } from '@attieke-chat/shared';
import type { CommonDictionary } from '@/lib/i18n';
import { useAppStore } from '@/store/useAppStore';

interface BottomNavProps {
  locale: Locale;
  dict: CommonDictionary['nav'];
}

export function BottomNav({ locale, dict }: BottomNavProps): React.JSX.Element {
  const pathname = usePathname();
  const unreadChatCount = useAppStore((s) => s.unreadChatCount);
  const activeOrdersCount = useAppStore((s) => s.activeOrdersCount);
  const isHydrated = useAppStore((s) => s.isHydrated);
  const hydrateSession = useAppStore((s) => s.hydrateSession);

  useEffect(() => {
    if (!isHydrated) {
      void hydrateSession();
    }
  }, [isHydrated, hydrateSession]);

  // 4 onglets style mobile Android / iOS : Discussions (Chat), Catalogue, Commandes, Profil
  const items: ReadonlyArray<{
    key: 'chat' | 'catalog' | 'orders' | 'profile';
    href: string;
    label: string;
    badgeCount?: number;
    isActive: boolean;
  }> = [
    {
      key: 'chat',
      href: `/${locale}/chat`,
      label: dict.chat,
      badgeCount: unreadChatCount,
      isActive:
        pathname === `/${locale}` || pathname.startsWith(`/${locale}/chat`),
    },
    {
      key: 'catalog',
      href: `/${locale}/catalog`,
      label: dict.catalog,
      isActive: pathname.startsWith(`/${locale}/catalog`),
    },
    {
      key: 'orders',
      href: `/${locale}/orders`,
      label: dict.orders,
      badgeCount: activeOrdersCount,
      isActive: pathname.startsWith(`/${locale}/orders`),
    },
    {
      key: 'profile',
      href: `/${locale}/profile`,
      label: dict.profile,
      isActive:
        pathname.startsWith(`/${locale}/profile`) ||
        pathname.startsWith(`/${locale}/auth`),
    },
  ];

  return (
    <nav
      aria-label={dict.bottomNavAriaLabel}
      className="wa-mobile-hide-in-thread fixed bottom-0 left-0 right-0 z-40 border-t border-wa-border bg-wa-panel md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-4 px-2 py-1.5">
        {items.map((item) => (
          <li key={item.key}>
            <Link
              href={item.href}
              aria-current={item.isActive ? 'page' : undefined}
              onClick={() => {
                if (item.key === 'chat' && typeof window !== 'undefined') {
                  window.dispatchEvent(
                    new CustomEvent('attieke:show-conversation-list')
                  );
                }
              }}
              className={`relative flex min-h-[54px] flex-col items-center justify-center gap-1 rounded-xl px-1 py-1 text-wa-meta transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-wa-accent ${
                item.isActive
                  ? 'font-bold text-wa-text-primary'
                  : 'font-medium text-wa-text-secondary hover:text-wa-text-primary'
              }`}
            >
              {/* Capsule active arrondie autour de l'icône (exactement comme sur la capture Android/iOS) */}
              <span
                className={`relative flex h-8 w-16 items-center justify-center rounded-full transition-colors duration-fast ${
                  item.isActive
                    ? 'bg-wa-nav-pill text-wa-accent'
                    : 'text-wa-text-primary'
                }`}
              >
                {item.key === 'chat' && (
                  <svg
                    viewBox="0 0 24 24"
                    fill={item.isActive ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2Z"
                    />
                    <path
                      strokeLinecap="round"
                      stroke={item.isActive ? '#0B141A' : 'currentColor'}
                      strokeWidth="2"
                      d="M8 9h8M8 13h5"
                    />
                  </svg>
                )}

                {item.key === 'catalog' && (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"
                    />
                    <path strokeLinecap="round" d="M3 6h18" />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 10a4 4 0 0 1-8 0"
                    />
                  </svg>
                )}

                {item.key === 'orders' && (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9 2 2 4-4"
                    />
                  </svg>
                )}

                {item.key === 'profile' && (
                  <span
                    className={`relative h-6 w-6 overflow-hidden rounded-full ${
                      item.isActive
                        ? 'ring-2 ring-wa-accent'
                        : 'ring-1 ring-wa-border'
                    }`}
                  >
                    <Image
                      src="/images/avatars/vendor.jpg"
                      alt={item.label}
                      fill
                      sizes="24px"
                      className="object-cover"
                    />
                  </span>
                )}

                {/* Badge vert vif (#25D366) en haut à droite de la capsule (comme le badge 99+ sur la capture) */}
                {typeof item.badgeCount === 'number' && item.badgeCount > 0 && (
                  <span className="absolute -right-0.5 -top-1 flex h-4 min-w-[18px] items-center justify-center rounded-full bg-wa-accent px-1.5 text-wa-meta font-bold text-wa-commerce-text">
                    {item.badgeCount}
                  </span>
                )}
              </span>

              <span className="truncate max-w-[78px]">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
