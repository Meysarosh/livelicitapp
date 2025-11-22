'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import {
  CreateAuctionFormSchema,
  durationDayOptions,
  type CreateAuctionFormState,
} from '@/lib/formValidation/validation';
import { isNextRedirectError } from '@/lib/utils/isNextRedirectError';
import { redirect } from 'next/navigation';

export async function createAuction(
  _prevState: CreateAuctionFormState,
  formData: FormData
): Promise<CreateAuctionFormState> {
  const session = await auth();
  const user = session?.user;
  if (!user) {
    redirect('/login');
  }

  const raw = {
    title: formData.get('title'),
    description: formData.get('description'),
    startingPrice: formData.get('startingPrice'),
    minIncrement: formData.get('minIncrement'),
    durationDays: formData.get('durationDays') ?? '7',
    currency: formData.get('currency') ?? 'HUF',
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
        // imageUrls: fieldErrors.imageUrls,
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

  const {
    title,
    description,
    startingPrice,
    minIncrement,
    durationDays,
    currency,
    startMode,
    startAt: startAtRaw,
    imageUrls,
  } = parsed.data;

  const toMinor = (v: string) => Math.round(Number(v) * 100);
  const startPriceMinor = toMinor(startingPrice);
  const minIncrementMinor = toMinor(minIncrement);

  const now = new Date(Date.now());
  let startAt: Date;

  if (startMode === 'future' && startAtRaw) {
    startAt = new Date(startAtRaw);
  } else {
    startAt = now;
  }

  let durationMs: number;
  if (durationDays === 'test') {
    // 1 minute duration for testing/demo
    durationMs = 1 * 60 * 1000;
  } else {
    const days = Number(durationDays) || 7;
    durationMs = days * 24 * 60 * 60 * 1000;
  }
  const endAt = new Date(startAt.getTime() + durationMs);

  //TODO update after implementation of image uploading
  const parsedImageUrls = (imageUrls ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  console.log('BEFORE PRISMA`S CREATE');
  try {
    await prisma.auction.create({
      data: {
        ownerId: user.id,
        title,
        description,
        startPriceMinor,
        minIncrementMinor,
        currentPriceMinor: startPriceMinor,
        currency,
        status: 'ACTIVE',
        startAt,
        endAt,
        images: parsedImageUrls.length
          ? {
              create: parsedImageUrls.map((url, index) => ({
                url,
                position: index,
              })),
            }
          : undefined,
      },
    });
  } catch (err) {
    console.error('APP/ACTIONS/CREATE_AUCTION:', err);
    if (isNextRedirectError(err)) throw err;

    return {
      message: 'Server error. Please try again.',
      values: {
        title,
        description,
        startingPrice,
        minIncrement,
        durationDays,
        currency,
        startMode,
        startAt: startAtRaw,
        imageUrls: imageUrls ?? '',
      },
    };
  }

  redirect('/account/auctions');
}
