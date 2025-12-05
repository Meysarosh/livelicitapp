'use server';

import { prisma } from '@/lib/db';
import { getAuctionForConversationTransaction } from '@/data-access/auctions';
import { updateConversation, upsertConversation } from '@/data-access/conversations';
import { MessageKind } from '@prisma/client';
import { createMessage } from '@/data-access/messages';
import { emitConversationUpdatedForUsers } from '@/lib/realtime/conversations-events';
import { getAuthUser } from '@/lib/auth/getAuthUser';
import { getAdminUserId } from '@/data-access/admin';

export type ContactSupportFormState =
  | {
      message?: string;
      errors?: { body?: string[] };
      values?: { body?: string };
    }
  | undefined;

export async function contactSupport(
  _prevState: ContactSupportFormState,
  formData: FormData
): Promise<ContactSupportFormState> {
  const user = await getAuthUser();
  const adminId = await getAdminUserId();

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

      const userAId = adminId;
      const userBId = user.id;

      const convo = await upsertConversation(auction.id, userAId!, userBId, tx);

      await createMessage(
        {
          conversationId: convo.id,
          senderId: user.id,
          kind: MessageKind.TEXT,
          body,
        },
        tx
      );

      const now = new Date();

      const conversationUpdateData = {
        lastMessageAt: now,
        unreadCountA: convo.unreadCountA + 1,
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

    if (err instanceof Error && err.message === 'Auction not found') {
      return { message: 'Auction not found.', values: { body } };
    }

    return {
      message: 'Server error. Please try again.',
      values: { body },
    };
  }
}
