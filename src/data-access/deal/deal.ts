import 'server-only';
import type { Deal, PrismaClient, Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import {
  dealForListArgs,
  dealForStatusActionArgs,
  type DealForList,
  type DealForStatusAction,
} from '@/data-access/deal/deal.types';

type DbClient = PrismaClient | Prisma.TransactionClient;

// CREATE DEAL
export async function createDeal(
  data: Omit<
    Deal,
    | 'id'
    | 'paidAt'
    | 'paidAmountMinor'
    | 'shippedAt'
    | 'shippingCompany'
    | 'trackingNumber'
    | 'receivedAt'
    | 'disputeReason'
    | 'closedAt'
    | 'createdAt'
    | 'updatedAt'
  >,
  tx: DbClient = prisma,
): Promise<Deal> {
  return await tx.deal.create({
    data,
  });
}

// READ DEALS

export async function getDealForStatusAction(
  dealId: string,
  tx: DbClient = prisma,
): Promise<DealForStatusAction | null> {
  return tx.deal.findUnique({
    where: { id: dealId },
    ...dealForStatusActionArgs,
  });
}

// GET DEALS AS SELLER AND BUYER

export async function getDealsAsSeller(userId: string): Promise<DealForList[]> {
  return prisma.deal.findMany({
    where: {
      sellerId: userId,
    },
    ...dealForListArgs,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getDealsAsBuyer(userId: string): Promise<DealForList[]> {
  return prisma.deal.findMany({
    where: {
      buyerId: userId,
    },
    ...dealForListArgs,
    orderBy: { createdAt: 'desc' },
  });
}

// UPDATE DEAL
export async function updateDeal(
  dealId: string,
  data: Prisma.DealUpdateInput,
  tx: DbClient = prisma,
) {
  return tx.deal.update({
    where: { id: dealId },
    data,
  });
}
