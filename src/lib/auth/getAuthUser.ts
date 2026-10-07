import 'server-only';
import { auth } from '@/lib/auth';
import { SessionUser } from '@/data-access/user/user.types';
import { redirect } from 'next/navigation';

export async function getAuthUser(): Promise<SessionUser> {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect('/login');
  }

  return user;
}
