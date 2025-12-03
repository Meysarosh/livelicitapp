import 'dotenv/config';
import type { PrismaConfig } from 'prisma';

//TODO propper config for prisma V7

export default {
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
} satisfies PrismaConfig;
