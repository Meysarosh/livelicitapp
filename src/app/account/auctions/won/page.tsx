import { getAuthUser } from '@/lib/auth/getAuthUser';
import { getDealsAsBuyer } from '@/data-access/deals';
import { AuctionsList } from '@/components/auctions/AuctionsList';
import { PageSection } from '@/components/layout/primitives';
import { Title } from '@/components/ui';

export default async function WonAuctionsPage() {
  const user = await getAuthUser();
  const deals = await getDealsAsBuyer(user.id);
  const auctions = deals.map((d) => d.auction);

  return (
    <PageSection>
      <Title>Won auctions</Title>
      <AuctionsList auctions={auctions} page='won' />
    </PageSection>
  );
}
