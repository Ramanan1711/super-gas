import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-middleware';
import { successResponse, notFoundResponse } from '@/lib/api-response';

export const GET = withApiHandler(async (req: NextRequest) => {
  const partnerCode = req.nextUrl.searchParams.get('partnerCode') || 'DP-003';
  const filter = req.nextUrl.searchParams.get('filter') || 'All';

  const partner = await prisma.deliveryPartner.findUnique({
    where: { partnerCode },
  });

  if (!partner) {
    return notFoundResponse('Delivery partner');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { partnerId: partner.id };

  if (filter === 'Verified') {
    where.status = 'VERIFIED';
  } else if (filter === 'Partially Handed Over') {
    where.status = 'PARTIALLY_HANDED_OVER';
  } else if (filter === 'Pending Verification') {
    where.status = 'PENDING_VERIFICATION';
  }

  const settlements = await prisma.dailySettlement.findMany({
    where,
    include: {
      handovers: {
        orderBy: { handoverTime: 'desc' },
      },
    },
    orderBy: { businessDate: 'desc' },
  });

  const formatted = settlements.map((s: {
    id: string;
    businessDate: Date;
    status: string;
    cashExpected: number;
    cashHandedOver: number;
    remainingBalance: number;
    shortfallAmount: number;
    auditRemarks: string | null;
  }) => {
    let displayStatus = 'Verified';
    if (s.status === 'PENDING_VERIFICATION') displayStatus = 'Pending Verification';
    if (s.status === 'PARTIALLY_HANDED_OVER') displayStatus = 'Partially Handed Over';
    if (s.status === 'DIFFERENCE_FOUND') displayStatus = 'Difference Found';

    const dateFormatted = s.businessDate.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    return {
      id: s.id,
      date: dateFormatted,
      status: displayStatus,
      rawStatus: s.status,
      expectedAmount: s.cashExpected,
      handedOverAmount: s.cashHandedOver,
      remainingAmount: s.remainingBalance,
      shortfall: s.shortfallAmount > 0 ? s.shortfallAmount : undefined,
      footerStatusText: s.auditRemarks || (s.remainingBalance === 0 ? 'Fully Cleared' : 'In Progress'),
      isShortfallNotice: s.status === 'DIFFERENCE_FOUND',
    };
  });

  return successResponse({
    filter,
    settlements: formatted,
  });
});
