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
  { key: 'ivory_pattern', previewClass: 'bg-[#EFEAE2]' },
  { key: 'emerald_mist', previewClass: 'bg-[#D9F2E6]' },
  { key: 'warm_sand', previewClass: 'bg-[#F5E6CC]' },
  { key: 'night_forest', previewClass: 'bg-[#0B2920] text-white' },
  { key: 'plain_cream', previewClass: 'bg-[#FAF6EE]' },
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
        className="w-full max-w-md overflow-hidden rounded-3xl border border-brand-ink/15 bg-white p-6 shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-brand-ink/10 pb-3">
          <h3 className="text-base font-extrabold text-brand-ink">
            🎨 {dict.title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-xs font-bold text-brand-ink-muted hover:text-brand-ink"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-5">
          {/* 1. Thème Clair / Sombre */}
          <div>
            <p className="text-xs font-extrabold text-brand-ink">
              {dict.themeLabel}
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(['light', 'dark'] as const).map((mode: ChatThemeMode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onUpdatePreferences({ theme: mode })}
                  className={`rounded-2xl border py-2.5 text-xs font-extrabold transition-colors ${
                    preferences.theme === mode
                      ? 'border-brand-green bg-brand-green text-white'
                      : 'border-brand-ink/15 bg-brand-cream text-brand-ink hover:bg-brand-green-soft'
                  }`}
                >
                  {mode === 'light' ? dict.themeLight : dict.themeDark}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Fond de conversation personnalisable */}
          <div>
            <p className="text-xs font-extrabold text-brand-ink">
              {dict.wallpaperLabel}
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {WALLPAPER_SWATCHES.map((swatch) => (
                <button
                  key={swatch.key}
                  type="button"
                  onClick={() => onUpdatePreferences({ wallpaper: swatch.key })}
                  className={`flex items-center gap-2 rounded-2xl border p-2 text-left text-[11px] font-bold transition-all ${
                    preferences.wallpaper === swatch.key
                      ? 'border-brand-green ring-2 ring-brand-green'
                      : 'border-brand-ink/15 hover:border-brand-green/50'
                  }`}
                >
                  <span
                    className={`h-6 w-6 shrink-0 rounded-full border border-black/15 ${swatch.previewClass}`}
                  />
                  <span className="truncate text-brand-ink">
                    {dict.wallpapers[swatch.key]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Taille du texte réglable */}
          <div>
            <p className="text-xs font-extrabold text-brand-ink">
              {dict.fontSizeLabel}
            </p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(['small', 'medium', 'large'] as const).map(
                (sz: ChatFontSize) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => onUpdatePreferences({ fontSize: sz })}
                    className={`rounded-2xl border py-2 text-xs font-extrabold transition-colors ${
                      preferences.fontSize === sz
                        ? 'border-brand-green bg-brand-green text-white'
                        : 'border-brand-ink/15 bg-brand-cream text-brand-ink'
                    }`}
                  >
                    {dict.fontSizes[sz]}
                  </button>
                )
              )}
            </div>
          </div>

          {/* 4. Son et Notifications du navigateur */}
          <div className="space-y-2.5 border-t border-brand-ink/10 pt-4">
            <label className="flex cursor-pointer items-center justify-between text-xs font-extrabold text-brand-ink">
              <span>🔔 {dict.soundLabel}</span>
              <input
                type="checkbox"
                checked={preferences.soundEnabled}
                onChange={(e) =>
                  onUpdatePreferences({ soundEnabled: e.target.checked })
                }
                className="h-4 w-4 rounded border-brand-ink/30 text-brand-green focus:ring-brand-green"
              />
            </label>

            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="text-xs font-extrabold text-brand-ink">
                🖥️ {dict.notificationsLabel}
              </span>
              {notifStatus === 'granted' ? (
                <span className="rounded-full bg-brand-green-soft px-3 py-1 text-[11px] font-extrabold text-brand-green">
                  {dict.notificationGranted}
                </span>
              ) : notifStatus === 'unsupported' ? (
                <span className="rounded-full bg-brand-cream px-3 py-1 text-[11px] font-bold text-brand-ink-muted">
                  {dict.notificationUnsupported}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => void handleRequestNotifications()}
                  className="rounded-full border border-brand-ink bg-brand-gold px-3.5 py-1.5 text-[11px] font-extrabold text-brand-ink hover:bg-brand-gold-hover"
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
          className="mt-6 w-full rounded-full bg-brand-green py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-brand-green-dark"
        >
          {dict.closeButton}
        </button>
      </div>
    </div>
  );
}
