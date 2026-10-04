import 'server-only';
import { auth } from '@/lib/auth';
import { SessionUser } from '@/types/user';
import { redirect } from 'next/navigation';

export async function getAuthUser(): Promise<SessionUser> {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect('/login');
  }

  return user;
}
