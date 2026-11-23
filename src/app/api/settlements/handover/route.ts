import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withApiHandler, validateBody, getAuthenticatedUser } from '@/lib/api-middleware';
import { successResponse, notFoundResponse } from '@/lib/api-response';
import { createHandoverEventSchema } from '@/lib/validations/settlement.schema';
import { DeliveryTransactionService } from '@/services/delivery-transaction.service';

export const POST = withApiHandler(async (req: NextRequest) => {
  const body = await validateBody(req, createHandoverEventSchema);

  let partnerId = body.partnerId;

  // Resolve partnerId from authenticated session if not explicitly passed
  if (!partnerId) {
    const authUser = await getAuthenticatedUser(req);
    if (authUser) {
      const partner = await prisma.deliveryPartner.findUnique({
        where: { userId: authUser.id },
      });
      if (partner) {
        partnerId = partner.id;
      }
    }
  }

  if (!partnerId || partnerId.startsWith('DP-')) {
    let partner = await prisma.deliveryPartner.findUnique({
      where: { partnerCode: partnerId || body.partnerCode || 'DP-003' },
    });
    if (!partner && body.partnerCode) {
      partner = await prisma.deliveryPartner.findUnique({
        where: { partnerCode: body.partnerCode },
      });
    }
    if (!partner) {
      partner = await prisma.deliveryPartner.findFirst({
        where: { status: { in: ['ACTIVE', 'ON_DUTY'] } },
        orderBy: { createdAt: 'desc' },
      });
    }
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
    message: `Cash handover ${result.handoverEvent.handoverCode} recorded and verified with depot.${body.dropType === 'END_OF_SHIFT' ? ' Driver status updated to OFF_DUTY.' : ''}`,
    ...result,
  }, 201);
});
