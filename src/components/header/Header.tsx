'use client';
import { Bar, Wrap, Brand, Nav, Right, Hello, Btn, Button } from './header.styles';
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
          <Link href='/account/auctions'>Account</Link>
        </Nav>

        <Right>
          {user ? (
            <>
              <Hello>Hello, {user.nickname}</Hello>
              <Btn href='/account/profile'>Profile</Btn>
              <Button onClick={handleClickSignOut}>Sign out</Button>
            </>
          ) : onAuthPage ? null : (
            <>
              <Btn href='/login'>Sign in</Btn>
              <Btn href='/register'>Sign up</Btn>
            </>
          )}
        </Right>
      </Wrap>
    </Bar>
  );
}
