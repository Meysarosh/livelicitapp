import { prisma } from '@/lib/db';
import { PlaceBidFormState } from '@/services/zodValidation-service';

type TransactionResult = { kind: 'error'; state: PlaceBidFormState } | { kind: 'success'; auctionId: string };

export async function createBid({
  auctionId,
  user,
  amount,
}: {
  auctionId: string;
  user: { id: string };
  amount: string;
}): Promise<TransactionResult> {
  return await prisma.$transaction(async (tx) => {
    const auction = await tx.auction.findUnique({
      where: { id: auctionId },
      include: { bids: false },
    });

    if (!auction) {
      return {
        kind: 'error',
        state: {
          message: 'Auction not found.',
          values: { amount },
        },
      };
    }

    const now = new Date();
    if (auction.status === 'CANCELLED') {
      return {
        kind: 'error',
        state: { message: 'This auction has been cancelled.', values: { amount } },
      };
    }
    if (!auction.startAt || !auction.endAt || now < auction.startAt) {
      return {
        kind: 'error',
        state: { message: 'This auction has not started yet.', values: { amount } },
      };
    }
    if (now >= auction.endAt) {
      return {
        kind: 'error',
        state: { message: 'This auction has already ended.', values: { amount } },
      };
    }

    if (auction.ownerId === user!.id) {
      return {
        kind: 'error',
        state: { message: 'You cannot bid on your own auction.', values: { amount } },
      };
    }

    const minAllowed = auction.currentPriceMinor + auction.minIncrementMinor;
    const toMinor = (v: string) => Math.round(Number(v) * 100);
    const bidAmountMinor = toMinor(amount);

    if (bidAmountMinor < minAllowed) {
      return {
        kind: 'error',
        state: {
          errors: {
            amount: [`Your bid must be at least ${(minAllowed / 100).toFixed(0)} ${auction.currency}.`],
          },
          values: { amount },
        },
      };
    }

    await tx.bid.create({
      data: {
        auctionId: auction.id,
        userId: user!.id,
        amountMinor: bidAmountMinor,
      },
    });

    const updateResult = await tx.auction.updateMany({
      where: {
        id: auction.id,
        version: auction.version,
      },
      data: {
        currentPriceMinor: bidAmountMinor,
        highestBidderId: user!.id,
        version: { increment: 1 },
      },
    });

    if (updateResult.count === 0) {
      return {
        kind: 'error',
        state: {
          message: 'Someone placed a bid just before you. Please try again with a higher amount.',
          values: { amount },
        },
      };
    }

    return { kind: 'success', auctionId: auction.id };
  });
}
