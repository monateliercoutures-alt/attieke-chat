'use client';

import React, { useCallback, useEffect } from 'react';
import {
  applyThemeToDocument,
  resolveInitialTheme,
  THEME_STORAGE_KEY,
  type ThemeMode,
} from '@/styles/theme';
import { useChatStore } from '@/store/useChatStore';
import { chatService } from '@/services';

export interface UseThemeResult {
  theme: ThemeMode;
  setTheme: (nextTheme: ThemeMode) => void;
  toggleTheme: () => void;
}

export function useTheme(): UseThemeResult {
  const theme = useChatStore((s) => s.preferences.theme);
  const setPreferencesSync = useChatStore((s) => s.setPreferencesSync);

  const setTheme = useCallback(
    (nextTheme: ThemeMode): void => {
      applyThemeToDocument(nextTheme, true);
      const currentPrefs = useChatStore.getState().preferences;
      setPreferencesSync({ ...currentPrefs, theme: nextTheme });
      void chatService.updatePreferences({ theme: nextTheme });
    },
    [setPreferencesSync]
  );

  const toggleTheme = useCallback((): void => {
    const next: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }, [theme, setTheme]);

  return {
    theme,
    setTheme,
    toggleTheme,
  };
}

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const theme = useChatStore((s) => s.preferences.theme);
  const setPreferencesSync = useChatStore((s) => s.setPreferencesSync);

  // Initialisation au montage : localStorage ou préférence système (prefers-color-scheme)
  useEffect(() => {
    const initialMode: ThemeMode = resolveInitialTheme();
    applyThemeToDocument(initialMode, false);

    const currentPrefs = useChatStore.getState().preferences;
    if (currentPrefs.theme !== initialMode) {
      setPreferencesSync({ ...currentPrefs, theme: initialMode });
      void chatService.updatePreferences({ theme: initialMode });
    }

    // Écoute du changement système si l'utilisateur n'a pas fixé de préférence manuelle
    if (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function'
    ) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent): void => {
        try {
          const hasStored = window.localStorage.getItem(THEME_STORAGE_KEY);
          if (!hasStored) {
            const sysMode: ThemeMode = e.matches ? 'dark' : 'light';
            applyThemeToDocument(sysMode, false);
            const latestPrefs = useChatStore.getState().preferences;
            setPreferencesSync({ ...latestPrefs, theme: sysMode });
          }
        } catch {
          // Ignore storage error
        }
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    return undefined;
  }, [setPreferencesSync]);

  // Synchronisation automatique dès que `preferences.theme` change dans le store
  useEffect(() => {
    applyThemeToDocument(theme, true);
  }, [theme]);

  return <>{children}</>;
}
