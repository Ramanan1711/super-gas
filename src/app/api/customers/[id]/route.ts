import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-middleware';
import { successResponse, notFoundResponse } from '@/lib/api-response';

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
