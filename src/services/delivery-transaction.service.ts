import { prisma } from '@/lib/prisma';
import { CompleteDeliveryInput } from '@/lib/validations/delivery.schema';
import { CreateHandoverEventInput } from '@/lib/validations/settlement.schema';
import { StockTransferInput } from '@/lib/validations/inventory.schema';

/**
 * Service providing atomic database transactions (using prisma.$transaction)
 * to ensure absolute data consistency across orders, inventory, customer ledger,
 * invoicing, and cash settlement balances.
 */
export class DeliveryTransactionService {
  /**
   * Completes a customer cylinder delivery atomically:
   * 1. Updates DeliveryTask status to COMPLETED
   * 2. Inserts DeliveryItem records
   * 3. Creates/updates Invoice & PaymentTransaction
   * 4. Updates Customer currentBalance & creates CustomerLedgerEntry
   * 5. Adjusts VehicleInventory (filled decremented, empty incremented)
   * 6. Updates driver's DailySettlement cashExpected if cash was collected
   */
  static async completeDelivery(input: CompleteDeliveryInput) {
    return await prisma.$transaction(async (tx) => {
      // 1. Fetch task and relations
      const task = await tx.deliveryTask.findUnique({
        where: { id: input.taskId },
        include: {
          customer: true,
          trip: {
            include: {
              partner: true,
              vehicle: true,
            },
          },
        },
      });

      if (!task) {
        throw new Error(`Delivery task with ID ${input.taskId} was not found.`);
      }

      if (task.status === 'COMPLETED') {
        throw new Error(`Delivery task ${input.taskId} is already marked as COMPLETED.`);
      }

      const now = new Date();

      // 2. Calculate item totals
      const items = input.items && input.items.length > 0 ? input.items : [];
      let subtotal = 0;
      for (const item of items) {
        subtotal += item.filledDelivered * item.unitPrice;
      }

      const totalAmount = subtotal;
      const paidAmount = Math.min(input.amountCollected, totalAmount);
      const balanceDue = Math.max(0, totalAmount - paidAmount);

      const paymentStatus =
        balanceDue === 0 ? 'PAID' : paidAmount > 0 ? 'PARTIALLY_PAID' : 'UNPAID';

      // 3. Update DeliveryTask
      await tx.deliveryTask.update({
        where: { id: task.id },
        data: {
          status: 'COMPLETED',
          deliveredAt: now,
          notes: input.notes || task.notes,
        },
      });

      // 4. Delete existing items if any and insert fresh items
      await tx.deliveryItem.deleteMany({
        where: { taskId: task.id },
      });

      for (const item of items) {
        const productId = item.productId || '';
        await tx.deliveryItem.create({
          data: {
            taskId: task.id,
            productId,
            filledDelivered: item.filledDelivered,
            emptyCollected: item.emptyCollected,
            unitPrice: item.unitPrice,
            totalPrice: item.filledDelivered * item.unitPrice,
          },
        });

        // 5. Adjust Vehicle Inventory
        const currentInv = await tx.vehicleInventory.findUnique({
          where: {
            vehicleId_productId: {
              vehicleId: task.trip.vehicleId,
              productId,
            },
          },
        });

        if (currentInv) {
          await tx.vehicleInventory.update({
            where: {
              vehicleId_productId: {
                vehicleId: task.trip.vehicleId,
                productId,
              },
            },
            data: {
              filledCount: Math.max(0, currentInv.filledCount - item.filledDelivered),
              emptyCount: currentInv.emptyCount + item.emptyCollected,
            },
          });
        }
      }

      // 6. Generate Invoice Number if none exists
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
      const countToday = await tx.invoice.count();
      const invoiceNumber = `INV-${dateStr}-${String(countToday + 1).padStart(3, '0')}`;

      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          customerId: task.customerId,
          taskId: task.id,
          subtotal,
          totalAmount,
          paidAmount,
          balanceDue,
          paymentStatus,
          creditDueDate:
            balanceDue > 0
              ? new Date(Date.now() + (task.customer.creditDays || 15) * 86400000)
              : null,
        },
      });

      // 7. Record Payment Transaction if amount collected
      let paymentTx = null;
      if (input.amountCollected > 0) {
        paymentTx = await tx.paymentTransaction.create({
          data: {
            invoiceId: invoice.id,
            customerId: task.customerId,
            partnerId: task.trip.partnerId,
            amount: input.amountCollected,
            paymentMethod: input.paymentMethod,
            paymentStatus: paidAmount >= totalAmount ? 'PAID' : 'PARTIALLY_PAID',
            referenceNumber: input.paymentReference || `REC-${Date.now().toString().slice(-6)}`,
            transactionDate: now,
            notes: `Delivery payment for invoice ${invoice.invoiceNumber}`,
          },
        });
      }

      // 8. Update Customer Ledger & Outstanding Balance
      const newBalance = task.customer.currentBalance + balanceDue;
      await tx.customer.update({
        where: { id: task.customerId },
        data: { currentBalance: newBalance },
      });

      // Record invoice debit in ledger
      await tx.customerLedgerEntry.create({
        data: {
          customerId: task.customerId,
          type: 'INVOICE',
          referenceNumber: invoice.invoiceNumber,
          debit: totalAmount,
          credit: 0,
          runningBalance: task.customer.currentBalance + totalAmount,
          notes: `Cylinder delivery charges for ${invoice.invoiceNumber}`,
        },
      });

      // If paid, record payment credit in ledger
      if (input.amountCollected > 0) {
        await tx.customerLedgerEntry.create({
          data: {
            customerId: task.customerId,
            type: 'PAYMENT',
            referenceNumber: input.paymentReference || invoice.invoiceNumber,
            debit: 0,
            credit: input.amountCollected,
            runningBalance: newBalance,
            notes: `Settlement via ${input.paymentMethod}`,
          },
        });
      }

      // 9. Update Driver Cash Settlement if cash was received
      if (input.paymentMethod === 'CASH' && input.amountCollected > 0) {
        const todayDate = new Date(now.toISOString().slice(0, 10));

        const settlement = await tx.dailySettlement.findUnique({
          where: {
            businessDate_partnerId: {
              businessDate: todayDate,
              partnerId: task.trip.partnerId,
            },
          },
        });

        if (settlement) {
          const newExpected = settlement.cashExpected + input.amountCollected;
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
              partnerId: task.trip.partnerId,
              cashExpected: input.amountCollected,
              cashHandedOver: 0,
              remainingBalance: input.amountCollected,
              shortfallAmount: 0,
              status: 'PARTIALLY_HANDED_OVER',
            },
          });
        }
      }

      return {
        task,
        invoice,
        payment: paymentTx,
        newCustomerBalance: newBalance,
      };
    });
  }

  /**
   * Records physical cash handover from driver to depot admin atomically
   */
  static async recordCashHandover(input: CreateHandoverEventInput) {
    const partnerId = input.partnerId;
    if (!partnerId) {
      throw new Error('partnerId is required to record a cash handover.');
    }

    return await prisma.$transaction(async (tx) => {
      const now = new Date();
      const todayDate = new Date(now.toISOString().slice(0, 10));

      // 1. Get or create daily settlement
      let settlement = await tx.dailySettlement.findUnique({
        where: {
          businessDate_partnerId: {
            businessDate: todayDate,
            partnerId,
          },
        },
      });

      if (!settlement) {
        settlement = await tx.dailySettlement.create({
          data: {
            businessDate: todayDate,
            partnerId,
            cashExpected: input.amount,
            cashHandedOver: 0,
            remainingBalance: input.amount,
            status: 'PARTIALLY_HANDED_OVER',
          },
        });
      }

      // 2. Generate handover code #HND-YYYYMMDD-XX
      const dateCode = todayDate.toISOString().slice(0, 10).replace(/-/g, '');
      const countEvents = await tx.cashHandoverEvent.count({
        where: { settlementId: settlement.id },
      });
      const handoverCode = `#HND-${dateCode}-${String(countEvents + 1).padStart(2, '0')}`;

      // 3. Create handover event
      const handoverEvent = await tx.cashHandoverEvent.create({
        data: {
          handoverCode,
          settlementId: settlement.id,
          partnerId,
          amount: input.amount,
          dropType: input.dropType,
          receivedByName: input.receivedByName,
          stampNumber: input.stampNumber || null,
          status: 'Verified',
          handoverTime: input.handoverTime ? new Date(input.handoverTime) : now,
        },
      });

      // 4. Recalculate settlement balances
      const newHandedOver = settlement.cashHandedOver + input.amount;
      const newRemaining = Math.max(0, settlement.cashExpected - newHandedOver);
      const isCleared = newRemaining === 0;

      const updatedSettlement = await tx.dailySettlement.update({
        where: { id: settlement.id },
        data: {
          cashHandedOver: newHandedOver,
          remainingBalance: newRemaining,
          status: isCleared ? 'VERIFIED' : 'PARTIALLY_HANDED_OVER',
          auditRemarks: isCleared ? 'Fully Cleared' : settlement.auditRemarks,
        },
      });

      return {
        handoverEvent,
        settlement: updatedSettlement,
      };
    });
  }

  /**
   * Executes depot-to-vehicle or vehicle-to-depot cylinder transfers atomically
   */
  static async recordStockTransfer(input: StockTransferInput) {
    const depotId = input.depotId;
    const vehicleId = input.vehicleId;
    if (!depotId || !vehicleId) {
      throw new Error('depotId and vehicleId are required for stock transfer.');
    }

    return await prisma.$transaction(async (tx) => {
      const now = new Date();
      const transferDateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
      const count = await tx.stockTransferLog.count();
      const transferCode = `TRF-${transferDateStr}-${String(count + 1).padStart(3, '0')}`;

      // 1. Create Transfer Log
      const transferLog = await tx.stockTransferLog.create({
        data: {
          transferCode,
          depotId,
          vehicleId,
          partnerId: input.partnerId || null,
          transferType: input.transferType,
          notes: input.notes || null,
          transferDate: now,
        },
      });

      // 2. Process each cylinder product
      for (const item of input.items) {
        const productId = item.productId;
        if (!productId) {
          throw new Error('productId is required for each transfer item.');
        }

        await tx.stockTransferItem.create({
          data: {
            transferId: transferLog.id,
            productId,
            filledQuantity: item.filledQuantity,
            emptyQuantity: item.emptyQuantity,
            damagedQuantity: item.damagedQuantity,
          },
        });

        const depotInv = await tx.depotInventory.findUnique({
          where: {
            depotId_productId: {
              depotId,
              productId,
            },
          },
        });

        const vehicleInv = await tx.vehicleInventory.findUnique({
          where: {
            vehicleId_productId: {
              vehicleId,
              productId,
            },
          },
        });

        if (input.transferType === 'LOAD_VEHICLE') {
          // Depot -> Vehicle: deduct filled from depot, add filled to vehicle
          if (depotInv) {
            await tx.depotInventory.update({
              where: { id: depotInv.id },
              data: { filledCount: Math.max(0, depotInv.filledCount - item.filledQuantity) },
            });
          }
          await tx.vehicleInventory.upsert({
            where: {
              vehicleId_productId: {
                vehicleId,
                productId,
              },
            },
            update: { filledCount: { increment: item.filledQuantity } },
            create: {
              vehicleId,
              productId,
              filledCount: item.filledQuantity,
              emptyCount: 0,
              damagedCount: 0,
            },
          });
        } else if (input.transferType === 'UNLOAD_VEHICLE') {
          // Vehicle -> Depot: deduct empties/damaged from vehicle, add to depot
          if (vehicleInv) {
            await tx.vehicleInventory.update({
              where: { id: vehicleInv.id },
              data: {
                emptyCount: Math.max(0, vehicleInv.emptyCount - item.emptyQuantity),
                damagedCount: Math.max(0, vehicleInv.damagedCount - item.damagedQuantity),
              },
            });
          }
          await tx.depotInventory.upsert({
            where: {
              depotId_productId: {
                depotId,
                productId,
              },
            },
            update: {
              emptyCount: { increment: item.emptyQuantity },
              damagedCount: { increment: item.damagedQuantity },
            },
            create: {
              depotId,
              productId,
              filledCount: 0,
              emptyCount: item.emptyQuantity,
              damagedCount: item.damagedQuantity,
            },
          });
        }
      }

      return transferLog;
    });
  }
}
