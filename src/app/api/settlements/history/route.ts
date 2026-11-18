import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-middleware';
import { successResponse, notFoundResponse } from '@/lib/api-response';

export const GET = withApiHandler(async (req: NextRequest) => {
  const partnerCode = req.nextUrl.searchParams.get('partnerCode');
  const filter = req.nextUrl.searchParams.get('filter') || 'All';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (partnerCode && partnerCode !== 'ALL' && partnerCode !== 'all') {
    const partner = await prisma.deliveryPartner.findUnique({
      where: { partnerCode },
    });

    if (!partner) {
      return notFoundResponse('Delivery partner');
    }
    where.partnerId = partner.id;
  }

  if (filter === 'Verified') {
    where.status = 'VERIFIED';
  } else if (filter === 'Partially Handed Over') {
    where.status = 'PARTIALLY_HANDED_OVER';
  } else if (filter === 'Pending Verification' || filter === 'Pending') {
    where.status = 'PENDING_VERIFICATION';
  }

  const settlements = await prisma.dailySettlement.findMany({
    where,
    include: {
      partner: true,
      handovers: {
        orderBy: { handoverTime: 'desc' },
      },
    },
    orderBy: { businessDate: 'desc' },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatted = settlements.map((s: any) => {
    let displayStatus = 'Verified';
    if (s.status === 'PENDING_VERIFICATION') displayStatus = 'Pending Verification';
    if (s.status === 'PARTIALLY_HANDED_OVER') displayStatus = 'Partially Handed Over';
    if (s.status === 'DIFFERENCE_FOUND') displayStatus = 'Difference Found';

    const dateFormatted = new Date(s.businessDate).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    return {
      id: s.id,
      date: dateFormatted,
      status: displayStatus,
      rawStatus: s.status,
      partnerName: s.partner?.name || 'Suresh Babu',
      partnerCode: s.partner?.partnerCode || 'DP-003',
      expectedAmount: s.cashExpected,
      handedOverAmount: s.cashHandedOver,
      remainingAmount: s.remainingBalance,
      shortfall: s.shortfallAmount > 0 ? s.shortfallAmount : undefined,
      footerStatusText: s.auditRemarks || (s.remainingBalance === 0 ? 'Fully Cleared' : 'In Progress'),
      isShortfallNotice: s.status === 'DIFFERENCE_FOUND',
      handovers: s.handovers || [],
    };
  });

  return successResponse({
    filter,
    settlements: formatted,
  });
});
