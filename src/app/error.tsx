'use client';

import Link from 'next/link';
import { Title, Note, Button } from '@/components/ui';
import { Wrapper, Card, Actions } from '@/components/layout/error-notFound.styles';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function RootError({ error, reset }: Props) {
  return (
    <Wrapper>
      <Card>
        <Title>Something went wrong</Title>
        <Note>This part of the application failed to load. You can try again or navigate elsewhere.</Note>

        {error?.digest && <p style={{ fontSize: 12, opacity: 0.6, marginTop: 8 }}>Error digest: {error.digest}</p>}

        <Actions>
          <Button type='button' onClick={() => reset()}>
            Try again
          </Button>

          <Link href='/'>Go home</Link>
          <Link href='/auctions'>Browse auctions</Link>
          <Link href='/account'>My account</Link>
        </Actions>
      </Card>
    </Wrapper>
  );
}
