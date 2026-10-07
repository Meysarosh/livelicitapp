import {
  EffectiveAuctionStatus,
  getEffectiveAuctionStatus,
} from '@/services/auctionStatus-service';
import { MetaRow, Badge } from './AuctionMetaData.styles';
import type { AuctionDetails } from '@/data-access/auction/auction.types';

interface AuctionMetaDataProps {
  auction: Pick<AuctionDetails, 'status' | 'startAt' | 'endAt' | 'owner'>;
}

export function AuctionMetaData({ auction }: AuctionMetaDataProps) {
  const effectiveStatus: EffectiveAuctionStatus = getEffectiveAuctionStatus(auction);
  const statusTone =
    effectiveStatus === 'LIVE' ? 'success' : effectiveStatus === 'CANCELLED' ? 'danger' : 'neutral';

  return (
    <MetaRow>
      <Badge $tone={statusTone}>{effectiveStatus}</Badge>
      <span>Seller: {auction.owner.nickname}</span>
      <span>
        Rating: {auction.owner.ratingCount > 0 ? auction.owner.ratingAvg.toFixed(1) : '—'} (
        {auction.owner.ratingCount})
      </span>
    </MetaRow>
  );
}
