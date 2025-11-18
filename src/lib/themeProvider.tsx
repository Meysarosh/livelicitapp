'use client';

import { ThemeProvider, createGlobalStyle } from 'styled-components';
import type { ReactNode } from 'react';
import { theme } from '@/theme';

const GlobalStyles = createGlobalStyle`
  *,*::before,*::after { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; }
  img, video { max-width: 100%; height: auto; display: block; }
  a { color: inherit; text-decoration: none; }
  button { cursor: pointer; }
`;

export default function ClientThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      {children}
    </ThemeProvider>
  );
}
