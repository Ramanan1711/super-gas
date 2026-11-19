import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withApiHandler, validateBody } from '@/lib/api-middleware';
import { successResponse, notFoundResponse } from '@/lib/api-response';
import { createExpenseSchema } from '@/lib/validations/expense.schema';

export const GET = withApiHandler(async (req: NextRequest) => {
  const partnerCode = req.nextUrl.searchParams.get('partnerCode');
  const status = req.nextUrl.searchParams.get('status');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (partnerCode && partnerCode !== 'ALL' && partnerCode !== 'all') {
    let partner = await prisma.deliveryPartner.findUnique({
      where: { partnerCode },
    });

    if (!partner) {
      partner = await prisma.deliveryPartner.findFirst({
        where: { status: { in: ['ACTIVE', 'ON_DUTY'] } },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (partner) {
      where.partnerId = partner.id;
    }
  }

  if (status && status !== 'All' && status !== 'ALL') {
    where.status = status.toUpperCase();
  }

  const claims = await prisma.expenseClaim.findMany({
    where,
    include: {
      partner: true,
      vehicle: true,
      reviewedBy: {
        select: { id: true, name: true, role: true },
      },
    },
    orderBy: { claimDate: 'desc' },
  });

  // Calculate summary metrics
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

  // Resolve partner
  let partnerId = body.partnerId;
  const partnerCode = body.partnerCode || (partnerId && partnerId.startsWith('DP-') ? partnerId : 'DP-003');

  let partner = await prisma.deliveryPartner.findFirst({
    where: {
      OR: [
        ...(partnerId && !partnerId.startsWith('DP-') ? [{ id: partnerId }] : []),
        { partnerCode },
      ],
    },
    include: {
      assignedVehicle: true,
    },
  });

  if (!partner) {
    partner = await prisma.deliveryPartner.findFirst({
      where: { status: { in: ['ACTIVE', 'ON_DUTY'] } },
      include: {
        assignedVehicle: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  if (!partner) {
    return notFoundResponse('Delivery partner');
  }
  partnerId = partner.id;

  // Resolve vehicle
  let vehicleId = body.vehicleId;
  if (!vehicleId || vehicleId.startsWith('TN')) {
    if (body.vehicleReg) {
      const v = await prisma.vehicle.findUnique({ where: { regNumber: body.vehicleReg } });
      if (v) vehicleId = v.id;
    }
    if (!vehicleId && partner.assignedVehicleId) {
      vehicleId = partner.assignedVehicleId;
    }
    if (!vehicleId) {
      const defaultV = await prisma.vehicle.findFirst();
      if (defaultV) vehicleId = defaultV.id;
    }
  }

  if (!vehicleId) {
    return notFoundResponse('Vehicle');
  }

  // Auto-generate claim number EXP-YYYYMMDD-XXX
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const countToday = await prisma.expenseClaim.count();
  const claimNumber = `EXP-${dateStr}-${String(countToday + 1).padStart(3, '0')}`;

  const claim = await prisma.expenseClaim.create({
    data: {
      claimNumber,
      partnerId,
      vehicleId,
      category: body.category,
      categoryLabel: body.categoryLabel || body.category.replace(/_/g, ' '),
      amount: body.amount,
      description: body.description,
      receiptUrl: body.receiptUrl || null,
      status: 'PENDING',
      paymentStatus: 'Unpaid',
      claimDate: body.claimDate ? new Date(body.claimDate) : now,
    },
    include: {
      vehicle: true,
    },
  });

  return successResponse({
    message: 'Expense claim lodged successfully for Admin audit.',
    claim,
  }, 201);
});
