import { prisma } from '@/lib/db';

export async function createUser(nickname: string, email: string, hash: string) {
  return await prisma.user.create({
    data: { nickname, email, credentials: { create: { passHash: hash } } },
  });
}
