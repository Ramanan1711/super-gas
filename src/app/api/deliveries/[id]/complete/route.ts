import { NextRequest } from 'next/server';
import { withApiHandler } from '@/lib/api-middleware';
import { successResponse, badRequestResponse } from '@/lib/api-response';
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

  const result = await DeliveryTransactionService.completeDelivery(validatedInput);

  return successResponse({
    message: 'Delivery completed successfully and balances reconciled.',
    ...result,
  }, 200);
});
