import { ReactNode } from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return <>{children}</>;
}
