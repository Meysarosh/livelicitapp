import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '@/styles/theme';

const testTheme = {
  ...lightTheme,
};

function Providers({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={testTheme}>{children}</ThemeProvider>;
}

const customRender = (ui: React.ReactElement, options?: RenderOptions) =>
  render(ui, { wrapper: Providers, ...options });

export * from '@testing-library/react';
export { customRender as render };
