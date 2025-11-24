'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { ImageWithSkeleton } from '../global/ImageWithSkeleton';
import { getEffectiveAuctionStatus } from '@/lib/auctionStatus';
import { formatDateTime, formatMoney } from '@/lib/format';
import { ActiveAuctions } from '@/lib/data/prismaQueries';

import { List, Item, Thumb, Body, Title, MetaRow, MetaPiece } from './AuctionsList.styles';

type Props = {
  auctions: ActiveAuctions;
  page: string;
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

    const href =
      {
        public: `/auctions/${a.id}`,
        watchlist: `/auctions/${a.id}`,
        account: `/account/auctions/${a.id}`,
        won: `/account/deals/${a.id}`,
        sold: `/account/deals/${a.id}`,
      }[page] ?? `/auctions/${a.id}`;

    return {
      id: a.id,
      title: a.title,
      href: href as Route,
      imageUrl: firstImage || undefined,
      priceLabel,
      priceText: formatMoney(priceValue, a.currency),
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
              <Title>{item.title}</Title>
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
