import { prisma } from '@/lib/db';
import type { Auction, AuctionImage, User } from '@prisma/client';

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
