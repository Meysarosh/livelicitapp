'use client';

import { ThemeProvider, createGlobalStyle } from 'styled-components';
import type { ReactNode } from 'react';

export const theme = {
  colors: {
    // bg: 'transparent',
    bg: '#e6e6e6',
    text: '#0b0c10',
    primary: '#1f8ef1',
  },
  radii: { md: '12px' },
};

export const GlobalStyles = createGlobalStyle`
  *,*::before,*::after{box-sizing:border-box}
  html,body{
    padding:0;
    margin:0;
    background: ${({ theme }) => theme.colors.bg};
    color: ${({ theme }) => theme.colors.text};
  }
  img, video { max-width: 100%; height: auto; display: block; }
  a{color:inherit;text-decoration:none}
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
