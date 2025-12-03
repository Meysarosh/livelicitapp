'use server';

import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth/getAuthUser';
import { createAuction as createAuctionInDb } from '@/data-access/auctions';
import {
  CreateAuctionFormSchema,
  durationDayOptions,
  type CreateAuctionFormState,
} from '@/services/zodValidation-service';
import { DEFAULT_CURRENCY, MAX_FILE_SIZE, MAX_IMAGES } from '@/lib/constants';
import { isNextRedirectError } from '@/lib/utils/isNextRedirectError';
import { validateImageFile } from '@/lib/utils/validateImageFile';
import { AuctionStatus } from '@prisma/client';
import { put } from '@vercel/blob';

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
  };

  const imageFiles = formData.getAll('images').filter((v): v is File => v instanceof File && v.size > 0);

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
      },
    };
  }

  if (imageFiles.length > MAX_IMAGES) {
    return {
      errors: {
        imageUrls: [`You can upload at most ${MAX_IMAGES} images.`],
      },
      values: {
        ...parsed.data,
        imageUrls: '',
      },
    };
  }

  const tooBig = imageFiles.find((file) => file.size > MAX_FILE_SIZE);
  if (tooBig) {
    return {
      errors: {
        imageUrls: [`Each image must be at most 5 MB.`],
      },
      values: {
        ...parsed.data,
        imageUrls: '',
      },
    };
  }

  // Validate image file types and content
  for (const file of imageFiles) {
    const validation = await validateImageFile(file);
    if (!validation.valid) {
      return {
        errors: {
          imageUrls: [validation.error || 'Invalid image file.'],
        },
        values: {
          ...parsed.data,
          imageUrls: '',
        },
      };
    }
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

  const imageCreates: { url: string; position: number }[] = [];

  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i];
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');

    try {
      const blob = await put(`auctions/${user.id}/${crypto.randomUUID()}-${safeName}`, file, {
        access: 'public',
      });

      imageCreates.push({
        url: blob.url,
        position: i,
      });
    } catch (err) {
      console.error('Error uploading image file:', err);
      return {
        message: `Failed to upload image "${file.name}". Please try again.`,
        values: {
          ...parsed.data,
          imageUrls: parsed.data.imageUrls ?? '',
        },
      };
    }
  }

  const data = {
    ownerId: user.id,
    title,
    description,
    startPriceMinor,
    minIncrementMinor,
    currentPriceMinor: startPriceMinor,
    currency,
    status: 'ACTIVE' as AuctionStatus,
    startAt,
    endAt,
    images: imageCreates.length
      ? {
          create: imageCreates,
        }
      : undefined,
  };

  try {
    await createAuctionInDb(data);
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
