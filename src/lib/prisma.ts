import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

// Explicit intersection ensures TypeScript in all IDEs recognizes dynamically added models
// without requiring manual TS Server restarts when schemas change.
export type AppPrismaClient = PrismaClient & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delivery: any;
};

const globalForPrisma = globalThis as unknown as {
  prisma: AppPrismaClient | undefined;
};

export const prisma = (globalForPrisma.prisma ?? new PrismaClient({ adapter })) as AppPrismaClient;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
