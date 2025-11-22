import { prisma } from '@/lib/db';
import { AuctionsList } from '@/components/auctions/AuctionsList';
import type { AuctionListItemVM } from '@/components/auctions/types';
import { formatMoney, formatDateTime } from '@/lib/format';
import { getEffectiveAuctionStatus } from '@/lib/auctionStatus';

export default async function PublicAuctionsPage() {
  const now = new Date();

  const auctions = await prisma.auction.findMany({
    where: {
      status: 'ACTIVE',
      endAt: { gt: now },
    },
    orderBy: { startAt: 'asc' },
    include: {
      images: { orderBy: { position: 'asc' }, take: 1 },
    },
  });

  const items: AuctionListItemVM[] = auctions.map((a) => {
    const firstImage = a.images[0]?.url;
    const effectiveStatus = getEffectiveAuctionStatus(a);

    const isLive = effectiveStatus === 'LIVE';
    const isScheduled = effectiveStatus === 'SCHEDULED';

    const priceLabel = isLive ? 'Current bid' : 'Starting price';
    const priceValue = isLive ? a.currentPriceMinor : a.startPriceMinor;

    const [metaLabel, metaDate] = isScheduled ? ['Starts', a.startAt] : ['Ends', a.endAt];

    return {
      id: a.id,
      title: a.title,
      href: `/auctions/${a.id}`,
      imageUrl: firstImage || undefined,
      priceLabel,
      priceText: formatMoney(priceValue, a.currency),
      metaLabel,
      metaText: formatDateTime(metaDate),
    };
  });

  return <AuctionsList items={items} emptyMessage='No auctions yet.' />;
}
