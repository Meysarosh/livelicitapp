'use server';

import { getPusherServer } from './pusher-server';

const userChannel = (userId: string) => `private-user-${userId}`;
const conversationChannel = (conversationId: string) => `private-conversation-${conversationId}`;

export async function emitNewMessageEvent(params: {
  conversationId: string;
  message: {
    id: string;
    body: string;
    kind: string;
    senderId: string | null;
    createdAt: Date;
  };
}) {
  const pusher = getPusherServer();
  const { conversationId, message } = params;

  await pusher.trigger(conversationChannel(conversationId), 'message:new', {
    id: message.id,
    conversationId,
    body: message.body,
    kind: message.kind,
    senderId: message.senderId,
    createdAt: message.createdAt.toISOString(),
  });
}

export async function emitConversationUpdatedForUsers(params: {
  conversationId: string;
  userAId: string;
  userBId: string;
}) {
  const pusher = getPusherServer();
  const { conversationId, userAId, userBId } = params;

  await pusher.trigger(userChannel(userAId), 'conversation:updated', { conversationId });
  await pusher.trigger(userChannel(userBId), 'conversation:updated', { conversationId });
}

export async function emitConversationRead(params: { conversationId: string; readerId: string; readAt: Date }) {
  const pusher = getPusherServer();
  const { conversationId, readerId, readAt } = params;

  await pusher.trigger(conversationChannel(conversationId), 'conversation:read', {
    conversationId,
    readerId,
    readAt: readAt.toISOString(),
  });
}
