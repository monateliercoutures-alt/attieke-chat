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

  // Masque le bouton flottant lorsque l'utilisateur est déjà dans l'écran Chat
  if (pathname.startsWith(`/${locale}/chat`)) {
    return null;
  }

  return (
    <div className="fixed bottom-20 right-4 z-40 md:bottom-6 sm:right-6">
      <Link
        href={`/${locale}/chat`}
        aria-label={dict.ariaLabel}
        className="group flex min-h-[52px] items-center gap-2.5 rounded-full border-2 border-brand-ink bg-[#25D366] px-5 py-3 text-brand-ink shadow-floating transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-gold focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-gold"
      >
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-80" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-brand-ink" />
        </span>

        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-5 w-5 text-brand-ink transition-transform group-hover:scale-110"
          aria-hidden="true"
        >
          <path d="M12 2C6.48 2 2 6.04 2 11.02c0 2.38 1.03 4.55 2.72 6.17L3.5 22l5.02-1.32c1.1.34 2.27.52 3.48.52 5.52 0 10-4.04 10-9.02S17.52 2 12 2zm-4 10.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm4 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm4 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z" />
        </svg>

        <span className="text-sm font-extrabold tracking-wide sm:text-base">
          {dict.label}
        </span>
      </Link>
    </div>
  );
}
