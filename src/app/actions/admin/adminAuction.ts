'use server';

import { getAuthUser } from '@/lib/auth/getAuthUser';
import { redirect } from 'next/navigation';
import { AuctionStatus, Prisma } from '@prisma/client';
import { updateAuction } from '@/data-access/auctions';
import { getAuctionsCountForAdmin, getAuctionsForAdmin } from '@/data-access/zadmin';

export type AuctionRow = {
  id: string;
  title: string;
  status: string;
  currentPriceMinor: number;
  currency: string;
  ownerId: string;
  ownerEmail: string;
  ownerNickname: string | null;
  bidsCount: number;
  createdAt: Date;
  startAt: Date;
  endAt: Date;
};

type GetAuctionsForAdminArgs = {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
};

export async function getAuctionsDataForAdmin({
  page,
  pageSize,
  search,
  status,
}: GetAuctionsForAdminArgs): Promise<{ auctions: AuctionRow[]; total: number }> {
  const where: Prisma.AuctionWhereInput = {};

  const trimmed = search?.trim() ?? '';
  if (trimmed.length >= 2) {
    where.OR = [
      { title: { contains: trimmed, mode: 'insensitive' } },
      { description: { contains: trimmed, mode: 'insensitive' } },
      {
        owner: {
          OR: [
            { email: { contains: trimmed, mode: 'insensitive' } },
            { nickname: { contains: trimmed, mode: 'insensitive' } },
          ],
        },
      },
    ];
  }

  if (status && status !== 'ALL') {
    where.status = status as AuctionStatus;
  }

  const skip = (page - 1) * pageSize;

  const [rows, total] = await Promise.all([
    getAuctionsForAdmin({ where, skip, pageSize }),
    getAuctionsCountForAdmin(where),
  ]);

  const auctions: AuctionRow[] = rows.map((a) => ({
    id: a.id,
    title: a.title,
    status: a.status,
    currentPriceMinor: a.currentPriceMinor,
    currency: a.currency,
    ownerId: a.ownerId,
    ownerEmail: a.owner.email,
    ownerNickname: a.owner.nickname,
    bidsCount: a._count.bids,
    createdAt: a.createdAt,
    startAt: a.startAt,
    endAt: a.endAt,
  }));

  return { auctions, total };
}

export async function adminCancelAuction(formData: FormData) {
  const admin = await getAuthUser();

  if (admin.role !== 'ADMIN') {
    redirect('/');
  }

  const auctionId = formData.get('auctionId');

  if (typeof auctionId !== 'string' || !auctionId) {
    return;
  }

  await updateAuction(auctionId, {
    status: AuctionStatus.CANCELLED,
    endAt: new Date(),
  });

  redirect('/admin/auctions');
}
