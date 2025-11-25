import { getAuthUser } from '@/lib/auth/getAuthUser';
import { getDealsAsBuyer } from '@/data-access/deals';
import { AuctionsList } from '@/components/auctions/AuctionsList';

export default async function WonAuctionsPage() {
  const user = await getAuthUser();
  const deals = await getDealsAsBuyer(user.id);
  const auctions = deals.map((d) => d.auction);

  return (
    <div>
      <h1>Won auctions</h1>
      <AuctionsList auctions={auctions} page='won' />
    </div>
  );
}
