'use client';
import {
  Header,
  HeaderInner,
  Brand,
  Logo,
  BrandText,
  BrandTitle,
  BrandSubtitle,
  Nav,
  NavLink,
  AuthBlock,
} from './header.styles';
import { Button, Paragraph } from '@/components/ui';
import { useThemeMode } from '@/styles/themeProvider';
import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

type HeaderUser = { id: string; nickname: string; role: string } | null;

export default function AppHeader({ user }: { user: HeaderUser }) {
  const pathname = usePathname();
  const authPaths = ['/login', '/register'];
  const onAuthPage = authPaths.includes(pathname);

  const { mode, toggleMode } = useThemeMode();

  function handleClickSignOut() {
    signOut({ callbackUrl: '/auctions' });
  }

  return (
    <Header>
      <HeaderInner>
        <Brand>
          <Logo />
          <BrandText>
            <BrandTitle>Live Licit</BrandTitle>
            <BrandSubtitle>Real-time auctions & deals</BrandSubtitle>
          </BrandText>
        </Brand>
        <Nav>
          <NavLink href='/auctions'>Auctions</NavLink>
          {user && <NavLink href='/account'>Account</NavLink>}
        </Nav>
        <AuthBlock>
          <Button type='button' onClick={toggleMode}>
            {mode === 'light' ? '🌙 Dark' : '☀️ Light'}
          </Button>
          {user ? (
            <>
              <Paragraph>Hello, {user.nickname}</Paragraph>
              <NavLink href='/account/profile'>Profile</NavLink>
              <Button onClick={handleClickSignOut}>Sign out</Button>
            </>
          ) : onAuthPage ? null : (
            <>
              <NavLink href='/login'>Sign in</NavLink>
              <NavLink href='/register'>Sign up</NavLink>
            </>
          )}
        </AuthBlock>
      </HeaderInner>
    </Header>
  );
}
