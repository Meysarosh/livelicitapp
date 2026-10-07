import { Prisma } from '@prisma/client';
import { auctionForListArgs } from '@/data-access/auction/auction.types';

export type WatchlistEntry = Prisma.WatchlistGetPayload<Prisma.WatchlistDefaultArgs>;

export const watchlistEntryWithAuctionArgs = Prisma.validator<Prisma.WatchlistDefaultArgs>()({
  include: {
    auction: {
      ...auctionForListArgs,
    },
  },
});

export type WatchlistEntryWithAuction = Prisma.WatchlistGetPayload<
  typeof watchlistEntryWithAuctionArgs
>;
