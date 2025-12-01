import { PrismaClient, Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';

type DbClient = PrismaClient | Prisma.TransactionClient;

//CREATE MESSAGE
type CreateMessageData = {
  conversationId: string;
  senderId: string | null;
  kind: 'TEXT' | 'SYSTEM';
  body: string;
};

export async function createMessage(data: CreateMessageData, tx: DbClient = prisma) {
  return await tx.message.create({
    data,
  });
}
