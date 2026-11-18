import { NextRequest } from 'next/server';
import { withApiHandler, validateBody } from '@/lib/api-middleware';
import { successResponse } from '@/lib/api-response';
import { stockTransferSchema } from '@/lib/validations/inventory.schema';
import { DeliveryTransactionService } from '@/services/delivery-transaction.service';

export const POST = withApiHandler(async (req: NextRequest) => {
  const body = await validateBody(req, stockTransferSchema);

  const transferLog = await DeliveryTransactionService.recordStockTransfer(body);

  return successResponse({
    message: 'Stock handover synchronized with depot successfully.',
    transfer: transferLog,
  }, 201);
});
