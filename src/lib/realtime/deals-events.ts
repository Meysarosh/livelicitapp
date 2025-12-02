import type { Deal } from '@prisma/client';
import { getPusherServer } from './pusher-server';

export type DealUpdatedPayload = {
  dealId: string;
  auctionId: string;
  buyerId: string;
  sellerId: string;
  status: Deal['status'];
  paidAt: string | null;
  shippedAt: string | null;
  receivedAt: string | null;
  closedAt: string | null;
  shippingCompany: string | null;
  trackingNumber: string | null;
};

export async function broadcastDealUpdated(deal: Deal) {
  const pusher = getPusherServer();

  const payload: DealUpdatedPayload = {
    dealId: deal.id,
    auctionId: deal.auctionId,
    buyerId: deal.buyerId,
    sellerId: deal.sellerId,
    status: deal.status,
    paidAt: deal.paidAt ? deal.paidAt.toISOString() : null,
    shippedAt: deal.shippedAt ? deal.shippedAt.toISOString() : null,
    receivedAt: deal.receivedAt ? deal.receivedAt.toISOString() : null,
    closedAt: deal.closedAt ? deal.closedAt.toISOString() : null,
    shippingCompany: deal.shippingCompany ?? null,
    trackingNumber: deal.trackingNumber ?? null,
  };

  const channels = [`private-user-${deal.buyerId}`, `private-user-${deal.sellerId}`];

  await Promise.all(
    channels.map(async (ch) => {
      try {
        await pusher.trigger(ch, 'deal:updated', payload);
      } catch (err) {
        console.error('Pusher deal:updated trigger failed for channel', ch, err);
      }
    })
  );
}
