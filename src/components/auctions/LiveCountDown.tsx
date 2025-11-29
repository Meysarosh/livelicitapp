'use client';

import { useAuctionRealtime } from './AuctionRealtimeProvider';
import { useState, useEffect } from 'react';

function formatTime(diff: number) {
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  const dDisplay = days > 0 ? `${days}d ` : '';
  const hDisplay = hours > 0 ? `${hours}h ` : '';
  const mDisplay = minutes > 9 ? `${minutes}m ` : `0${minutes}m `;
  const sDisplay = seconds > 9 ? `${seconds}s` : `0${seconds}s`;

  return `${dDisplay}${hDisplay}${mDisplay}${sDisplay}`;
}

export function LiveCountdown() {
  const { endAt } = useAuctionRealtime();
  const [timeLeft, setTimeLeft] = useState(() => {
    const now = new Date();
    const diff = endAt.getTime() - now.getTime();
    return formatTime(diff);
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = endAt.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('Ended');
        clearInterval(interval);
        return;
      }

      const formattedTime = formatTime(diff);

      setTimeLeft(formattedTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [endAt]);

  return <span>{timeLeft}</span>;
}
