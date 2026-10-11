'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { FaqItemMock, Locale } from '@attieke-chat/shared';
import type { HomeDictionary } from '@/data/mock/home';

interface FaqProps {
  locale: Locale;
  items: readonly FaqItemMock[];
  dict: HomeDictionary['faq'];
}

export function Faq({ locale, items, dict }: FaqProps): React.JSX.Element {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  const handleToggle = (id: string): void => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="scroll-mt-20 py-14 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <span className="inline-flex items-center rounded-full border border-brand-ink/15 bg-white px-3.5 py-1 text-xs font-extrabold text-brand-green">
              {dict.sectionBadge}
            </span>
            <h2
              id="faq-heading"
              className="mt-3 text-3xl font-extrabold tracking-tight text-brand-ink sm:text-4xl"
            >
              {dict.sectionTitle}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-brand-ink-muted sm:text-base">
              {dict.sectionSubtitle}
            </p>

            <div className="mt-6">
              <Link
                href={`/${locale}/chat`}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-full border border-brand-ink bg-brand-green-soft px-6 py-3 text-sm font-extrabold text-brand-ink transition-colors hover:bg-brand-gold"
              >
                <span aria-hidden="true">💬</span>
                <span>{dict.askInChatCta}</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-3.5">
            {items.map((item) => {
              const qa = dict.items[item.translationKey];
              const isOpen = openId === item.id;
              const buttonId = `faq-trigger-${item.id}`;
              const panelId = `faq-panel-${item.id}`;

              return (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-[1.5rem] border border-brand-ink/10 bg-brand-cream-card shadow-sm transition-colors"
                >
                  <h3>
                    <button
                      id={buttonId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => handleToggle(item.id)}
                      className="flex min-h-[60px] w-full items-center justify-between gap-4 px-5 py-4 text-left text-base font-bold text-brand-ink transition-colors hover:bg-brand-green-soft/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-green sm:px-6"
                    >
                      <span>{qa.question}</span>
                      <span
                        aria-hidden="true"
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors ${
                          isOpen
                            ? 'border-brand-ink bg-brand-gold text-brand-ink'
                            : 'border-brand-ink/15 bg-brand-cream text-brand-ink'
                        }`}
                      >
                        <svg
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className={`h-5 w-5 transition-transform duration-200 ${
                            isOpen ? 'rotate-45' : 'rotate-0'
                          }`}
                        >
                          <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5z" />
                        </svg>
                      </span>
                    </button>
                  </h3>

                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    hidden={!isOpen}
                    className="border-t border-brand-ink/10 bg-brand-cream/50 px-5 py-4 text-sm leading-relaxed text-brand-ink-muted sm:px-6"
                  >
                    <p>{qa.answer}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
