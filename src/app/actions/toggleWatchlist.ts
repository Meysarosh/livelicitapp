'use server';

import { requireUser } from '@/lib/auth/requireUser';
import { prisma } from '@/lib/db';

export async function toggleWatchlist(auctionId: string, inWatchlist: boolean) {
  const user = await requireUser();

  if (inWatchlist) {
    await prisma.watchlist.delete({
      where: {
        userId_auctionId: {
          userId: user.id,
          auctionId,
        },
      },
    });
    return { inWatchlist: false };
  }

  await prisma.watchlist.create({
    data: {
      userId: user.id,
      auctionId,
    },
  });

  return { inWatchlist: true };
}
