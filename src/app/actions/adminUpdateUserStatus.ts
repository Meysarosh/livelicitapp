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
    throw new Error('Invalid form data: userId and action must be strings.');
  }

  // Validate action parameter to prevent security issues
  if (action !== 'suspend' && action !== 'unsuspend') {
    throw new Error('Invalid action: must be either "suspend" or "unsuspend".');
  }

  // Prevent self-suspension (optional but sensible)
  if (userId === admin.id) {
    throw new Error('Admin cannot suspend themselves.');
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
    // Optionally log the error, e.g. console.error(error);
    // Provide appropriate error feedback, e.g. return or redirect with error message
    return;
  }

  if (newStatus === 'BANNED') {
    await emitToUser(userId, 'user:suspended', {});
  }

  redirect('/admin/users');
}
