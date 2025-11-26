'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { ImageWithSkeleton } from '@/components/ui';
import { getEffectiveAuctionStatus } from '@/services/auctionStatus-service';
import { formatDateTime, formatPrice } from '@/services/format-service';
import { ActiveAuctions } from '@/data-access/auctions';

import { List, Item, Thumb, Body, ItemTitle, MetaRow, MetaPiece } from './AuctionsList.styles';

type AuctionsListPage = 'public' | 'watchlist' | 'account' | 'won' | 'sold';

type Props = {
  auctions: ActiveAuctions;
  page: AuctionsListPage;
};

const pageRoutes: Record<AuctionsListPage, (id: string) => Route> = {
  public: (id) => `/auctions/${id}`,
  watchlist: (id) => `/auctions/${id}`,
  account: (id) => `/account/auctions/${id}`,
  won: (id) => `/account/deals/${id}`,
  sold: (id) => `/account/deals/${id}`,
};

export function AuctionsList({ auctions, page }: Props) {
  if (auctions.length === 0) {
    return <p>No auctions found.</p>;
  }

    const items = auctions.map((a) => {
      const firstImage = a.images[0]?.url;
      const effectiveStatus = getEffectiveAuctionStatus(a);

      const isLive = effectiveStatus === 'LIVE';
      const isScheduled = effectiveStatus === 'SCHEDULED';

      const priceLabel = isLive ? 'Current bid' : 'Starting price';
      const priceValue = isLive ? a.currentPriceMinor : a.startPriceMinor;

      const [metaLabel, metaDate] = isScheduled ? ['Starts', a.startAt] : ['Ends', a.endAt];

      const href = pageRoutes[page](a.id);

      return {
        id: a.id,
        title: a.title,
        href,
        imageUrl: firstImage || undefined,
        priceLabel,
        priceText: formatPrice(priceValue, a.currency),
        metaLabel,
        metaText: formatDateTime(metaDate),
      };
    });

  return (
    <List>
      {items.map((item) => (
        <Item key={item.id}>
          <Link href={item.href}>
            <Thumb>
              <ImageWithSkeleton src={item.imageUrl} alt={item.title} />
            </Thumb>
          </Link>

          <Body>
            <Link href={item.href}>
              <ItemTitle>{item.title}</ItemTitle>
            </Link>

            {(item.priceText || item.metaText) && (
              <MetaRow>
                {item.priceText && (
                  <MetaPiece>
                    {item.priceLabel && <strong>{item.priceLabel}:</strong>}
                    <span>{item.priceText}</span>
                  </MetaPiece>
                )}
                {item.metaText && (
                  <MetaPiece>
                    {item.metaLabel && <strong>{item.metaLabel}:</strong>}
                    <span>{item.metaText}</span>
                  </MetaPiece>
                )}
              </MetaRow>
            )}
          </Body>
        </Item>
      ))}
    </List>
  );
}
