import { prisma } from '@/lib/db';
import type { Auction, AuctionImage, User, Deal, Watchlist } from '@prisma/client';

export type ActiveAuctions = (Auction & {
  images: AuctionImage[];
})[];

export async function getActiveAuctions(): Promise<ActiveAuctions> {
  const now = new Date();

  return await prisma.auction.findMany({
    where: {
      status: 'ACTIVE',
      endAt: { gt: now },
    },
    orderBy: { startAt: 'asc' },
    include: {
      images: { orderBy: { position: 'asc' }, take: 1 },
    },
  });
}

export type AuctionWithOwnerAndImages = Auction & {
  images: AuctionImage[];
  owner: Pick<User, 'id' | 'nickname' | 'ratingAvg' | 'ratingCount'>;
};

export async function getAuctionWithOwnerAndImages(id: string): Promise<AuctionWithOwnerAndImages | null> {
  return prisma.auction.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: { position: 'asc' },
      },
      owner: {
        select: {
          id: true,
          nickname: true,
          ratingAvg: true,
          ratingCount: true,
        },
      },
    },
  });
}

// My auction
export type AuctionWithImages = Auction & {
  images: AuctionImage[];
};

export async function getAuctionWithImages(id: string): Promise<AuctionWithImages | null> {
  return prisma.auction.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: { position: 'asc' },
      },
    },
  });
}
// My auctions
export async function getUserAuctions(userId: string): Promise<AuctionWithOwnerAndImages[]> {
  return prisma.auction.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: 'desc' },
    include: {
      images: {
        orderBy: { position: 'asc' },
      },
      owner: {
        select: {
          id: true,
          nickname: true,
          ratingAvg: true,
          ratingCount: true,
        },
      },
    },
  });
}

// Sold auctions (via Deal where user is seller)
export type DealWithAuction = Deal & {
  auction: AuctionWithOwnerAndImages;
};

export async function getUserSoldDeals(userId: string): Promise<DealWithAuction[]> {
  return prisma.deal.findMany({
    where: {
      sellerId: userId,
      // optionally filter by status if you only want closed/paid
    },
    include: {
      auction: {
        include: {
          images: {
            orderBy: { position: 'asc' },
          },
          owner: {
            select: {
              id: true,
              nickname: true,
              ratingAvg: true,
              ratingCount: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// Won auctions (user is buyer)
export async function getUserWonDeals(userId: string): Promise<DealWithAuction[]> {
  return prisma.deal.findMany({
    where: {
      buyerId: userId,
    },
    include: {
      auction: {
        include: {
          images: {
            orderBy: { position: 'asc' },
          },
          owner: {
            select: {
              id: true,
              nickname: true,
              ratingAvg: true,
              ratingCount: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// Watchlist: return auctions that user has watchlisted
export type WatchlistWithAuction = Watchlist & {
  auction: AuctionWithOwnerAndImages;
};

export async function getUserWatchlist(userId: string): Promise<WatchlistWithAuction[]> {
  return prisma.watchlist.findMany({
    where: {
      userId,
    },
    include: {
      auction: {
        include: {
          images: {
            orderBy: { position: 'asc' },
          },
          owner: {
            select: {
              id: true,
              nickname: true,
              ratingAvg: true,
              ratingCount: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}
