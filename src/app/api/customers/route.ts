import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-middleware';
import { successResponse } from '@/lib/api-response';

export const GET = withApiHandler(async (req: NextRequest) => {
  const search = req.nextUrl.searchParams.get('search')?.trim() || '';
  const route = req.nextUrl.searchParams.get('route') || '';
  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get('page') || '1', 10));
  const limit = Math.max(1, Math.min(100, parseInt(req.nextUrl.searchParams.get('limit') || '20', 10)));
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

  if (route) {
    where.route = { contains: route, mode: 'insensitive' };
  }

  const [total, customers] = await Promise.all([
    prisma.customer.count({ where }),
    prisma.customer.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        customerCode: true,
        name: true,
        businessName: true,
        contactPerson: true,
        phone: true,
        address: true,
        customerType: true,
        creditDays: true,
        creditLimit: true,
        currentBalance: true,
        route: true,
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
