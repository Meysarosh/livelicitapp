'use server';

import { getAuthUser } from '@/lib/auth/getAuthUser';
import {
  getConversationSummary,
  updateConversation,
} from '@/data-access/conversation/conversation';
import {
  emitConversationRead,
  emitConversationUpdatedForUsers,
} from '@/lib/realtime/conversations-events';

export async function markConversationReadAction(conversationId: string) {
  const user = await getAuthUser();

  if (!user) return;

  const conversation = await getConversationSummary(conversationId);
  if (!conversation) return;

  const isA = conversation.userAId === user.id;
  const isB = conversation.userBId === user.id;
  if (!isA && !isB) return;

  const now = new Date();

  const dataUpdate: Partial<{ unreadCountA: number; unreadCountB: number }> = {};
  if (isA) {
    if (conversation.unreadCountA === 0) return;
    dataUpdate.unreadCountA = 0;
  } else if (isB) {
    if (conversation.unreadCountB === 0) return;
    dataUpdate.unreadCountB = 0;
  }

  await updateConversation(conversation.id, dataUpdate);

  await emitConversationRead({
    conversationId: conversation.id,
    readerId: user.id,
    readAt: now,
  });

  await emitConversationUpdatedForUsers({
    conversationId: conversation.id,
    userAId: conversation.userAId,
    userBId: conversation.userBId,
  });
}
