'use server';

import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth/getAuthUser';
import { createAuctionInDb } from '@/data-access/auctions';
import {
  CreateAuctionFormSchema,
  durationDayOptions,
  type CreateAuctionFormState,
} from '@/services/zodValidation-service';
import { DEFAULT_CURRENCY } from '@/lib/constants';
import { isNextRedirectError } from '@/lib/utils/isNextRedirectError';

export async function createAuction(
  _prevState: CreateAuctionFormState,
  formData: FormData
): Promise<CreateAuctionFormState> {
  const user = await getAuthUser();

  const raw = {
    title: formData.get('title'),
    description: formData.get('description'),
    startingPrice: formData.get('startingPrice'),
    minIncrement: formData.get('minIncrement'),
    durationDays: formData.get('durationDays') ?? '7',
    currency: formData.get('currency') ?? DEFAULT_CURRENCY,
    startMode: formData.get('startMode') ?? 'now',
    startAt: formData.get('startAt'),
    imageUrls: formData.get('imageUrls'),
  };

  const parsed = CreateAuctionFormSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    return {
      errors: {
        title: fieldErrors.title,
        description: fieldErrors.description,
        startingPrice: fieldErrors.startingPrice,
        minIncrement: fieldErrors.minIncrement,
        durationDays: fieldErrors.durationDays,
        currency: fieldErrors.currency,
        startMode: fieldErrors.startMode,
        startAt: fieldErrors.startAt,
      },
      values: {
        title: (raw.title as string | null) ?? undefined,
        description: (raw.description as string | null) ?? undefined,
        startingPrice: (raw.startingPrice as string | null) ?? undefined,
        minIncrement: (raw.minIncrement as string | null) ?? undefined,
        durationDays: (raw.durationDays as (typeof durationDayOptions)[number] | null) ?? undefined,
        currency: (raw.currency as string | null) ?? undefined,
        startMode: (raw.startMode as 'now' | 'future') ?? 'now',
        startAt: (raw.startAt as string | null) ?? undefined,
        imageUrls: (raw.imageUrls as string | null) ?? undefined,
      },
    };
  }

  try {
    await createAuctionInDb(parsed.data, user.id);
  } catch (err) {
    console.error('APP/ACTIONS/CREATE_AUCTION:', err);

    if (isNextRedirectError(err)) throw err;

    return {
      message: 'Server error. Please try again.',
      values: {
        ...parsed.data,
        imageUrls: parsed.data.imageUrls ?? '',
      },
    };
  }

  redirect('/account/auctions');
}
