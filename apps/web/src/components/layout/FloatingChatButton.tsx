'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Locale } from '@attieke-chat/shared';
import type { HomeDictionary } from '@/data/mock/home';

interface FloatingChatButtonProps {
  locale: Locale;
  dict: HomeDictionary['floatingChat'];
}

export function FloatingChatButton({
  locale,
  dict,
}: FloatingChatButtonProps): React.JSX.Element | null {
  const pathname = usePathname();

  if (pathname.startsWith(`/${locale}/chat`)) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 z-40 md:bottom-6 sm:right-6">
      {/* Bouton de commerce : Jaune doré #F2B705 ("Commander par chat") */}
      <Link
        href={`/${locale}/chat`}
        aria-label={dict.ariaLabel}
        className="group flex min-h-[48px] items-center gap-2.5 rounded-full bg-wa-commerce px-5 py-3 text-wa-commerce-text shadow-wa-panel transition-transform duration-fast hover:-translate-y-0.5 hover:bg-wa-commerce-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-wa-accent"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-wa-accent opacity-80" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-wa-accent" />
        </span>

        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-5 w-5 text-wa-commerce-text"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
          />
        </svg>

        <span className="text-wa-preview font-semibold">{dict.label}</span>
      </Link>
    </div>
  );
}
