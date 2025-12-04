import { prisma } from '@/lib/db';
import { AuctionImage, Prisma, PrismaClient } from '@prisma/client';

type DbClient = PrismaClient | Prisma.TransactionClient;

//CREATE AUCTION IMAGE
export async function createImage(
  auctionId: string,
  url: string,
  pathname: string,
  position: number = 0,
  tx: DbClient = prisma
): Promise<AuctionImage> {
  return tx.auctionImage.create({
    data: {
      auctionId,
      url,
      pathname,
      position,
    },
  });
}

//GET AUCTION IMAGES BY AUCTION ID
export async function getAuctionImagesByAuctionId(auctionId: string, tx: DbClient = prisma): Promise<AuctionImage[]> {
  return tx.auctionImage.findMany({
    where: { auctionId },
    orderBy: { position: 'asc' },
  });
}

//UPDATE AUCTION IMAGE POSITION
export async function updateAuctionImagePosition(
  id: string,
  position: number,
  tx: DbClient = prisma
): Promise<AuctionImage> {
  return tx.auctionImage.update({
    where: { id },
    data: { position },
  });
}

//DELETE AUCTION IMAGES BY IDs
export async function deleteAuctionImagesByIds(
  auctionId: string,
  ids: string[],
  tx: DbClient = prisma
): Promise<Prisma.BatchPayload> {
  return tx.auctionImage.deleteMany({
    where: {
      auctionId,
      id: { in: ids },
    },
  });
}
