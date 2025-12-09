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
} from './appHeader.styles';
import { Button, Muted } from '@/components/ui';
import { useThemeMode } from '@/styles/themeProvider';
import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Avatar } from '../account/Avatar';

export default function AppHeader({
  user,
}: {
  user: {
    email: string;
    nickname: string;
    fullName: string | null;
    phone: string | null;
    avatarUrl: string | null;
  } | null;
}) {
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
          <NavLink href='/rules'>Rules</NavLink>
          {user && <NavLink href='/account'>Account</NavLink>}
        </Nav>
        <AuthBlock>
          <Button type='button' onClick={toggleMode}>
            {mode === 'light' ? '🌙 Dark' : '☀️ Light'}
          </Button>
          {user ? (
            <>
              <Muted>Hello, {user.nickname}</Muted>
              <NavLink href='/account/profile' aria-label='Profile'>
                <Avatar src={user.avatarUrl} alt={user.nickname} />
              </NavLink>
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
