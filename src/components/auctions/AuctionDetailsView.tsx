'use client';

import type { ReactNode } from 'react';
import type { Auction, AuctionImage } from '@prisma/client';
import {
  Wrapper,
  LeftColumn,
  RightColumn,
  Title,
  ImagesWrapper,
  MainImageBox,
  ThumbImageBox,
  DescriptionBox,
  Panel,
  PriceRow,
  PriceLabel,
  PriceValue,
  ActionsTitle,
} from './AuctionDetailsView.styles';
import Image from 'next/image';

type AuctionWithImages = Auction & { images: AuctionImage[] };

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
    <Wrapper>
      <LeftColumn>
        <Title>{auction.title}</Title>

        <ImagesWrapper>
          <MainImageBox>
            {mainImage ? (
              <Image
                src={mainImage.url}
                alt={auction.title}
                width={600}
                height={400}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ padding: 12, fontSize: 13, color: '#9ca3af' }}>No image</div>
            )}
          </MainImageBox>

          {otherImages.map((img) => (
            <ThumbImageBox key={img.id}>
              <Image
                src={img.url}
                alt={auction.title}
                width={160}
                height={160}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
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
            <PriceValue>{formatPrice(auction.currentPriceMinor)}</PriceValue>
          </PriceRow>
          <PriceRow>
            <PriceLabel>Min. increment</PriceLabel>
            <PriceValue>{formatPrice(auction.minIncrementMinor)}</PriceValue>
          </PriceRow>
          <PriceRow>
            <PriceLabel>Starts at</PriceLabel>
            <PriceValue>{formatDateTime(auction.startAt ?? null)}</PriceValue>
          </PriceRow>
          <PriceRow>
            <PriceLabel>Ends at</PriceLabel>
            <PriceValue>{formatDateTime(auction.endAt ?? null)}</PriceValue>
          </PriceRow>
        </Panel>

        <Panel>
          <ActionsTitle>Actions</ActionsTitle>
          {actions}
        </Panel>
      </RightColumn>
    </Wrapper>
  );
}
