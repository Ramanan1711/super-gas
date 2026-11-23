import { NextRequest } from 'next/server';
import { withApiHandler, requireAdmin } from '@/lib/api-middleware';
import { successResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';

export const GET = withApiHandler(async (req: NextRequest) => {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.response;

  const [
    totalCustomers,
    totalDrivers,
    totalVehicles,
    pendingDeliveries,
    completedDeliveries,
    pendingExpenseClaims,
    depotStocks,
    vehicleStocks,
    todaySettlement,
    invoiceAgg,
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
    prisma.vehicleInventory.findMany(),
    prisma.dailySettlement.findFirst({
      orderBy: { businessDate: 'desc' },
    }),
    prisma.invoice.aggregate({
      _sum: {
        totalAmount: true,
        paidAmount: true,
      },
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

  let totalVehicleFilled = 0;
  let totalVehicleEmpty = 0;
  vehicleStocks.forEach((v: { filledCount: number; emptyCount: number }) => {
    totalVehicleFilled += v.filledCount;
    totalVehicleEmpty += v.emptyCount;
  });

  const completedDeliveriesList = await prisma.delivery.findMany({
    where: { status: 'DELIVERED' },
  });
  let customerHolding = 0;
  for (const d of completedDeliveriesList) {
    customerHolding += Math.max(0, d.quantity - (d.emptyCollected || 0));
  }

  const totalDepotCylinders = totalFilledCylinders + totalEmptyCylinders + totalDamagedCylinders;
  const totalVehicleCylinders = totalVehicleFilled + totalVehicleEmpty;
  const cylindersInCirculation = totalDepotCylinders + totalVehicleCylinders + customerHolding;

  const totalRevenue = invoiceAgg._sum.paidAmount ?? invoiceAgg._sum.totalAmount ?? 0;
  const todayCollection = todaySettlement?.cashHandedOver ?? 0;
  const activeVehicles = totalVehicles;

  return successResponse({
    totalRevenue,
    todayCollection,
    activeVehicles,
    cylindersInCirculation,
    warehouseCylinders: totalDepotCylinders,
    vanCylinders: totalVehicleCylinders,
    customerHolding,
    metrics: {
      totalRevenue,
      todayCollection,
      activeVehicles,
      cylindersInCirculation,
      warehouseCylinders: totalDepotCylinders,
      vanCylinders: totalVehicleCylinders,
      completedDeliveries,
      pendingDeliveries,
    },
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
      vehicleFilled: totalVehicleFilled,
      vehicleEmpty: totalVehicleEmpty,
      totalInDepot: totalDepotCylinders,
      totalInVehicle: totalVehicleCylinders,
      totalInCirculation: cylindersInCirculation,
      customerHolding,
    },
    pendingApprovals: {
      expenseClaims: pendingExpenseClaims,
    },
  });
});
