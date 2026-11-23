import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withApiHandler, getAuthenticatedUser } from '@/lib/api-middleware';
import { successResponse, notFoundResponse } from '@/lib/api-response';

export const GET = withApiHandler(async (req: NextRequest) => {
  let queryParam =
    req.nextUrl.searchParams.get('regNumber') ||
    req.nextUrl.searchParams.get('vehicleReg') ||
    req.nextUrl.searchParams.get('vehicleId');

  if (!queryParam) {
    const authUser = await getAuthenticatedUser(req);
    if (authUser) {
      const partner = await prisma.deliveryPartner.findUnique({
        where: { userId: authUser.id },
        include: { assignedVehicle: true },
      });
      if (partner?.assignedVehicle?.regNumber) {
        queryParam = partner.assignedVehicle.regNumber;
      }
    }
  }

  if (!queryParam) {
    queryParam = 'TN 58 AX 4821';
  }

  const vehicle = await prisma.vehicle.findFirst({
    where: {
      OR: [
        { regNumber: queryParam },
        { id: queryParam },
      ],
    },
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

  // Calculate totals from actual vehicle inventory records
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
