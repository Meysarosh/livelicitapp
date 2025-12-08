import { MIN_SEARCH_LENGTH } from '@/lib/constants';
import { prisma } from '@/lib/db';
import type { Auction, AuctionImage, Prisma, PrismaClient, User } from '@prisma/client';

type DbClient = PrismaClient | Prisma.TransactionClient;
//CREATE AUCTION
export async function createAuction(data: Prisma.AuctionCreateInput): Promise<Auction> {
  return await prisma.auction.create({
    data,
  });
}

//READ AUCTION
export async function getAuctionById(id: string): Promise<Auction | null> {
  return prisma.auction.findUnique({
    where: { id },
  });
}

export async function getAuctionForConversationTransaction(id: string, tx: DbClient = prisma) {
  return tx.auction.findUnique({
    where: { id },
    include: { images: { orderBy: { position: 'asc' } } },
  });
}

type AuctionForBidTransaction = Auction & {
  _count: {
    bids: number;
  };
};

export async function getAuctionForBidTransaction(
  id: string,
  tx: DbClient = prisma
): Promise<AuctionForBidTransaction | null> {
  return tx.auction.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          bids: true,
        },
      },
    },
  });
}

export type AuctionDetailForPublic = Auction & {
  images: AuctionImage[];
  owner: Pick<User, 'id' | 'nickname' | 'ratingAvg' | 'ratingCount'>;
  _count: {
    bids: number;
    watchlistedBy: number;
  };
};

export async function getAuctionDetailsForPublic(id: string): Promise<AuctionDetailForPublic | null> {
  return prisma.auction.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: { position: 'asc' },
      },
      owner: {
        select: {
          id: true,
          nickname: true,
          ratingAvg: true,
          ratingCount: true,
        },
      },
      _count: {
        select: {
          bids: true,
          watchlistedBy: true,
        },
      },
    },
  });
}

export type AuctionWithImages = Auction & {
  images: AuctionImage[];
  _count: {
    bids: number;
    watchlistedBy: number;
  };
};

export async function getAuctionDetailsForOwner(id: string): Promise<AuctionWithImages | null> {
  return prisma.auction.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: { position: 'asc' },
      },
      _count: {
        select: {
          bids: true,
          watchlistedBy: true,
        },
      },
    },
  });
}

export async function getAuctionWithDeal(id: string, tx: DbClient = prisma) {
  return tx.auction.findUnique({
    where: { id },
    include: {
      owner: true,
      images: { orderBy: { position: 'asc' } },
      _count: { select: { bids: true, watchlistedBy: true } },
      deal: {
        include: {
          buyer: true,
          seller: true,
        },
      },
      auctionForConversations: { select: { id: true } },
    },
  });
}

//READ ACTIVE AUCTIONS

export type AuctionForLists = Auction & {
  images: AuctionImage[];
  _count: {
    bids: number;
    watchlistedBy: number;
  };
};

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
}: GetPublicAuctionsArgs): Promise<{ auctions: AuctionForLists[]; total: number }> {
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
      select: {
        id: true,
        title: true,
        description: true,
        currentPriceMinor: true,
        currency: true,
        endAt: true,
        highestBidderId: true,
        startAt: true,
        status: true,
        ownerId: true,
        images: {
          orderBy: { position: 'asc' },
          take: 1,
          select: { url: true },
        },
        _count: {
          select: {
            bids: true,
            watchlistedBy: true,
          },
        },
      },
    }),
    prisma.auction.count({ where }),
  ]);

  return {
    auctions: rows as AuctionForLists[],
    total,
  };
}

// READ USER'S AUCTIONS
export async function getAuctionsByUser(userId: string) {
  return prisma.auction.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: 'desc' },
    include: {
      images: {
        orderBy: { position: 'asc' },
      },
      _count: {
        select: {
          bids: true,
          watchlistedBy: true,
        },
      },
    },
  });
}

// READ AUCTIONS TO FINALIZE
export async function getAuctionsToFinalize(limit: number): Promise<Pick<Auction, 'id'>[]> {
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
export async function updateAuction(id: string, data: Partial<Auction>, tx: DbClient = prisma): Promise<Auction> {
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
  tx: DbClient = prisma
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
  tx: DbClient = prisma
): Promise<Auction> {
  return await tx.auction.update({
    where: { id },
    data,
  });
}
