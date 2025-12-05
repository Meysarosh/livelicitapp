'use client';

import Link from 'next/link';
import { Title, Note } from '@/components/ui';
import { Wrapper, Card, Actions } from '@/components/layout/error-notFound.styles';

export default function NotFound() {
  return (
    <Wrapper>
      <Card>
        <Title as='h1'>Page not found</Title>
        <Note>The page you’re looking for doesn’t exist or may have been moved.</Note>

        <Actions>
          <Actions>
            <Link href='/'>Go home</Link>
            <Link href='/auctions'>Browse auctions</Link>
            <Link href='/account'>My account</Link>
          </Actions>
        </Actions>
      </Card>
    </Wrapper>
  );
}
