import { AuctionDetailsView } from '@/components/auctions/AuctionDetailsView';
import { DealPanel } from '@/components/deals/DealPanel';
import { getAuctionWithDeal } from '@/data-access/auctions';
import { getAuthUser } from '@/lib/auth/getAuthUser';
import { notFound } from 'next/navigation';

export default async function DealDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAuthUser();
  const currentUserId = user?.id;

  const auction = await getAuctionWithDeal(id);
  if (!auction || !auction.deal) {
    notFound();
  }

  const actions = <DealPanel deal={auction.deal} currentUserId={currentUserId} />;

  return (
    <div style={{ padding: '20px 0' }}>
      <AuctionDetailsView auction={auction} actions={actions} />
    </div>
  );
}
