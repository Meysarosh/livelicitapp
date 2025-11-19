// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { DefaultTheme } from 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      bg: string;
      text: string;
      primary: string;
    };
    radii: {
      md: string;
    };
  }
}
