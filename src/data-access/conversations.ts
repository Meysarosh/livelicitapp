import type { PrismaClient, Prisma, Conversation } from '@prisma/client';
import { prisma } from '@/lib/db';

type DbClient = PrismaClient | Prisma.TransactionClient;

type BlankConversationData = {
  auctionId: string;
  userAId: string;
  userBId: string;
};

//CREATE CONVERSATION
export async function createConversation(data: BlankConversationData, tx: DbClient = prisma): Promise<Conversation> {
  return await tx.conversation.create({
    data,
  });
}

//GET CONVERSATION BY AUCTION AND USERS
export async function getConversationByAuctionAndUsers(
  auctionId: string,
  sellerId: string,
  buyerId: string,
  tx: DbClient = prisma
): Promise<Conversation | null> {
  return await tx.conversation.findFirst({
    where: {
      auctionId,
      OR: [
        { userAId: sellerId, userBId: buyerId },
        { userAId: buyerId, userBId: sellerId },
      ],
    },
  });
}
