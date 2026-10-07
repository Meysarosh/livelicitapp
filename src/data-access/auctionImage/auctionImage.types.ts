import { Prisma } from '@prisma/client';

export const auctionImagesByAuctionIdArgs = Prisma.validator<Prisma.AuctionImageDefaultArgs>()({
  select: {
    id: true,
    url: true,
  },
});

export type AuctionImageForAuction = Prisma.AuctionImageGetPayload<
  typeof auctionImagesByAuctionIdArgs
>;
