'use client';

import { useAuctionRealtime } from './AuctionRealtimeProvider';
import { formatPrice } from '@/services/format-service';
import styled, { keyframes } from 'styled-components';

const flashAnimation = keyframes`
  0% { background-color: #fef08a; }
  100% { background-color: transparent; }
`;

const PriceContainer = styled.span`
  border-radius: 4px;
  padding: 0 2px;
  animation: ${flashAnimation} 1s ease-out;
  display: inline-block;
`;

export function LivePrice() {
  const { currentPriceMinor, currency } = useAuctionRealtime();

  return <PriceContainer key={currentPriceMinor}>{formatPrice(currentPriceMinor, currency)}</PriceContainer>;
}
