import { NextRequest } from 'next/server';
import { withApiHandler, validateBody } from '@/lib/api-middleware';
import { successResponse } from '@/lib/api-response';
import { createHandoverEventSchema } from '@/lib/validations/settlement.schema';
import { DeliveryTransactionService } from '@/services/delivery-transaction.service';

export const POST = withApiHandler(async (req: NextRequest) => {
  const body = await validateBody(req, createHandoverEventSchema);

  const result = await DeliveryTransactionService.recordCashHandover(body);

  return successResponse({
    message: `Cash handover ${result.handoverEvent.handoverCode} recorded and verified with depot.`,
    ...result,
  }, 201);
});
