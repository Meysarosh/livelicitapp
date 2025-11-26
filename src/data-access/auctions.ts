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

export async function getAuction(id: string, tx: DbClient = prisma): Promise<Auction | null> {
  return tx.auction.findUnique({
    where: { id },
  });
}

export type AuctionWithOwnerAndImages = Auction & {
  images: AuctionImage[];
  owner?: Pick<User, 'id' | 'nickname' | 'ratingAvg' | 'ratingCount'>;
};
// TODO SEPARATE FUNCTION FOR OWNER AND NON-OWNER VIEW
export async function getAuctionById(id: string, owner?: boolean): Promise<AuctionWithOwnerAndImages | null> {
  if (!owner) {
    return prisma.auction.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { position: 'asc' },
        },
      },
    });
  }

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
  id: string,
  version: number,
  currentPriceMinor: number,
  highestBidderId: string,
  tx: DbClient = prisma
): Promise<Prisma.BatchPayload> {
  return await tx.auction.updateMany({
    where: { id, version },
    data: {
      currentPriceMinor,
      highestBidderId,
      version: { increment: 1 },
    },
  });
}
//READ ACTIVE AUCTIONS

export async function getActiveAuctions(): Promise<AuctionWithOwnerAndImages[]> {
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

// READ USER'S AUCTIONS
export async function getAuctionsByUser(userId: string): Promise<AuctionWithOwnerAndImages[]> {
  return prisma.auction.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: 'desc' },
    include: {
      images: {
        orderBy: { position: 'asc' },
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
