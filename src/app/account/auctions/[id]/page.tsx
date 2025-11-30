import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAuctionDetailsForOwner } from '@/data-access/auctions';
import { AuctionDetailsView } from '@/components/auctions/AuctionDetailsView';

interface RouteParams {
  id: string;
}

export default async function MyAuctionDetailsPage({ params }: { params: Promise<RouteParams> }) {
  const { id } = await params;
  const auction = await getAuctionDetailsForOwner(id);
  if (!auction) {
    notFound();
  }

  const actions = (
    <div style={{ display: 'grid', gap: 8 }}>
      <Link href={`/account/auctions/edit/${auction.id}`}>Edit auction</Link>
      {/* TODO: delete action */}
      {/* TODO: copy auction */}
      {/* TODO: open conversation with buyer when there is a deal */}
    </div>
  );

  return <AuctionDetailsView auction={auction} actions={actions} />;
}
