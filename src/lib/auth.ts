import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Auth0 from 'next-auth/providers/auth0';
import { prisma } from '@/lib/db';
import bcrypt from 'bcrypt';
import { z } from 'zod';

const Creds = z.object({
  identifier: z.string(),
  password: z.string(),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        identifier: { label: 'Email or nickname' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (creds) => {
        const parsed = Creds.safeParse(creds);
        if (!parsed.success) return null;

        const { identifier, password } = parsed.data;

        const user = await prisma.user.findFirst({
          where: {
            OR: [{ email: identifier }, { nickname: identifier }],
          },
          include: { credentials: true },
        });

        if (!user?.credentials) return null;

        const ok = await bcrypt.compare(password, user.credentials.passHash);
        if (!ok) return null;

        if (user.status !== 'OK') return null;

        return {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          role: user.role,
        };
      },
    }),

    Auth0({
      clientId: process.env.AUTH0_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET!,
      issuer: process.env.AUTH0_ISSUER!,
    }),
  ],

  pages: {
    signIn: '/login',
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      if (!account || account.provider !== 'auth0') {
        return true;
      }

      const provider = 'auth0';
      const providerUserId = account.providerAccountId;
      if (!providerUserId) {
        return false;
      }

      // 1) If identity already exists, we are done (link already in place)
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

      // 2) Try to find user by email if no identity yet
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

      // 3) If still no user, create one (Auth0-first signup)
      if (!dbUser) {
        const nicknameBase =
          (profile && 'nickname' in profile && typeof profile.nickname === 'string' && profile.nickname) ||
          (profile && 'name' in profile && typeof profile.name === 'string' && profile.name) ||
          (emailFromProfile ? emailFromProfile.split('@')[0] : 'user');

        const nickname = nicknameBase.slice(0, 50);

        dbUser = await prisma.user.create({
          data: {
            email: emailFromProfile || `${providerUserId}@example.com`, // fallback if no email from Auth0
            nickname,
          },
        });
      }

      // 4) Ensure UserIdentity row exists and is linked to this user
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
    },

    async jwt({ token, user, account }) {
      if (user && account?.provider === 'credentials') {
        token.uid = user.id;
        token.role = user.role;
        token.nickname = user.nickname;
        return token;
      }

      if (account?.provider === 'auth0') {
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
            return token;
          }
        }
      }

      if (token.uid) {
        return token;
      }

      if (!token.uid && token.sub) {
        token.uid = token.sub;
      }

      return token;
    },

    async session({ session, token }) {
      if (!session.user) return session;

      session.user.id = token.uid;
      session.user.role = token.role;
      session.user.nickname = token.nickname;

      return session;
    },
  },
});
