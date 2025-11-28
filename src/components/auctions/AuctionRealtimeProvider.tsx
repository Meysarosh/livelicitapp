'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getPusherClient } from '@/lib/realtime/pusher-client';
import { AuctionForLists } from '@/data-access/auctions';

type AuctionContextType = {
  currentPriceMinor: number;
  endAt: Date;
  highestBidderId: string | null;
  currency: string;
  bidsCount: number;
};

const AuctionContext = createContext<AuctionContextType | null>(null);

export function useAuctionRealtime() {
  const context = useContext(AuctionContext);
  if (!context) {
    throw new Error('useAuctionRealtime must be used within an AuctionRealtimeProvider');
  }
  return context;
}

type ProviderProps = {
  auction: AuctionForLists;
  children: React.ReactNode;
};

export function AuctionRealtimeProvider({ auction, children }: ProviderProps) {
  const [currentPriceMinor, setCurrentPriceMinor] = useState(auction.currentPriceMinor);
  const [endAt, setEndAt] = useState(new Date(auction.endAt));
  const [highestBidderId, setHighestBidderId] = useState<string | null>(auction.highestBidderId);
  const [bidsCount, setBidsCount] = useState(auction._count.bids);

  useEffect(() => {
    const pusherClient = getPusherClient();
    const channel = pusherClient.subscribe(`auction-${auction.id}`);

    channel.bind(
      'bid-placed',
      (data: {
        pusherCurrentPriceMinor: number;
        pusherEndAt: string;
        pusherHighestBidderId: string;
        pusherBidsCount: number;
      }) => {
        setCurrentPriceMinor(data.pusherCurrentPriceMinor);
        setHighestBidderId(data.pusherHighestBidderId);
        setEndAt(new Date(data.pusherEndAt));
        setBidsCount(data.pusherBidsCount);
      }
    );

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(`auction-${auction.id}`);
    };
  }, [auction]);

  return (
    <AuctionContext.Provider
      value={{
        currentPriceMinor,
        endAt,
        highestBidderId,
        currency: auction.currency,
        bidsCount,
      }}
    >
      {children}
    </AuctionContext.Provider>
  );
}
