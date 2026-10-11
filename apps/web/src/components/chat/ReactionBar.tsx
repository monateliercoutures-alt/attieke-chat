'use client';

import React from 'react';
import { QUICK_REACTION_EMOJIS } from '@attieke-chat/shared';

export interface ReactionBarProps {
  selectedEmoji?: string;
  onSelectEmoji: (emoji: string) => void;
  onOpenFullPicker?: () => void;
}

export function ReactionBar({
  selectedEmoji,
  onSelectEmoji,
  onOpenFullPicker,
}: ReactionBarProps): React.JSX.Element {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-brand-ink/15 bg-white px-2.5 py-1 shadow-card">
      {QUICK_REACTION_EMOJIS.map((emoji) => {
        const isActive = selectedEmoji === emoji;
        return (
          <button
            key={emoji}
            type="button"
            onClick={() => onSelectEmoji(emoji)}
            className={`flex h-8 w-8 items-center justify-center rounded-full text-base transition-transform hover:scale-125 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green ${
              isActive ? 'bg-brand-green-soft ring-1 ring-brand-green' : ''
            }`}
          >
            {emoji}
          </button>
        );
      })}

      {onOpenFullPicker && (
        <button
          type="button"
          onClick={onOpenFullPicker}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-cream text-xs font-extrabold text-brand-ink-muted hover:bg-brand-green-soft hover:text-brand-green"
        >
          +
        </button>
      )}
    </div>
  );
}
