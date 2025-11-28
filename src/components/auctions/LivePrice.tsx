'use client';

import { useAuctionRealtime } from './AuctionRealtimeProvider';
import { formatPrice } from '@/services/format-service';
import styled, { keyframes } from 'styled-components';

// 1. Define the yellow flash animation
const flashAnimation = keyframes`
  0% { background-color: #fef08a; }
  100% { background-color: transparent; }
`;

// 2. Create a styled component that uses it
const PriceContainer = styled.span`
  border-radius: 4px;
  padding: 0 2px;
  /* The animation runs once every time this element mounts */
  animation: ${flashAnimation} 1s ease-out;
  display: inline-block; /* Ensures transform/animations render correctly */
`;

export function LivePrice() {
  const { currentPriceMinor, currency } = useAuctionRealtime();

  return (
    /* 3. The 'key={price}' tells React: "If price changes, this is a NEW element".
          This forces the component to remount, instantly restarting the CSS animation.
    */
    <PriceContainer key={currentPriceMinor}>{formatPrice(currentPriceMinor, currency)}</PriceContainer>
  );
}
