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
    const qtyDelivered = body.quantity ? Number(body.quantity) : legacyDelivery.quantity || 1;

    // Resolve active delivery partner (from session cookies if available, or fallback to active partner)
    const cookiePartnerCode = req.cookies.get('partner_code')?.value;
    const cookieUserId = req.cookies.get('user_id')?.value;

    const result = await prisma.$transaction(async (tx) => {
      let partner = null;
      if (cookiePartnerCode) {
        partner = await tx.deliveryPartner.findUnique({
          where: { partnerCode: cookiePartnerCode },
          include: { assignedVehicle: true },
        });
      } else if (cookieUserId) {
        partner = await tx.deliveryPartner.findFirst({
          where: { userId: cookieUserId },
          include: { assignedVehicle: true },
        });
      }

      if (!partner) {
        partner = await tx.deliveryPartner.findFirst({
          where: { status: { in: ['ACTIVE', 'ON_DUTY'] } },
          include: { assignedVehicle: true },
        });
      }

      // 1. Update delivery status
      const updated = await tx.delivery.update({
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

      // 2. Synchronize vehicle inventory: deduct delivered filled, add collected empties
      const vehicleId = partner?.assignedVehicleId || (await tx.vehicle.findFirst())?.id;
      const defaultProduct =
        (await tx.cylinderProduct.findFirst({
          where: {
            OR: [
              { code: 'DOM_14KG' },
              { label: { contains: '14.2', mode: 'insensitive' } },
            ],
          },
        })) || (await tx.cylinderProduct.findFirst());

      if (vehicleId) {
        if (body.items && Array.isArray(body.items) && body.items.length > 0) {
          for (const item of body.items) {
            const p = await tx.cylinderProduct.findFirst({
              where: {
                OR: [
                  { code: item.productCode },
                  { label: { contains: item.category || '14.2', mode: 'insensitive' } },
                ],
              },
            });
            if (p) {
              const currentInv = await tx.vehicleInventory.findUnique({
                where: {
                  vehicleId_productId: {
                    vehicleId,
                    productId: p.id,
                  },
                },
              });

              if (currentInv) {
                await tx.vehicleInventory.update({
                  where: { id: currentInv.id },
                  data: {
                    filledCount: Math.max(0, currentInv.filledCount - (item.filledDelivered || 1)),
                    emptyCount: currentInv.emptyCount + (item.emptyCollected || 0),
                  },
                });
              } else {
                await tx.vehicleInventory.create({
                  data: {
                    vehicleId,
                    productId: p.id,
                    filledCount: 0,
                    emptyCount: item.emptyCollected || 0,
                  },
                });
              }
            }
          }
        } else if (defaultProduct) {
          const currentInv = await tx.vehicleInventory.findUnique({
            where: {
              vehicleId_productId: {
                vehicleId,
                productId: defaultProduct.id,
              },
            },
          });

          if (currentInv) {
            await tx.vehicleInventory.update({
              where: { id: currentInv.id },
              data: {
                filledCount: Math.max(0, currentInv.filledCount - qtyDelivered),
                emptyCount: currentInv.emptyCount + finalEmpty,
              },
            });
          }
        }
      }

      // 3. If CASH, record expected cash in driver daily settlement for day-end handover
      if (paymentMethodNorm === 'CASH' && partner && finalAmount > 0) {
        const todayDate = new Date(new Date().toISOString().slice(0, 10));
        const settlement = await tx.dailySettlement.findUnique({
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
          await tx.dailySettlement.update({
            where: { id: settlement.id },
            data: {
              cashExpected: newExpected,
              remainingBalance: newRemaining,
              status: newRemaining === 0 ? 'VERIFIED' : 'PARTIALLY_HANDED_OVER',
            },
          });
        } else {
          await tx.dailySettlement.create({
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

      // 4. Fetch customer details for invoicing and ledger accounting
      const customer = await tx.customer.findUnique({
        where: { id: legacyDelivery.customerId },
      });

      const isCredit = validatedInput.paymentMethod === 'CREDIT_TERMS';
      const paidAmount = isCredit ? 0 : finalAmount;
      const balanceDue = isCredit ? finalAmount : 0;
      const paymentStatus = isCredit ? 'UNPAID' : 'PAID';

      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
      const countToday = await tx.invoice.count();
      const invoiceNumber = `INV-${dateStr}-${String(countToday + 1).padStart(3, '0')}`;

      // 5. Generate official invoice record
      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          customerId: legacyDelivery.customerId,
          subtotal: finalAmount,
          taxAmount: 0,
          totalAmount: finalAmount,
          paidAmount,
          balanceDue,
          paymentStatus,
          creditDueDate:
            balanceDue > 0
              ? new Date(Date.now() + (customer?.creditDays || 15) * 86400000)
              : null,
        },
      });

      // 6. Record PaymentTransaction if payment was collected
      let paymentTx = null;
      if (paidAmount > 0) {
        paymentTx = await tx.paymentTransaction.create({
          data: {
            invoiceId: invoice.id,
            customerId: legacyDelivery.customerId,
            partnerId: partner?.id || null,
            amount: paidAmount,
            paymentMethod: validatedInput.paymentMethod,
            paymentStatus: 'PAID',
            referenceNumber: validatedInput.paymentReference || (validatedInput.paymentMethod === 'CASH' ? null : `UPI-${Date.now().toString().slice(-6)}`),
            notes: `Delivery payment for invoice ${invoiceNumber}`,
            transactionDate: now,
          },
        });
      }

      // 7. Reconcile Customer Ledger & Outstanding Balances
      if (customer) {
        const newBalance = customer.currentBalance + balanceDue;
        await tx.customer.update({
          where: { id: customer.id },
          data: { currentBalance: newBalance },
        });

        // Record invoice debit in ledger
        await tx.customerLedgerEntry.create({
          data: {
            customerId: customer.id,
            type: 'INVOICE',
            referenceNumber: invoiceNumber,
            debit: finalAmount,
            credit: 0,
            runningBalance: customer.currentBalance + finalAmount,
            notes: `Cylinder delivery charges for ${invoiceNumber}`,
          },
        });

        // If paid, record payment credit in ledger
        if (paidAmount > 0) {
          await tx.customerLedgerEntry.create({
            data: {
              customerId: customer.id,
              type: 'PAYMENT',
              referenceNumber: validatedInput.paymentReference || invoiceNumber,
              debit: 0,
              credit: paidAmount,
              runningBalance: newBalance,
              notes: `Settlement via ${validatedInput.paymentMethod}`,
            },
          });
        }
      }

      return {
        delivery: updated,
        invoice,
        payment: paymentTx,
      };
    });

    return successResponse({
      message: 'Delivery completed successfully and reconciled with customer ledger & inventory.',
      ...result,
    }, 200);
  }

  return notFoundResponse('Delivery task');
});
