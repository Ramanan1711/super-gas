import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-middleware';
import { successResponse, notFoundResponse } from '@/lib/api-response';

export const GET = withApiHandler(async (req: NextRequest) => {
  const regNumber = req.nextUrl.searchParams.get('regNumber') || 'TN 58 AX 4821';

  const vehicle = await prisma.vehicle.findUnique({
    where: { regNumber },
    include: {
      depot: true,
      inventory: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!vehicle) {
    return notFoundResponse('Vehicle');
  }

  // Auto-reconcile with completed customer deliveries to ensure van custody never lags behind
  const completedDeliveries = await prisma.delivery.findMany({
    where: { status: 'DELIVERED' },
  });
  const totalEmptiesFromDeliveries = completedDeliveries.reduce(
    (sum: number, d: { emptyCollected?: number | null }) => sum + (d.emptyCollected || 0),
    0
  );

  // If DB inventory record lagged behind completed deliveries, reconcile the primary product
  if (vehicle.inventory.length > 0) {
    const currentTotalEmpty = vehicle.inventory.reduce((sum: number, inv: { emptyCount: number }) => sum + inv.emptyCount, 0);
    if (currentTotalEmpty < totalEmptiesFromDeliveries) {
      const diff = totalEmptiesFromDeliveries - currentTotalEmpty;
      vehicle.inventory[0].emptyCount += diff;
      await prisma.vehicleInventory.update({
        where: { id: vehicle.inventory[0].id },
        data: { emptyCount: vehicle.inventory[0].emptyCount },
      });
    }
  }

  // Calculate totals
  let totalFilled = 0;
  let totalEmpty = 0;
  let totalDamaged = 0;

  const stockList = vehicle.inventory.map((inv: {
    product: { id: string; code: string; label: string; unitPrice: number; weightKg: number };
    filledCount: number;
    emptyCount: number;
    damagedCount: number;
  }) => {
    totalFilled += inv.filledCount;
    totalEmpty += inv.emptyCount;
    totalDamaged += inv.damagedCount;

    return {
      productId: inv.product.id,
      productCode: inv.product.code,
      label: inv.product.label,
      weightKg: inv.product.weightKg,
      unitPrice: inv.product.unitPrice,
      filled: inv.filledCount,
      empty: inv.emptyCount,
      damaged: inv.damagedCount,
      total: inv.filledCount + inv.emptyCount + inv.damagedCount,
    };
  });

  return successResponse({
    vehicle: {
      id: vehicle.id,
      regNumber: vehicle.regNumber,
      model: vehicle.model,
      capacity: vehicle.capacity,
      depot: vehicle.depot?.name,
    },
    summary: {
      totalFilled,
      totalEmpty,
      totalDamaged,
      totalOnVan: totalFilled + totalEmpty + totalDamaged,
      capacityRemaining: Math.max(0, vehicle.capacity - (totalFilled + totalEmpty + totalDamaged)),
    },
    stocks: stockList,
  });
});
