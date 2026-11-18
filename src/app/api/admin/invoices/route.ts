import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-middleware';
import { successResponse } from '@/lib/api-response';
import { Prisma, PaymentStatus } from '@prisma/client';

export const GET = withApiHandler(async (req: NextRequest) => {
  const search = req.nextUrl.searchParams.get('search')?.trim().toLowerCase();
  const status = req.nextUrl.searchParams.get('status')?.trim().toUpperCase();

  const whereClause: Prisma.InvoiceWhereInput = {};
  if (status && status !== 'ALL' && Object.values(PaymentStatus).includes(status as PaymentStatus)) {
    whereClause.paymentStatus = status as PaymentStatus;
  }
  if (search) {
    whereClause.OR = [
      { invoiceNumber: { contains: search, mode: 'insensitive' } },
      { customer: { name: { contains: search, mode: 'insensitive' } } },
      { customer: { phone: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const invoices = await prisma.invoice.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    include: {
      customer: true,
      task: {
        include: {
          trip: {
            include: {
              partner: true,
              vehicle: true,
            },
          },
          items: {
            include: {
              product: true,
            },
          },
        },
      },
      payments: true,
    },
  });

  let totalInvoiced = 0;
  let totalPaid = 0;
  let totalBalanceDue = 0;

  type InvoiceWithRelations = (typeof invoices)[number];
  type TaskItemWithProduct = NonNullable<NonNullable<InvoiceWithRelations['task']>['items']>[number];
  type PaymentRecordItem = InvoiceWithRelations['payments'][number];

  const formattedInvoices = invoices.map((inv: InvoiceWithRelations) => {
    totalInvoiced += inv.totalAmount;
    totalPaid += inv.paidAmount;
    totalBalanceDue += inv.balanceDue;

    const partnerName = inv.task?.trip?.partner?.name || 'Assigned Driver';
    const partnerCode = inv.task?.trip?.partner?.partnerCode || 'DP-003';
    const vehicleReg = inv.task?.trip?.vehicle?.regNumber || 'TN 58 AX 4821';

    const itemsSummary = inv.task?.items?.length
      ? inv.task.items.map((it: TaskItemWithProduct) => `${it.filledDelivered}x ${it.product?.code || '19kg'}`)
      : ['1x Commercial LPG'];

    const formattedDate = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(inv.createdAt));

    const formattedTime = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(inv.createdAt));

    const statusMap: Record<string, 'Paid' | 'Partially Paid' | 'Unpaid'> = {
      PAID: 'Paid',
      PARTIAL: 'Partially Paid',
      UNPAID: 'Unpaid',
      OVERDUE: 'Unpaid',
    };

    return {
      id: inv.id,
      invoiceNo: inv.invoiceNumber,
      date: formattedDate,
      time: formattedTime,
      customerName: inv.customer.name,
      customerCode: inv.customer.customerCode || 'CUS-001',
      category: inv.customer.type === 'COMMERCIAL' ? 'Commercial' : 'Domestic',
      deliveryPartnerName: partnerName,
      deliveryPartnerCode: partnerCode,
      vehicle: vehicleReg,
      cylinders: itemsSummary,
      invoiceAmount: inv.totalAmount,
      paidAmount: inv.paidAmount,
      balanceDue: inv.balanceDue,
      status: statusMap[inv.paymentStatus] || 'Unpaid',
      phone: inv.customer.phone,
      address: inv.customer.address,
      emptyCollected:
        inv.task?.items?.reduce((sum: number, it: TaskItemWithProduct) => sum + (it.emptyCollected || 0), 0) || 0,
      payments: inv.payments.map((p: PaymentRecordItem) => ({
        id: p.id,
        reference: p.reference,
        amount: p.amount,
        method: p.method,
        status: p.status,
        date: p.createdAt,
      })),
    };
  });

  return successResponse({
    metrics: {
      totalInvoiced,
      totalPaid,
      totalBalanceDue,
      count: formattedInvoices.length,
    },
    invoices: formattedInvoices,
  });
});
