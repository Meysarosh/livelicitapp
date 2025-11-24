'use server';

import { requireUser } from '@/lib/auth/requireUser';
import { prisma } from '@/lib/db';
import { PlaceBidFormSchema, type PlaceBidFormState } from '@/lib/formValidation/validation';
import { isNextRedirectError } from '@/lib/utils/isNextRedirectError';
import { redirect } from 'next/navigation';

type TxResult = { kind: 'error'; state: PlaceBidFormState } | { kind: 'success'; auctionId: string };

export async function placeBid(_prevState: PlaceBidFormState, formData: FormData): Promise<PlaceBidFormState> {
  const user = await requireUser();

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
  const bidAmountMinor = toMinor(amount);

  try {
    const txResult: TxResult = await prisma.$transaction(async (tx) => {
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

      await tx.auction.update({
        where: { id: auction.id },
        data: {
          currentPriceMinor: bidAmountMinor,
          highestBidderId: user!.id,
        },
      });

      return { kind: 'success', auctionId: auction.id };
    });

    if (txResult.kind === 'error') {
      return txResult.state;
    }

    if (txResult.kind === 'success') {
      redirect(`/auctions/${txResult.auctionId}`);
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
