import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/db';
import bcrypt from 'bcrypt';
import { z } from 'zod';

const Creds = z.object({
  identifier: z.string(),
  password: z.string(),
});

export const credentialsProvider = Credentials({
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
});
