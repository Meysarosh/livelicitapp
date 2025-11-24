import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { AuctionDetailsView } from '@/components/auctions/AuctionDetailsView';
import { BidActions } from '@/components/auctions/BidActions';
import { getAuctionWithOwnerAndImages } from '@/lib/data/auctions';

interface PageProps {
  id: string;
}

export default async function AuctionDetailsPage({ params }: { params: Promise<PageProps> }) {
  const session = await auth();
  const currentUserId = session?.user.id;

  const pageParams = await params;

  const auction = await getAuctionWithOwnerAndImages(pageParams.id);

  if (!auction) {
    notFound();
  }

  const actions = <BidActions auction={auction} currentUserId={currentUserId} />;

  return (
    <div style={{ padding: '20px 0' }}>
      <AuctionDetailsView auction={auction} owner={auction.owner} currentUserId={currentUserId} actions={actions} />
    </div>
  );
}
