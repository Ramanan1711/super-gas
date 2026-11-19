import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-middleware';
import { successResponse, badRequestResponse, notFoundResponse } from '@/lib/api-response';
import { completeDeliverySchema } from '@/lib/validations/delivery.schema';
import { DeliveryTransactionService } from '@/services/delivery-transaction.service';

export const POST = withApiHandler(async (
  req: NextRequest,
  context?: { params?: Promise<Record<string, string | string[]>> }
) => {
  const params = await context?.params;
  const id = Array.isArray(params?.id) ? params?.id[0] : params?.id;

  if (!id) {
    return badRequestResponse('Delivery task ID is required in URL parameter.');
  }

  const body = await req.json();
  const validatedInput = completeDeliverySchema.parse({
    ...body,
    taskId: id,
  });

  // 1. Check if DeliveryTask exists
  const task = await prisma.deliveryTask.findUnique({
    where: { id },
    include: {
      customer: true,
      items: { include: { product: true } },
      invoice: { include: { payments: true } },
    },
  });

  if (task) {
    if (task.status === 'COMPLETED') {
      return successResponse({
        message: 'Delivery was already completed.',
        task,
        invoice: task.invoice,
      }, 200);
    }

    const amount =
      body.amountCollected !== undefined
        ? Number(body.amountCollected)
        : (body.amount !== undefined ? Number(body.amount) : 0);

    let resolvedItems = validatedInput.items;
    if (!resolvedItems || resolvedItems.length === 0) {
      if (task.items.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolvedItems = task.items.map((i: any) => ({
          productId: i.productId,
          filledDelivered: i.filledDelivered,
          emptyCollected: body.emptyCollected !== undefined ? Number(body.emptyCollected) : i.emptyCollected,
          unitPrice: i.unitPrice,
        }));
      } else {
        const firstProduct = await prisma.cylinderProduct.findFirst();
        if (!firstProduct) return notFoundResponse('Cylinder Product');
        resolvedItems = [
          {
            productId: firstProduct.id,
            filledDelivered: body.quantity ? Number(body.quantity) : 1,
            emptyCollected: body.emptyCollected !== undefined ? Number(body.emptyCollected) : 1,
            unitPrice: amount > 0 ? amount : firstProduct.basePrice,
          },
        ];
      }
    } else {
      // Ensure each item has a valid productId
      resolvedItems = await Promise.all(
        resolvedItems.map(async (item) => {
          let prodId = item.productId;
          if (!prodId) {
            const p = await prisma.cylinderProduct.findFirst({
              where: {
                OR: [
                  { code: item.productCode },
                  { label: { contains: item.category || '19kg', mode: 'insensitive' } },
                ],
              },
            });
            prodId = p?.id;
          }
          if (!prodId) {
            const defaultP = await prisma.cylinderProduct.findFirst();
            prodId = defaultP?.id || '';
          }
          return {
            productId: prodId,
            filledDelivered: item.filledDelivered,
            emptyCollected: item.emptyCollected,
            unitPrice: item.unitPrice,
          };
        })
      );
    }

    const result = await DeliveryTransactionService.completeDelivery({
      taskId: id,
      items: resolvedItems,
      paymentMethod: validatedInput.paymentMethod,
      amountCollected: amount,
      paymentReference: validatedInput.paymentReference,
      notes: validatedInput.notes,
    });

    return successResponse({
      message: 'Delivery completed successfully and balances reconciled.',
      ...result,
    }, 200);
  }

  // 2. Check legacy delivery table
  const legacyDelivery = await prisma.delivery.findUnique({
    where: { id },
  });

  if (legacyDelivery) {
    const finalAmount =
      body.amountCollected !== undefined
        ? Number(body.amountCollected)
        : (body.amount !== undefined ? Number(body.amount) : legacyDelivery.amount);
    const finalEmpty =
      body.emptyCollected !== undefined ? Number(body.emptyCollected) : legacyDelivery.emptyCollected;

    const paymentMethodNorm = validatedInput.paymentMethod === 'UPI_QR' ? 'UPI' : validatedInput.paymentMethod;

    const updated = await prisma.delivery.update({
      where: { id },
      data: {
        status: 'DELIVERED',
        emptyCollected: finalEmpty,
        amount: finalAmount,
        paymentMethod: paymentMethodNorm,
        paymentStatus: 'PAID',
        deliveredAt: new Date(),
      },
      include: { customer: true },
    });

    const qtyDelivered = body.quantity ? Number(body.quantity) : legacyDelivery.quantity || 1;

    // Synchronize vehicle inventory: deduct delivered filled, add collected empties
    try {
      const partner = await prisma.deliveryPartner.findFirst({
        where: { status: { in: ['ACTIVE', 'ON_DUTY'] } },
        include: { assignedVehicle: true },
      });

      const vehicleId = partner?.assignedVehicleId || (await prisma.vehicle.findFirst())?.id;
      const defaultProduct =
        (await prisma.cylinderProduct.findFirst({
          where: {
            OR: [
              { code: 'DOM_14KG' },
              { label: { contains: '14.2', mode: 'insensitive' } },
            ],
          },
        })) || (await prisma.cylinderProduct.findFirst());

      if (vehicleId && defaultProduct) {
        const currentInv = await prisma.vehicleInventory.findUnique({
          where: {
            vehicleId_productId: {
              vehicleId,
              productId: defaultProduct.id,
            },
          },
        });

        if (currentInv) {
          await prisma.vehicleInventory.update({
            where: { id: currentInv.id },
            data: {
              filledCount: Math.max(0, currentInv.filledCount - qtyDelivered),
              emptyCount: currentInv.emptyCount + finalEmpty,
            },
          });
        }
      }

      // If CASH, record expected cash in driver daily settlement for day-end handover
      if (paymentMethodNorm === 'CASH' && partner && finalAmount > 0) {
        const todayDate = new Date(new Date().toISOString().slice(0, 10));
        const settlement = await prisma.dailySettlement.findUnique({
          where: {
            businessDate_partnerId: {
              businessDate: todayDate,
              partnerId: partner.id,
            },
          },
        });

        if (settlement) {
          const newExpected = settlement.cashExpected + finalAmount;
          const newRemaining = Math.max(0, newExpected - settlement.cashHandedOver);
          await prisma.dailySettlement.update({
            where: { id: settlement.id },
            data: {
              cashExpected: newExpected,
              remainingBalance: newRemaining,
              status: newRemaining === 0 ? 'VERIFIED' : 'PARTIALLY_HANDED_OVER',
            },
          });
        } else {
          await prisma.dailySettlement.create({
            data: {
              businessDate: todayDate,
              partnerId: partner.id,
              cashExpected: finalAmount,
              cashHandedOver: 0,
              remainingBalance: finalAmount,
              shortfallAmount: 0,
              status: 'PARTIALLY_HANDED_OVER',
            },
          });
        }
      }

      // Generate invoice record for customer billing
      const invoiceNumber = `#INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Date.now()).slice(-4)}`;
      await prisma.invoice.create({
        data: {
          invoiceNumber,
          customerId: legacyDelivery.customerId,
          totalAmount: finalAmount,
          taxAmount: 0,
          paymentStatus: 'PAID',
          pdfUrl: null,
          payments: {
            create: {
              amount: finalAmount,
              paymentMethod: paymentMethodNorm === 'CASH' ? 'CASH' : 'UPI',
              status: 'COMPLETED',
              collectedById: partner?.id || null,
            },
          },
        },
      });
    } catch (syncErr) {
      console.warn('Non-fatal warning synchronizing inventory/invoice for legacy delivery:', syncErr);
    }

    return successResponse({
      message: 'Delivery completed successfully.',
      delivery: updated,
    }, 200);
  }

  return notFoundResponse('Delivery task');
});
