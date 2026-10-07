'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { MessageKind } from '@prisma/client';
import {
  getConversationSummary,
  updateConversation,
} from '@/data-access/conversation/conversation';
import { createMessage } from '@/data-access/message/message';
import {
  emitConversationUpdatedForUsers,
  emitNewMessageEvent,
} from '@/lib/realtime/conversations-events';

type SendMessageFormState =
  | {
      message?: string;
      errors?: { body?: string[] };
      values?: { body?: string };
    }
  | undefined;

export async function sendMessageAction(
  _prevState: SendMessageFormState,
  formData: FormData,
): Promise<SendMessageFormState> {
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
      const conversation = await getConversationSummary(conversationId, tx);
      if (!conversation) {
        throw new Error('Conversation not found');
      }

      const isA = conversation.userAId === user!.id;
      const isB = conversation.userBId === user!.id;

      if (!isA && !isB) {
        throw new Error('You are not a participant of this conversation.');
      }

      const createdMessage = await createMessage(
        {
          conversationId: conversation.id,
          senderId: user!.id,
          kind: MessageKind.TEXT,
          body,
        },
        tx,
      );

      const now = new Date();

      const conversationUpdateData = {
        lastMessageAt: now,
        unreadCountA: isA ? conversation.unreadCountA : conversation.unreadCountA + 1,
        unreadCountB: isB ? conversation.unreadCountB : conversation.unreadCountB + 1,
      };

      const updatedConversation = await updateConversation(
        conversation.id,
        conversationUpdateData,
        tx,
      );

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
