import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-middleware';
import { successResponse, notFoundResponse } from '@/lib/api-response';

export const GET = withApiHandler(async (req: NextRequest) => {
  const depotCode = req.nextUrl.searchParams.get('depotCode') || 'MDU-HQ';

  const depot = await prisma.depot.findUnique({
    where: { code: depotCode },
    include: {
      inventory: {
        include: {
          product: true,
        },
      },
      vehicles: true,
    },
  });

  if (!depot) {
    return notFoundResponse('Depot');
  }

  let totalFilled = 0;
  let totalEmpty = 0;
  let totalDamaged = 0;

  const inventory = depot.inventory.map((inv: {
    product: { id: string; code: string; label: string; unitPrice: number };
    filledCount: number;
    emptyCount: number;
    damagedCount: number;
  }) => {
    totalFilled += inv.filledCount;
    totalEmpty += inv.emptyCount;
    totalDamaged += inv.damagedCount;

    return {
      productId: inv.product.id,
      code: inv.product.code,
      label: inv.product.label,
      unitPrice: inv.product.unitPrice,
      filled: inv.filledCount,
      empty: inv.emptyCount,
      damaged: inv.damagedCount,
    };
  });

  return successResponse({
    depot: {
      id: depot.id,
      code: depot.code,
      name: depot.name,
      city: depot.city,
    },
    summary: {
      totalFilled,
      totalEmpty,
      totalDamaged,
      totalCylinders: totalFilled + totalEmpty + totalDamaged,
    },
    inventory,
  });
});
