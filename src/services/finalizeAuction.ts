import { getAuctionWithDeal, updateAuction } from '@/data-access/auctions';
import { createConversation, getConversationByAuctionAndUsers } from '@/data-access/conversations';
import { createDeal } from '@/data-access/deals';
import { createMessage } from '@/data-access/messages';
import type { DealStatus, Prisma } from '@prisma/client';

export async function finalizeAuction(tx: Prisma.TransactionClient, auctionId: string) {
  // Re-fetch auction inside the transaction for safety
  const auction = await getAuctionWithDeal(auctionId, tx);

  if (!auction) return null;

  if (auction.status !== 'ACTIVE') {
    return auction.deal;
  }

  // Update auction status to ENDED
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
    status: 'AWAITING_PAYMENT' as DealStatus,
    currency: auction.currency,
  };

  // Create deal
  const deal = await createDeal(dealData, tx);

  // Check for existing conversation
  let conversation = await getConversationByAuctionAndUsers(auction.id, sellerId, buyerId, tx);

  if (!conversation) {
    //If no conversation exists, create one between buyer and seller
    conversation = await createConversation(
      {
        auctionId: auction.id,
        userAId: sellerId,
        userBId: buyerId,
      },
      tx
    );
  }

  const messageData = {
    conversationId: conversation.id,
    senderId: null,
    kind: 'SYSTEM' as const,
    body: `Auction "${auction.title}" has ended and a deal has been created.`,
  };

  // Create system message in the conversation
  await createMessage(messageData, tx);

  return deal;
}
