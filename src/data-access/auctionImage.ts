import { prisma } from '@/lib/db';
import { AuctionImage, Prisma, PrismaClient } from '@prisma/client';

type DbClient = PrismaClient | Prisma.TransactionClient;

export async function createImage(
  auctionId: string,
  url: string,
  pathname: string,
  tx: DbClient = prisma
): Promise<AuctionImage> {
  return tx.auctionImage.create({
    data: {
      auctionId,
      url,
      pathname,
    },
  });
}
