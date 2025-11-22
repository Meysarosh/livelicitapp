// src/components/auctions/AuctionsList.tsx
'use client';

import Link from 'next/link';
import styled from 'styled-components';
import type { AuctionListItemVM } from './types';
import { ImageWithSkeleton } from '../global/ImageWithSkeleton';

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const Item = styled.li`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  &:not(:last-child) {
    margin-bottom: 8px;
  }
`;

const Thumb = styled.div`
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.05);
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const Title = styled.div`
  font-size: 14px;
  font-weight: 600;
`;

const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 12px;
  opacity: 0.85;
`;

const MetaPiece = styled.span`
  strong {
    font-weight: 600;
    margin-right: 4px;
  }
`;

type Props = {
  items: AuctionListItemVM[];
  emptyMessage?: string;
};

export function AuctionsList({ items, emptyMessage = 'No auctions found.' }: Props) {
  if (items.length === 0) {
    return <p>{emptyMessage}</p>;
  }

  return (
    <List>
      {items.map((item) => (
        <Item key={item.id}>
          <Link href={`/auctions/${item.id}`}>
            <Thumb>
              <ImageWithSkeleton src={item.imageUrl} alt={item.title} />
            </Thumb>
          </Link>

          <Body>
            <Link href={`/auctions/${item.id}`}>
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
