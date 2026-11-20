import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-middleware';
import { successResponse, notFoundResponse } from '@/lib/api-response';

export const GET = withApiHandler(async (req: NextRequest) => {
  const partnerCode = req.nextUrl.searchParams.get('partnerCode') || 'DP-003';

  let partner = await prisma.deliveryPartner.findUnique({
    where: { partnerCode },
    include: {
      depot: true,
    },
  });

  if (!partner) {
    partner = await prisma.deliveryPartner.findFirst({
      where: { status: { in: ['ACTIVE', 'ON_DUTY'] } },
      include: {
        depot: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  if (!partner) {
    return notFoundResponse('Delivery partner');
  }

  // Get most recent or today's settlement
  const settlement = await prisma.dailySettlement.findFirst({
    where: { partnerId: partner.id },
    orderBy: { businessDate: 'desc' },
    include: {
      handovers: {
        orderBy: { handoverTime: 'desc' },
      },
    },
  });

  if (!settlement) {
    return successResponse({
      businessDate: new Date().toISOString().slice(0, 10),
      cashExpected: 0,
      cashHandedOver: 0,
      remainingBalance: 0,
      status: 'VERIFIED',
      progressPercent: 100,
      handovers: [],
    });
  }

  const expected = settlement.cashExpected;
  const handedOver = settlement.cashHandedOver;
  const remaining = settlement.remainingBalance;
  const progressPercent = expected > 0 ? Math.min(100, Math.round((handedOver / expected) * 100)) : 100;

  return successResponse({
    id: settlement.id,
    partnerCode: partner.partnerCode,
    partnerName: partner.name,
    businessDate: settlement.businessDate.toISOString().slice(0, 10),
    cashExpected: expected,
    cashHandedOver: handedOver,
    remainingBalance: remaining,
    status: settlement.status,
    progressPercent,
    depotCounterInstruction: `Deposit remaining cash at ${partner.depot?.name || 'Madurai Depot'} Counter #2 before shift closing (21:30 IST).`,
    handovers: settlement.handovers,
  });
});
