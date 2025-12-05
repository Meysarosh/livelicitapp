import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function getAdminUserId(): Promise<string | null> {
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN', status: 'OK' },
    select: { id: true },
    orderBy: { createdAt: 'asc' },
  });

  return admin?.id ?? null;
}

export async function getAuctionsForAdmin({
  where,
  skip,
  pageSize,
}: {
  where: Prisma.AuctionWhereInput;
  skip: number;
  pageSize: number;
}) {
  return await prisma.auction.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip,
    take: pageSize,
    select: {
      id: true,
      title: true,
      status: true,
      currentPriceMinor: true,
      currency: true,
      createdAt: true,
      startAt: true,
      endAt: true,
      ownerId: true,
      owner: {
        select: {
          email: true,
          nickname: true,
        },
      },
      _count: {
        select: {
          bids: true,
        },
      },
    },
  });
}

export async function getAuctionsCountForAdmin(where: Prisma.AuctionWhereInput) {
  return await prisma.auction.count({ where });
}

export async function getUsersForAdmin({
  where,
  skip,
  pageSize,
}: {
  where: Prisma.UserWhereInput;
  skip: number;
  pageSize: number;
}) {
  return await prisma.user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip,
    take: pageSize,
    select: {
      id: true,
      email: true,
      nickname: true,
      role: true,
      status: true,
      sessionVersion: true,
      createdAt: true,
      _count: {
        select: {
          auctions: true,
          dealsAsBuyer: true,
          dealsAsSeller: true,
        },
      },
    },
  });
}

export async function getUsersCountForAdmin(where: Prisma.UserWhereInput) {
  return await prisma.user.count({ where });
}
