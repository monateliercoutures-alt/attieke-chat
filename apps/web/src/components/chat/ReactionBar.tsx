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
    <div className="inline-flex items-center gap-1 rounded-full border border-wa-border bg-wa-panel px-2.5 py-1 shadow-wa-panel">
      {QUICK_REACTION_EMOJIS.map((emoji) => {
        const isActive = selectedEmoji === emoji;
        return (
          <button
            key={emoji}
            type="button"
            onClick={() => onSelectEmoji(emoji)}
            className={`flex h-8 w-8 items-center justify-center rounded-full text-wa-contact transition-transform duration-fast hover:scale-125 focus:outline-none focus-visible:ring-2 focus-visible:ring-wa-accent ${
              isActive ? 'bg-wa-accent/20 ring-1 ring-wa-accent' : ''
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
          className="flex h-7 w-7 items-center justify-center rounded-full bg-wa-composer text-wa-meta font-semibold text-wa-text-secondary hover:text-wa-text-primary"
        >
          +
        </button>
      )}
    </div>
  );
}
