import { requireUser } from '@/lib/auth/requireUser';
import { getUserAuctions } from '@/lib/data/prismaQueries';
import { AuctionsList } from '@/components/auctions/AuctionsList';

export default async function MyAuctionsPage() {
  const user = await requireUser();

  const auctions = await getUserAuctions(user.id);

  return (
    <div>
      <h1>My auctions</h1>
      <AuctionsList auctions={auctions} page='account' />
    </div>
  );
}
