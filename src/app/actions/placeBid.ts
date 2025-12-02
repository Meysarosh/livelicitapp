'use server';

import { getAuthUser } from '@/lib/auth/getAuthUser';
import { PlaceBidFormSchema, type PlaceBidFormState } from '@/services/zodValidation-service';
import { isNextRedirectError } from '@/lib/utils/isNextRedirectError';
import { prisma } from '@/lib/db';
import { getAuctionForBidTransaction, updateAuctionBid } from '@/data-access/auctions';
import { createBid } from '@/data-access/bids';
import { TIME_EXTEND_AFTER_BID } from '@/lib/constants';
import { emitBidPlaced } from '@/lib/realtime/auctions-events';

export async function placeBid(_prevState: PlaceBidFormState, formData: FormData): Promise<PlaceBidFormState> {
  const user = await getAuthUser();

  const raw = {
    auctionId: formData.get('auctionId'),
    amount: formData.get('amount'),
  };

  const parsed = PlaceBidFormSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      errors: {
        amount: fieldErrors.amount,
      },
      values: {
        amount: (raw.amount as string | null) ?? undefined,
      },
    };
  }

  const { auctionId, amount } = parsed.data;
  const toMinor = (v: string) => Math.round(Number(v) * 100);

  try {
    const transactionResult = await prisma.$transaction(async (tx) => {
      // Refresh auction data within transaction
      const auction = await getAuctionForBidTransaction(auctionId, tx);
      const now = new Date();

      if (!auction) {
        return {
          kind: 'error' as const,
          state: {
            message: 'Auction not found.',
            values: { amount },
          },
        };
      }
      if (auction.status === 'CANCELLED') {
        return {
          kind: 'error' as const,
          state: { message: 'This auction has been cancelled.', values: { amount } },
        };
      }
      if (!auction.startAt || !auction.endAt || now < auction.startAt) {
        return {
          kind: 'error' as const,
          state: { message: 'This auction has not started yet.', values: { amount } },
        };
      }
      if (now >= auction.endAt) {
        return {
          kind: 'error' as const,
          state: { message: 'This auction has already ended.', values: { amount } },
        };
      }
      if (auction.ownerId === user!.id) {
        return {
          kind: 'error' as const,
          state: { message: 'You cannot bid on your own auction.', values: { amount } },
        };
      }

      const minAllowedBidMinor = auction.currentPriceMinor + auction.minIncrementMinor;
      const bidAmountMinor = toMinor(amount);

      if (bidAmountMinor < minAllowedBidMinor) {
        return {
          kind: 'error' as const,
          state: {
            errors: {
              amount: [`Your bid must be at least ${(minAllowedBidMinor / 100).toFixed(0)} ${auction.currency}.`],
            },
            values: { amount },
          },
        };
      }

      await createBid(auction.id, user.id, bidAmountMinor, tx);

      const timeRemaining = auction.endAt.getTime() - now.getTime();
      let newEndAt = auction.endAt;

      if (timeRemaining < TIME_EXTEND_AFTER_BID) {
        newEndAt = new Date(now.getTime() + TIME_EXTEND_AFTER_BID);
      }

      const dataToUpdate = {
        id: auction.id,
        version: auction.version,
        currentPriceMinor: bidAmountMinor,
        highestBidderId: user.id,
        endAt: newEndAt,
      };

      const updateResult = await updateAuctionBid(dataToUpdate, tx);

      if (updateResult.count === 0) {
        return {
          kind: 'error' as const,
          state: {
            message: 'Someone placed a bid just before you. Please try again with a higher amount.',
            values: { amount },
          },
        };
      }

      return {
        kind: 'success' as const,
        data: {
          ...auction,
          currentPriceMinor: bidAmountMinor,
          highestBidderId: user.id,
          endAt: newEndAt ? newEndAt.toISOString() : auction.endAt.toISOString(),
        },
      };
    });

    if (transactionResult.kind === 'error') {
      return transactionResult.state;
    }

    if (transactionResult.kind === 'success') {
      const { id, currentPriceMinor, highestBidderId, endAt, _count } = transactionResult.data!;

      try {
        await emitBidPlaced({
          auctionId: id,
          currentPriceMinor,
          highestBidderId: highestBidderId!,
          endAtIso: endAt,
          bidsCount: _count.bids + 1,
        });
      } catch (pusherErr) {
        console.error('Pusher trigger failed:', pusherErr);
      }

      return {
        message: 'Bid placed successfully!',
        values: { amount },
      };
    }

    return {
      message: 'Unexpected error. Please try again.',
      values: { amount },
    };
  } catch (err) {
    if (isNextRedirectError(err)) throw err;

    console.error('APP/ACTIONS/PLACE_BID:', err);

    return {
      message: 'Server error. Please try again.',
      values: { amount },
    };
  }
}
