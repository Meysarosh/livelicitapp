'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { GlobalStyle } from './globalStyles';
import { lightTheme, darkTheme, type AppTheme } from './theme';

type ThemeMode = 'light' | 'dark';

type ThemeContextValue = {
  mode: ThemeMode;
  theme: AppTheme;
  toggleMode: () => void;
};

const ThemeModeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'll-theme';

export function useThemeMode() {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) {
    throw new Error('useThemeMode must be used within ClientThemeProvider');
  }
  return ctx;
}

type ClientThemeProviderProps = {
  children: ReactNode;
  initialMode: ThemeMode;
};

export default function ClientThemeProvider({ children, initialMode }: ClientThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(initialMode);
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
      if (stored === 'light' || stored === 'dark') {
        if (stored !== mode) {
          setMode(stored);
        }
      } else {
        const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
        const effective: ThemeMode = prefersDark ? 'dark' : 'light';
        if (effective !== mode) {
          setMode(effective);
        }
      }
    } catch {
      // ignore
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);

      document.cookie = `ll-theme=${mode}; path=/; max-age=31536000`;
    } catch {
      // ignore
    }

    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [mode]);

  const toggleMode = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const theme: AppTheme = mode === 'light' ? lightTheme : darkTheme;

  const ctxValue: ThemeContextValue = {
    mode,
    theme,
    toggleMode,
  };

  return (
    <ThemeModeContext.Provider value={ctxValue}>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}
