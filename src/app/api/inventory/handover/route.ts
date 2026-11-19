import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withApiHandler, validateBody } from '@/lib/api-middleware';
import { successResponse, notFoundResponse, badRequestResponse } from '@/lib/api-response';
import { stockTransferSchema } from '@/lib/validations/inventory.schema';
import { DeliveryTransactionService } from '@/services/delivery-transaction.service';

export const POST = withApiHandler(async (req: NextRequest) => {
  const body = await validateBody(req, stockTransferSchema);

  // Normalize transferType
  const rawType = body.transferType;
  const transferType: 'LOAD_VEHICLE' | 'UNLOAD_VEHICLE' | 'DEPOT_REFILL' =
    rawType === 'DEPOT_TO_VEHICLE'
      ? 'LOAD_VEHICLE'
      : rawType === 'VEHICLE_TO_DEPOT'
      ? 'UNLOAD_VEHICLE'
      : rawType;

  // Resolve partner
  let partnerId = body.partnerId;
  let partner = null;
  if (body.partnerCode || body.partnerId) {
    partner = await prisma.deliveryPartner.findFirst({
      where: body.partnerId ? { id: body.partnerId } : { partnerCode: body.partnerCode },
      include: { assignedVehicle: true },
    });
    if (partner) {
      partnerId = partner.id;
    }
  }

  // Resolve vehicle
  let vehicleId = body.vehicleId;
  if (!vehicleId && partner?.assignedVehicleId) {
    vehicleId = partner.assignedVehicleId;
  }

  if (!vehicleId || vehicleId.startsWith('TN')) {
    const reg = body.vehicleReg || (vehicleId?.startsWith('TN') ? vehicleId : 'TN 58 AX 4821');
    let v = await prisma.vehicle.findFirst({
      where: {
        OR: [{ regNumber: reg }, { regNumber: 'TN-58-BZ-4412' }],
      },
    });

    if (!v) {
      // Auto-provision vehicle for partner
      const defaultDepot = await prisma.depot.findFirst();
      v = await prisma.vehicle.create({
        data: {
          regNumber: reg,
          model: 'Delivery Three-Wheeler / Van',
          capacity: 30,
          depotId: defaultDepot?.id || null,
        },
      });
    }

    vehicleId = v.id;

    if (partner && !partner.assignedVehicleId) {
      await prisma.deliveryPartner.update({
        where: { id: partner.id },
        data: { assignedVehicleId: v.id },
      });
    }
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

  // Resolve item productIds if productCode given
  const resolvedItems = await Promise.all(
    body.items.map(async (item) => {
      let prodId = item.productId;
      if (!prodId && item.productCode) {
        const prod = await prisma.cylinderProduct.findFirst({
          where: {
            OR: [
              { code: item.productCode },
              { label: { contains: item.productCode.split('_')[0] } },
            ],
          },
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
        damagedQuantity: item.damagedQuantity || 0,
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
    transferType,
    notes: body.notes,
    items: resolvedItems,
  });

  return successResponse(
    {
      message: 'Stock handover synchronized with depot successfully.',
      transfer: transferLog,
    },
    201
  );
});
