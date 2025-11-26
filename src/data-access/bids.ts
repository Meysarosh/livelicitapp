import { prisma } from '@/lib/db';
import { Prisma, PrismaClient } from '@prisma/client';

type DbClient = PrismaClient | Prisma.TransactionClient;

//CREATE BID

export async function createBid(auctionId: string, userId: string, amountMinor: number, tx: DbClient = prisma) {
  return await tx.bid.create({
    data: {
      auctionId,
      userId,
      amountMinor,
    },
  });
}
