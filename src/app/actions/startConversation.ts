'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { isNextRedirectError } from '@/lib/utils/isNextRedirectError';
import { getAuctionById } from '@/data-access/auctions';
import { updateConversation, upsertConversation } from '@/data-access/conversations';
import { MessageKind } from '@prisma/client';
import { createMessage } from '@/data-access/messages';

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
    return await prisma.$transaction(async (tx) => {
      const auction = await getAuctionById(auctionId, tx);

      if (!auction) {
        return { message: 'Auction not found.', values: { body } };
      }

      if (auction.ownerId === user!.id) {
        return { message: 'You cannot ask yourself a question.', values: { body } };
      }

      const sellerId = auction.ownerId;
      const buyerId = user!.id;

      const userAId = sellerId;
      const userBId = buyerId;

      const convo = await upsertConversation(auction.id, userAId, userBId, tx);

      const messageData = {
        conversationId: convo.id,
        senderId: user!.id,
        kind: MessageKind.TEXT,
        body,
      };

      await createMessage(messageData, tx);

      const ownIsA = convo.userAId === user!.id;

      const conversationUpdateData = {
        lastMessageAt: new Date(),
        unreadCountA: ownIsA ? convo.unreadCountA : convo.unreadCountA + 1,
        unreadCountB: ownIsA ? convo.unreadCountB + 1 : convo.unreadCountB,
      };

      await updateConversation(convo.id, conversationUpdateData, tx);
    });
  } catch (err) {
    console.error('APP/ACTIONS/START_CONVERSATION:', err);
    if (isNextRedirectError(err)) throw err;

    return {
      message: 'Server error. Please try again.',
      values: { body },
    };
  }
}
