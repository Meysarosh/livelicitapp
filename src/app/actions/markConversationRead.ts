'use server';

import { getConversationById, updateConversation } from '@/data-access/conversations';
import { auth } from '@/lib/auth';
import { emitConversationRead, emitConversationUpdatedForUsers } from '@/lib/realtime/conversations-events';

export async function markConversationRead(conversationId: string) {
  const session = await auth();
  const user = session?.user;
  if (!user) return;

  const userId = user.id;

  const convo = await getConversationById(conversationId);
  if (!convo) return;

  const isA = convo.userAId === userId;
  const isB = convo.userBId === userId;
  if (!isA && !isB) return;

  const now = new Date();

  const dataUpdate: Partial<{ unreadCountA: number; unreadCountB: number }> = {};
  if (isA) {
    if (convo.unreadCountA === 0) return;
    dataUpdate.unreadCountA = 0;
  } else if (isB) {
    if (convo.unreadCountB === 0) return;
    dataUpdate.unreadCountB = 0;
  }

  await updateConversation(convo.id, dataUpdate);

  await emitConversationRead({
    conversationId: convo.id,
    readerId: userId,
    readAt: now,
  });

  await emitConversationUpdatedForUsers({ conversationId: convo.id, userAId: convo.userAId, userBId: convo.userBId });
}
