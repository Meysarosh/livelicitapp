'use client';

import { useTransition, useState } from 'react';
import { toggleWatchlistAction } from '@/app/actions/auction/toggleWatchlist';
import { Button } from '@/components/ui';

interface WatchlistButtonProps {
  auctionId: string;
  initialInWatchlist: boolean;
  disabled?: boolean;
}

export function WatchlistButton({ auctionId, initialInWatchlist }: WatchlistButtonProps) {
  const [inWatchlist, setInWatchlist] = useState(initialInWatchlist);
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type='button'
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          try {
            const result = await toggleWatchlistAction(auctionId, inWatchlist);
            setInWatchlist(result.inWatchlist);
          } catch (e) {
            console.error('toggleWatchlist failed', e);
          }
        });
      }}
    >
      {isPending ? 'Updating…' : inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
    </Button>
  );
}
