import 'server-only';
import type { Account, Profile, User as NextAuthUser } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import type { User } from '@/types/user';
import {
  getProviderAccountWithUser,
  createUser,
  getUserByEmail,
  upsertProviderAccount,
} from '@/data-access/user';

type SignInArgs = {
  user: NextAuthUser;
  account: Account | null;
  profile?: Profile | undefined;
};

export async function handleAuth0SignIn({ user, account, profile }: SignInArgs): Promise<boolean> {
  if (!account || account.provider !== 'auth0') {
    return true;
  }

  const provider = 'auth0';
  const providerUserId = account.providerAccountId;
  if (!providerUserId) {
    return false;
  }

  try {
    let dbUser: User | null = null;

    const existingProviderAccount = await getProviderAccountWithUser(provider, providerUserId);

    if (existingProviderAccount) {
      dbUser = existingProviderAccount.user;
    }

    const emailFromProfile =
      (profile && 'email' in profile && typeof profile.email === 'string' && profile.email) ||
      (user && typeof user.email === 'string' && user.email) ||
      undefined;

    if (!dbUser && emailFromProfile) {
      const userByEmail = await getUserByEmail(emailFromProfile);
      if (userByEmail) {
        dbUser = userByEmail;
      }
    }

    if (dbUser && dbUser.status !== 'OK') {
      console.warn(`[Auth0 SignIn] Rejected user ${dbUser.id} with status: ${dbUser.status}`);
      return false;
    }

    if (!dbUser) {
      const nicknameBase =
        (profile &&
          'nickname' in profile &&
          typeof profile.nickname === 'string' &&
          profile.nickname) ||
        (profile && 'name' in profile && typeof profile.name === 'string' && profile.name) ||
        (emailFromProfile ? emailFromProfile.split('@')[0] : 'user');

      const safeNickname = nicknameBase!.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 30);
      const uniqueNickname = `${safeNickname}_${Math.random().toString(36).slice(2, 7)}`;

      dbUser = await createUser(
        uniqueNickname,
        emailFromProfile || `${providerUserId}@example.com`,
      );
    }

    await upsertProviderAccount(dbUser.id, provider, providerUserId);

    return true;
  } catch (error) {
    console.error('[Auth0 SignIn Callback Error]:', error);

    return false;
  }
}

export async function applyAuth0IdentityToToken(
  token: JWT,
  account: Account | null | undefined,
): Promise<JWT> {
  if (!account || account.provider !== 'auth0') {
    return token;
  }

  const provider = 'auth0';
  const providerUserId = account.providerAccountId;

  if (!providerUserId) {
    throw new Error('[applyAuth0IdentityToToken] Missing providerAccountId on account');
  }

  const providerAccount = await getProviderAccountWithUser(provider, providerUserId);
  const user = providerAccount?.user;

  if (!user) {
    throw new Error('[applyAuth0IdentityToToken] No user mapped to Auth0 identity');
  }

  if (user.status !== 'OK') {
    throw new Error(
      `[applyAuth0IdentityToToken] User ${user.id} has non-active status: ${user.status}`,
    );
  }

  token.uid = user.id;
  token.role = user.role;
  token.nickname = user.nickname;

  return token;
}
