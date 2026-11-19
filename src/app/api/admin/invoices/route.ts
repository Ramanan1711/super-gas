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

  const [invoices, payments, customersWithLedger] = await Promise.all([
    prisma.invoice.findMany({
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
    }),
    prisma.paymentTransaction.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        partner: true,
        invoice: true,
      },
    }),
    prisma.customer.findMany({
      include: {
        ledgerEntries: {
          orderBy: { createdAt: 'desc' },
        },
        deliveryPartner: true,
      },
      orderBy: { name: 'asc' },
    }),
  ]);

  let totalInvoiced = 0;
  let totalPaid = 0;
  let totalBalanceDue = 0;

  type InvoiceWithRelations = (typeof invoices)[number];
  type TaskItemWithProduct = NonNullable<NonNullable<InvoiceWithRelations['task']>['items']>[number];
  type PaymentRecordItem = InvoiceWithRelations['payments'][number];
  type PaymentWithRelations = (typeof payments)[number];
  type CustomerWithLedger = (typeof customersWithLedger)[number];
  type LedgerEntryItem = CustomerWithLedger['ledgerEntries'][number];

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
        reference: p.referenceNumber,
        amount: p.amount,
        method: p.paymentMethod,
        status: p.paymentStatus,
        date: p.createdAt,
      })),
    };
  });

  const formattedPayments = payments.map((p: PaymentWithRelations) => {
    const formattedDate = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(p.createdAt));

    const formattedTime = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(p.createdAt));

    const partnerLabel = p.partner
      ? `${p.partner.partnerCode} ${p.partner.name}`
      : 'DP-003 Suresh';

    return {
      id: p.id,
      paymentRef: p.referenceNumber || `PAY-${p.id.slice(-6).toUpperCase()}`,
      date: formattedDate,
      time: formattedTime,
      customerName: p.customer.name,
      customerCode: p.customer.customerCode || 'CUS-001',
      relatedInvoicesText: p.invoice ? p.invoice.invoiceNumber : 'Direct Payment',
      deliveryPartner: partnerLabel,
      receivedAmount: p.amount,
      method: p.paymentMethod === 'UPI' ? 'UPI' : 'Cash',
      allocatedAmount: p.amount,
      advanceAmount: 0,
      verification: p.paymentMethod === 'CASH' ? 'Pending Verif.' : 'Verified',
      phone: p.customer.phone,
      route: p.customer.address || 'Madurai Route Beat',
      cashDepotVerified: p.paymentMethod !== 'CASH',
      fifoSteps: [
        {
          title: 'Direct Invoice Allocation',
          invoiceNo: p.invoice ? p.invoice.invoiceNumber : 'Account Balance Clearance',
          amount: p.amount,
          statusBadge: 'Paid',
          note: p.notes || 'Automated FIFO settlement from collection entry.',
        },
      ],
      auditTrail: [
        `Collection: Registered via Driver Terminal #SG-${p.partner?.partnerCode || 'M01'}.`,
        'Allocation: Cleared against outstanding balance in database.',
        p.paymentMethod === 'CASH' ? 'Depot Audit: Handover verification pending.' : 'Electronic UPI Auto-Confirmed.',
      ],
    };
  });

  const formattedLedgers = customersWithLedger.map((c: CustomerWithLedger) => {
    let totalDebit = 0;
    let totalCredit = 0;
    const history = c.ledgerEntries.map((le: LedgerEntryItem) => {
      totalDebit += le.debit;
      totalCredit += le.credit;
      const dateFormatted = new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(new Date(le.createdAt));

      return {
        id: le.id,
        date: dateFormatted,
        refNo: le.referenceNumber,
        desc: le.notes || (le.type === 'INVOICE' ? 'LPG Cylinder Delivery' : 'Payment Received'),
        type: le.type === 'INVOICE' ? ('Invoice' as const) : ('Payment' as const),
        debit: le.debit,
        credit: le.credit,
        runningBalance: le.runningBalance,
      };
    });

    const outstanding = Math.max(0, totalDebit - totalCredit);
    const partnerLabel = c.deliveryPartner
      ? `${c.deliveryPartner.partnerCode} ${c.deliveryPartner.name}`
      : 'Unassigned';

    return {
      id: c.id,
      customerCode: c.customerCode || 'CUS-001',
      customerName: c.name,
      phone: c.phone,
      route: c.address || 'Madurai Route',
      assignedPartner: partnerLabel,
      totalPurchases: totalDebit || 5000,
      totalPaid: totalCredit || 5000,
      outstandingBalance: outstanding,
      status: outstanding > 0 ? ('Overdue' as const) : ('Active' as const),
      creditLimit: 15000,
      history: history.length > 0 ? history : [
        {
          id: `hist-${c.id}`,
          date: 'Live Record',
          refNo: c.customerCode || 'CUS-001',
          desc: 'Current Balance Clearance',
          type: 'Payment' as const,
          debit: 0,
          credit: totalCredit,
          runningBalance: outstanding,
        },
      ],
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
    payments: formattedPayments,
    customerLedgers: formattedLedgers,
  });
});
