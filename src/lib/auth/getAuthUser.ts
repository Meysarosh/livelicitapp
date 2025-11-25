'use server';

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function getAuthUser() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect('/login');
  }

  return user;
}
