// frontend/src/hooks/useTheme.js
import { useEffect, useState } from 'react';

const THEME_KEY = 'collabcodex-theme';

export const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return saved;

    // System preference fallback
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return {
    theme,
    toggleTheme,
    isDark: theme === 'dark',
  };
};