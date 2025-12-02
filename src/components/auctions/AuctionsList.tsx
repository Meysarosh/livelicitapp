'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { ImageWithSkeleton } from '@/components/ui';
import { getEffectiveAuctionStatus } from '@/services/auctionStatus-service';
import { formatDateTime } from '@/services/format-service';
import { AuctionForLists } from '@/data-access/auctions';

import { List, Item, Thumb, Body, ItemTitle, MetaRow, MetaPiece } from './AuctionsList.styles';
import { LivePrice } from './LivePrice';
import { AuctionRealtimeProvider } from './AuctionRealtimeProvider';
import { LiveCountdown } from './LiveCountDown';
import { LiveBidsCount } from './LiveBidsCount';
import { DealWithAuction } from '@/data-access/deals';
import { getDealStatusChip } from '@/services/dealStatus-service';
import { StatusChip } from '../ui/StatusChip';

type AuctionsListPage = 'public' | 'watchlist' | 'account' | 'won' | 'sold';

type Props = {
  auctions: AuctionForLists[];
  page: AuctionsListPage;
  deals?: DealWithAuction[];
};

const pageRoutes: Record<AuctionsListPage, (id: string) => Route> = {
  public: (id) => `/auctions/${id}` as Route,
  watchlist: (id) => `/auctions/${id}` as Route,
  account: (id) => `/account/auctions/${id}` as Route,
  won: (id) => `/account/deals/${id}` as Route,
  sold: (id) => `/account/deals/${id}` as Route,
};

export function AuctionsList({ auctions, page, deals }: Props) {
  if (auctions.length === 0) {
    return <p>No auctions found.</p>;
  }

  const items = auctions.map((a, idx) => {
    const firstImage = a.images[0]?.url;
    const isScheduled = getEffectiveAuctionStatus(a) === 'SCHEDULED';
    const [metaLabel, metaDate] = isScheduled
      ? ['Starts:', <span key={a.id}>{formatDateTime(a.startAt)}</span>]
      : ['Ends in:', <LiveCountdown key={a.id} />];
    const href = pageRoutes[page](a.id);

    return (
      <AuctionRealtimeProvider key={a.id} auction={a}>
        <Item>
          <Link href={href}>
            <Thumb>
              <ImageWithSkeleton src={firstImage || undefined} alt={a.title} />
            </Thumb>
          </Link>
          <Body>
            <Link href={href}>
              <ItemTitle>{a.title}</ItemTitle>
            </Link>
            <MetaRow>
              <MetaPiece>
                <strong>{isScheduled ? 'Starting price:' : 'Current price:'}</strong>
                <LivePrice />
              </MetaPiece>
              <MetaPiece>
                <strong>Bids:</strong>
                <LiveBidsCount />
              </MetaPiece>
              <MetaPiece>
                <strong>{metaLabel}</strong>
                {metaDate}
              </MetaPiece>
              {deals && (
                <MetaPiece>
                  {(() => {
                    const { label, tone } = getDealStatusChip(deals[idx].status);
                    return <StatusChip $tone={tone}>{label}</StatusChip>;
                  })()}
                </MetaPiece>
              )}
            </MetaRow>
          </Body>
        </Item>
      </AuctionRealtimeProvider>
    );
  });

  return <List>{items}</List>;
}
