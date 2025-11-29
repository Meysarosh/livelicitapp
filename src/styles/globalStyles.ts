import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  *,*::before,*::after{box-sizing:border-box}

  html,body{
    padding:0;
    margin:0;
  }

  body {
    min-height: 100vh;
    font-family: ${({ theme }) => theme.typography.fontFamily};
    font-size: ${({ theme }) => theme.typography.fontSizeBase};
    line-height: ${({ theme }) => theme.typography.lineHeightBase};
    color: ${({ theme }) => theme.colors.text};
    background-color: ${({ theme }) => theme.colors.bg};
  }

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }

  button { 
    cursor: pointer;
    font-family: inherit; 
  }

   input, textarea, select {
    font-family: inherit;
    font-size: inherit;
  }

  ul, ol {
    padding-left: 1.25rem;
  }

  body, #__next, #root {
    transition: background-color 0.2s ease, color 0.2s ease;
  }
`;
