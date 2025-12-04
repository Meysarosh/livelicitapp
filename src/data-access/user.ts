import { prisma } from '@/lib/db';

// CREATE USER
export async function createUser(nickname: string, email: string, hash: string) {
  return await prisma.user.create({
    data: { nickname, email, credentials: { create: { passHash: hash } } },
  });
}

// GET USER

export async function getUserProfile(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      nickname: true,
      fullName: true,
      phone: true,
      avatarUrl: true,
    },
  });
}

// UPDATE USER PROFILE
export async function updateUserProfile(
  userId: string,
  fullName: string | null,
  phone: string | null,
  avatarUrl?: string | undefined
) {
  return await prisma.user.update({
    where: { id: userId },
    data: { fullName, phone, avatarUrl },
  });
}
