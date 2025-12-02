import type { Deal, PrismaClient, Prisma, Auction, User } from '@prisma/client';
import { prisma } from '@/lib/db';
import type { AuctionDetailForPublic } from './auctions';

type DbClient = PrismaClient | Prisma.TransactionClient;

// CREATE DEAL
export async function createDeal(
  data: Omit<
    Deal,
    | 'id'
    | 'paidAt'
    | 'paidAmountMinor'
    | 'shippedAt'
    | 'shippingCompany'
    | 'trackingNumber'
    | 'receivedAt'
    | 'disputeReason'
    | 'closedAt'
    | 'createdAt'
    | 'updatedAt'
  >,
  tx: DbClient = prisma
): Promise<Deal> {
  return await tx.deal.create({
    data,
  });
}

// READ DEALS

export type DealWithRelations = Deal & {
  auction: Auction;
  seller: User;
  buyer: User;
};

export async function getDealById(dealId: string, tx: DbClient = prisma): Promise<DealWithRelations | null> {
  return tx.deal.findUnique({
    where: { id: dealId },
    include: {
      auction: true,
      seller: true,
      buyer: true,
    },
  });
}

export async function getDealForAuction(auctionId: string, tx: DbClient = prisma): Promise<DealWithRelations | null> {
  return tx.deal.findUnique({
    where: { auctionId },
    include: {
      auction: true,
      seller: true,
      buyer: true,
    },
  });
}

// GET DEALS AS SELLER AND BUYER
export type DealWithAuction = Deal & {
  auction: AuctionDetailForPublic;
};

export async function getDealsAsSeller(userId: string): Promise<DealWithAuction[]> {
  return prisma.deal.findMany({
    where: {
      sellerId: userId,
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
          _count: {
            select: {
              bids: true,
              watchlistedBy: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getDealsAsBuyer(userId: string): Promise<DealWithAuction[]> {
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
          _count: {
            select: {
              bids: true,
              watchlistedBy: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// UPDATE DEAL
export async function updateDeal(dealId: string, data: Prisma.DealUpdateInput, tx: DbClient = prisma) {
  return tx.deal.update({
    where: { id: dealId },
    data,
  });
}
