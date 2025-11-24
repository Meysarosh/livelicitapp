'use client';

import { useTransition, useState } from 'react';
import { toggleWatchlist } from '@/app/actions/toggleWatchlist';
import { Btn } from '@/components/forms/form.styles';

interface WatchlistButtonProps {
  auctionId: string;
  initialInWatchlist: boolean;
  disabled?: boolean;
}

export function WatchlistButton({ auctionId, initialInWatchlist, disabled }: WatchlistButtonProps) {
  const [inWatchlist, setInWatchlist] = useState(initialInWatchlist);
  const [isPending, startTransition] = useTransition();

  return (
    <Btn
      type='button'
      disabled={disabled || isPending}
      onClick={() => {
        startTransition(async () => {
          try {
            const result = await toggleWatchlist(auctionId, inWatchlist);
            setInWatchlist(result.inWatchlist);
          } catch (e) {
            console.error('toggleWatchlist failed', e);
          }
        });
      }}
    >
      {isPending ? 'Updating…' : inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
    </Btn>
  );
}
