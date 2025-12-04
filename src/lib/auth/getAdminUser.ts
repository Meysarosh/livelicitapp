'use server';

import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth/getAuthUser';

export async function getAdminUser() {
  const user = await getAuthUser();
  if (user.role !== 'ADMIN') {
    redirect('/');
  }

  return user;
}
