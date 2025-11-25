import { getAuthUser } from '@/lib/auth/getAuthUser';
import { getDealsAsSeller } from '@/data-access/deals';
import { AuctionsList } from '@/components/auctions/AuctionsList';

export default async function SoldAuctionsPage() {
  const user = await getAuthUser();
  const deals = await getDealsAsSeller(user.id);
  const auctions = deals.map((d) => d.auction);

  return (
    <div>
      <h1>Sold auctions</h1>
      <AuctionsList auctions={auctions} page='sold' />
    </div>
  );
}
