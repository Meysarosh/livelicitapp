import { prisma } from '@/lib/db';
//CREATE WATCHLIST ENTRY
export async function createWatchlistEntry(userId: string, auctionId: string) {
  return await prisma.watchlist.create({
    data: {
      userId,
      auctionId,
    },
  });
}

//READ WATCHLIST ENTRY
export async function getWatchlistEntry(userId: string, auctionId: string) {
  return await prisma.watchlist.findUnique({
    where: {
      userId_auctionId: {
        userId,
        auctionId,
      },
    },
  });
}

//DELETE WATCHLIST ENTRY
export async function deleteWatchlistEntry(userId: string, auctionId: string) {
  return await prisma.watchlist.delete({
    where: {
      userId_auctionId: {
        userId,
        auctionId,
      },
    },
  });
}

//GET WATCHLIST ENTRIES BY USER
export async function getWatchlistByUser(userId: string) {
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
          _count: {
            select: {
              bids: true,
              watchlistedBy: true,
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
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}
