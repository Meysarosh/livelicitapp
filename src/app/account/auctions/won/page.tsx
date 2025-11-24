import { requireUser } from '@/lib/auth/requireUser';
import { getUserWonDeals } from '@/lib/data/prismaQueries';
import { AuctionsList } from '@/components/auctions/AuctionsList';

export default async function WonAuctionsPage() {
  const user = await requireUser();
  const deals = await getUserWonDeals(user.id);
  const auctions = deals.map((d) => d.auction);

  return (
    <div>
      <h1>Won auctions</h1>
      <AuctionsList auctions={auctions} page='won' />
    </div>
  );
}
