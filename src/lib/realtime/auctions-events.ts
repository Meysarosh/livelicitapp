'use server';

import { getPusherServer } from './pusher-server';

const auctionChannel = (auctionId: string) => `auction-${auctionId}`;

export async function emitBidPlaced(params: {
  auctionId: string;
  currentPriceMinor: number;
  highestBidderId: string;
  endAtIso: string;
  bidsCount: number;
}) {
  const pusher = getPusherServer();
  const { auctionId, currentPriceMinor, highestBidderId, endAtIso, bidsCount } = params;

  await pusher.trigger(auctionChannel(auctionId), 'bid-placed', {
    pusherCurrentPriceMinor: currentPriceMinor,
    pusherHighestBidderId: highestBidderId,
    pusherEndAt: endAtIso,
    pusherBidsCount: bidsCount,
  });
}
