import { prisma } from '@/lib/db';
import type { Auction, AuctionImage, User, Watchlist } from '@prisma/client';

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

export async function createAuctionInDb(
  data: {
    title: string;
    description: string;
    startingPrice: string;
    minIncrement: string;
    durationDays: '1' | '3' | '5' | '7' | 'test';
    currency: string;
    startMode: 'now' | 'future';
    startAt?: string | undefined;
    imageUrls?: string | undefined;
  },
  userId: string
) {
  const {
    title,
    description,
    startingPrice,
    minIncrement,
    durationDays,
    currency,
    startMode,
    startAt: startAtRaw,
    imageUrls,
  } = data;

  const toMinor = (v: string) => Math.round(Number(v) * 100);
  const startPriceMinor = toMinor(startingPrice);
  const minIncrementMinor = toMinor(minIncrement);

  const now = new Date(Date.now());
  let startAt: Date;

  if (startMode === 'future' && startAtRaw) {
    startAt = new Date(startAtRaw);
  } else {
    startAt = now;
  }

  let durationMs: number;
  if (durationDays === 'test') {
    // 1 minute duration for testing/demo
    durationMs = 1 * 60 * 1000;
  } else {
    const days = Number(durationDays) || 7;
    durationMs = days * 24 * 60 * 60 * 1000;
  }
  const endAt = new Date(startAt.getTime() + durationMs);

  //TODO update after implementation of image uploading
  const parsedImageUrls: string[] = (imageUrls ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  return await prisma.auction.create({
    data: {
      ownerId: userId,
      title,
      description,
      startPriceMinor,
      minIncrementMinor,
      currentPriceMinor: startPriceMinor,
      currency,
      status: 'ACTIVE',
      startAt,
      endAt,
      images: parsedImageUrls.length
        ? {
            create: parsedImageUrls.map((url, index) => ({
              url,
              position: index,
            })),
          }
        : undefined,
    },
  });
}
