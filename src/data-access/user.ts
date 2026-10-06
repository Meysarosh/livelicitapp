import 'server-only';
import { prisma } from '@/lib/db';
import { User, UserWithPassword, UserPasswordLookup, ProviderAccountWithUser } from '@/types/user';

// CREATE USER
export async function createUser(nickname: string, email: string, hash?: string): Promise<User> {
  return await prisma.user.create({
    data: { nickname, email, ...(hash ? { credentials: { create: { passHash: hash } } } : {}) },
  });
}

// GET USER

export async function getUserById(userId: string): Promise<User | null> {
  return await prisma.user.findUnique({
    where: { id: userId },
  });
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return await prisma.user.findUnique({
    where: { email },
  });
}

export async function getUserWithPasswordByIdentifier(
  identifier: string,
): Promise<UserWithPassword | null> {
  return await prisma.user.findFirst({
    where: {
      OR: [{ email: identifier }, { nickname: identifier }],
    },
    select: {
      id: true,
      email: true,
      nickname: true,
      role: true,
      status: true,
      password: {
        select: {
          passHash: true,
        },
      },
    },
  });
}

// UPDATE USER PROFILE
export async function updateUser(
  userId: string,
  fullName: string | null,
  phone: string | null,
  avatarUrl?: string | undefined,
): Promise<User | null> {
  return await prisma.user.update({
    where: { id: userId },
    data: { fullName, phone, avatarUrl },
  });
}

// CREATE USER CREDENTIAL
export async function createUserPassword(userId: string, passHash: string): Promise<void> {
  await prisma.password.create({
    data: { userId, passHash },
  });
}

// GET USER CREDENTIAL
export async function hasUserPassword(userId: string): Promise<boolean> {
  const credential = await prisma.password.findUnique({
    where: { userId },
  });
  return !!credential;
}

export async function getUserPassword(userId: string): Promise<UserPasswordLookup | null> {
  return await prisma.password.findUnique({
    where: { userId },
    select: {
      userId: true,
      passHash: true,
    },
  });
}

// UPDATE USER CREDENTIAL
export async function updateUserPassword(userId: string, passHash: string): Promise<void> {
  await prisma.password.update({
    where: { userId },
    data: { passHash },
  });
}

export async function getProviderAccountWithUser(
  provider: string,
  providerUserId: string,
): Promise<ProviderAccountWithUser | null> {
  return await prisma.providerAccount.findUnique({
    where: {
      provider_providerUserId: {
        provider,
        providerUserId,
      },
    },
    include: {
      user: true,
    },
  });
}

export async function upsertProviderAccount(
  userId: string,
  provider: string,
  providerUserId: string,
): Promise<void> {
  await prisma.providerAccount.upsert({
    where: {
      provider_providerUserId: {
        provider,
        providerUserId,
      },
    },
    update: {
      userId,
    },
    create: {
      userId,
      provider,
      providerUserId,
    },
  });
}
