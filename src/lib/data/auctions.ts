import { prisma } from '@/lib/db';
import type { Auction, AuctionImage, User } from '@prisma/client';

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
