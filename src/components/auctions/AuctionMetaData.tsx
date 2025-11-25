import { EffectiveAuctionStatus, getEffectiveAuctionStatus } from '@/services/auctionStatus-service';
import { MetaRow, Badge } from './AuctionMetaData.styles';
import { Auction } from '@prisma/client';
import { User } from '@prisma/client';

interface AuctionMetaDataProps {
  auction: Auction;
  owner: Pick<User, 'id' | 'nickname' | 'ratingAvg' | 'ratingCount'>;
}

export function AuctionMetaData({ auction, owner }: AuctionMetaDataProps) {
  const effectiveStatus: EffectiveAuctionStatus = getEffectiveAuctionStatus(auction);
  const statusTone = effectiveStatus === 'LIVE' ? 'success' : effectiveStatus === 'CANCELLED' ? 'danger' : 'neutral';
  return (
    <MetaRow>
      <Badge $tone={statusTone}>{effectiveStatus}</Badge>
      <span>Seller: {owner.nickname}</span>
      <span>
        Rating: {owner.ratingCount > 0 ? owner.ratingAvg.toFixed(1) : '—'} ({owner.ratingCount})
      </span>
    </MetaRow>
  );
}
