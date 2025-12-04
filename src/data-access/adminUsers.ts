import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export type AdminUserRow = {
  id: string;
  email: string;
  nickname: string;
  role: 'ADMIN' | 'USER';
  status: 'OK' | 'BANNED';
  sessionVersion: number;
  createdAt: Date;
  auctionsCount: number;
  dealsAsBuyerCount: number;
  dealsAsSellerCount: number;
};

type GetUsersForAdminArgs = {
  page: number;
  pageSize: number;
  search?: string;
};

export async function getUsersForAdmin({
  page,
  pageSize,
  search,
}: GetUsersForAdminArgs): Promise<{ users: AdminUserRow[]; total: number }> {
  const where: Prisma.UserWhereInput = {};

  const trimmed = search?.trim() ?? '';
  if (trimmed.length >= 2) {
    where.OR = [
      { email: { contains: trimmed, mode: 'insensitive' } },
      { nickname: { contains: trimmed, mode: 'insensitive' } },
    ];
  }

  const skip = (page - 1) * pageSize;

  const [rows, total] = await Promise.all([
    prisma.user.findMany({
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
    }),
    prisma.user.count({ where }),
  ]);

  const users: AdminUserRow[] = rows.map((u) => ({
    id: u.id,
    email: u.email,
    nickname: u.nickname,
    role: u.role as 'ADMIN' | 'USER',
    status: u.status as 'OK' | 'BANNED',
    sessionVersion: u.sessionVersion,
    createdAt: u.createdAt,
    auctionsCount: u._count.auctions,
    dealsAsBuyerCount: u._count.dealsAsBuyer,
    dealsAsSellerCount: u._count.dealsAsSeller,
  }));

  return { users, total };
}
