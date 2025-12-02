'use server';

import { getAuthUser } from '@/lib/auth/getAuthUser';
import { prisma } from '@/lib/db';
import { getDealById, updateDeal } from '@/data-access/deals';
import { upsertConversation, updateConversation } from '@/data-access/conversations';
import { createMessage } from '@/data-access/messages';
import { MessageKind, DealStatus, Deal } from '@prisma/client';
import { broadcastDealUpdated } from '@/lib/realtime/deals-events';
import { emitConversationUpdatedForUsers, emitNewMessageEvent } from '@/lib/realtime/conversations-events';

type MarkDealShippedState =
  | {
      message?: string;
      errors?: {
        shippingCompany?: string[];
        trackingNumber?: string[];
      };
      values?: {
        shippingCompany?: string;
        trackingNumber?: string;
      };
    }
  | undefined;

export async function markDealShipped(_prev: MarkDealShippedState, formData: FormData): Promise<MarkDealShippedState> {
  const user = await getAuthUser();

  const dealId = formData.get('dealId');
  const companyRaw = formData.get('shippingCompany');
  const trackingRaw = formData.get('trackingNumber');

  if (typeof dealId !== 'string') {
    return { message: 'Invalid deal.' };
  }

  const shippingCompany = typeof companyRaw === 'string' ? companyRaw.trim() : '';
  const trackingNumber = typeof trackingRaw === 'string' ? trackingRaw.trim() : '';

  const errors = {
    shippingCompany: !shippingCompany ? ['Please enter shipping company.'] : undefined,
    trackingNumber: !trackingNumber ? ['Please enter tracking number.'] : undefined,
  };
  if (errors.shippingCompany || errors.trackingNumber) {
    return { errors, values: { shippingCompany, trackingNumber } };
  }

  try {
    const now = new Date();

    const { deal, message, conversation } = await prisma.$transaction(async (tx) => {
      const deal = await getDealById(dealId, tx);
      if (!deal) {
        throw new Error('Deal not found.');
      }

      if (deal.sellerId !== user.id) {
        throw new Error('You are not the seller for this deal.');
      }

      if (deal.status !== DealStatus.PAID && deal.status !== DealStatus.AWAITING_PAYMENT) {
        throw new Error('This deal cannot be marked as shipped.');
      }

      const updated = await updateDeal(
        deal.id,
        {
          status: DealStatus.SHIPPED,
          shippedAt: now,
          shippingCompany,
          trackingNumber,
        },
        tx
      );

      const convo = await upsertConversation(deal.auctionId, deal.sellerId, deal.buyerId, tx);

      const createdMessage = await createMessage(
        {
          conversationId: convo.id,
          senderId: null,
          kind: MessageKind.SYSTEM,
          body: `Seller marked the deal as SHIPPED.\nCarrier: ${shippingCompany}\nTracking: ${trackingNumber}`,
        },
        tx
      );

      const updatedConversation = await updateConversation(
        convo.id,
        {
          lastMessageAt: now,
          unreadCountA: convo.userAId === deal.buyerId ? convo.unreadCountA + 1 : convo.unreadCountA,
          unreadCountB: convo.userBId === deal.buyerId ? convo.unreadCountB + 1 : convo.unreadCountB,
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
      console.error('Error broadcasting deal updated (shipped):', pusherErr);
    }

    return { message: 'Deal marked as shipped.' };
  } catch (err) {
    console.error('APP/ACTIONS/MARK_DEAL_SHIPPED:', err);

    if (err instanceof Error && err.message === 'Deal not found.') {
      return { message: 'Deal not found.' };
    }

    if (err instanceof Error && err.message === 'You are not the seller for this deal.') {
      return { message: 'You are not the seller for this deal.' };
    }

    if (err instanceof Error && err.message === 'This deal cannot be marked as shipped.') {
      return { message: 'This deal cannot be marked as shipped.' };
    }

    return {
      message: 'Server error. Please try again.',
      values: { shippingCompany, trackingNumber },
    };
  }
}
