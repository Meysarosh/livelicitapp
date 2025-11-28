import { prisma } from '@/lib/db';
import type { Auction, AuctionImage, Prisma, PrismaClient, User } from '@prisma/client';

type DbClient = PrismaClient | Prisma.TransactionClient;

//CREATE AUCTION
export async function createAuction(
  data: Omit<Auction, 'id' | 'highestBidderId' | 'cancelledReason' | 'createdAt' | 'updatedAt' | 'version'>
): Promise<Auction> {
  return await prisma.auction.create({
    data,
  });
}

//READ ONE AUCTION

export async function getAuction(id: string, tx: DbClient = prisma) {
  return tx.auction.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          bids: true,
        },
      },
    },
  });
}

export type AuctionWithOwnerAndImages = Auction & {
  images: AuctionImage[];
  owner: Pick<User, 'id' | 'nickname' | 'ratingAvg' | 'ratingCount'>;
  _count: {
    bids: number;
    watchlistedBy: number;
  };
};

export async function getAuctionDetailsForPublic(id: string): Promise<AuctionWithOwnerAndImages | null> {
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
      _count: {
        select: {
          bids: true,
          watchlistedBy: true,
        },
      },
    },
  });
}

export type AuctionWithImages = Auction & {
  images: AuctionImage[];
  _count: {
    bids: number;
    watchlistedBy: number;
  };
};

export async function getAuctionDetailsForOwner(id: string): Promise<AuctionWithImages | null> {
  return prisma.auction.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: { position: 'asc' },
      },
      _count: {
        select: {
          bids: true,
          watchlistedBy: true,
        },
      },
    },
  });
}

export async function getAuctionWithDeal(id: string, tx: DbClient = prisma) {
  return tx.auction.findUnique({
    where: { id },
    include: { deal: true },
  });
}

//UPDATE AUCTION
export async function updateAuction(id: string, data: Partial<Auction>, tx: DbClient = prisma): Promise<Auction> {
  return await tx.auction.update({
    where: { id },
    data,
  });
}

export async function updateAuctionBid(
  data: {
    id: string;
    version: number;
    currentPriceMinor: number;
    highestBidderId: string;
    endAt: Date;
  },
  tx: DbClient = prisma
): Promise<Prisma.BatchPayload> {
  const { id, version, currentPriceMinor, highestBidderId, endAt } = data;
  return await tx.auction.updateMany({
    where: { id, version },
    data: {
      currentPriceMinor,
      highestBidderId,
      version: { increment: 1 },
      endAt,
    },
  });
}
//READ ACTIVE AUCTIONS

export type AuctionForLists = Auction & {
  images: AuctionImage[];
  _count: {
    bids: number;
    watchlistedBy: number;
  };
};

export async function getActiveAuctions() {
  const now = new Date();

  return await prisma.auction.findMany({
    where: {
      status: 'ACTIVE',
      endAt: { gt: now },
    },
    orderBy: { startAt: 'asc' },
    include: {
      images: { orderBy: { position: 'asc' }, take: 1 },
      _count: {
        select: {
          bids: true,
          watchlistedBy: true,
        },
      },
    },
  });
}

// READ USER'S AUCTIONS
export async function getAuctionsByUser(userId: string) {
  return prisma.auction.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: 'desc' },
    include: {
      images: {
        orderBy: { position: 'asc' },
      },
      _count: {
        select: {
          bids: true,
          watchlistedBy: true,
        },
      },
    },
  });
}

// READ AUCTIONS TO FINALIZE
export async function getAuctionsToFinalize(limit: number): Promise<Pick<Auction, 'id'>[]> {
  const now = new Date();
  return prisma.auction.findMany({
    where: {
      status: 'ACTIVE',
      endAt: { lte: now },
    },
    select: { id: true },
    take: limit,
  });
}
