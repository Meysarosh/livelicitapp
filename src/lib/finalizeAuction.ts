import type { Prisma } from '@prisma/client';

export async function finalizeAuction(transaction: Prisma.TransactionClient, auctionId: string) {
  // Re-fetch inside the transaction for safety
  const auction = await transaction.auction.findUnique({
    where: { id: auctionId },
    include: { deal: true },
  });

  if (!auction) return null;

  if (auction.status !== 'ACTIVE') {
    return auction.deal;
  }

  await transaction.auction.update({
    where: { id: auction.id },
    data: {
      status: 'ENDED',
    },
  });

  if (!auction.highestBidderId) {
    return null;
  }

  if (auction.deal) {
    return auction.deal;
  }

  const sellerId = auction.ownerId;
  const buyerId = auction.highestBidderId;

  const deal = await transaction.deal.create({
    data: {
      auctionId: auction.id,
      sellerId,
      buyerId,
      status: 'AWAITING_PAYMENT',
      paidAmountMinor: null,
      currency: auction.currency,
    },
  });

  let conversation = await transaction.conversation.findFirst({
    where: {
      auctionId: auction.id,
      OR: [
        { userAId: sellerId, userBId: buyerId },
        { userAId: buyerId, userBId: sellerId },
      ],
    },
  });

  if (!conversation) {
    conversation = await transaction.conversation.create({
      data: {
        auctionId: auction.id,
        userAId: sellerId,
        userBId: buyerId,
      },
    });
  }

  // System message about the deal
  await transaction.message.create({
    data: {
      conversationId: conversation.id,
      senderId: null,
      kind: 'SYSTEM',
      body: `Auction "${auction.title}" has ended and a deal has been created.`,
    },
  });

  return deal;
}
