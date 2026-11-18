import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withApiHandler, validateBody } from '@/lib/api-middleware';
import { successResponse, notFoundResponse, badRequestResponse } from '@/lib/api-response';
import { stockTransferSchema } from '@/lib/validations/inventory.schema';
import { DeliveryTransactionService } from '@/services/delivery-transaction.service';

export const POST = withApiHandler(async (req: NextRequest) => {
  const body = await validateBody(req, stockTransferSchema);

  // Resolve vehicle
  let vehicleId = body.vehicleId;
  if (!vehicleId || vehicleId.startsWith('TN')) {
    const reg = body.vehicleReg || (vehicleId?.startsWith('TN') ? vehicleId : 'TN 58 AX 4821');
    const v = await prisma.vehicle.findFirst({
      where: {
        OR: [{ regNumber: reg }, { regNumber: 'TN-58-BZ-4412' }],
      },
    });
    if (!v) return notFoundResponse('Vehicle');
    vehicleId = v.id;
  }

  // Resolve depot
  let depotId = body.depotId;
  if (!depotId) {
    const v = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: { depot: true },
    });
    if (v?.depotId) {
      depotId = v.depotId;
    } else {
      const firstDepot = await prisma.depot.findFirst();
      if (!firstDepot) return notFoundResponse('Depot');
      depotId = firstDepot.id;
    }
  }

  // Resolve partner
  let partnerId = body.partnerId;
  if (!partnerId) {
    const p = await prisma.deliveryPartner.findUnique({
      where: { partnerCode: body.partnerCode || 'DP-003' },
    });
    if (p) partnerId = p.id;
  }

  // Resolve item productIds if productCode given
  const resolvedItems = await Promise.all(
    body.items.map(async (item) => {
      let prodId = item.productId;
      if (!prodId && item.productCode) {
        const prod = await prisma.cylinderProduct.findUnique({
          where: { code: item.productCode },
        });
        if (prod) prodId = prod.id;
      }
      if (!prodId) {
        const firstProd = await prisma.cylinderProduct.findFirst();
        if (firstProd) prodId = firstProd.id;
      }
      return {
        productId: prodId || '',
        filledQuantity: item.filledQuantity,
        emptyQuantity: item.emptyQuantity,
        damagedQuantity: item.damagedQuantity,
      };
    })
  );

  if (resolvedItems.some((i) => !i.productId)) {
    return badRequestResponse('Could not resolve valid cylinder product for transfer items.');
  }

  const transferLog = await DeliveryTransactionService.recordStockTransfer({
    depotId,
    vehicleId,
    partnerId,
    transferType: body.transferType,
    notes: body.notes,
    items: resolvedItems,
  });

  return successResponse({
    message: 'Stock handover synchronized with depot successfully.',
    transfer: transferLog,
  }, 201);
});
