import { requireUser } from '@/lib/auth/requireUser';
import { getUserSoldDeals } from '@/lib/data/prismaQueries';
import { AuctionsList } from '@/components/auctions/AuctionsList';

export default async function SoldAuctionsPage() {
  const user = await requireUser();
  const deals = await getUserSoldDeals(user.id);
  const auctions = deals.map((d) => d.auction);

  return (
    <div>
      <h1>Sold auctions</h1>
      <AuctionsList auctions={auctions} page='sold' />
    </div>
  );
}
