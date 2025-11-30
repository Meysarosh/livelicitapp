import 'next-auth';
import 'next-auth/jwt';

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
