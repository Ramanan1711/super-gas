import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-middleware';
import { successResponse, notFoundResponse, badRequestResponse } from '@/lib/api-response';

export const POST = withApiHandler(async (req: NextRequest) => {
  const body = await req.json().catch(() => ({}));
  const { settlementId, handoverCode, handoverId, auditRemarks } = body;

  if (!settlementId && !handoverCode && !handoverId) {
    return badRequestResponse('Provide settlementId, handoverId, or handoverCode to verify.');
  }

  // 1. Verify by Handover Event
  if (handoverId || handoverCode) {
    const event = await prisma.cashHandoverEvent.findFirst({
      where: {
        OR: [
          ...(handoverId ? [{ id: handoverId }] : []),
          ...(handoverCode ? [{ handoverCode }] : []),
        ],
      },
    });

    if (!event) {
      return notFoundResponse('Cash handover drop');
    }

    const updatedEvent = await prisma.cashHandoverEvent.update({
      where: { id: event.id },
      data: {
        status: 'Verified',
      },
    });

    // Check if parent settlement can also be cleared
    const settlement = await prisma.dailySettlement.findUnique({
      where: { id: event.settlementId },
    });

    if (settlement) {
      await prisma.dailySettlement.update({
        where: { id: settlement.id },
        data: {
          status: 'VERIFIED',
          auditRemarks: auditRemarks || 'Verified by Admin',
        },
      });
    }

    return successResponse({
      message: `Cash handover ${event.handoverCode} verified successfully.`,
      event: updatedEvent,
    });
  }

  // 2. Verify by Settlement or Expense Claim fallback
  if (settlementId) {
    const settlement = await prisma.dailySettlement.findUnique({
      where: { id: settlementId },
    });

    if (settlement) {
      const updated = await prisma.dailySettlement.update({
        where: { id: settlement.id },
        data: {
          status: 'VERIFIED',
          auditRemarks: auditRemarks || 'Reconciled & Verified by Admin',
        },
      });

      await prisma.cashHandoverEvent.updateMany({
        where: { settlementId: settlement.id },
        data: { status: 'Verified' },
      });

      return successResponse({
        message: `Settlement for ${settlement.businessDate.toISOString().slice(0, 10)} verified.`,
        settlement: updated,
      });
    }

    // Fallback: check if settlementId is an expense claim
    const claim = await prisma.expenseClaim.findFirst({
      where: {
        OR: [{ id: settlementId }, { claimNumber: settlementId }],
      },
    });

    if (claim) {
      const updatedClaim = await prisma.expenseClaim.update({
        where: { id: claim.id },
        data: {
          status: 'APPROVED',
          adminRemark: auditRemarks || 'Verified by Admin',
          paymentStatus: 'Paid in Full',
          disbursedAmount: claim.amount,
          reviewedAt: new Date(),
        },
      });

      return successResponse({
        message: `Expense claim ${claim.claimNumber} verified & approved.`,
        claim: updatedClaim,
      });
    }

    return notFoundResponse('Daily settlement or expense claim');
  }

  return badRequestResponse('Invalid request parameters');
});
