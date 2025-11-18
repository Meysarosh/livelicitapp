import { Main } from './layout.styles';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <Main>{children}</Main>;
}
