import { prisma } from '@/lib/db';

// CREATE USER CREDENTIAL
export async function createUserCredential(userId: string, passHash: string) {
  return await prisma.userCredential.create({
    data: { userId, passHash },
  });
}

// UPDATE USER CREDENTIAL
export async function updateUserCredential(userId: string, passHash: string) {
  return await prisma.userCredential.update({
    where: { userId },
    data: { passHash },
  });
}
