import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAuctionDetailsForOwner } from '@/data-access/auctions';
import { AuctionDetailsView } from '@/components/auctions/AuctionDetailsView';
import { ContactSupportButton } from '@/components/conversations/ContactSupportButton';

interface RouteParams {
  id: string;
}

export default async function MyAuctionDetailsPage({ params }: { params: Promise<RouteParams> }) {
  const { id } = await params;

  const auction = await getAuctionDetailsForOwner(id);

  if (!auction) {
    notFound();
  }

  const hasBids = auction.currentPriceMinor > auction.startPriceMinor;

  const actions = (
    <div style={{ display: 'grid', gap: 8 }}>
      {!hasBids && <Link href={`/account/auctions/edit/${auction.id}`}>Edit auction</Link>}
      <ContactSupportButton auctionId={auction.id} />
    </div>
  );

  return <AuctionDetailsView auction={auction} actions={actions} />;
}
