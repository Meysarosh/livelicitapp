'use server';

import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/auth/getAuthUser';
import { redirect } from 'next/navigation';
import { emitToUser } from '@/lib/realtime/emitToUser';

export async function adminUpdateUserStatus(formData: FormData) {
  const admin = await getAuthUser();

  if (admin.role !== 'ADMIN') {
    redirect('/');
  }

  const userId = formData.get('userId');
  const action = formData.get('action');

  if (typeof userId !== 'string' || typeof action !== 'string') {
    return;
  }

  // Prevent self-suspension (optional but sensible)
  if (userId === admin.id) {
    return;
  }

  const newStatus = action === 'suspend' ? 'BANNED' : 'OK';

  await prisma.user.update({
    where: { id: userId },
    data: {
      status: newStatus,
      sessionVersion: { increment: 1 },
    },
  });

  if (newStatus === 'BANNED') {
    await emitToUser(userId, 'user:suspended', {});
  }

  redirect('/admin/users');
}
