import 'server-only';
import { prisma } from '@/lib/db';
import {
  watchlistEntryWithAuctionArgs,
  type WatchlistEntry,
  WatchlistEntryWithAuction,
} from '@/types/watchlist';

//CREATE WATCHLIST ENTRY
export async function createWatchlistEntry(
  userId: string,
  auctionId: string,
): Promise<WatchlistEntry> {
  return await prisma.watchlist.create({
    data: {
      userId,
      auctionId,
    },
  });
}

//READ WATCHLIST ENTRY
export async function getWatchlistEntry(
  userId: string,
  auctionId: string,
): Promise<WatchlistEntry | null> {
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
export async function deleteWatchlistEntry(
  userId: string,
  auctionId: string,
): Promise<WatchlistEntry> {
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
export async function getWatchlistByUser(userId: string): Promise<WatchlistEntryWithAuction[]> {
  return prisma.watchlist.findMany({
    where: {
      userId,
    },
    ...watchlistEntryWithAuctionArgs,
    orderBy: { createdAt: 'desc' },
  });
}
