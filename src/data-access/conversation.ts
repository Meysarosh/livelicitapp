import 'server-only';
import { prisma } from '@/lib/db';
import type { PrismaClient, Prisma } from '@prisma/client';
import {
  conversationDetailsArgs,
  conversationSummaryArgs,
  conversationForListArgs,
  type Conversation,
  type ConversationSummary,
  ConversationForList,
  ConversationDetails,
} from '@/types/conversation';
type DbClient = PrismaClient | Prisma.TransactionClient;

//CREATE CONVERSATION

//UPSERT CONVERSATION
export async function upsertConversation(
  auctionId: string,
  userAId: string,
  userBId: string,
  tx: DbClient = prisma,
): Promise<Conversation> {
  return await tx.conversation.upsert({
    where: {
      auctionId_userAId_userBId: {
        auctionId,
        userAId,
        userBId,
      },
    },
    create: {
      auctionId,
      userAId,
      userBId,
    },
    update: {},
  });
}

//GET CONVERSATION
export async function getConversationSummary(
  conversationId: string,
  tx: DbClient = prisma,
): Promise<ConversationSummary | null> {
  return await tx.conversation.findUnique({
    where: { id: conversationId },
    ...conversationSummaryArgs,
  });
}

//GET CONVERSATIONS

export async function getConversationDetails(
  conversationId: string,
  userId: string,
): Promise<ConversationDetails | null> {
  return await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [{ userAId: userId }, { userBId: userId }],
    },
    ...conversationDetailsArgs,
  });
}

export async function getUserConversations(userId: string): Promise<ConversationForList[]> {
  return prisma.conversation.findMany({
    where: {
      OR: [{ userAId: userId }, { userBId: userId }],
    },
    orderBy: { lastMessageAt: 'desc' },
    ...conversationForListArgs,
  });
}

export async function getUnreadMessagesCountForUser(userId: string, tx: DbClient = prisma) {
  return await Promise.all([
    tx.conversation.aggregate({
      _sum: { unreadCountA: true },
      where: { userAId: userId },
    }),
    tx.conversation.aggregate({
      _sum: { unreadCountB: true },
      where: { userBId: userId },
    }),
  ]);
}

//UPDATE CONVERSATION
export async function updateConversation(
  conversationId: string,
  data: Prisma.ConversationUpdateInput,
  tx: DbClient = prisma,
): Promise<Conversation> {
  return await tx.conversation.update({
    where: { id: conversationId },
    data,
  });
}
