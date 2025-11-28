'use server';

import { getAuthUser } from '@/lib/auth/getAuthUser';
import { PlaceBidFormSchema, type PlaceBidFormState } from '@/services/zodValidation-service';
import { isNextRedirectError } from '@/lib/utils/isNextRedirectError';
import { prisma } from '@/lib/db';
import { getAuction, updateAuctionBid } from '@/data-access/auctions';
import { createBid } from '@/data-access/bids';
import { pusherServer } from '@/lib/realtime/pusher-server';

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
      const auction = await getAuction(auctionId, tx);
      const now = new Date();

      if (!auction) {
        return {
          kind: 'error',
          state: {
            message: 'Auction not found.',
            values: { amount },
          },
        };
      }
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

      const minAllowedBidMinor = auction.currentPriceMinor + auction.minIncrementMinor;
      const bidAmountMinor = toMinor(amount);

      if (bidAmountMinor < minAllowedBidMinor) {
        return {
          kind: 'error',
          state: {
            errors: {
              amount: [`Your bid must be at least ${(minAllowedBidMinor / 100).toFixed(0)} ${auction.currency}.`],
            },
            values: { amount },
          },
        };
      }

      await createBid(auction.id, user.id, bidAmountMinor, tx);

      const FIVE_MINUTES_MS = 5 * 60 * 1000;
      const timeRemaining = auction.endAt.getTime() - now.getTime();
      let newEndAt: Date | undefined = undefined;

      if (timeRemaining < FIVE_MINUTES_MS) {
        newEndAt = new Date(now.getTime() + FIVE_MINUTES_MS);
      }

      const dataToUpdate = {
        id: auction.id,
        version: auction.version,
        currentPriceMinor: bidAmountMinor,
        highestBidderId: user.id,
        endAt: newEndAt ? newEndAt : auction.endAt,
      };

      const updateResult = await updateAuctionBid(dataToUpdate, tx);

      if (updateResult.count === 0) {
        return {
          kind: 'error',
          state: {
            message: 'Someone placed a bid just before you. Please try again with a higher amount.',
            values: { amount },
          },
        };
      }

      return {
        kind: 'success',
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

      await pusherServer.trigger(`auction-${id}`, 'bid-placed', {
        pusherCurrentPriceMinor: currentPriceMinor,
        pusherHighestBidderId: highestBidderId,
        pusherEndAt: endAt,
        pusherBidsCount: _count.bids + 1,
      });
    }
  } catch (err) {
    if (isNextRedirectError(err)) throw err;

    console.error('APP/ACTIONS/PLACE_BID:', err);

    return {
      message: 'Server error. Please try again.',
      values: { amount },
    };
  }
}
