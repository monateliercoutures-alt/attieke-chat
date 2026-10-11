'use client';

import React from 'react';
import type { ChatDictionary } from '@/lib/i18n';

export interface SearchBarProps {
  query: string;
  matchIds: string[];
  currentMatchIndex: number;
  dict: ChatDictionary['searchBar'];
  onQueryChange: (query: string) => void;
  onPrevMatch: () => void;
  onNextMatch: () => void;
  onClose: () => void;
}

export function SearchBar({
  query,
  matchIds,
  currentMatchIndex,
  dict,
  onQueryChange,
  onPrevMatch,
  onNextMatch,
  onClose,
}: SearchBarProps): React.JSX.Element {
  const hasQuery = query.trim().length > 0;
  const totalMatches = matchIds.length;

  return (
    <div className="flex items-center gap-2 border-b border-brand-ink/10 bg-white px-3.5 py-2 shadow-xs">
      <div className="relative flex-1">
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-ink-muted"
        >
          <path
            fillRule="evenodd"
            d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
            clipRule="evenodd"
          />
        </svg>
        <input
          type="search"
          autoFocus
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={dict.placeholder}
          aria-label={dict.placeholder}
          className="min-h-[36px] w-full rounded-full border border-brand-ink/15 bg-brand-cream pl-9 pr-4 py-1 text-xs font-medium text-brand-ink placeholder:text-brand-ink-muted focus:border-brand-green focus:bg-white focus:outline-none"
        />
      </div>

      {/* Compteur de résultats */}
      {hasQuery && (
        <span className="shrink-0 text-xs font-extrabold text-brand-ink-muted">
          {totalMatches === 0
            ? dict.noResults
            : `${currentMatchIndex + 1} / ${totalMatches}`}
        </span>
      )}

      {/* Navigation Haut / Bas */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={totalMatches === 0}
          onClick={onPrevMatch}
          aria-label={dict.prevMatchAria}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-brand-ink/15 bg-brand-cream text-xs font-extrabold text-brand-ink hover:bg-brand-green-soft disabled:opacity-40"
        >
          ↑
        </button>
        <button
          type="button"
          disabled={totalMatches === 0}
          onClick={onNextMatch}
          aria-label={dict.nextMatchAria}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-brand-ink/15 bg-brand-cream text-xs font-extrabold text-brand-ink hover:bg-brand-green-soft disabled:opacity-40"
        >
          ↓
        </button>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label={dict.closeSearchAria}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-cream text-xs font-bold text-brand-ink-muted hover:text-brand-ink"
      >
        ✕
      </button>
    </div>
  );
}
