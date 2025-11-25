'use client';
import { Bar, Wrap, Brand, Nav, Right, Hello } from './header.styles';
import { Button, LinkButton } from '@/components/ui';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type HeaderUser = { id: string; nickname: string; role: string } | null;

export default function Header({ user }: { user: HeaderUser }) {
  const pathname = usePathname();
  const authPaths = ['/login', '/register'];
  const onAuthPage = authPaths.includes(pathname);

  function handleClickSignOut() {
    signOut({ callbackUrl: '/auctions' });
  }

  return (
    <Bar>
      <Wrap>
        <Brand>
          <Link href='/auctions'>🧭 Live Licit App</Link>
        </Brand>

        <Nav aria-label='Primary'>
          <Link href='/auctions'>Auctions</Link>
          <Link href='/account'>Account</Link>
        </Nav>

        <Right>
          {user ? (
            <>
              <Hello>Hello, {user.nickname}</Hello>
              <LinkButton href='/account/profile'>Profile</LinkButton>
              <Button onClick={handleClickSignOut}>Sign out</Button>
            </>
          ) : onAuthPage ? null : (
            <>
              <LinkButton href='/login'>Sign in</LinkButton>
              <LinkButton href='/register'>Sign up</LinkButton>
            </>
          )}
        </Right>
      </Wrap>
    </Bar>
  );
}
