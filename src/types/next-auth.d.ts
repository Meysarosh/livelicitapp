// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth, { DefaultSession } from 'next-auth';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    id: string;
    role: 'ADMIN' | 'USER';
    email: string;
    nickname: string;
  }

  interface Session {
    user: {
      id: string;
      role: 'ADMIN' | 'USER';
      email: string;
      nickname: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    uid: string;
    role: 'ADMIN' | 'USER';
    nickname: string;
  }
}

export {};
