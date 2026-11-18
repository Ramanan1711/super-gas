import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withApiHandler, validateBody } from '@/lib/api-middleware';
import { successResponse, notFoundResponse } from '@/lib/api-response';
import { createExpenseSchema } from '@/lib/validations/expense.schema';

export const GET = withApiHandler(async (req: NextRequest) => {
  const partnerCode = req.nextUrl.searchParams.get('partnerCode') || 'DP-003';
  const status = req.nextUrl.searchParams.get('status');

  const partner = await prisma.deliveryPartner.findUnique({
    where: { partnerCode },
  });

  if (!partner) {
    return notFoundResponse('Delivery partner');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { partnerId: partner.id };
  if (status && status !== 'All') {
    where.status = status.toUpperCase();
  }

  const claims = await prisma.expenseClaim.findMany({
    where,
    include: {
      vehicle: true,
      reviewedBy: {
        select: { id: true, name: true, role: true },
      },
    },
    orderBy: { claimDate: 'desc' },
  });

  // Calculate high-level summary cards (Submitted, Approved, Pending, Rejected)
  let totalSubmitted = 0;
  let totalApproved = 0;
  let totalPending = 0;
  let totalRejected = 0;

  claims.forEach((c: { amount: number; status: string }) => {
    totalSubmitted += c.amount;
    if (c.status === 'APPROVED') totalApproved += c.amount;
    if (c.status === 'PENDING') totalPending += c.amount;
    if (c.status === 'REJECTED') totalRejected += c.amount;
  });

  return successResponse({
    metrics: {
      totalSubmitted,
      totalApproved,
      totalPending,
      totalRejected,
      entryCount: claims.length,
    },
    claims,
  });
});

export const POST = withApiHandler(async (req: NextRequest) => {
  const body = await validateBody(req, createExpenseSchema);

  // Auto-generate claim number EXP-YYYYMMDD-XXX
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const countToday = await prisma.expenseClaim.count();
  const claimNumber = `EXP-${dateStr}-${String(countToday + 1).padStart(3, '0')}`;

  const claim = await prisma.expenseClaim.create({
    data: {
      claimNumber,
      partnerId: body.partnerId,
      vehicleId: body.vehicleId,
      category: body.category,
      categoryLabel: body.categoryLabel || body.category.replace('_', ' '),
      amount: body.amount,
      description: body.description,
      receiptUrl: body.receiptUrl || null,
      status: 'PENDING',
      paymentStatus: 'Unpaid',
      claimDate: body.claimDate ? new Date(body.claimDate) : now,
    },
  });

  return successResponse({
    message: 'Expense claim lodged successfully for Admin audit.',
    claim,
  }, 201);
});
