import NextAuth from 'next-auth';
import Auth0 from 'next-auth/providers/auth0';
import { credentialsProvider } from '@/lib/auth/credentials-auth';
import { handleAuth0SignIn, applyAuth0IdentityToToken } from '@/lib/auth/auth0-support';

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  providers: [
    credentialsProvider,

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
      return handleAuth0SignIn({ user, account: account ?? null, profile });
    },

    async jwt({ token, user, account }) {
      if (user && account?.provider === 'credentials') {
        token.uid = user.id;
        token.role = user.role;
        token.nickname = user.nickname;
        return token;
      }

      if (account?.provider === 'auth0') {
        return applyAuth0IdentityToToken(token, account);
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
