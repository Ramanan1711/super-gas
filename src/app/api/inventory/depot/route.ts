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

export const POST = withApiHandler(async (req: NextRequest) => {
  const body = await req.json();
  const depotCode = body.depotCode || 'MDU-HQ';

  const depot = await prisma.depot.findUnique({
    where: { code: depotCode },
  });

  if (!depot) {
    return notFoundResponse('Depot');
  }

  // Items to inward or adjust
  const items = Array.isArray(body.items) ? body.items : [body];
  const updatedRecords = [];

  for (const item of items) {
    const sizeName = item.size || item.cylinderType || item.label || '19.5 kg Commercial';
    const isFilled = item.isFilled !== false && !item.state?.toLowerCase().includes('empty');
    const qty = parseInt(item.quantity || item.qty || '0', 10);

    if (qty <= 0) continue;

    // Find matching cylinder product
    let product = await prisma.cylinderProduct.findFirst({
      where: {
        OR: [
          { label: { contains: sizeName.split(' ')[0] } },
          { code: { contains: sizeName.split(' ')[0] } },
        ],
      },
    });

    if (!product) {
      product = await prisma.cylinderProduct.create({
        data: {
          code: `CYL-${Date.now()}`,
          label: sizeName,
          weightKg: parseFloat(sizeName) || 19.5,
          unitPrice: 1950.0,
        },
      });
    }

    const depotInv = await prisma.depotInventory.upsert({
      where: {
        depotId_productId: {
          depotId: depot.id,
          productId: product.id,
        },
      },
      update: isFilled
        ? { filledCount: { increment: qty } }
        : { emptyCount: { increment: qty } },
      create: {
        depotId: depot.id,
        productId: product.id,
        filledCount: isFilled ? qty : 0,
        emptyCount: isFilled ? 0 : qty,
        damagedCount: 0,
      },
      include: {
        product: true,
      },
    });

    updatedRecords.push(depotInv);
  }

  return successResponse(
    {
      message: 'Inward inventory recorded successfully.',
      updatedRecords,
    },
    201
  );
});
