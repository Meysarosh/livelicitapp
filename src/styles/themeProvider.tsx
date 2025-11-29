'use client';

import { ThemeProvider } from 'styled-components';
import type { ReactNode } from 'react';
import { GlobalStyle } from './globalStyles';
import { lightTheme } from './theme';
import { AppShell } from '@/components/layouts/AppShell';

export default function ClientThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={lightTheme}>
      <GlobalStyle />
      <AppShell>{children}</AppShell>
    </ThemeProvider>
  );
}
