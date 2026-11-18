import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withApiHandler, validateBody } from '@/lib/api-middleware';
import { successResponse, notFoundResponse } from '@/lib/api-response';
import { createHandoverEventSchema } from '@/lib/validations/settlement.schema';
import { DeliveryTransactionService } from '@/services/delivery-transaction.service';

export const POST = withApiHandler(async (req: NextRequest) => {
  const body = await validateBody(req, createHandoverEventSchema);

  let partnerId = body.partnerId;
  if (!partnerId || partnerId.startsWith('DP-')) {
    const partner = await prisma.deliveryPartner.findUnique({
      where: { partnerCode: partnerId || body.partnerCode || 'DP-003' },
    });
    if (!partner) {
      return notFoundResponse('Delivery partner');
    }
    partnerId = partner.id;
  }

  const result = await DeliveryTransactionService.recordCashHandover({
    ...body,
    partnerId,
  });

  return successResponse({
    message: `Cash handover ${result.handoverEvent.handoverCode} recorded and verified with depot.`,
    ...result,
  }, 201);
});
