import { getAuctionWithDeal, updateAuction } from '@/data-access/auctions';
import { upsertConversation } from '@/data-access/conversations';
import { createDeal } from '@/data-access/deals';
import { createMessage } from '@/data-access/messages';
import { type Prisma, DealStatus } from '@prisma/client';

export async function finalizeAuction(tx: Prisma.TransactionClient, auctionId: string) {
  const auction = await getAuctionWithDeal(auctionId, tx);

  if (!auction) return null;

  if (auction.status !== 'ACTIVE') {
    return auction.deal;
  }

  await updateAuction(auction.id, { status: 'ENDED' }, tx);

  if (!auction.highestBidderId) {
    return null;
  }

  if (auction.deal) {
    return auction.deal;
  }

  const sellerId = auction.ownerId;
  const buyerId = auction.highestBidderId;
  const dealData = {
    auctionId: auction.id,
    sellerId,
    buyerId,
    status: DealStatus.AWAITING_PAYMENT,
    currency: auction.currency,
  };

  const deal = await createDeal(dealData, tx);
  const conversation = await upsertConversation(auction.id, sellerId, buyerId, tx);

  const messageData = {
    conversationId: conversation.id,
    senderId: null,
    kind: 'SYSTEM' as const,
    body: `Auction "${auction.title}" has ended and a deal has been created.`,
  };

  await createMessage(messageData, tx);

  return deal;
}
