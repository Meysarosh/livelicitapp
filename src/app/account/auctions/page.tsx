import { getAuthUser } from '@/lib/auth/getAuthUser';
import { getUserAuctions } from '@/data-access/auctions';
import { AuctionsList } from '@/components/auctions/AuctionsList';

export default async function MyAuctionsPage() {
  const user = await getAuthUser();

  const auctions = await getUserAuctions(user.id);

  return (
    <div>
      <h1>My auctions</h1>
      <AuctionsList auctions={auctions} page='account' />
    </div>
  );
}
