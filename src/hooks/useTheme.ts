import { useState, useEffect } from 'react';
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
    const metaTheme = document.querySelector('#theme-color-meta');

    const updateActualTheme = () => {
      let resolvedDark = true;
      if (theme === 'system') {
        resolvedDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      } else {
        resolvedDark = theme === 'dark';
      }

      setIsDark(resolvedDark);

      // Keep phone status bar fixed to clean neutral dark / light background
      if (resolvedDark) {
        root.classList.add('dark');
        metaTheme?.setAttribute('content', '#121417');
      } else {
        root.classList.remove('dark');
        metaTheme?.setAttribute('content', '#F8F9FA');
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

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return { theme, isDark, setTheme, toggleTheme };
}
