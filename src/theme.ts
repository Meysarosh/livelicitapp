// theme.ts
import { createGlobalStyle } from 'styled-components';

export const theme = {
  colors: {
    bg: '#0b0c10',
    text: '#e6e6e6',
    primary: '#1f8ef1',
  },
  radii: { md: '12px' },
};

export const GlobalStyle = createGlobalStyle`
  *,*::before,*::after{box-sizing:border-box}
  html,body{
    padding:0;
    margin:0;
    background: ${({ theme }) => theme.colors.bg};
    color: ${({ theme }) => theme.colors.text};
  }
  a{color:inherit;text-decoration:none}
`;
