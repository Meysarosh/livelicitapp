'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { isNextRedirectError } from '@/lib/utils/isNextRedirectError';
import { MessageKind } from '@prisma/client';
import { getConversationById, updateConversation } from '@/data-access/conversations';
import { createMessage } from '@/data-access/messages';
import { emitConversationUpdatedForUsers, emitNewMessageEvent } from '@/lib/realtime/conversations-events';

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
    return {
      message: 'Invalid conversation.',
      values: { body: typeof bodyRaw === 'string' ? bodyRaw : '' },
    };
  }

  const body = typeof bodyRaw === 'string' ? bodyRaw.trim() : '';

  if (!body) {
    return {
      errors: { body: ['Please enter a message.'] },
      values: { body: '' },
    };
  }

  try {
    const { conversation, message } = await prisma.$transaction(async (tx) => {
      const convo = await getConversationById(conversationId, tx);
      if (!convo) {
        throw new Error('Conversation not found');
      }

      const isA = convo.userAId === user!.id;
      const isB = convo.userBId === user!.id;

      if (!isA && !isB) {
        throw new Error('You are not a participant of this conversation.');
      }

      const createdMessage = await createMessage(
        {
          conversationId: convo.id,
          senderId: user!.id,
          kind: MessageKind.TEXT,
          body,
        },
        tx
      );

      const now = new Date();

      const conversationUpdateData = {
        lastMessageAt: now,
        unreadCountA: isA ? convo.unreadCountA : convo.unreadCountA + 1,
        unreadCountB: isB ? convo.unreadCountB : convo.unreadCountB + 1,
      };

      const updatedConversation = await updateConversation(convo.id, conversationUpdateData, tx);

      return {
        conversation: updatedConversation,
        message: createdMessage,
      };
    });

    try {
      await emitNewMessageEvent({
        conversationId: conversation.id,
        message: {
          id: message.id,
          body: message.body,
          kind: message.kind,
          senderId: message.senderId,
          createdAt: message.createdAt,
        },
      });

      await emitConversationUpdatedForUsers({
        conversationId: conversation.id,
        userAId: conversation.userAId,
        userBId: conversation.userBId,
      });
    } catch (pusherErr) {
      console.error('Pusher trigger failed:', pusherErr);
    }

    return {
      message: 'Message sent successfully.',
      values: { body: '' },
    };
  } catch (err) {
    console.error('APP/ACTIONS/SEND_MESSAGE:', err);
    if (isNextRedirectError(err)) throw err;

    if (err instanceof Error && err.message === 'Conversation not found') {
      return { message: 'Conversation not found.', values: { body } };
    }

    if (err instanceof Error && err.message === 'You are not a participant of this conversation.') {
      return { message: err.message, values: { body } };
    }

    return {
      message: 'Server error. Please try again.',
      values: { body },
    };
  }
}
