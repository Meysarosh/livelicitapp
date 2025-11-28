'use client';

import type { ReactNode } from 'react';
import {
  Wrapper,
  LeftColumn,
  RightColumn,
  ImagesWrapper,
  MainImageBox,
  ThumbImageBox,
  DescriptionBox,
  Panel,
  PriceRow,
  PriceLabel,
  PriceValue,
} from './AuctionDetailsView.styles';
import { ImageWithSkeleton, Title, SubTitle } from '@/components/ui';
import { LivePrice } from './LivePrice';
import { LiveCountdown } from './LiveCountDown';
import { LiveBidsCount } from './LiveBidsCount';
import { AuctionWithImages } from '@/data-access/auctions';
import { AuctionRealtimeProvider } from './AuctionRealtimeProvider';

interface AuctionDetailsViewProps {
  auction: AuctionWithImages;
  actions?: ReactNode;
  metadata?: ReactNode;
  watchlistButton?: ReactNode;
}

export function AuctionDetailsView({ auction, actions, metadata, watchlistButton }: AuctionDetailsViewProps) {
  const mainImage = auction.images[0];
  const otherImages = auction.images.slice(1);

  const formatPrice = (minor: number) => `${(minor / 100).toFixed(0)} ${auction.currency}`;

  const formatDateTime = (d: Date | null | undefined) =>
    d
      ? new Intl.DateTimeFormat('hu-HU', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }).format(d)
      : '—';

  return (
    <AuctionRealtimeProvider auction={auction}>
      <Wrapper>
        <LeftColumn>
          <Title>{auction.title}</Title>

          <ImagesWrapper>
            <MainImageBox>
              <ImageWithSkeleton src={mainImage ? mainImage.url : undefined} alt={auction.title} />
            </MainImageBox>

            {otherImages.map((img) => (
              <ThumbImageBox key={img.id}>
                <ImageWithSkeleton src={img.url} alt={auction.title} />
              </ThumbImageBox>
            ))}
          </ImagesWrapper>

          <DescriptionBox>
            <div style={{ whiteSpace: 'pre-wrap' }}>{auction.description}</div>
          </DescriptionBox>
        </LeftColumn>

        <RightColumn>
          {metadata}
          {watchlistButton}
          <Panel>
            <PriceRow>
              <PriceLabel>Current price</PriceLabel>
              <PriceValue>
                <LivePrice />
              </PriceValue>
            </PriceRow>
            <PriceRow>
              <PriceLabel>Min. increment</PriceLabel>
              <PriceValue>{formatPrice(auction.minIncrementMinor)}</PriceValue>
            </PriceRow>
            <PriceRow>
              <PriceLabel>Bids</PriceLabel>
              <PriceValue>
                <LiveBidsCount />
              </PriceValue>
            </PriceRow>
            <PriceRow>
              <PriceLabel>Watchlisted</PriceLabel>
              <PriceValue>{auction._count.watchlistedBy}</PriceValue>
            </PriceRow>
            <PriceRow>
              <PriceLabel>Starts at</PriceLabel>
              <PriceValue>{formatDateTime(auction.startAt ?? null)}</PriceValue>
            </PriceRow>
            <PriceRow>
              <PriceLabel>Ends at</PriceLabel>
              <PriceValue>{formatDateTime(auction.endAt ?? null)}</PriceValue>
            </PriceRow>
            <PriceRow>
              <PriceLabel>Time left</PriceLabel>
              <PriceValue>
                <LiveCountdown />
              </PriceValue>
            </PriceRow>
          </Panel>

          <Panel>
            <SubTitle>Actions</SubTitle>
            {actions}
          </Panel>
        </RightColumn>
      </Wrapper>
    </AuctionRealtimeProvider>
  );
}
