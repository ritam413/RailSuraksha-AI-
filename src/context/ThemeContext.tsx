'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useSyncExternalStore } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (dark: boolean) => void;
}

const THEME_STORAGE_KEY = 'railsuraksha-theme';

const DEFAULT_THEME_CONTEXT: ThemeContextType = {
  isDarkMode: false,
  toggleTheme: () => {},
  setTheme: () => {}
};

const ThemeContext = createContext<ThemeContextType>(DEFAULT_THEME_CONTEXT);

function subscribeToTheme(callback: () => void) {
  if (typeof window === 'undefined') {
    return () => {};
  }
  window.addEventListener('storage', callback);
  window.addEventListener('railsuraksha_theme_change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('railsuraksha_theme_change', callback);
  };
}

function getThemeSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const item = window.localStorage.getItem(THEME_STORAGE_KEY);
    return item === 'dark';
  } catch {}
  return false;
}

function getServerThemeSnapshot(): boolean {
  return false;
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isDarkMode = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, getServerThemeSnapshot);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Apply classes on mount and updates
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('theme-dark', isDarkMode);
      document.body.classList.toggle('dark', isDarkMode);
      document.documentElement.classList.toggle('theme-dark', isDarkMode);
      document.documentElement.classList.toggle('dark', isDarkMode);
    }
  }, [isDarkMode]);

  const setTheme = useCallback((dark: boolean) => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, dark ? 'dark' : 'light');
        if (typeof document !== 'undefined') {
          document.body.classList.toggle('theme-dark', dark);
          document.body.classList.toggle('dark', dark);
          document.documentElement.classList.toggle('theme-dark', dark);
          document.documentElement.classList.toggle('dark', dark);
        }
        window.dispatchEvent(new Event('railsuraksha_theme_change'));
      } catch {}
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const current = getThemeSnapshot();
    setTheme(!current);
  }, [setTheme]);

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        toggleTheme,
        setTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  return useContext(ThemeContext);
};
