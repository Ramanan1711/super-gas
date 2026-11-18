import { withApiHandler } from '@/lib/api-middleware';
import { successResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';

export const GET = withApiHandler(async () => {
  const [
    totalCustomers,
    totalDrivers,
    totalVehicles,
    pendingDeliveries,
    completedDeliveries,
    pendingExpenseClaims,
    depotStocks,
    todaySettlement,
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.deliveryPartner.count({ where: { status: { in: ['ACTIVE', 'ON_DUTY'] } } }),
    prisma.vehicle.count({ where: { isActive: true } }),
    prisma.deliveryTask.count({ where: { status: 'PENDING' } }),
    prisma.deliveryTask.count({ where: { status: 'COMPLETED' } }),
    prisma.expenseClaim.count({ where: { status: 'PENDING' } }),
    prisma.depotInventory.findMany({
      include: { product: true, depot: true },
    }),
    prisma.dailySettlement.findFirst({
      orderBy: { businessDate: 'desc' },
    }),
  ]);

  let totalFilledCylinders = 0;
  let totalEmptyCylinders = 0;
  let totalDamagedCylinders = 0;

  depotStocks.forEach((item: { filledCount: number; emptyCount: number; damagedCount: number }) => {
    totalFilledCylinders += item.filledCount;
    totalEmptyCylinders += item.emptyCount;
    totalDamagedCylinders += item.damagedCount;
  });

  return successResponse({
    fleet: {
      activeDrivers: totalDrivers,
      activeVehicles: totalVehicles,
      totalCustomers,
    },
    deliveries: {
      pending: pendingDeliveries,
      completed: completedDeliveries,
      totalToday: pendingDeliveries + completedDeliveries,
    },
    cashReconciliation: {
      cashExpected: todaySettlement?.cashExpected || 0,
      cashReceived: todaySettlement?.cashHandedOver || 0,
      pendingHandover: todaySettlement?.remainingBalance || 0,
      settlementStatus: todaySettlement?.status || 'VERIFIED',
    },
    inventory: {
      depotFilled: totalFilledCylinders,
      depotEmpty: totalEmptyCylinders,
      depotDamaged: totalDamagedCylinders,
      totalInDepot: totalFilledCylinders + totalEmptyCylinders + totalDamagedCylinders,
    },
    pendingApprovals: {
      expenseClaims: pendingExpenseClaims,
    },
  });
});
