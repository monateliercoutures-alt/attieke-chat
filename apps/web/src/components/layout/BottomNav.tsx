'use client';

import React, { useEffect } from 'react';
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

  const items: ReadonlyArray<{
    key: 'home' | 'chat' | 'orders' | 'profile';
    href: string;
    label: string;
    badgeCount?: number;
    isActive: boolean;
  }> = [
    {
      key: 'home',
      href: `/${locale}`,
      label: dict.home,
      isActive: pathname === `/${locale}`,
    },
    {
      key: 'chat',
      href: `/${locale}/chat`,
      label: dict.chat,
      badgeCount: unreadChatCount,
      isActive: pathname.startsWith(`/${locale}/chat`),
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
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-brand-ink/10 bg-brand-cream-card/95 backdrop-blur-md md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-4 px-2 py-1.5">
        {items.map((item) => (
          <li key={item.key}>
            <Link
              href={item.href}
              aria-current={item.isActive ? 'page' : undefined}
              className={`relative flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-2xl px-1 py-1 text-xs font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green ${
                item.isActive
                  ? 'text-brand-green'
                  : 'text-brand-ink-muted hover:text-brand-ink'
              }`}
            >
              <span
                className={`relative flex h-7 w-12 items-center justify-center rounded-full transition-colors ${
                  item.isActive ? 'bg-brand-green-soft text-brand-green' : ''
                }`}
              >
                {item.key === 'home' && (
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
                      d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5.5v-6h-5v6H4a1 1 0 0 1-1-1v-9.5z"
                    />
                  </svg>
                )}

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
                      d="M12 3C6.48 3 2 6.92 2 11.75c0 2.18.91 4.17 2.41 5.7L3.2 21l4.65-1.25c1.3.42 2.7.65 4.15.65 5.52 0 10-3.92 10-8.65S17.52 3 12 3z"
                    />
                  </svg>
                )}

                {item.key === 'orders' && (
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
                      d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9 2 2 4-4"
                    />
                  </svg>
                )}

                {item.key === 'profile' && (
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
                      d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z"
                    />
                  </svg>
                )}

                {typeof item.badgeCount === 'number' && item.badgeCount > 0 && (
                  <span className="absolute -right-0.5 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-gold px-1 text-[10px] font-extrabold text-brand-ink shadow-sm">
                    {item.badgeCount}
                  </span>
                )}
              </span>

              <span className="truncate max-w-[76px]">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
