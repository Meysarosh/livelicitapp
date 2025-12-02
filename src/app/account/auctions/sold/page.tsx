import { getAuthUser } from '@/lib/auth/getAuthUser';
import { getDealsAsSeller } from '@/data-access/deals';
import { AuctionsList } from '@/components/auctions/AuctionsList';
import { PageSection } from '@/components/layout/primitives';
import { Title } from '@/components/ui';

export default async function SoldAuctionsPage() {
  const user = await getAuthUser();
  const deals = await getDealsAsSeller(user.id);
  const auctions = deals.map((d) => d.auction);

  return (
    <PageSection>
      <Title>Sold auctions</Title>
      <AuctionsList auctions={auctions} page='sold' deals={deals} />
    </PageSection>
  );
}
