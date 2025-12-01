import type { PrismaClient, Prisma, Conversation, User, Auction, AuctionImage, Message } from '@prisma/client';
import { prisma } from '@/lib/db';

type DbClient = PrismaClient | Prisma.TransactionClient;

type BlankConversationData = {
  auctionId: string;
  userAId: string;
  userBId: string;
};

//CREATE CONVERSATION
// TODO remove if unused - upsertConversation covers this case
export async function createConversation(data: BlankConversationData, tx: DbClient = prisma): Promise<Conversation> {
  return await tx.conversation.create({
    data,
  });
}

//UPSERT CONVERSATION
export async function upsertConversation(
  auctionId: string,
  userAId: string,
  userBId: string,
  tx: DbClient = prisma
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
export async function getConversationById(conversationId: string, tx: DbClient = prisma): Promise<Conversation | null> {
  return await tx.conversation.findUnique({
    where: { id: conversationId },
  });
}

export async function getConversationForUser(conversationId: string, userId: string) {
  const convo = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      auction: {},
      userA: true,
      userB: true,
      messages: {
        orderBy: { createdAt: 'asc' },
        include: { sender: true },
      },
    },
  });

  if (!convo) return null;

  if (convo.userAId !== userId && convo.userBId !== userId) {
    return null;
  }

  return convo;
}

//GET CONVERSATIONS

//  WITH LAST MESSAGE PREVIEW
export type ConversationWithRelations = Conversation & {
  auction: Auction & { images: AuctionImage[] };
  userA: User;
  userB: User;
  messages: (Message & { sender: User | null })[];
};

export async function getUserConversations(userId: string): Promise<ConversationWithRelations[]> {
  return prisma.conversation.findMany({
    where: {
      OR: [{ userAId: userId }, { userBId: userId }],
    },
    orderBy: { lastMessageAt: 'desc' },
    include: {
      auction: {
        include: {
          images: { orderBy: { position: 'asc' }, take: 1 },
        },
      },
      userA: true,
      userB: true,
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: { sender: true },
      },
    },
  });
}

//UPDATE CONVERSATION
export async function updateConversation(
  conversationId: string,
  data: Prisma.ConversationUpdateInput,
  tx: DbClient = prisma
): Promise<Conversation> {
  return await tx.conversation.update({
    where: { id: conversationId },
    data,
  });
}
