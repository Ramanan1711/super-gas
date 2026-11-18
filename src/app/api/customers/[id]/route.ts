import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withApiHandler, validateBody } from '@/lib/api-middleware';
import { successResponse, notFoundResponse } from '@/lib/api-response';
import { updateCustomerSchema } from '@/lib/validations/customer.schema';

export const GET = withApiHandler(async (
  _req: NextRequest,
  context?: { params?: Promise<Record<string, string | string[]>> }
) => {
  const params = await context?.params;
  const id = Array.isArray(params?.id) ? params?.id[0] : params?.id;

  if (!id) {
    return notFoundResponse('Customer');
  }

  const customer = await prisma.customer.findFirst({
    where: {
      OR: [{ id }, { customerCode: id }],
    },
    include: {
      invoices: {
        take: 5,
        orderBy: { createdAt: 'desc' },
      },
      deliveries: {
        take: 5,
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!customer) {
    return notFoundResponse('Customer');
  }

  return successResponse(customer);
});

export const PATCH = withApiHandler(async (
  req: NextRequest,
  context?: { params?: Promise<Record<string, string | string[]>> }
) => {
  const params = await context?.params;
  const id = Array.isArray(params?.id) ? params?.id[0] : params?.id;

  if (!id) {
    return notFoundResponse('Customer');
  }

  const existing = await prisma.customer.findFirst({
    where: { OR: [{ id }, { customerCode: id }] },
  });

  if (!existing) {
    return notFoundResponse('Customer');
  }

  const body = await validateBody(req, updateCustomerSchema);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = {};
  if (body.name) data.name = body.name.trim();
  if (body.businessName) data.businessName = body.businessName.trim();
  if (body.phone) data.phone = body.phone.trim();
  if (body.address) data.address = body.address.trim();
  if (body.route !== undefined) data.route = body.route;
  if (body.notes !== undefined) data.notes = body.notes;
  if (body.customerType) {
    const raw = body.customerType.toUpperCase();
    if (raw === 'DOMESTIC' || raw === 'RESIDENTIAL') data.customerType = 'DOMESTIC';
    else if (raw === 'INDUSTRIAL' || raw === 'B2B') data.customerType = 'INDUSTRIAL';
    else data.customerType = 'COMMERCIAL';
    data.type = body.customerType;
  }

  const updated = await prisma.customer.update({
    where: { id: existing.id },
    data,
  });

  return successResponse(updated);
});
