'use server';

import { getAuthUser } from '@/lib/auth/getAuthUser';
import { prisma } from '@/lib/db';
import { getDealById, updateDeal } from '@/data-access/deals';
import { upsertConversation, updateConversation } from '@/data-access/conversations';
import { createMessage } from '@/data-access/messages';
import { MessageKind, DealStatus, Deal } from '@prisma/client';
import { broadcastDealUpdated } from '@/lib/realtime/deals-events';
import { emitConversationUpdatedForUsers, emitNewMessageEvent } from '@/lib/realtime/conversations-events';

type MarkDealReceivedState =
  | {
      message?: string;
    }
  | undefined;

export async function markDealReceived(
  _prev: MarkDealReceivedState,
  formData: FormData
): Promise<MarkDealReceivedState> {
  const user = await getAuthUser();

  const dealId = formData.get('dealId');
  if (typeof dealId !== 'string') {
    return { message: 'Invalid deal.' };
  }

  try {
    const now = new Date();

    const { deal, message, conversation } = await prisma.$transaction(async (tx) => {
      const deal = await getDealById(dealId, tx);
      if (!deal) {
        throw new Error('Deal not found.');
      }

      if (deal.buyerId !== user.id) {
        throw new Error('You are not the buyer for this deal.');
      }

      if (deal.status !== DealStatus.SHIPPED && deal.status !== DealStatus.PAID) {
        throw new Error('This deal cannot be marked as received.');
      }

      const updated = await updateDeal(
        deal.id,
        {
          status: DealStatus.RECEIVED,
          receivedAt: now,
          closedAt: now,
        },
        tx
      );

      const convo = await upsertConversation(deal.auctionId, deal.sellerId, deal.buyerId, tx);

      const createdMessage = await createMessage(
        {
          conversationId: convo.id,
          senderId: null,
          kind: MessageKind.SYSTEM,
          body: 'Buyer marked the deal as RECEIVED. Transaction closed.',
        },
        tx
      );

      const updatedConversation = await updateConversation(
        convo.id,
        {
          lastMessageAt: now,
          unreadCountA: convo.userAId === deal.sellerId ? convo.unreadCountA + 1 : convo.unreadCountA,
          unreadCountB: convo.userBId === deal.sellerId ? convo.unreadCountB + 1 : convo.unreadCountB,
        },
        tx
      );

      return {
        deal: updated,
        message: createdMessage,
        conversation: updatedConversation,
      } as const;
    });

    try {
      await broadcastDealUpdated(deal as Deal);
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
      console.error('Error broadcasting deal updated:', pusherErr);
    }

    return { message: 'Deal marked as received.' };
  } catch (err) {
    console.error('APP/ACTIONS/MARK_DEAL_RECEIVED:', err);

    if (err instanceof Error && err.message === 'Deal not found.') {
      return { message: 'Deal not found.' };
    }

    if (err instanceof Error && err.message === 'You are not the buyer for this deal.') {
      return { message: 'You are not the buyer for this deal.' };
    }
    if (err instanceof Error && err.message === 'This deal cannot be marked as received.') {
      return { message: 'This deal cannot be marked as received.' };
    }

    return { message: 'Server error. Please try again.' };
  }
}
