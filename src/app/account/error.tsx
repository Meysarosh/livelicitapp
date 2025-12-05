'use client';

import Link from 'next/link';
import { Title, Note, Button } from '@/components/ui';
import { Wrapper, Card, Actions } from '@/components/layout/error-notFound.styles';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AccountError({ error, reset }: Props) {
  return (
    <Wrapper>
      <Card>
        <Title as='h1'>Account area error</Title>
        <Note>We couldn’t load this section of your account. Please try again.</Note>

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
