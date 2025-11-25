import { getAuthUser } from '@/lib/auth/getAuthUser';
import { getUserWatchlist } from '@/data-access/auctions';
import { AuctionsList } from '@/components/auctions/AuctionsList';

export default async function WatchlistPage() {
  const user = await getAuthUser();
  const items = await getUserWatchlist(user.id);

  const auctions = items.map((i) => i.auction);

  return (
    <div>
      <h1>Watchlist</h1>
      <AuctionsList auctions={auctions} page='watchlist' />
    </div>
  );
}
