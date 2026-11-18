import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

// Explicit intersection ensures TypeScript in all IDEs recognizes dynamically added models
// without requiring manual TS Server restarts when schemas change.
export type AppPrismaClient = PrismaClient & {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  user: any;
  depot: any;
  vehicle: any;
  deliveryPartner: any;
  partnerDocument: any;
  customer: any;
  customerLedgerEntry: any;
  cylinderProduct: any;
  depotInventory: any;
  vehicleInventory: any;
  stockTransferLog: any;
  stockTransferItem: any;
  deliveryTrip: any;
  deliveryTask: any;
  deliveryItem: any;
  invoice: any;
  paymentTransaction: any;
  expenseClaim: any;
  dailySettlement: any;
  cashHandoverEvent: any;
  delivery: any;
  [key: string]: any;
  /* eslint-enable @typescript-eslint/no-explicit-any */
};

const globalForPrisma = globalThis as unknown as {
  prisma: AppPrismaClient | undefined;
};

export const prisma = (globalForPrisma.prisma ?? new PrismaClient({ adapter })) as AppPrismaClient;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
