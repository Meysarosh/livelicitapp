'use server';

import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth/getAuthUser';
import { getAuctionById, updateAuctionWithImages } from '@/data-access/auctions';
import {
  CreateAuctionFormSchema,
  durationDayOptions,
  type CreateAuctionFormState,
} from '@/services/zodValidation-service';
import { DEFAULT_CURRENCY, MAX_IMAGES, MAX_FILE_SIZE } from '@/lib/constants';

import { Prisma } from '@prisma/client';
import { put } from '@vercel/blob';
import { prisma } from '@/lib/db';
import { validateImageFile } from '@/services/validateImageFile';
import {
  deleteAuctionImagesByIds,
  getAuctionImagesByAuctionId,
  updateAuctionImagePosition,
} from '@/data-access/auctionImage';

export async function updateAuction(
  auctionId: string,
  _prevState: CreateAuctionFormState,
  formData: FormData
): Promise<CreateAuctionFormState> {
  const user = await getAuthUser();
  if (!user) {
    return {
      message: 'You must be signed in to edit an auction.',
    };
  }

  const auction = await getAuctionById(auctionId);

  if (!auction) {
    return {
      message: 'Auction not found.',
    };
  }

  if (auction.ownerId !== user.id) {
    return {
      message: 'You can only edit your own auctions.',
    };
  }

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
  const imagesMetaRaw = formData.get('imagesMeta');
  let meta: { existingOrder: string[]; deletedIds: string[] } | null = null;

  if (typeof imagesMetaRaw === 'string' && imagesMetaRaw.trim() !== '') {
    try {
      meta = JSON.parse(imagesMetaRaw);
    } catch (err) {
      console.error('Invalid imagesMeta JSON:', err);
    }
  }

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
        imageUrls: fieldErrors.imageUrls,
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

  // Image validation for *new* images
  if (imageFiles.length > MAX_IMAGES) {
    return {
      errors: {
        imageUrls: [`You can upload at most ${MAX_IMAGES} images at once.`],
      },
      values: {
        ...parsed.data,
        imageUrls: parsed.data.imageUrls ?? '',
      },
    };
  }

  const tooBig = imageFiles.find((file) => file.size > MAX_FILE_SIZE);
  if (tooBig) {
    return {
      errors: {
        imageUrls: ['Each image must be at most 5 MB.'],
      },
      values: {
        ...parsed.data,
        imageUrls: parsed.data.imageUrls ?? '',
      },
    };
  }

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
    durationMs = 1 * 60 * 1000;
  } else {
    const days = Number(durationDays) || 7;
    durationMs = days * 24 * 60 * 60 * 1000;
  }
  const endAt = new Date(startAt.getTime() + durationMs);

  // Upload new images and append them after existing positions
  const imageCreates: { url: string; position: number }[] = [];

  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i];
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');

    try {
      const blob = await put(`auctions/${user.id}/${crypto.randomUUID()}-${safeName}`, file, { access: 'public' });

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

  const baseData: Prisma.AuctionUpdateInput = {
    title,
    description,
    startPriceMinor,
    minIncrementMinor,
    currentPriceMinor: startPriceMinor,
    currency,
    startAt,
    endAt,
  };
  try {
    await prisma.$transaction(async (tx) => {
      // 1) Load existing images
      const existingImages = await getAuctionImagesByAuctionId(auctionId, tx);

      let existingOrder: string[] = [];
      let deletedIds: string[] = [];

      if (meta) {
        const existingIdSet = new Set(existingImages.map((img) => img.id));

        const metaExistingOrder = (meta.existingOrder ?? []).filter((id) => existingIdSet.has(id));

        const metaDeleted = (meta.deletedIds ?? []).filter((id) => existingIdSet.has(id));

        const notMentioned = existingImages
          .map((img) => img.id)
          .filter((id) => !metaExistingOrder.includes(id) && !metaDeleted.includes(id));

        existingOrder = [...metaExistingOrder, ...notMentioned];
        deletedIds = metaDeleted;
      } else {
        existingOrder = existingImages.map((img) => img.id);
        deletedIds = [];
      }

      // 2) Delete images marked for deletion
      if (deletedIds.length > 0) {
        await deleteAuctionImagesByIds(auctionId, deletedIds, tx);
      }

      // 3) Re-apply positions for kept existing images
      for (let i = 0; i < existingOrder.length; i++) {
        await updateAuctionImagePosition(existingOrder[i], i, tx);
      }

      // 4) Append new images after kept existing ones
      const basePosition = existingOrder.length;
      const finalImageCreates = imageCreates.map((img, index) => ({
        url: img.url,
        position: basePosition + index,
      }));

      const dataWithImages: Prisma.AuctionUpdateInput = {
        ...baseData,
        images: finalImageCreates.length
          ? {
              create: finalImageCreates,
            }
          : undefined,
      };

      await updateAuctionWithImages(auctionId, dataWithImages, tx);
    });
  } catch (err) {
    console.error('APP/ACTIONS/UPDATE_AUCTION:', err);

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
