import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-middleware';
import { successResponse, notFoundResponse } from '@/lib/api-response';

export const GET = withApiHandler(async (req: NextRequest) => {
  const partnerCode = req.nextUrl.searchParams.get('partnerCode') || 'DP-003';

  const partner = await prisma.deliveryPartner.findUnique({
    where: { partnerCode },
  });

  if (!partner) {
    return notFoundResponse('Delivery partner');
  }

  const documents = await prisma.partnerDocument.findMany({
    where: { partnerId: partner.id },
    orderBy: { createdAt: 'asc' },
  });

  const verifiedCount = documents.filter((d: { status: string }) => d.status === 'VERIFIED').length;
  const pendingCount = documents.filter((d: { status: string }) => d.status === 'PENDING_VERIFICATION' || d.status === 'EXPIRING_SOON').length;
  const issuesCount = documents.filter((d: { status: string }) => d.status === 'EXPIRED' || d.status === 'ACTION_REQUIRED' || d.status === 'REJECTED').length;

  return successResponse({
    metrics: {
      verified: verifiedCount,
      pending: pendingCount,
      issues: issuesCount,
    },
    documents,
  });
});
