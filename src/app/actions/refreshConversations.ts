'use server';

import { auth } from '@/lib/auth';
import { getUserConversations } from '@/data-access/conversations';
import type { ConversationWithRelations } from '@/data-access/conversations';

export async function refreshConversations(): Promise<ConversationWithRelations[] | null> {
  const session = await auth();
  const userId = session?.user.id;
  if (!userId) return null;

  const conversations = await getUserConversations(userId);
  return conversations;
}
