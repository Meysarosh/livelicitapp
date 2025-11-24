import type { Auction } from '@prisma/client';

export type EffectiveAuctionStatus = 'DRAFT' | 'CANCELLED' | 'SCHEDULED' | 'LIVE' | 'ENDED';

export function getEffectiveAuctionStatus(
  auction: Pick<Auction, 'status' | 'startAt' | 'endAt'>
): EffectiveAuctionStatus {
  if (auction.status === 'CANCELLED') return 'CANCELLED';
  if (auction.status === 'DRAFT') return 'DRAFT';

  // const { startAt, endAt } = auction;
  const now = new Date();

  // if (!startAt || !endAt) {
  //   // Fallback: trust stored status
  //   return auction.status;
  // }

  if (now < auction.startAt) {
    return 'SCHEDULED';
  }

  if (now >= auction.startAt && now < auction.endAt) {
    return 'LIVE';
  }

  return 'ENDED';
}
