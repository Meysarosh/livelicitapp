import type { Deal } from '@prisma/client';
import { prisma } from '@/lib/db';
import type { AuctionWithOwnerAndImages } from './auctions';

// Sold auctions (via Deal where user is seller)
export type DealWithAuction = Deal & {
  auction: AuctionWithOwnerAndImages;
};

export async function getDealsAsSeller(userId: string): Promise<DealWithAuction[]> {
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
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}
