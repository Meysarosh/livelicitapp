'use server';

import { getAuthUser } from '@/lib/auth/getAuthUser';
import { PlaceBidFormSchema, type PlaceBidFormState } from '@/services/zodValidation-service';
import { isNextRedirectError } from '@/lib/utils/isNextRedirectError';
import { redirect } from 'next/navigation';
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
    const transactionResult = await createBid({ auctionId, user, amount });
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
