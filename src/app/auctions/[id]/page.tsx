import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { AuctionDetailsView } from '@/components/auctions/AuctionDetailsView';
import { BidActions } from '@/components/auctions/BidActions';
import { getAuctionWithOwnerAndImages } from '@/lib/data/prismaQueries';
import { AuctionMetaData } from '@/components/auctions/AuctionMetaData';
import { prisma } from '@/lib/db';
import { WatchlistButton } from '@/components/auctions/WatchlistButton';

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

  const inWatchlist = currentUserId
    ? !!(await prisma.watchlist.findUnique({
        where: {
          userId_auctionId: {
            userId: currentUserId,
            auctionId: auction.id,
          },
        },
      }))
    : false;

  const actions = <BidActions auction={auction} currentUserId={currentUserId} />;
  const metadata = <AuctionMetaData auction={auction} owner={auction.owner} />;
  const watchlistButton = <WatchlistButton auctionId={auction.id} initialInWatchlist={inWatchlist} disabled={false} />;
  const isOwner = currentUserId === auction.ownerId;

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
