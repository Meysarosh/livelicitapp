import { getAuthUser } from '@/lib/auth/getAuthUser';
import { getAuctionsByUser } from '@/data-access/auctions';
import { AuctionsList } from '@/components/auctions/AuctionsList';
import { PageSection } from '@/components/layout/primitives';
import { Title } from '@/components/ui';

export default async function MyAuctionsPage() {
  const user = await getAuthUser();

  const auctions = await getAuctionsByUser(user.id);

  return (
    <PageSection>
      <Title>My auctions</Title>
      <AuctionsList auctions={auctions} page='account' />
    </PageSection>
  );
}
