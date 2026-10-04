import 'server-only';
import { prisma } from '@/lib/db';
import {
  User,
  UserWithCredentials,
  UserPasswordLookup,
  ProviderAccountWithUser,
} from '@/types/user';

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

export async function getUserWithCredentialsByIdentifier(
  identifier: string,
): Promise<UserWithCredentials | null> {
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
      credentials: {
        select: {
          passHash: true,
        },
      },
    },
  });
}

export async function getUserWithCredentialsById(
  userId: string,
): Promise<UserWithCredentials | null> {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: { credentials: true },
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
export async function createUserCredential(userId: string, passHash: string): Promise<void> {
  await prisma.userCredential.create({
    data: { userId, passHash },
  });
}

// GET USER CREDENTIAL
export async function hasUserCredential(userId: string): Promise<boolean> {
  const credential = await prisma.userCredential.findUnique({
    where: { userId },
  });
  return !!credential;
}

export async function getUserCredential(userId: string): Promise<UserPasswordLookup | null> {
  return await prisma.userCredential.findUnique({
    where: { userId },
    select: {
      userId: true,
      passHash: true,
    },
  });
}

// UPDATE USER CREDENTIAL
export async function updateUserCredential(userId: string, passHash: string): Promise<void> {
  await prisma.userCredential.update({
    where: { userId },
    data: { passHash },
  });
}

export async function getProviderAccountWithUser(
  provider: string,
  providerUserId: string,
): Promise<ProviderAccountWithUser | null> {
  return await prisma.userIdentity.findUnique({
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
  await prisma.userIdentity.upsert({
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
