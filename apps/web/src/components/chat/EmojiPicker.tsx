'use client';

import React, { useEffect, useState } from 'react';
import type { ChatDictionary } from '@/lib/i18n';

export interface EmojiPickerProps {
  dict: ChatDictionary['emojiPicker'];
  onSelectEmoji: (emoji: string) => void;
  onSendSticker?: (stickerText: string) => void;
  onClose: () => void;
}

type EmojiTab = 'recent' | 'smileys' | 'food' | 'gestures' | 'stickers';

const RECENT_STORAGE_KEY = 'attieke_chat_recent_emojis_v1';

const SMILEY_EMOJIS: readonly string[] = [
  '😊', '😄', '😁', '😍', '🥰', '😋', '🤩', '😎',
  '🤗', '🥳', '😂', '🤣', '😉', '😌', '😮', '🤔',
  '🥺', '😢', '😭', '😤', '😴', '🫡', '🤓', '😇',
] as const;

const FOOD_CI_EMOJIS: readonly string[] = [
  '🥣', '🐟', '🍗', '🌶️', '🍌', '🍅', '🧅', '🍋',
  '🥑', '🍚', '🥘', '🍲', '🍤', '🥜', '🥥', '🍍',
  '🇨🇮', '🇨🇳', '✈️', '📦', '❄️', '🛵', '🔥', '✨',
] as const;

const GESTURE_EMOJIS: readonly string[] = [
  '👍', '❤️', '🙏', '👏', '🙌', '👌', '🤝', '💪',
  '🎉', '🎊', '💯', '⭐', '🌟', '💎', '✅', '🚀',
  '👋', '✌️', '🤞', '🫶', '🧡', '💚', '💛', '💬',
] as const;

export function EmojiPicker({
  dict,
  onSelectEmoji,
  onSendSticker,
  onClose,
}: EmojiPickerProps): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<EmojiTab>('smileys');
  const [recentEmojis, setRecentEmojis] = useState<string[]>([
    '❤️', '👍', '😋', '🔥', '🙏', '🇨🇮', '🥣', '🐟',
  ]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      const raw = window.localStorage.getItem(RECENT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as string[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecentEmojis(parsed);
        }
      }
    } catch {
      // Ignore storage error
    }
  }, []);

  const handlePick = (emoji: string): void => {
    const nextRecents = [
      emoji,
      ...recentEmojis.filter((e) => e !== emoji),
    ].slice(0, 16);
    setRecentEmojis(nextRecents);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(
          RECENT_STORAGE_KEY,
          JSON.stringify(nextRecents)
        );
      } catch {
        // Ignore storage error
      }
    }
    onSelectEmoji(emoji);
  };

  const stickers: ReadonlyArray<{ id: string; text: string; bg: string }> = [
    {
      id: 'st-1',
      text: dict.sticker1,
      bg: 'bg-brand-green text-white border-brand-gold',
    },
    {
      id: 'st-2',
      text: dict.sticker2,
      bg: 'bg-brand-gold text-brand-ink border-brand-ink',
    },
    {
      id: 'st-3',
      text: dict.sticker3,
      bg: 'bg-brand-green-soft text-brand-green border-brand-green/30',
    },
    {
      id: 'st-4',
      text: dict.sticker4,
      bg: 'bg-sky-100 text-sky-900 border-sky-300',
    },
    {
      id: 'st-5',
      text: dict.sticker5,
      bg: 'bg-red-100 text-red-900 border-red-300',
    },
    {
      id: 'st-6',
      text: dict.sticker6,
      bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    },
  ];

  const currentList =
    activeTab === 'recent'
      ? recentEmojis
      : activeTab === 'smileys'
      ? SMILEY_EMOJIS
      : activeTab === 'food'
      ? FOOD_CI_EMOJIS
      : GESTURE_EMOJIS;

  return (
    <div className="w-72 sm:w-80 overflow-hidden rounded-3xl border border-brand-ink/15 bg-white shadow-card">
      {/* En-tête + Onglets */}
      <div className="flex items-center justify-between border-b border-brand-ink/10 bg-brand-cream px-3.5 py-2">
        <span className="text-xs font-extrabold text-brand-ink">
          {dict.title}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 text-xs font-bold text-brand-ink-muted hover:text-brand-ink"
        >
          ✕
        </button>
      </div>

      {/* Onglets de catégories */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-brand-ink/10 bg-white px-2 py-1.5">
        {(
          [
            { key: 'recent', label: `🕒 ${dict.tabRecent}` },
            { key: 'smileys', label: `😊 ${dict.tabSmileys}` },
            { key: 'food', label: `🥣 ${dict.tabFood}` },
            { key: 'gestures', label: `👍 ${dict.tabGestures}` },
            { key: 'stickers', label: `✨ ${dict.tabStickers}` },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold transition-colors ${
              activeTab === tab.key
                ? 'bg-brand-green text-white'
                : 'text-brand-ink-muted hover:bg-brand-cream hover:text-brand-ink'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grille d'emojis ou de stickers */}
      <div className="max-h-52 overflow-y-auto p-3">
        {activeTab === 'stickers' ? (
          <div className="grid grid-cols-2 gap-2">
            {stickers.map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => {
                  if (onSendSticker) {
                    onSendSticker(st.text);
                  } else {
                    handlePick(st.text);
                  }
                  onClose();
                }}
                className={`rounded-2xl border px-3 py-2.5 text-center text-xs font-extrabold shadow-xs transition-transform hover:scale-105 ${st.bg}`}
              >
                {st.text}
              </button>
            ))}
          </div>
        ) : currentList.length === 0 ? (
          <p className="py-6 text-center text-xs text-brand-ink-muted">
            {dict.noRecent}
          </p>
        ) : (
          <div className="grid grid-cols-8 gap-1">
            {currentList.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handlePick(emoji)}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-lg transition-transform hover:scale-125 hover:bg-brand-cream"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
