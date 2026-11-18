import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withApiHandler, validateBody } from '@/lib/api-middleware';
import { successResponse, conflictResponse } from '@/lib/api-response';
import { createCustomerSchema } from '@/lib/validations/customer.schema';

export const GET = withApiHandler(async (req: NextRequest) => {
  const search = req.nextUrl.searchParams.get('search')?.trim() || '';
  const route = req.nextUrl.searchParams.get('route') || '';
  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get('page') || '1', 10));
  const limit = Math.max(1, Math.min(100, parseInt(req.nextUrl.searchParams.get('limit') || '50', 10)));
  const skip = (page - 1) * limit;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { businessName: { contains: search, mode: 'insensitive' } },
      { customerCode: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } },
    ];
  }

  if (route && route !== 'All') {
    where.route = { contains: route, mode: 'insensitive' };
  }

  const [total, customers] = await Promise.all([
    prisma.customer.count({ where }),
    prisma.customer.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        customerCode: true,
        name: true,
        businessName: true,
        contactPerson: true,
        phone: true,
        altPhone: true,
        address: true,
        customerType: true,
        type: true,
        creditDays: true,
        creditLimit: true,
        currentBalance: true,
        route: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);

  return successResponse(customers, 200, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

export const POST = withApiHandler(async (req: NextRequest) => {
  const body = await validateBody(req, createCustomerSchema);

  const normalizedPhone = body.phone.trim();

  // Check if customer with phone already exists
  const existingByPhone = await prisma.customer.findFirst({
    where: { phone: normalizedPhone },
  });

  if (existingByPhone) {
    return conflictResponse(
      `A customer with phone ${normalizedPhone} already exists: ${existingByPhone.name} (${existingByPhone.customerCode || 'Registered'})`
    );
  }

  // Generate unique customerCode if not explicitly supplied
  let customerCode = body.customerCode?.trim();
  if (!customerCode) {
    const totalCount = await prisma.customer.count();
    let num = totalCount + 120;
    while (true) {
      const candidate = `CUS-${String(num).padStart(5, '0')}`;
      const found = await prisma.customer.findUnique({ where: { customerCode: candidate } });
      if (!found) {
        customerCode = candidate;
        break;
      }
      num++;
    }
  } else {
    // Check if code already taken
    const existingByCode = await prisma.customer.findUnique({
      where: { customerCode },
    });
    if (existingByCode) {
      return conflictResponse(`Customer code ${customerCode} is already assigned to ${existingByCode.name}`);
    }
  }

  // Normalize customerType enum
  let typeEnum: 'COMMERCIAL' | 'DOMESTIC' | 'INDUSTRIAL' = 'COMMERCIAL';
  const rawType = (body.customerType || '').toUpperCase();
  if (rawType === 'DOMESTIC' || rawType === 'RESIDENTIAL') {
    typeEnum = 'DOMESTIC';
  } else if (rawType === 'INDUSTRIAL' || rawType === 'B2B') {
    typeEnum = 'INDUSTRIAL';
  }

  // Construct assigned partner route string
  let assignedRoute = body.route?.trim() || '';
  if (body.deliveryPartnerName && !assignedRoute) {
    assignedRoute = body.deliveryPartnerCode
      ? `${body.deliveryPartnerName} · ${body.deliveryPartnerCode}`
      : body.deliveryPartnerName;
  }

  const customer = await prisma.customer.create({
    data: {
      customerCode,
      name: body.name.trim(),
      businessName: body.businessName?.trim() || body.name.trim(),
      contactPerson: body.contactPerson?.trim() || body.name.trim(),
      phone: normalizedPhone,
      altPhone: body.altPhone?.trim() || null,
      address: body.address.trim(),
      customerType: typeEnum,
      type: body.customerType === 'B2B' ? 'B2B' : typeEnum === 'DOMESTIC' ? 'Residential' : 'Commercial',
      creditDays: body.creditDays || 0,
      creditLimit: body.creditLimit || 0,
      currentBalance: 0,
      route: assignedRoute || null,
      notes: body.notes || (body.deliveryPartnerName ? `Assigned to: ${body.deliveryPartnerName}` : null),
    },
  });

  return successResponse(customer, 201);
});
