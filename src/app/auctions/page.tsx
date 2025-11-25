import { AuctionsList } from '@/components/auctions/AuctionsList';
import { getActiveAuctions } from '@/data-access/auctions';

export default async function PublicAuctionsPage() {
  const auctions = await getActiveAuctions();

  return <AuctionsList auctions={auctions} page='public' />;
}
