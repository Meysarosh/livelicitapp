import { AuctionsList } from '@/components/auctions/AuctionsList';
import { getActiveAuctions } from '@/lib/data/prismaQueries';

export default async function PublicAuctionsPage() {
  const auctions = await getActiveAuctions();

  return <AuctionsList auctions={auctions} page='public' />;
}
