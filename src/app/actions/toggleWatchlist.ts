'use server';

import { createWatchlistEntry, deleteWatchlistEntry } from '@/data-access/watchlist';
import { getAuthUser } from '@/lib/auth/getAuthUser';

export async function toggleWatchlist(auctionId: string, inWatchlist: boolean) {
  const user = await getAuthUser();

  if (inWatchlist) {
    await deleteWatchlistEntry(user.id, auctionId);
    return { inWatchlist: false };
  }

  await createWatchlistEntry(user.id, auctionId);

  return { inWatchlist: true };
}
