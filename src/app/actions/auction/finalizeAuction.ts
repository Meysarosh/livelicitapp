'use server';

import { getAuctionWithDeal, updateAuction } from '@/data-access/auctions';
import { updateConversation, upsertConversation } from '@/data-access/conversations';
import { createDeal } from '@/data-access/deals';
import { createMessage } from '@/data-access/messages';
import { emitConversationUpdatedForUsers, emitNewMessageEvent } from '@/lib/realtime/conversations-events';
import { broadcastDealUpdated } from '@/lib/realtime/deals-events';
import { type Prisma, Deal, DealStatus } from '@prisma/client';

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

  const message = await createMessage(messageData, tx);

  const updatedConversation = await updateConversation(
    conversation.id,
    {
      lastMessageAt: new Date(),
      unreadCountA: conversation.unreadCountA + 1,
      unreadCountB: conversation.unreadCountB + 1,
    },
    tx
  );

  try {
    await broadcastDealUpdated(deal as Deal);

    await emitNewMessageEvent({
      conversationId: conversation.id,
      message: {
        id: message.id,
        body: message.body,
        kind: message.kind,
        senderId: message.senderId,
        createdAt: message.createdAt,
      },
    });

    await emitConversationUpdatedForUsers({
      conversationId: updatedConversation.id,
      userAId: updatedConversation.userAId,
      userBId: updatedConversation.userBId,
    });
  } catch (pusherErr) {
    console.error('Error broadcasting deal updated (paid):', pusherErr);
  }

  return deal;
}
