'use client';

import { useActionState, useEffect, useState } from 'react';
import type { Deal, DealStatus, User } from '@prisma/client';
import { Button, Paragraph, Muted, SubTitle } from '@/components/ui';
import { Form } from '@/components/forms/form.styles';
import { FormFieldWrapper } from '@/components/forms/FormFieldWrapper';
import { Input } from '@/components/ui';
import { markDealPaid } from '@/app/actions/deal/markDealPaid';
import { markDealShipped } from '@/app/actions/deal/markDealShipped';
import { markDealReceived } from '@/app/actions/deal/markDealReceived';
import { getPusherClient } from '@/lib/realtime/pusher-client';
import { DealUpdatedPayload } from '@/lib/realtime/deals-events';
import { getDealStatusChip } from '@/services/dealStatus-service';
import { Route } from 'next';
import { StyledLink } from '../layout';
import { ContactSupportButton } from '../conversations/ContactSupportButton';

type DealWithUsers = Deal & {
  buyer: User;
  seller: User;
};

type Props = {
  deal: DealWithUsers;
  currentUserId: string;
  conversationId: string;
  auctionId: string;
};

export function DealPanel({ deal: initialDeal, currentUserId, conversationId, auctionId }: Props) {
  const [deal, setDeal] = useState<DealWithUsers>(initialDeal);
  const isBuyer = deal.buyerId === currentUserId;
  const isSeller = deal.sellerId === currentUserId;

  const [paidState, markPaidAction, pendingPaid] = useActionState(markDealPaid, undefined);
  const [shippedState, markShippedAction, pendingShipped] = useActionState(markDealShipped, undefined);
  const [receivedState, markReceivedAction, pendingReceived] = useActionState(markDealReceived, undefined);

  useEffect(() => {
    const pusher = getPusherClient();
    const channelName = `private-user-${currentUserId}`;
    const channel = pusher.subscribe(channelName);

    const handleDealUpdated = (payload: DealUpdatedPayload) => {
      if (payload.dealId !== deal.id) return;

      setDeal((prev) => ({
        ...prev,
        status: payload.status as DealStatus,
        paidAt: payload.paidAt ? new Date(payload.paidAt) : prev.paidAt,
        shippedAt: payload.shippedAt ? new Date(payload.shippedAt) : prev.shippedAt,
        receivedAt: payload.receivedAt ? new Date(payload.receivedAt) : prev.receivedAt,
        closedAt: payload.closedAt ? new Date(payload.closedAt) : prev.closedAt,
        shippingCompany: payload.shippingCompany ?? prev.shippingCompany,
        trackingNumber: payload.trackingNumber ?? prev.trackingNumber,
      }));
    };

    channel.bind('deal:updated', handleDealUpdated);

    return () => {
      channel.unbind('deal:updated', handleDealUpdated);
      pusher.unsubscribe(channelName);
    };
  }, [deal.id, currentUserId]);

  if (!isBuyer && !isSeller) return null;

  const canMarkPaid = isBuyer && (deal.status === 'CREATED' || deal.status === 'AWAITING_PAYMENT');
  const canMarkShipped = isSeller && deal.status === 'PAID';
  const canMarkReceived = isBuyer && deal.status === 'SHIPPED';

  const { label } = getDealStatusChip(deal.status);

  return (
    <section style={{ marginTop: 24 }}>
      <SubTitle>Deal</SubTitle>
      <Paragraph>
        Status: <strong>{label}</strong>
      </Paragraph>

      {isBuyer && <Paragraph>Seller: {deal.seller.nickname ?? deal.seller.email}</Paragraph>}
      {isSeller && <Paragraph>Buyer: {deal.buyer.nickname ?? deal.buyer.email}</Paragraph>}

      <StyledLink $active={true} href={`/account/conversations/${conversationId}` as Route}>
        Go to conversation
      </StyledLink>

      {/* Buyer: mark as paid */}
      {canMarkPaid && (
        <Form action={markPaidAction} style={{ marginTop: 12 }}>
          <input type='hidden' name='dealId' value={deal.id} />
          <Button type='submit' disabled={pendingPaid}>
            {pendingPaid ? 'Marking as paid…' : 'Mark as paid'}
          </Button>
          {paidState?.message && <Muted>{paidState.message}</Muted>}
        </Form>
      )}

      {/* Seller: mark as shipped */}
      {canMarkShipped && (
        <Form action={markShippedAction} style={{ marginTop: 12 }}>
          <input type='hidden' name='dealId' value={deal.id} />

          <FormFieldWrapper label='Shipping company' required error={shippedState?.errors?.shippingCompany?.[0]}>
            <Input name='shippingCompany' defaultValue={shippedState?.values?.shippingCompany ?? ''} />
          </FormFieldWrapper>

          <FormFieldWrapper label='Tracking number' required error={shippedState?.errors?.trackingNumber?.[0]}>
            <Input name='trackingNumber' defaultValue={shippedState?.values?.trackingNumber ?? ''} />
          </FormFieldWrapper>

          <Button type='submit' disabled={pendingShipped}>
            {pendingShipped ? 'Marking as shipped…' : 'Mark as shipped'}
          </Button>
          {shippedState?.message && <Muted>{shippedState.message}</Muted>}
        </Form>
      )}

      {/* Buyer: mark as received */}
      {canMarkReceived && (
        <Form action={markReceivedAction} style={{ marginTop: 12 }}>
          <input type='hidden' name='dealId' value={deal.id} />
          <Button type='submit' disabled={pendingReceived}>
            {pendingReceived ? 'Marking as received…' : 'Mark as received'}
          </Button>
          {receivedState?.message && <Muted>{receivedState.message}</Muted>}
        </Form>
      )}
      <Form style={{ marginTop: 12 }}>
        <ContactSupportButton auctionId={auctionId} />
      </Form>
    </section>
  );
}
