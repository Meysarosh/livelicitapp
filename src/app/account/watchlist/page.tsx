import { requireUser } from '@/lib/auth/requireUser';
import { getUserWatchlist } from '@/lib/data/prismaQueries';
import { AuctionsList } from '@/components/auctions/AuctionsList';

export default async function WatchlistPage() {
  const user = await requireUser();
  const items = await getUserWatchlist(user.id);

  const auctions = items.map((i) => i.auction);

  return (
    <div>
      <h1>Watchlist</h1>
      <AuctionsList auctions={auctions} page='watchlist' />
    </div>
  );
}
