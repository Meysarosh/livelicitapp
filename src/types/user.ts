import { Prisma } from '@prisma/client';

export type User = Prisma.UserGetPayload<Prisma.UserDefaultArgs>;

export type SessionUser = Pick<User, 'id' | 'nickname' | 'email'> & {
  role: 'USER' | 'ADMIN';
};

export type UserWithCredentials = Pick<
  Prisma.UserGetPayload<{
    include: { credentials: { select: { passHash: true } } };
  }>,
  'id' | 'email' | 'nickname' | 'role' | 'status' | 'credentials'
>;

export type UserPasswordLookup = Pick<
  Prisma.UserCredentialGetPayload<Prisma.UserCredentialDefaultArgs>,
  'userId' | 'passHash'
>;

export type ProviderAccountWithUser = Prisma.UserIdentityGetPayload<{
  include: { user: true };
}>;
