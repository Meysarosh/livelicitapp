'use server';

import { watchlistAdd, watchlistRemove } from '@/data-access/watchlist';
import { getAuthUser } from '@/lib/auth/getAuthUser';

export async function toggleWatchlist(auctionId: string, inWatchlist: boolean) {
  const user = await getAuthUser();

  if (inWatchlist) {
    await watchlistRemove(user.id, auctionId);
    return { inWatchlist: false };
  }

  await watchlistAdd(user.id, auctionId);

  return { inWatchlist: true };
}
