import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { AuctionDetailsView } from '@/components/auctions/AuctionDetailsView';
import { BidContainer } from '@/components/auctions/BidContainer';
import { getAuctionDetailsForPublic } from '@/data-access/auctions';
import { AuctionMetaData } from '@/components/auctions/AuctionMetaData';
import { WatchlistButton } from '@/components/auctions/WatchlistButton';
import { getWatchlistEntry } from '@/data-access/watchlist';
import { AskSellerButton } from '@/components/conversations/AskSellerButton';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const auction = await getAuctionDetailsForPublic(id);

  if (!auction) return { title: 'Auction Not Found' };

  return {
    title: `${auction.title} | Live Licit`,
    description: auction.description?.substring(0, 150),
  };
}

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
  const isOwner = userId === auction.ownerId;

  const actions = (
    <>
      <BidContainer auction={auction} userId={userId} />
      <AskSellerButton auctionId={auction.id} disabled={isOwner} />
    </>
  );
  const metadata = <AuctionMetaData auction={auction} />;
  const watchlistButton = <WatchlistButton auctionId={auction.id} initialInWatchlist={inWatchlist} />;

  return (
    <AuctionDetailsView
      auction={auction}
      actions={actions}
      metadata={isOwner ? null : metadata}
      watchlistButton={isOwner ? null : watchlistButton}
    />
  );
}
