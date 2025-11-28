'use client';

import { useAuctionRealtime } from './AuctionRealtimeProvider';

export function LiveBidsCount() {
  const { bidsCount } = useAuctionRealtime();

  return <span>Bids:({bidsCount})</span>;
}
