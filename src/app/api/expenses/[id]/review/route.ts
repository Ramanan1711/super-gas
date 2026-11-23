import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withApiHandler, requireAdmin } from '@/lib/api-middleware';
import { successResponse, notFoundResponse, badRequestResponse } from '@/lib/api-response';
import { reviewExpenseSchema } from '@/lib/validations/expense.schema';

export const PATCH = withApiHandler(async (
  req: NextRequest,
  context?: { params?: Promise<Record<string, string | string[]>> }
) => {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.response;

  const params = await context?.params;
  const id = Array.isArray(params?.id) ? params?.id[0] : params?.id;

  if (!id) {
    return badRequestResponse('Expense ID parameter is required');
  }

  const body = await req.json();
  const validated = reviewExpenseSchema.parse({
    ...body,
    expenseId: id,
  });

  const claim = await prisma.expenseClaim.findFirst({
    where: {
      OR: [{ id }, { claimNumber: id }],
    },
  });

  if (!claim) {
    return notFoundResponse('Expense claim');
  }

  const updatedClaim = await prisma.expenseClaim.update({
    where: { id: claim.id },
    data: {
      status: validated.status,
      adminRemark: validated.adminRemark || claim.adminRemark,
      paymentStatus:
        validated.status === 'APPROVED'
          ? (validated.disbursedAmount ? 'Paid in Full' : 'Unpaid')
          : 'N/A',
      disbursedAmount: validated.disbursedAmount || claim.disbursedAmount,
      referenceNumber: validated.referenceNumber || claim.referenceNumber,
      reviewedById: auth.user.id,
      reviewedAt: new Date(),
    },
    include: {
      reviewedBy: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
  });

  return successResponse({
    message: `Claim ${claim.claimNumber} marked as ${validated.status} by ${auth.user.name}.`,
    claim: updatedClaim,
  });
});
