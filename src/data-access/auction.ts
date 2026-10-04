import 'server-only';
import { MIN_SEARCH_LENGTH } from '@/lib/constants';
import { prisma } from '@/lib/db';
import type { Prisma, PrismaClient } from '@prisma/client';
import {
  auctionBidTransactionArgs,
  auctionMetaDataArgs,
  auctionDetailsArgs,
  auctionToFinalazeArgs,
  auctionWithDealArgs,
  auctionForListArgs,
  type Auction,
  AuctionForBidTransaction,
  AuctionMetaData,
  AuctionDetails,
  AuctionToFinalaze,
  AuctionWithDeal,
  AuctionForList,
} from '@/types/auction';

type DbClient = PrismaClient | Prisma.TransactionClient;

//CREATE AUCTION
export async function createAuction(data: Prisma.AuctionCreateInput): Promise<Auction> {
  return await prisma.auction.create({
    data,
  });
}

//READ AUCTION

export async function getAuction(id: string, tx: DbClient = prisma): Promise<Auction | null> {
  return tx.auction.findUnique({
    where: { id },
  });
}

export async function getAuctionForBidTransaction(
  id: string,
  tx: DbClient = prisma,
): Promise<AuctionForBidTransaction | null> {
  return tx.auction.findUnique({
    where: { id },
    ...auctionBidTransactionArgs,
  });
}

export async function getAuctionMetaData(id: string): Promise<AuctionMetaData | null> {
  return prisma.auction.findUnique({
    where: { id },
    ...auctionMetaDataArgs,
  });
}

export async function getAuctionDetails(id: string): Promise<AuctionDetails | null> {
  return prisma.auction.findUnique({
    where: { id },
    ...auctionDetailsArgs,
  });
}

export async function getAuctionToFinalaze(
  id: string,
  tx: DbClient = prisma,
): Promise<AuctionToFinalaze | null> {
  return tx.auction.findUnique({
    where: { id },
    ...auctionToFinalazeArgs,
  });
}

export async function getAuctionWithDeal(
  id: string,
  tx: DbClient = prisma,
): Promise<AuctionWithDeal | null> {
  return tx.auction.findUnique({
    where: { id },
    ...auctionWithDealArgs,
  });
}

//READ ACTIVE AUCTIONS

// GET AUCTIONS FOR PUBLIC WITH PAGINATION, FILTERING AND SORTING
/**
 * Retrieves active auctions for public display with pagination, search, and sorting.
 *
 * @param page - The page number (1-indexed)
 * @param pageSize - Number of auctions per page
 * @param search - Optional search query to filter by title (minimum 3 characters)
 * @param sort - Sort order for the results
 * @returns Promise containing an array of auctions and the total count
 */

export type PublicAuctionsSort = 'end-asc' | 'end-desc' | 'price-asc' | 'price-desc';

type GetPublicAuctionsArgs = {
  page: number;
  pageSize: number;
  search?: string;
  sort: PublicAuctionsSort;
};

export async function getPublicAuctions({
  page,
  pageSize,
  search,
  sort,
}: GetPublicAuctionsArgs): Promise<{ auctions: AuctionForList[]; total: number }> {
  const where: Prisma.AuctionWhereInput = {
    status: 'ACTIVE',
  };

  const trimmed = search?.trim() ?? '';
  if (trimmed.length >= MIN_SEARCH_LENGTH) {
    where.OR = [{ title: { contains: trimmed, mode: 'insensitive' } }];
  }

  let orderBy: Prisma.AuctionOrderByWithRelationInput;
  switch (sort) {
    case 'price-asc':
      orderBy = { currentPriceMinor: 'asc' };
      break;
    case 'price-desc':
      orderBy = { currentPriceMinor: 'desc' };
      break;
    case 'end-desc':
      orderBy = { endAt: 'desc' };
      break;
    case 'end-asc':
    default:
      orderBy = { endAt: 'asc' };
      break;
  }

  const skip = (page - 1) * pageSize;

  const [rows, total] = await Promise.all([
    prisma.auction.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
      ...auctionForListArgs,
    }),
    prisma.auction.count({ where }),
  ]);

  return {
    auctions: rows as AuctionForList[],
    total,
  };
}

// READ USER'S AUCTIONS
export async function getAuctionsByUser(userId: string): Promise<AuctionForList[]> {
  return prisma.auction.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: 'desc' },
    ...auctionForListArgs,
  });
}

// READ AUCTIONS TO FINALIZE
export async function getAuctionsListToFinalize(limit: number): Promise<Pick<Auction, 'id'>[]> {
  const now = new Date();
  return prisma.auction.findMany({
    where: {
      status: 'ACTIVE',
      endAt: { lte: now },
    },
    select: { id: true },
    take: limit,
  });
}
//UPDATE AUCTION
export async function updateAuction(
  id: string,
  data: Partial<Auction>,
  tx: DbClient = prisma,
): Promise<Auction> {
  return await tx.auction.update({
    where: { id },
    data,
  });
}

//UPDATE AUCTION inside bid placement transaction with version check
export async function updateAuctionBid(
  data: {
    id: string;
    version: number;
    currentPriceMinor: number;
    highestBidderId: string;
    endAt: Date;
  },
  tx: DbClient = prisma,
): Promise<Prisma.BatchPayload> {
  const { id, version, currentPriceMinor, highestBidderId, endAt } = data;
  return await tx.auction.updateMany({
    where: { id, version },
    data: {
      currentPriceMinor,
      highestBidderId,
      version: { increment: 1 },
      endAt,
    },
  });
}

// UPDATE AUCTION EDIT FORM
export async function updateAuctionWithImages(
  id: string,
  data: Prisma.AuctionUpdateInput,
  tx: DbClient = prisma,
): Promise<Auction> {
  return await tx.auction.update({
    where: { id },
    data,
  });
}
