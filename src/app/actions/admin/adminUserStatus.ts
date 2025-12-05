'use server';

import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/auth/getAuthUser';
import { redirect } from 'next/navigation';
import { emitToUser } from '@/lib/realtime/emitToUser';
import { Prisma, Role, UserStatus } from '@prisma/client';
import { getUsersCountForAdmin, getUsersForAdmin } from '@/data-access/zadmin';

export type UserRow = {
  id: string;
  email: string;
  nickname: string;
  role: Role;
  status: UserStatus;
  sessionVersion: number;
  createdAt: Date;
  auctionsCount: number;
  dealsAsBuyerCount: number;
  dealsAsSellerCount: number;
};

type GetUsersDataForAdminArgs = {
  page: number;
  pageSize: number;
  search?: string;
};

export async function getUsersDataForAdmin({
  page,
  pageSize,
  search,
}: GetUsersDataForAdminArgs): Promise<{ users: UserRow[]; total: number }> {
  const where: Prisma.UserWhereInput = {};

  const trimmed = search?.trim() ?? '';
  if (trimmed.length >= 2) {
    where.OR = [
      { email: { contains: trimmed, mode: 'insensitive' } },
      { nickname: { contains: trimmed, mode: 'insensitive' } },
    ];
  }

  const skip = (page - 1) * pageSize;

  const [rows, total] = await Promise.all([getUsersForAdmin({ where, skip, pageSize }), getUsersCountForAdmin(where)]);

  const users: UserRow[] = rows.map((u) => ({
    id: u.id,
    email: u.email,
    nickname: u.nickname,
    role: u.role as Role,
    status: u.status as UserStatus,
    sessionVersion: u.sessionVersion,
    createdAt: u.createdAt,
    auctionsCount: u._count.auctions,
    dealsAsBuyerCount: u._count.dealsAsBuyer,
    dealsAsSellerCount: u._count.dealsAsSeller,
  }));

  return { users, total };
}

export async function adminUpdateUserStatus(formData: FormData) {
  const admin = await getAuthUser();

  if (admin.role !== 'ADMIN') {
    redirect('/');
  }

  const userId = formData.get('userId');
  const action = formData.get('action');

  if (typeof userId !== 'string' || typeof action !== 'string') {
    throw new Error('Invalid form data: userId and action must be strings.');
  }

  // Prevent self-suspension (optional but sensible)
  if (userId === admin.id) {
    throw new Error('Admin cannot suspend themselves.');
  }

  if (action !== 'suspend' && action !== 'unsuspend') {
    throw new Error('Invalid action. Must be "suspend" or "unsuspend".');
  }

  const newStatus = action === 'suspend' ? 'BANNED' : 'OK';

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        status: newStatus,
        sessionVersion: { increment: 1 },
      },
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    return;
  }

  if (newStatus === 'BANNED') {
    await emitToUser(userId, 'user:suspended', {});
  }

  redirect('/admin/users');
}
