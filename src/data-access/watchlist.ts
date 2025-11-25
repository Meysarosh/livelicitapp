import { prisma } from '@/lib/db';

export async function watchlistRemove(userId: string, auctionId: string) {
  return await prisma.watchlist.delete({
    where: {
      userId_auctionId: {
        userId,
        auctionId,
      },
    },
  });
}

export async function watchlistAdd(userId: string, auctionId: string) {
  return await prisma.watchlist.create({
    data: {
      userId,
      auctionId,
    },
  });
}
