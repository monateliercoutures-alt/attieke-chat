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
    <div className="flex items-center gap-2 border-b border-wa-border bg-wa-panel px-3.5 py-2 shadow-wa-bubble">
      <div className="relative flex-1">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-wa-text-secondary"
        >
          <circle cx="11" cy="11" r="7" />
          <path strokeLinecap="round" d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="search"
          autoFocus
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={dict.placeholder}
          aria-label={dict.placeholder}
          className="min-h-[38px] w-full rounded-lg bg-wa-composer pl-9 pr-4 py-1 text-wa-preview text-wa-text-primary placeholder:text-wa-text-secondary focus:outline-none focus:ring-2 focus:ring-wa-accent"
        />
      </div>

      {/* Compteur de résultats */}
      {hasQuery && (
        <span className="shrink-0 text-wa-meta font-semibold text-wa-text-secondary">
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
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-wa-composer text-wa-meta font-semibold text-wa-text-primary hover:bg-wa-border disabled:opacity-40"
        >
          ↑
        </button>
        <button
          type="button"
          disabled={totalMatches === 0}
          onClick={onNextMatch}
          aria-label={dict.nextMatchAria}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-wa-composer text-wa-meta font-semibold text-wa-text-primary hover:bg-wa-border disabled:opacity-40"
        >
          ↓
        </button>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label={dict.closeSearchAria}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-wa-composer text-wa-meta font-semibold text-wa-text-secondary hover:text-wa-text-primary"
      >
        ✕
      </button>
    </div>
  );
}
