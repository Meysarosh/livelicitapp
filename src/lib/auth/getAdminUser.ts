import 'server-only';
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth/getAuthUser';
import { SessionUser } from '@/data-access/user/user.types';

export async function getAdminUser(): Promise<SessionUser> {
  const user = await getAuthUser();
  if (user.role !== 'ADMIN') {
    redirect('/');
  }

  return user;
}
