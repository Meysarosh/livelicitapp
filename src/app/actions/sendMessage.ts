'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { isNextRedirectError } from '@/lib/utils/isNextRedirectError';
import { getConversationById, updateConversation } from '@/data-access/conversations';
import { createMessage } from '@/data-access/messages';
import { MessageKind } from '@prisma/client';

type SendMessageFormState =
  | {
      message?: string;
      errors?: { body?: string[] };
      values?: { body?: string };
    }
  | undefined;

export async function sendMessage(_prevState: SendMessageFormState, formData: FormData): Promise<SendMessageFormState> {
  const session = await auth();
  const user = session?.user;
  if (!user) {
    redirect('/login');
  }

  const conversationId = formData.get('conversationId');
  const bodyRaw = formData.get('body');

  if (typeof conversationId !== 'string') {
    return { message: 'Invalid conversation.', values: { body: String(bodyRaw ?? '') } };
  }

  const body = typeof bodyRaw === 'string' ? bodyRaw.trim() : '';

  if (!body) {
    return {
      errors: { body: ['Please enter a message.'] },
      values: { body: '' },
    };
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const convo = await getConversationById(conversationId, tx);

      if (!convo) {
        return { message: 'Conversation not found.', values: { body } };
      }

      if (convo.userAId !== user!.id && convo.userBId !== user!.id) {
        return { message: 'You are not part of this conversation.', values: { body } };
      }

      const ownIsA = convo.userAId === user!.id;

      const messageData = {
        conversationId: convo.id,
        senderId: user!.id,
        kind: MessageKind.TEXT,
        body,
      };

      await createMessage(messageData, tx);

      const conversationUpdateData = {
        lastMessageAt: new Date(),
        unreadCountA: ownIsA ? convo.unreadCountA : convo.unreadCountA + 1,
        unreadCountB: ownIsA ? convo.unreadCountB + 1 : convo.unreadCountB,
      };

      await updateConversation(convo.id, conversationUpdateData, tx);
    });
  } catch (err) {
    console.error('APP/ACTIONS/SEND_MESSAGE:', err);
    if (isNextRedirectError(err)) throw err;

    return {
      message: 'Server error. Please try again.',
      values: { body },
    };
  }
}
