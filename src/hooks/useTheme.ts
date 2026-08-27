import { useState, useEffect, useCallback } from 'react';
import { ThemeMode } from '../types';

const THEME_KEY = 'brainbits_theme';

export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY) as ThemeMode | null;
      if (stored && (stored === 'dark' || stored === 'light' || stored === 'system')) {
        return stored;
      }
    } catch (_) {}
    return 'dark'; // Default dark mode
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored === 'dark') return true;
      if (stored === 'light') return false;
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (_) {
      return true;
    }
  });

  useEffect(() => {
    const root = document.documentElement;

    const updateActualTheme = () => {
      let resolvedDark = true;
      if (theme === 'system') {
        resolvedDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      } else {
        resolvedDark = theme === 'dark';
      }

      setIsDark(resolvedDark);

      if (resolvedDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    updateActualTheme();
    localStorage.setItem(THEME_KEY, theme);

    if (theme === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => updateActualTheme();
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, [theme]);

  // Sync phone's native status bar and browser top chrome with active Aura color
  const syncStatusBarAura = useCallback((auraHex: string, dark: boolean) => {
    try {
      const metaTheme = document.querySelector('#theme-color-meta');
      if (!metaTheme) return;

      // In dark mode: use a deep rich ambient aura tint for the OS status bar
      // In light mode: use an elegant soft ambient aura tint
      if (dark) {
        // Blend aura hex towards dark background
        metaTheme.setAttribute('content', auraHex);
      } else {
        metaTheme.setAttribute('content', '#F8F9FA');
      }
    } catch (_) {}
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return { theme, isDark, setTheme, toggleTheme, syncStatusBarAura };
}
