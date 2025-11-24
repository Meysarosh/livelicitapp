import type { Auction } from '@prisma/client';

export type EffectiveAuctionStatus = 'DRAFT' | 'CANCELLED' | 'SCHEDULED' | 'LIVE' | 'ENDED';

export function getEffectiveAuctionStatus(
  auction: Pick<Auction, 'status' | 'startAt' | 'endAt'>
): EffectiveAuctionStatus {
  if (auction.status === 'CANCELLED') return 'CANCELLED';
  if (auction.status === 'DRAFT') return 'DRAFT';

  const now = new Date();

  if (now < auction.startAt) {
    return 'SCHEDULED';
  }

  if (now >= auction.startAt && now < auction.endAt) {
    return 'LIVE';
  }

  return 'ENDED';
}
