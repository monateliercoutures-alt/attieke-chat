'use client';

import React, { useState } from 'react';
import type {
  ChatFontSize,
  ChatPreferences,
  ChatThemeMode,
  ChatWallpaper,
} from '@attieke-chat/shared';
import type { ChatDictionary } from '@/lib/i18n';

export interface ChatSettingsModalProps {
  preferences: ChatPreferences;
  dict: ChatDictionary['settings'];
  onUpdatePreferences: (partial: Partial<ChatPreferences>) => void;
  onClose: () => void;
}

const WALLPAPER_SWATCHES: ReadonlyArray<{
  key: ChatWallpaper;
  previewClass: string;
}> = [
  { key: 'ivory_pattern', previewClass: 'bg-wa-chat-bg' },
  { key: 'emerald_mist', previewClass: 'bg-wa-bubble-out' },
  { key: 'warm_sand', previewClass: 'bg-wa-system-bg' },
  { key: 'night_forest', previewClass: 'bg-wa-dark-green text-white' },
  { key: 'plain_cream', previewClass: 'bg-wa-composer' },
];

export function ChatSettingsModal({
  preferences,
  dict,
  onUpdatePreferences,
  onClose,
}: ChatSettingsModalProps): React.JSX.Element {
  const [notifStatus, setNotifStatus] = useState<
    'idle' | 'granted' | 'unsupported'
  >(preferences.notificationsEnabled ? 'granted' : 'idle');

  const handleRequestNotifications = async (): Promise<void> => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const res = await window.Notification.requestPermission();
        if (res === 'granted') {
          setNotifStatus('granted');
          onUpdatePreferences({ notificationsEnabled: true });
          return;
        }
      } catch {
        // Fallback for sandboxed iframe
      }
    }
    setNotifStatus('unsupported');
    onUpdatePreferences({ notificationsEnabled: true });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={dict.title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-wa-border bg-wa-panel p-6 text-wa-text-primary shadow-wa-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-wa-border pb-3">
          <h3 className="text-wa-title text-wa-text-primary">{dict.title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-wa-text-secondary hover:text-wa-text-primary"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-5">
          {/* 1. Thème Clair / Sombre */}
          <div>
            <p className="text-wa-preview font-semibold text-wa-text-primary">
              {dict.themeLabel}
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(['light', 'dark'] as const).map((mode: ChatThemeMode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onUpdatePreferences({ theme: mode })}
                  className={`min-h-[44px] rounded-wa-bubble border py-2 text-wa-preview font-semibold transition-colors duration-fast ${
                    preferences.theme === mode
                      ? 'border-wa-accent bg-wa-accent text-white'
                      : 'border-wa-border bg-wa-composer text-wa-text-primary hover:border-wa-accent'
                  }`}
                >
                  {mode === 'light' ? dict.themeLight : dict.themeDark}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Fond de conversation personnalisable */}
          <div>
            <p className="text-wa-preview font-semibold text-wa-text-primary">
              {dict.wallpaperLabel}
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {WALLPAPER_SWATCHES.map((swatch) => (
                <button
                  key={swatch.key}
                  type="button"
                  onClick={() =>
                    onUpdatePreferences({ wallpaper: swatch.key })
                  }
                  className={`flex min-h-[44px] items-center gap-2 rounded-wa-bubble border p-2 text-left text-wa-meta font-medium transition-all duration-fast ${
                    preferences.wallpaper === swatch.key
                      ? 'border-wa-accent ring-2 ring-wa-accent'
                      : 'border-wa-border hover:border-wa-accent/50'
                  }`}
                >
                  <span
                    className={`h-6 w-6 shrink-0 rounded-full border border-wa-border ${swatch.previewClass}`}
                  />
                  <span className="truncate text-wa-text-primary">
                    {dict.wallpapers[swatch.key]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Taille du texte réglable */}
          <div>
            <p className="text-wa-preview font-semibold text-wa-text-primary">
              {dict.fontSizeLabel}
            </p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(['small', 'medium', 'large'] as const).map(
                (sz: ChatFontSize) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => onUpdatePreferences({ fontSize: sz })}
                    className={`min-h-[44px] rounded-wa-bubble border py-2 text-wa-preview font-semibold transition-colors duration-fast ${
                      preferences.fontSize === sz
                        ? 'border-wa-accent bg-wa-accent text-white'
                        : 'border-wa-border bg-wa-composer text-wa-text-primary'
                    }`}
                  >
                    {dict.fontSizes[sz]}
                  </button>
                )
              )}
            </div>
          </div>

          {/* 4. Son et Notifications du navigateur */}
          <div className="space-y-3 border-t border-wa-border pt-4">
            <label className="flex cursor-pointer items-center justify-between text-wa-preview font-medium text-wa-text-primary">
              <span>🔔 {dict.soundLabel}</span>
              <input
                type="checkbox"
                checked={preferences.soundEnabled}
                onChange={(e) =>
                  onUpdatePreferences({ soundEnabled: e.target.checked })
                }
                className="h-4 w-4 rounded border-wa-border text-wa-accent focus:ring-wa-accent"
              />
            </label>

            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="text-wa-preview font-medium text-wa-text-primary">
                🖥️ {dict.notificationsLabel}
              </span>
              {notifStatus === 'granted' ? (
                <span className="rounded-full bg-wa-accent/15 px-3 py-1 text-wa-meta font-semibold text-wa-dark-green dark:text-wa-accent">
                  {dict.notificationGranted}
                </span>
              ) : notifStatus === 'unsupported' ? (
                <span className="rounded-full bg-wa-composer px-3 py-1 text-wa-meta text-wa-text-secondary">
                  {dict.notificationUnsupported}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => void handleRequestNotifications()}
                  className="min-h-[38px] rounded-full bg-wa-accent px-3.5 py-1.5 text-wa-meta font-semibold text-white hover:opacity-95"
                >
                  {dict.requestNotificationButton}
                </button>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 min-h-[44px] w-full rounded-full bg-wa-header py-2.5 text-wa-preview font-semibold text-white transition-opacity duration-fast hover:opacity-95"
        >
          {dict.closeButton}
        </button>
      </div>
    </div>
  );
}
