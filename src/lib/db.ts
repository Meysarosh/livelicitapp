// export const prisma = globalThis.prisma || new PrismaClient()
// if (process.env.NODE_ENV !== 'production') (globalThis as any).prisma = prisma

import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
