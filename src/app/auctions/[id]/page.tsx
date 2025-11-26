import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { AuctionDetailsView } from '@/components/auctions/AuctionDetailsView';
import { BidActions } from '@/components/auctions/BidActions';
import { getAuctionDetailsForPublic } from '@/data-access/auctions';
import { AuctionMetaData } from '@/components/auctions/AuctionMetaData';
import { WatchlistButton } from '@/components/auctions/WatchlistButton';
import { getWatchlistEntry } from '@/data-access/watchlist';

interface PageProps {
  id: string;
}

export default async function AuctionDetailsPage({ params }: { params: Promise<PageProps> }) {
  const session = await auth();
  const userId = session?.user.id;

  const pageParams = await params;

  const auction = await getAuctionDetailsForPublic(pageParams.id);

  if (!auction || !auction.owner) {
    notFound();
  }

  const inWatchlist = userId ? !!(await getWatchlistEntry(userId, auction.id)) : false;

  const actions = <BidActions auction={auction} userId={userId} />;
  const metadata = <AuctionMetaData auction={auction} owner={auction.owner} />;
  const watchlistButton = <WatchlistButton auctionId={auction.id} initialInWatchlist={inWatchlist} disabled={false} />;
  const isOwner = userId === auction.ownerId;

  return (
    <div style={{ padding: '20px 0' }}>
      <AuctionDetailsView
        auction={auction}
        actions={actions}
        metadata={isOwner ? null : metadata}
        watchlistButton={isOwner ? null : watchlistButton}
      />
    </div>
  );
}
