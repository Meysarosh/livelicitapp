'use client';

import type { ReactNode } from 'react';
import type { Auction, AuctionImage, User } from '@prisma/client';
import {
  Wrapper,
  LeftColumn,
  RightColumn,
  Title,
  ImagesWrapper,
  MainImageBox,
  ThumbImageBox,
  DescriptionBox,
  MetaRow,
  Badge,
  Panel,
  PriceRow,
  PriceLabel,
  PriceValue,
  ActionsTitle,
  Small,
} from './AuctionDetailsView.styles';
import Image from 'next/image';
import { getEffectiveAuctionStatus, type EffectiveAuctionStatus } from '@/lib/auctionStatus';

type AuctionWithImages = Auction & { images: AuctionImage[] };
type OwnerLite = Pick<User, 'id' | 'nickname' | 'ratingAvg' | 'ratingCount'>;

interface AuctionDetailsViewProps {
  auction: AuctionWithImages;
  owner: OwnerLite;
  currentUserId?: string;
  actions?: ReactNode;
}

export function AuctionDetailsView({ auction, owner, currentUserId, actions }: AuctionDetailsViewProps) {
  const effectiveStatus: EffectiveAuctionStatus = getEffectiveAuctionStatus(auction);
  const isOwner = currentUserId === owner.id;

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

  const statusTone = effectiveStatus === 'LIVE' ? 'success' : effectiveStatus === 'CANCELLED' ? 'danger' : 'neutral';

  return (
    <Wrapper>
      <LeftColumn>
        <Title>{auction.title}</Title>

        <MetaRow>
          <Badge $tone={statusTone}>{effectiveStatus}</Badge>
          <span>Seller: {owner.nickname}</span>
          <span>
            Rating: {owner.ratingCount > 0 ? owner.ratingAvg.toFixed(1) : '—'} ({owner.ratingCount})
          </span>
        </MetaRow>

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
          {isOwner && <Small>You are the owner of this auction.</Small>}
          {!isOwner && !actions && <Small>No actions available for this auction.</Small>}
          {actions}
        </Panel>
      </RightColumn>
    </Wrapper>
  );
}
