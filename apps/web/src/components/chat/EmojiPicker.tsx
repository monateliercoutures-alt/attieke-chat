'use client';

import React, { useEffect, useState } from 'react';
import type { ChatDictionary } from '@/lib/i18n';

export interface EmojiPickerProps {
  dict: ChatDictionary['emojiPicker'];
  onSelectEmoji: (emoji: string) => void;
  onBackspace?: () => void;
  onSendSticker?: (stickerText: string) => void;
  onClose: () => void;
}

type PickerMode = 'emojis' | 'gif' | 'stickers';

const RECENT_STORAGE_KEY = 'attieke_chat_recent_emojis_v1';

const DEFAULT_RECENT_EMOJIS: readonly string[] = [
  '😅', '😭', '💼', '🧏', '😏', '👨🏿‍💻', '🛜', '👉',
  '📚', '🖥️', '😊', '☺️', '🥰', '😎', '👩‍❤️‍👨', '🥲',
  '🙂', '🍀', '👫', '😔', '🤣', '👍', '🎤', '🪞',
  '❤️', '🙏', '🔥', '😋', '🇨🇮', '🇨🇳', '🥣', '🐟',
] as const;

const ALL_EMOJIS: readonly string[] = [
  '😅', '😭', '💼', '🧏', '😏', '👨🏿‍💻', '🛜', '👉',
  '📚', '🖥️', '😊', '☺️', '🥰', '😎', '👩‍❤️‍👨', '🥲',
  '🙂', '🍀', '👫', '😔', '🤣', '👍', '🎤', '🪞',
  '😄', '😁', '😍', '😋', '🤩', '🤗', '🥳', '😂',
  '😉', '😌', '😮', '🤔', '🥺', '😢', '😤', '😴',
  '❤️', '🙏', '👏', '🙌', '👌', '🤝', '💪', '🎉',
  '🎊', '💯', '⭐', '🌟', '💎', '✅', '🚀', '👋',
  '🥣', '🐟', '🍗', '🌶️', '🍌', '🍅', '🧅', '🍋',
  '🥑', '🍚', '🥘', '🍲', '🇨🇮', '🇨🇳', '✈️', '📦',
] as const;

const GIF_PRESETS: ReadonlyArray<{ id: string; label: string; emoji: string }> = [
  { id: 'gif-1', label: 'Attiéké chaud vapeur ! 🔥🥣', emoji: '🥣🔥' },
  { id: 'gif-2', label: 'Garba Thon croustillant 🐟✨', emoji: '🐟😋' },
  { id: 'gif-3', label: 'Colis SF Express en route ✈️📦', emoji: '✈️❄️' },
  { id: 'gif-4', label: 'Akwaba Abidjan ↔ Pékin 🇨🇮🤝🇨🇳', emoji: '🇨🇮🇨🇳' },
  { id: 'gif-5', label: 'Merci beaucoup ! 🙏❤️', emoji: '🙏❤️' },
  { id: 'gif-6', label: 'Top validé 100% 💯👍', emoji: '💯👍' },
];

export function EmojiPicker({
  dict,
  onSelectEmoji,
  onBackspace,
  onSendSticker,
  onClose,
}: EmojiPickerProps): React.JSX.Element {
  const [mode, setMode] = useState<PickerMode>('emojis');
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [recentEmojis, setRecentEmojis] = useState<string[]>([
    ...DEFAULT_RECENT_EMOJIS,
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
    ].slice(0, 32);
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

  const stickers: ReadonlyArray<{ id: string; text: string }> = [
    { id: 'st-1', text: dict.sticker1 },
    { id: 'st-2', text: dict.sticker2 },
    { id: 'st-3', text: dict.sticker3 },
    { id: 'st-4', text: dict.sticker4 },
    { id: 'st-5', text: dict.sticker5 },
    { id: 'st-6', text: dict.sticker6 },
  ];

  const displayedEmojis = searchQuery.trim()
    ? ALL_EMOJIS
    : recentEmojis.length >= 24
    ? recentEmojis
    : ALL_EMOJIS;

  return (
    <div className="w-full rounded-t-3xl border-t border-wa-border bg-wa-panel px-3 pb-4 pt-2.5 text-wa-text-primary shadow-wa-panel select-none">
      {/* Petite barre poignée grise centrée en haut (comme sur image-2.png) */}
      <div className="mb-3 flex justify-center">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="h-1.5 w-11 rounded-full bg-wa-text-secondary/50"
        />
      </div>

      {/* Barre supérieure : Loupe à gauche + Sélecteur 3 segments (Emoji | GIF | Sticker) au centre + Retour arrière ⌫ à droite */}
      <div className="flex items-center justify-between gap-2 px-1">
        {/* Icône Loupe à gauche */}
        <button
          type="button"
          onClick={() => setShowSearch((v) => !v)}
          aria-label="Rechercher"
          className="flex h-10 w-10 items-center justify-center rounded-full text-wa-text-primary hover:bg-wa-composer"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path strokeLinecap="round" d="m20 20-3.5-3.5" />
          </svg>
        </button>

        {/* Sélecteur segmenté en pilule bordée (Emoji | GIF | Sticker) comme sur image-2.png */}
        <div className="inline-flex h-10 w-56 items-center overflow-hidden rounded-full border border-wa-border bg-wa-panel sm:w-64">
          {/* Segment 1 : Emoji */}
          <button
            type="button"
            onClick={() => setMode('emojis')}
            aria-pressed={mode === 'emojis'}
            className={`flex h-full flex-1 items-center justify-center border-r border-wa-border transition-colors duration-fast ${
              mode === 'emojis'
                ? 'bg-wa-composer text-wa-text-primary'
                : 'text-wa-text-secondary hover:text-wa-text-primary'
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" />
              <path strokeLinecap="round" d="M8.5 14.5s1.5 2 3.5 2 3.5-2 3.5-2" />
              <circle cx="9" cy="9.5" r="1" fill="currentColor" />
              <circle cx="15" cy="9.5" r="1" fill="currentColor" />
            </svg>
          </button>

          {/* Segment 2 : GIF */}
          <button
            type="button"
            onClick={() => setMode('gif')}
            aria-pressed={mode === 'gif'}
            className={`flex h-full flex-1 items-center justify-center border-r border-wa-border text-wa-meta font-extrabold tracking-wider transition-colors duration-fast ${
              mode === 'gif'
                ? 'bg-wa-composer text-wa-text-primary'
                : 'text-wa-text-secondary hover:text-wa-text-primary'
            }`}
          >
            GIF
          </button>

          {/* Segment 3 : Sticker */}
          <button
            type="button"
            onClick={() => setMode('stickers')}
            aria-pressed={mode === 'stickers'}
            className={`flex h-full flex-1 items-center justify-center transition-colors duration-fast ${
              mode === 'stickers'
                ? 'bg-wa-composer text-wa-text-primary'
                : 'text-wa-text-secondary hover:text-wa-text-primary'
            }`}
          >
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
                d="M7 3h10a4 4 0 0 1 4 4v7l-6 6H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 20v-4a2 2 0 0 1 2-2h4"
              />
            </svg>
          </button>
        </div>

        {/* Bouton Retour arrière / Effacer (⌫) à droite */}
        <button
          type="button"
          onClick={() => {
            if (onBackspace) {
              onBackspace();
            }
          }}
          aria-label="Effacer"
          className="flex h-10 w-10 items-center justify-center rounded-full text-wa-text-primary hover:bg-wa-composer active:scale-95"
        >
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
              d="M21 5H9l-7 7 7 7h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m16 9-6 6m0-6 6 6"
            />
          </svg>
        </button>
      </div>

      {/* Champ de recherche d'emoji optionnel */}
      {showSearch && (
        <div className="mt-2.5 px-1">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={dict.title}
            className="min-h-[38px] w-full rounded-full bg-wa-composer px-4 py-1.5 text-wa-preview text-wa-text-primary placeholder:text-wa-text-secondary focus:outline-none focus:ring-2 focus:ring-wa-accent"
          />
        </div>
      )}

      {/* Contenu selon le mode sélectionné */}
      <div className="mt-3 max-h-60 overflow-y-auto px-1">
        {mode === 'emojis' && (
          <>
            <p className="mb-2.5 text-wa-contact font-semibold text-wa-text-secondary">
              {dict.tabRecent}
            </p>
            <div className="grid grid-cols-8 gap-y-2.5 text-center">
              {displayedEmojis.map((emoji, index) => (
                <button
                  key={`${emoji}-${index}`}
                  type="button"
                  onClick={() => handlePick(emoji)}
                  className="flex h-10 w-10 mx-auto items-center justify-center rounded-xl text-2xl transition-transform duration-fast hover:bg-wa-composer active:scale-125"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </>
        )}

        {mode === 'gif' && (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {GIF_PRESETS.map((gif) => (
              <button
                key={gif.id}
                type="button"
                onClick={() => {
                  if (onSendSticker) {
                    onSendSticker(`🎬 [GIF] ${gif.label}`);
                  } else {
                    handlePick(gif.emoji);
                  }
                  onClose();
                }}
                className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-wa-border bg-wa-composer p-3 text-center transition-transform duration-fast hover:border-wa-accent active:scale-95"
              >
                <span className="text-2xl">{gif.emoji}</span>
                <span className="text-wa-meta font-medium text-wa-text-primary">
                  {gif.label}
                </span>
              </button>
            ))}
          </div>
        )}

        {mode === 'stickers' && (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
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
                className="rounded-2xl border border-wa-border bg-wa-composer px-3 py-3 text-center text-wa-preview font-semibold text-wa-text-primary shadow-wa-bubble transition-transform duration-fast hover:border-wa-accent active:scale-95"
              >
                {st.text}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
