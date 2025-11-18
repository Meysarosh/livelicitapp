'use client';
import { Bar, Wrap, Brand, Nav, Right, Hello, Btn, Button } from './header.styles';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type HeaderUser = { id: string; nickname: string; role: string } | null;

export default function Header({ user }: { user: HeaderUser }) {
  const pathname = usePathname();
  const onAuthPage = pathname?.startsWith('/auth');

  function handleClickSignOut() {
    console.log('signing out');
    signOut();
  }

  return (
    <Bar>
      <Wrap>
        <Brand>
          <Link href='/auctions'>🧭 Live Licit App</Link>
        </Brand>

        <Nav aria-label='Primary'>
          <Link href='/auctions'>Auctions</Link>
          <Link href='/auction/create'>Create</Link>
        </Nav>

        <Right>
          {user ? (
            <>
              <Hello>Hello, {user.nickname}</Hello>
              <Btn href='/account'>Profile</Btn>
              <Button onClick={handleClickSignOut}>Sign out</Button>
            </>
          ) : onAuthPage ? null : (
            <>
              <Btn href='/auth/login'>Sign in</Btn>
              <Btn href='/auth/register'>Sign up</Btn>
            </>
          )}
        </Right>
      </Wrap>
    </Bar>
  );
}
