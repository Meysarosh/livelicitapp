import type { Account, Profile, User } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import { prisma } from '@/lib/db';

type SignInArgs = {
  user: User;
  account: Account | null;
  profile?: Profile | undefined;
};

export async function handleAuth0SignIn({ user, account, profile }: SignInArgs) {
  if (!account || account.provider !== 'auth0') {
    return true;
  }

  const provider = 'auth0';
  const providerUserId = account.providerAccountId;
  if (!providerUserId) {
    return false;
  }

  const existingIdentity = await prisma.userIdentity.findUnique({
    where: {
      provider_providerUserId: {
        provider,
        providerUserId,
      },
    },
  });

  let dbUser = null;

  if (existingIdentity) {
    dbUser = await prisma.user.findUnique({
      where: { id: existingIdentity.userId },
    });
  }

  const emailFromProfile =
    (profile && 'email' in profile && typeof profile.email === 'string' && profile.email) ||
    (user && typeof user.email === 'string' && user.email) ||
    undefined;

  if (!dbUser && emailFromProfile) {
    const byEmail = await prisma.user.findUnique({
      where: { email: emailFromProfile },
    });
    if (byEmail) {
      dbUser = byEmail;
    }
  }

  if (!dbUser) {
    const nicknameBase =
      (profile && 'nickname' in profile && typeof profile.nickname === 'string' && profile.nickname) ||
      (profile && 'name' in profile && typeof profile.name === 'string' && profile.name) ||
      (emailFromProfile ? emailFromProfile.split('@')[0] : 'user');

    const nickname = nicknameBase.slice(0, 50);

    dbUser = await prisma.user.create({
      data: {
        email: emailFromProfile || `${providerUserId}@example.com`,
        nickname,
      },
    });
  }

  await prisma.userIdentity.upsert({
    where: {
      provider_providerUserId: {
        provider,
        providerUserId,
      },
    },
    update: {
      userId: dbUser.id,
    },
    create: {
      userId: dbUser.id,
      provider,
      providerUserId,
    },
  });

  return true;
}

export async function applyAuth0IdentityToToken(token: JWT, account: Account | null | undefined) {
  if (!account || account.provider !== 'auth0') {
    return token;
  }

  const provider = 'auth0';
  const providerUserId = account.providerAccountId;

  const identity = await prisma.userIdentity.findUnique({
    where: {
      provider_providerUserId: {
        provider,
        providerUserId,
      },
    },
  });

  if (identity) {
    const dbUser = await prisma.user.findUnique({
      where: { id: identity.userId },
    });
    if (dbUser) {
      token.uid = dbUser.id;
      token.role = dbUser.role;
      token.nickname = dbUser.nickname;
    }
  }

  return token;
}
