'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { isNextRedirectError } from '@/lib/utils/isNextRedirectError';
import { getAuctionForConversationTransaction } from '@/data-access/auctions';
import { updateConversation, upsertConversation } from '@/data-access/conversations';
import { MessageKind } from '@prisma/client';
import { createMessage } from '@/data-access/messages';
import { emitConversationUpdatedForUsers } from '@/lib/realtime/conversations-events';

type StartConversationFormState =
  | {
      message?: string;
      errors?: { body?: string[] };
      values?: { body?: string };
    }
  | undefined;

export async function startConversation(
  _prevState: StartConversationFormState,
  formData: FormData
): Promise<StartConversationFormState> {
  const session = await auth();
  const user = session?.user;
  if (!user) {
    redirect('/login');
  }

  const auctionId = formData.get('auctionId');
  const bodyRaw = formData.get('body');

  if (typeof auctionId !== 'string') {
    return { message: 'Invalid auction.', values: { body: String(bodyRaw ?? '') } };
  }

  const body = typeof bodyRaw === 'string' ? bodyRaw.trim() : '';

  if (!body) {
    return {
      errors: { body: ['Please enter a message.'] },
      values: { body: '' },
    };
  }

  try {
    const { conversation } = await prisma.$transaction(async (tx) => {
      const auction = await getAuctionForConversationTransaction(auctionId, tx);

      if (!auction) {
        throw new Error('Auction not found');
      }

      if (auction.ownerId === user!.id) {
        throw new Error('You cannot ask yourself a question.');
      }

      const sellerId = auction.ownerId;
      const buyerId = user!.id;

      const userAId = sellerId;
      const userBId = buyerId;

      const convo = await upsertConversation(auction.id, userAId, userBId, tx);

      await createMessage(
        {
          conversationId: convo.id,
          senderId: user!.id,
          kind: MessageKind.TEXT,
          body,
        },
        tx
      );

      const ownIsA = convo.userAId === user!.id;
      const now = new Date();

      const conversationUpdateData = {
        lastMessageAt: now,
        unreadCountA: ownIsA ? convo.unreadCountA : convo.unreadCountA + 1,
        unreadCountB: ownIsA ? convo.unreadCountB + 1 : convo.unreadCountB,
      };

      const updatedConvo = await updateConversation(convo.id, conversationUpdateData, tx);

      return {
        conversation: updatedConvo,
      };
    });

    try {
      await emitConversationUpdatedForUsers({
        conversationId: conversation.id,
        userAId: conversation.userAId,
        userBId: conversation.userBId,
      });
    } catch (emitErr) {
      console.error('Failed to emit conversation update:', emitErr);
    }

    return { message: 'Message sent successfully!' };
  } catch (err) {
    console.error('APP/ACTIONS/START_CONVERSATION:', err);
    if (isNextRedirectError(err)) throw err;

    if (err instanceof Error && err.message === 'Auction not found') {
      return { message: 'Auction not found.', values: { body } };
    }
    if (err instanceof Error && err.message === 'You cannot ask yourself a question.') {
      return { message: err.message, values: { body } };
    }

    return {
      message: 'Server error. Please try again.',
      values: { body },
    };
  }
}
