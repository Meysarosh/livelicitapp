'use server';

import { getAuthUser } from '@/lib/auth/getAuthUser';
import { PlaceBidFormSchema, type PlaceBidFormState } from '@/services/zodValidation-service';
import { isNextRedirectError } from '@/lib/utils/isNextRedirectError';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getAuction, updateAuctionBid } from '@/data-access/auctions';
import { createBid } from '@/data-access/bids';

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

  try {
    const transactionResult = await prisma.$transaction(async (tx) => {
      const auction = await getAuction(auctionId, tx);

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

      await createBid(auction.id, user.id, bidAmountMinor, tx);

      const updateResult = await updateAuctionBid(auction.id, auction.version, bidAmountMinor, user.id, tx);

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
    if (transactionResult.kind === 'error') {
      return transactionResult.state;
    }

    if (transactionResult.kind === 'success') {
      redirect(`/auctions/${transactionResult.auctionId}`);
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
