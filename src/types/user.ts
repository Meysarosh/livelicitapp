import { Prisma } from '@prisma/client';

export type User = Prisma.UserGetPayload<Prisma.UserDefaultArgs>;

export type SessionUser = Pick<User, 'id' | 'nickname' | 'email'> & {
  role: 'USER' | 'ADMIN';
};

export type UserWithPassword = Pick<
  Prisma.UserGetPayload<{
    include: { password: { select: { passHash: true } } };
  }>,
  'id' | 'email' | 'nickname' | 'role' | 'status' | 'password'
>;

export type UserPasswordLookup = Pick<
  Prisma.PasswordGetPayload<Prisma.PasswordDefaultArgs>,
  'userId' | 'passHash'
>;

export type ProviderAccountWithUser = Prisma.ProviderAccountGetPayload<{
  include: { user: true };
}>;
