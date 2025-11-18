import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
// import Auth0 from 'next-auth/providers/auth0' // enable later
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
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // re-issue token at most once per day
  },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: { identifier: { label: 'Email or nickname' }, password: { label: 'Password', type: 'password' } },
      authorize: async (creds) => {
        const parsed = Creds.safeParse(creds);
        if (!parsed.success) return null;

        const { identifier, password } = parsed.data;

        const user = await prisma.user.findFirst({
          where: { OR: [{ email: identifier }, { nickname: identifier }] },
          include: { credentials: true },
        });
        if (!user?.credentials) return null;
        const ok = await bcrypt.compare(password, user.credentials.passHash);
        if (!ok) return null;
        if (user.status !== 'OK') return null;
        return { id: user.id, email: user.email, nickname: user.nickname, role: user.role };
      },
    }),
    // Auth0({
    // clientId: process.env.AUTH0_CLIENT_ID!,
    // clientSecret: process.env.AUTH0_CLIENT_SECRET!,
    // issuer: process.env.AUTH0_ISSUER!,
    // })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        token.role = user.role;
        token.nickname = user.nickname;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.uid;
      session.user.role = token.role;
      session.user.nickname = token.nickname;
      return session;
    },
  },
});
