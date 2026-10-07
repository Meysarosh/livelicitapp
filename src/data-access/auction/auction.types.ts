import { Prisma } from '@prisma/client';

export type Auction = Prisma.AuctionGetPayload<Prisma.AuctionDefaultArgs>;

export const auctionBidTransactionArgs = Prisma.validator<Prisma.AuctionDefaultArgs>()({
  include: {
    _count: {
      select: {
        bids: true,
      },
    },
  },
});

export type AuctionForBidTransaction = Prisma.AuctionGetPayload<typeof auctionBidTransactionArgs>;

export const auctionMetaDataArgs = Prisma.validator<Prisma.AuctionDefaultArgs>()({
  select: {
    title: true,
    description: true,
  },
});

export type AuctionMetaData = Prisma.AuctionGetPayload<typeof auctionMetaDataArgs>;

export const auctionDetailsArgs = Prisma.validator<Prisma.AuctionDefaultArgs>()({
  select: {
    id: true,
    title: true,
    description: true,
    status: true,
    ownerId: true,
    startAt: true,
    endAt: true,
    startPriceMinor: true,
    currentPriceMinor: true,
    minIncrementMinor: true,
    highestBidderId: true,
    currency: true,
    images: {
      orderBy: { position: 'asc' },
      select: {
        id: true,
        url: true,
      },
    },
    owner: {
      select: {
        id: true,
        nickname: true,
        ratingAvg: true,
        ratingCount: true,
      },
    },
    _count: {
      select: {
        bids: true,
        watchlistedBy: true,
      },
    },
  },
});

export type AuctionDetails = Prisma.AuctionGetPayload<typeof auctionDetailsArgs>;

export const auctionToFinalazeArgs = Prisma.validator<Prisma.AuctionDefaultArgs>()({
  include: {
    deal: {
      select: {
        id: true,
      },
    },
  },
});

export type AuctionToFinalaze = Prisma.AuctionGetPayload<typeof auctionToFinalazeArgs>;

export const auctionWithDealArgs = Prisma.validator<Prisma.AuctionDefaultArgs>()({
  include: {
    owner: true,
    images: { orderBy: { position: 'asc' } },
    _count: { select: { bids: true, watchlistedBy: true } },
    deal: {
      include: {
        buyer: {
          select: {
            id: true,
            nickname: true,
            email: true,
          },
        },
        seller: {
          select: {
            id: true,
            nickname: true,
            email: true,
          },
        },
      },
    },
    auctionForConversations: { select: { id: true } },
  },
});

export type AuctionWithDeal = Prisma.AuctionGetPayload<typeof auctionWithDealArgs>;

export const auctionForListArgs = Prisma.validator<Prisma.AuctionDefaultArgs>()({
  select: {
    id: true,
    title: true,
    status: true,
    startAt: true,
    endAt: true,
    currentPriceMinor: true,
    highestBidderId: true,
    currency: true,
    images: {
      orderBy: { position: 'asc' },
      take: 1,
      select: {
        url: true,
      },
    },
    _count: {
      select: {
        bids: true,
      },
    },
  },
});

export type AuctionForList = Prisma.AuctionGetPayload<typeof auctionForListArgs>;
