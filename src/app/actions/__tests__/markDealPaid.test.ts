import { describe, it, expect, vi, beforeEach } from 'vitest';
import { markDealPaid } from '../deal/markDealPaid';
import type { Deal } from '@prisma/client';
import { AuctionStatus, DealStatus, MessageKind } from '@prisma/client';

import { prisma } from '@/lib/db';
import { getAuthUser } from '@/lib/auth/getAuthUser';
import { getDealById, updateDeal } from '@/data-access/deals';
import { upsertConversation, updateConversation } from '@/data-access/conversations';
import { createMessage } from '@/data-access/messages';
import { getShippingAddress } from '@/data-access/shippingAddress';
import { broadcastDealUpdated } from '@/lib/realtime/deals-events';
import { emitConversationUpdatedForUsers, emitNewMessageEvent } from '@/lib/realtime/conversations-events';

vi.mock('@/lib/db', () => ({
  prisma: {
    $transaction: vi.fn(),
  },
}));

vi.mock('@/lib/auth/getAuthUser', () => ({
  getAuthUser: vi.fn(),
}));

vi.mock('@/data-access/deals', () => ({
  getDealById: vi.fn(),
  updateDeal: vi.fn(),
}));

vi.mock('@/data-access/conversations', () => ({
  upsertConversation: vi.fn(),
  updateConversation: vi.fn(),
}));

vi.mock('@/data-access/messages', () => ({
  createMessage: vi.fn(),
}));

vi.mock('@/data-access/shippingAddress', () => ({
  getShippingAddress: vi.fn(),
}));

vi.mock('@/lib/realtime/deals-events', () => ({
  broadcastDealUpdated: vi.fn(),
}));

vi.mock('@/lib/realtime/conversations-events', () => ({
  emitConversationUpdatedForUsers: vi.fn(),
  emitNewMessageEvent: vi.fn(),
}));

const mockedPrisma = vi.mocked(prisma);
const mockedGetAuthUser = vi.mocked(getAuthUser);
const mockedGetDealById = vi.mocked(getDealById);
const mockedUpdateDeal = vi.mocked(updateDeal);
const mockedUpsertConversation = vi.mocked(upsertConversation);
const mockedUpdateConversation = vi.mocked(updateConversation);
const mockedCreateMessage = vi.mocked(createMessage);
const mockedGetShippingAddress = vi.mocked(getShippingAddress);
const mockedBroadcastDealUpdated = vi.mocked(broadcastDealUpdated);
const mockedEmitConversationUpdatedForUsers = vi.mocked(emitConversationUpdatedForUsers);
const mockedEmitNewMessageEvent = vi.mocked(emitNewMessageEvent);

const authUser = {
  id: 'buyer-1',
  role: 'USER' as const,
  email: 'buyer@example.com',
  nickname: 'buyer',
};
const mockedUser = {
  id: 'user-1',
  role: 'USER' as const,
  email: 'user1@example.com',
  nickname: 'user1',
  status: 'OK' as const,
  sessionVersion: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  ratingAvg: 4.5,
  ratingCount: 10,
  fullName: null,
  phone: null,
  logoUrl: null,
  emailVerifiedAt: null,
  phoneVerifiedAt: null,
  avatarUrl: null,
  locale: null,
  timezone: null,
  currency: 'HUF',
};

const mockedAuction = {
  id: 'auction-1',
  status: AuctionStatus.ACTIVE,
  currency: 'HUF',
  createdAt: new Date(),
  updatedAt: new Date(),
  ownerId: 'seller-1',
  title: 'Vintage Clock',
  description: 'A beautiful vintage clock from the 1950s.',
  startAt: new Date(Date.now() - 1000 * 60 * 60), // started 1 hour ago
  endAt: new Date(Date.now() + 1000 * 60 * 60), // ends in 1 hour
  startPriceMinor: 5000, // 50.00 HUF
  minIncrementMinor: 500, // 5.00 HUF
  currentPriceMinor: 7500, // 75.00 HUF
  highestBidderId: 'buyer-1',
  cancelledReason: null,
  version: 1,
};

const baseDeal = {
  id: 'deal-1',
  status: DealStatus.CREATED,
  currency: 'HUF',
  createdAt: new Date(),
  updatedAt: new Date(),
  auctionId: 'auction-1',
  auction: mockedAuction,
  sellerId: 'seller-1',
  seller: mockedUser,
  buyer: mockedUser,
  buyerId: 'buyer-1',
  paidAt: null,
  paidAmountMinor: null,
  shippedAt: null,
  shippingCompany: null,
  trackingNumber: null,
  receivedAt: null,
  disputeReason: null,
  closedAt: null,
};

const baseConversation = {
  id: 'convo-1',
  auctionId: 'auction-1',
  userAId: 'seller-1',
  userBId: 'buyer-1',
  unreadCountA: 0,
  unreadCountB: 0,
  lastMessageAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

const baseAddress = {
  street: 'Main street 1',
  city: 'Budapest',
  postalCode: '1234',
  country: 'HU',
  state: null,
};

const baseMessage = {
  id: 'msg-1',
  conversationId: 'convo-1',
  senderId: null,
  kind: MessageKind.SYSTEM,
  body: 'dummy',
  createdAt: new Date(),
  meta: null,
};

const updatedConversation = {
  ...baseConversation,
  lastMessageAt: new Date(),
  unreadCountA: 1,
  unreadCountB: 0,
};

function makeFormData(values: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(values)) {
    fd.set(k, v);
  }
  return fd;
}

describe('markDealPaid action', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    mockedGetAuthUser.mockResolvedValue(authUser);

    // default transaction: execute callback with dummy tx object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedPrisma.$transaction.mockImplementation(async (cb) => cb({} as any));
  });

  it('returns error message for invalid dealId', async () => {
    const fd = new FormData(); // no dealId

    const result = await markDealPaid(undefined, fd);

    expect(result).toEqual({ message: 'Invalid deal.' });
    expect(mockedPrisma.$transaction).not.toHaveBeenCalled();
  });

  it('returns "Deal not found." if deal is missing', async () => {
    mockedGetDealById.mockResolvedValueOnce(null);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const fd = makeFormData({ dealId: 'deal-1' });

    const result = await markDealPaid(undefined, fd);

    expect(mockedPrisma.$transaction).toHaveBeenCalledTimes(1);
    expect(mockedGetDealById).toHaveBeenCalledWith('deal-1', expect.anything());
    expect(result).toEqual({ message: 'Deal not found.' });
    errorSpy.mockRestore();
  });

  it('returns error if current user is not the buyer', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockedGetDealById.mockResolvedValueOnce({
      ...baseDeal,
      buyerId: 'other-buyer',
    });

    const fd = makeFormData({ dealId: 'deal-1' });

    const result = await markDealPaid(undefined, fd);

    expect(result).toEqual({ message: 'You are not the buyer for this deal.' });
    expect(mockedUpdateDeal).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('returns error if deal status does not allow marking as paid', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockedGetDealById.mockResolvedValueOnce({
      ...baseDeal,
      status: DealStatus.PAID,
    });

    const fd = makeFormData({ dealId: 'deal-1' });

    const result = await markDealPaid(undefined, fd);

    expect(result).toEqual({ message: 'This deal cannot be marked as paid.' });
    expect(mockedUpdateDeal).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('marks deal as paid and sends system message with shipping address', async () => {
    const updatedDeal: Deal = {
      ...(baseDeal as Deal),
      status: DealStatus.PAID,
      paidAt: new Date(),
      paidAmountMinor: baseDeal.auction.currentPriceMinor,
      currency: baseDeal.currency,
    };

    mockedGetDealById.mockResolvedValueOnce(baseDeal);
    mockedUpdateDeal.mockResolvedValueOnce(updatedDeal);
    mockedUpsertConversation.mockResolvedValueOnce(baseConversation);
    mockedGetShippingAddress.mockResolvedValueOnce(baseAddress);
    mockedCreateMessage.mockResolvedValueOnce(baseMessage);
    mockedUpdateConversation.mockResolvedValueOnce(updatedConversation);

    const fd = makeFormData({ dealId: 'deal-1' });

    const result = await markDealPaid(undefined, fd);

    // updateDeal got correct payload
    const updateCall = mockedUpdateDeal.mock.calls[0];
    expect(updateCall[0]).toBe('deal-1');
    const updateData = updateCall[1];
    expect(updateData.status).toBe(DealStatus.PAID);
    expect(updateData.paidAmountMinor).toBe(baseDeal.auction.currentPriceMinor);
    expect(updateData.currency).toBe(baseDeal.currency);
    expect(updateData.paidAt).toBeInstanceOf(Date);

    // system message content includes address
    const createMsgCall = mockedCreateMessage.mock.calls[0];
    const msgData = createMsgCall[0];
    expect(msgData.kind).toBe(MessageKind.SYSTEM);
    expect(msgData.conversationId).toBe(baseConversation.id);
    expect(msgData.body).toContain('Street: Main street 1');
    expect(msgData.body).toContain('City: Budapest');
    expect(msgData.body).toContain('Postal Code: 1234');
    expect(msgData.body).toContain('Country: HU');

    // unread count updated for seller
    const updateConvoCall = mockedUpdateConversation.mock.calls[0];
    expect(updateConvoCall[0]).toBe('convo-1');
    expect(updateConvoCall[1]).toMatchObject({
      lastMessageAt: expect.any(Date),
      unreadCountA: 1,
      unreadCountB: 0,
    });

    // realtime events emitted
    expect(mockedBroadcastDealUpdated).toHaveBeenCalledWith(updatedDeal);
    expect(mockedEmitNewMessageEvent).toHaveBeenCalledWith({
      conversationId: updatedConversation.id,
      message: {
        id: baseMessage.id,
        body: baseMessage.body,
        kind: baseMessage.kind,
        senderId: baseMessage.senderId,
        createdAt: baseMessage.createdAt,
      },
    });
    expect(mockedEmitConversationUpdatedForUsers).toHaveBeenCalledWith({
      conversationId: updatedConversation.id,
      userAId: updatedConversation.userAId,
      userBId: updatedConversation.userBId,
    });

    expect(result).toEqual({ message: 'Deal marked as paid.' });
  });

  it('marks deal as paid and asks buyer for address when none is stored', async () => {
    const updatedDeal: Deal = {
      ...(baseDeal as Deal),
      status: DealStatus.PAID,
      paidAt: new Date(),
      paidAmountMinor: baseDeal.auction.currentPriceMinor,
      currency: baseDeal.currency,
    };

    mockedGetDealById.mockResolvedValueOnce(baseDeal);
    mockedUpdateDeal.mockResolvedValueOnce(updatedDeal);
    mockedUpsertConversation.mockResolvedValueOnce(baseConversation);
    mockedGetShippingAddress.mockResolvedValueOnce(null);
    mockedCreateMessage.mockResolvedValueOnce(baseMessage);
    mockedUpdateConversation.mockResolvedValueOnce(updatedConversation);

    const fd = makeFormData({ dealId: 'deal-1' });

    const result = await markDealPaid(undefined, fd);

    const createMsgCall = mockedCreateMessage.mock.calls[0];
    const msgData = createMsgCall[0];

    expect(msgData.body).toContain('Ask buyer for shipping address.');

    expect(result).toEqual({ message: 'Deal marked as paid.' });
  });

  it('still returns success if realtime broadcasting fails', async () => {
    const updatedDeal: Deal = {
      ...(baseDeal as Deal),
      status: DealStatus.PAID,
      paidAt: new Date(),
      paidAmountMinor: baseDeal.auction.currentPriceMinor,
      currency: baseDeal.currency,
    };

    mockedGetDealById.mockResolvedValueOnce(baseDeal);
    mockedUpdateDeal.mockResolvedValueOnce(updatedDeal);
    mockedUpsertConversation.mockResolvedValueOnce(baseConversation);
    mockedGetShippingAddress.mockResolvedValueOnce(baseAddress);
    mockedCreateMessage.mockResolvedValueOnce(baseMessage);
    mockedUpdateConversation.mockResolvedValueOnce(updatedConversation);

    mockedBroadcastDealUpdated.mockRejectedValueOnce(new Error('Pusher failure'));

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const fd = makeFormData({ dealId: 'deal-1' });

    const result = await markDealPaid(undefined, fd);

    expect(mockedBroadcastDealUpdated).toHaveBeenCalledTimes(1);
    // emitNewMessageEvent & emitConversationUpdatedForUsers are not awaited if broadcast throws
    expect(result).toEqual({ message: 'Deal marked as paid.' });

    errorSpy.mockRestore();
  });

  it('returns generic server error on unexpected exception', async () => {
    // Let getDealById itself fail unexpectedly
    mockedGetDealById.mockRejectedValueOnce(new Error('Unexpected DB error'));

    const fd = makeFormData({ dealId: 'deal-1' });

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await markDealPaid(undefined, fd);

    expect(result).toEqual({ message: 'Server error. Please try again.' });

    errorSpy.mockRestore();
  });
});
