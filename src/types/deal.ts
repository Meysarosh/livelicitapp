import { Prisma } from '@prisma/client';
import { auctionForListArgs } from '@/types/auction';

export const dealForStatusActionArgs = Prisma.validator<Prisma.DealDefaultArgs>()({
  select: {
    id: true,
    status: true,
    auctionId: true,
    buyerId: true,
    sellerId: true,
    currency: true,
    auction: {
      select: {
        currentPriceMinor: true,
        currency: true,
      },
    },
  },
});

export type DealForStatusAction = Prisma.DealGetPayload<typeof dealForStatusActionArgs>;

export const dealForListArgs = Prisma.validator<Prisma.DealDefaultArgs>()({
  select: {
    auctionId: true,
    status: true,
    auction: {
      ...auctionForListArgs,
    },
  },
});

export type DealForList = Prisma.DealGetPayload<typeof dealForListArgs>;
