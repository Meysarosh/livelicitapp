'use server';

import { auth } from '@/lib/auth';
import { getUnreadMessagesCountForUser } from '@/data-access/conversations';

export async function getUnreadMessagesCount() {
  const session = await auth();
  const userId = session?.user.id;
  if (!userId) return 0;

  const [asA, asB] = await getUnreadMessagesCountForUser(userId);
  const unreadA = asA._sum.unreadCountA ?? 0;
  const unreadB = asB._sum.unreadCountB ?? 0;

  return unreadA + unreadB;
}
