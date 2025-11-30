'use client';

import { MonospaceText } from '../ui';
import { useAuctionRealtime } from './AuctionRealtimeProvider';

export function LiveBidsCount() {
  const { bidsCount } = useAuctionRealtime();

  return <MonospaceText>({bidsCount})</MonospaceText>;
}
