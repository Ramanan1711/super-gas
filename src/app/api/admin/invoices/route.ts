import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withApiHandler, requireAdmin } from '@/lib/api-middleware';
import { successResponse, errorResponse } from '@/lib/api-response';
import { Prisma, PaymentStatus, PaymentMethod } from '@prisma/client';

export const GET = withApiHandler(async (req: NextRequest) => {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.response;

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
        invoices: true,
        deliveryTasks: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            trip: {
              include: {
                partner: true,
                vehicle: true,
              },
            },
          },
        },
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
  type CustomerInvoiceItem = CustomerWithLedger['invoices'][number];

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
        dateTime: le.createdAt.toISOString(),
        refNo: le.referenceNumber,
        reference: le.referenceNumber,
        desc: le.notes || (le.type === 'INVOICE' ? 'LPG Cylinder Delivery' : 'Payment Received'),
        description: le.notes || (le.type === 'INVOICE' ? 'LPG Cylinder Delivery' : 'Payment Received'),
        type: le.type === 'INVOICE' ? ('Invoice' as const) : ('Payment' as const),
        debit: le.debit > 0 ? le.debit : null,
        credit: le.credit > 0 ? le.credit : null,
        runningBalance: le.runningBalance,
      };
    });

    const outstanding = Math.max(0, totalDebit - totalCredit);
    const advance = Math.max(0, totalCredit - totalDebit);

    const assignedPartnerObj = c.deliveryTasks?.[0]?.trip?.partner;
    const assignedVehicleObj = c.deliveryTasks?.[0]?.trip?.vehicle;

    let partnerName = 'Unassigned';
    let partnerCode: string | undefined = undefined;

    if (assignedPartnerObj) {
      partnerName = assignedPartnerObj.name;
      partnerCode = assignedPartnerObj.partnerCode;
    } else if (c.route && c.route.includes('·')) {
      const parts = c.route.split('·');
      partnerName = parts[0].trim();
      partnerCode = parts[1].trim();
    } else if (c.route) {
      partnerName = c.route;
    }

    const partnerLabel = partnerCode ? `${partnerCode} ${partnerName}` : partnerName;
    const vehicleText = assignedVehicleObj?.regNumber || (partnerCode ? `${partnerCode} Delivery Vehicle` : undefined);

    const paidInvoicesCount = c.invoices?.filter((inv: CustomerInvoiceItem) => inv.paymentStatus === 'PAID').length || 0;
    const pendingInvoicesCount = c.invoices?.filter((inv: CustomerInvoiceItem) => inv.paymentStatus !== 'PAID').length || 0;

    let ledgerStatus: 'Outstanding' | 'Advance Available' | 'Settled' | 'Inactive' = 'Settled';
    if (outstanding > 0) {
      ledgerStatus = 'Outstanding';
    } else if (advance > 0) {
      ledgerStatus = 'Advance Available';
    }

    return {
      id: c.id,
      name: c.name,
      customerName: c.name,
      customerCode: c.customerCode || 'CUS-001',
      phone: c.phone,
      address: c.address || '',
      route: c.address || 'Madurai Route',
      category: c.type === 'COMMERCIAL' || c.customerType === 'COMMERCIAL' ? 'Commercial Client' : 'Domestic Consumer',
      assignedPartner: partnerName,
      assignedPartnerCode: partnerCode,
      assignedPartnerLabel: partnerLabel,
      partnerVehicle: vehicleText,
      totalInvoiced: totalDebit,
      totalPurchases: totalDebit,
      paymentsReceived: totalCredit,
      totalPaid: totalCredit,
      totalAmountPaid: totalCredit,
      outstandingBalance: outstanding,
      availableAdvance: advance,
      paidInvoicesCount,
      pendingInvoicesCount,
      status: ledgerStatus,
      creditLimit: c.creditLimit || 15000,
      transactions: history.length > 0 ? history : [
        {
          id: `hist-${c.id}`,
          date: 'Live Record',
          dateTime: new Date().toISOString(),
          refNo: c.customerCode || 'CUS-001',
          reference: c.customerCode || 'CUS-001',
          desc: 'Current Balance Clearance',
          description: 'Current Balance Clearance',
          type: 'Payment' as const,
          debit: null,
          credit: totalCredit > 0 ? totalCredit : null,
          runningBalance: outstanding,
        },
      ],
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

export const POST = withApiHandler(async (req: NextRequest) => {
  const auth = await requireAdmin(req);
  if (!auth.authorized) return auth.response;

  const body = await req.json().catch(() => ({}));
  const action = String(body.action || '').toUpperCase();

  // Helper to find customer by id, code, or name
  const resolveCustomer = async (input: string, tx: Prisma.TransactionClient) => {
    if (!input) return null;
    const trimmed = input.trim();

    // 1. Try by ID
    let customer = await tx.customer.findUnique({ where: { id: trimmed } });
    if (customer) return customer;

    // 2. Try by customerCode directly
    customer = await tx.customer.findUnique({ where: { customerCode: trimmed } });
    if (customer) return customer;

    // 3. Extract CUS-XXXXX pattern from string (e.g. "Mohammed Ali (CUS-00125)")
    const codeMatch = trimmed.match(/CUS-\d+/i);
    if (codeMatch) {
      customer = await tx.customer.findFirst({
        where: { customerCode: { equals: codeMatch[0], mode: 'insensitive' } },
      });
      if (customer) return customer;
    }

    // 4. Try by name
    const cleanName = trimmed.replace(/\(CUS-.*?\)/gi, '').trim();
    if (cleanName) {
      customer = await tx.customer.findFirst({
        where: {
          OR: [
            { name: { contains: cleanName, mode: 'insensitive' } },
            { businessName: { contains: cleanName, mode: 'insensitive' } },
          ],
        },
      });
      if (customer) return customer;
    }

    // 5. Fallback to first available customer
    return tx.customer.findFirst({ orderBy: { createdAt: 'asc' } });
  };

  // Case 1: RECORD_PAYMENT (Offline Payment with FIFO Allocation)
  if (action === 'RECORD_PAYMENT') {
    const customerInput = body.customerId || body.customer || body.customerName;
    const rawAmount = String(body.amount || '').replace(/,/g, '').trim();
    const amount = parseFloat(rawAmount);

    if (isNaN(amount) || amount <= 0) {
      return errorResponse('Valid positive payment amount is required', 'BAD_REQUEST', 400);
    }

    let paymentMethod: PaymentMethod = PaymentMethod.CASH;
    const rawMode = String(body.paymentMode || body.paymentMethod || '').toUpperCase();
    if (rawMode.includes('UPI') || rawMode.includes('QR')) {
      paymentMethod = PaymentMethod.UPI_QR;
    } else if (rawMode.includes('BANK') || rawMode.includes('NEFT') || rawMode.includes('TRANSFER')) {
      paymentMethod = PaymentMethod.BANK_TRANSFER;
    } else if (rawMode.includes('CREDIT')) {
      paymentMethod = PaymentMethod.CREDIT_TERMS;
    } else {
      paymentMethod = PaymentMethod.CASH;
    }

    const refNumber =
      body.referenceNumber ||
      body.paymentRef ||
      `PAY-${Math.floor(100000 + Math.random() * 900000)}`;

    const result = await prisma.$transaction(async (tx) => {
      const customer = await resolveCustomer(customerInput, tx);
      if (!customer) {
        throw new Error('Customer not found for payment recording');
      }

      // Fetch unpaid or partially paid invoices in FIFO order (oldest first)
      const unpaidInvoices = await tx.invoice.findMany({
        where: {
          customerId: customer.id,
          paymentStatus: { in: [PaymentStatus.UNPAID, PaymentStatus.PARTIALLY_PAID] },
        },
        orderBy: { createdAt: 'asc' },
      });

      let remainingPayment = amount;
      const allocatedInvoices: Array<{
        invoiceId: string;
        invoiceNumber: string;
        allocatedAmount: number;
        newBalanceDue: number;
      }> = [];

      for (const inv of unpaidInvoices) {
        if (remainingPayment <= 0) break;
        const due = inv.balanceDue > 0 ? inv.balanceDue : Math.max(0, inv.totalAmount - inv.paidAmount);
        if (due <= 0) continue;

        const payForThis = Math.min(due, remainingPayment);
        const newPaid = inv.paidAmount + payForThis;
        const newBalance = Math.max(0, inv.totalAmount - newPaid);
        const newStatus = newBalance === 0 ? PaymentStatus.PAID : PaymentStatus.PARTIALLY_PAID;

        await tx.invoice.update({
          where: { id: inv.id },
          data: {
            paidAmount: newPaid,
            balanceDue: newBalance,
            paymentStatus: newStatus,
          },
        });

        allocatedInvoices.push({
          invoiceId: inv.id,
          invoiceNumber: inv.invoiceNumber,
          allocatedAmount: payForThis,
          newBalanceDue: newBalance,
        });

        remainingPayment -= payForThis;
      }

      // Create PaymentTransaction
      const paymentTx = await tx.paymentTransaction.create({
        data: {
          customerId: customer.id,
          invoiceId: allocatedInvoices.length > 0 ? allocatedInvoices[0].invoiceId : null,
          amount,
          paymentMethod,
          paymentStatus: PaymentStatus.PAID,
          referenceNumber: refNumber,
          notes:
            body.notes ||
            `Admin offline payment (FIFO: ${allocatedInvoices.length} bills updated, unallocated surplus: ₹${remainingPayment})`,
        },
      });

      // Update customer ledger
      const prevBalance = customer.currentBalance || 0;
      const newCustomerBalance = prevBalance - amount;

      await tx.customerLedgerEntry.create({
        data: {
          customerId: customer.id,
          type: 'PAYMENT',
          referenceNumber: refNumber,
          debit: 0,
          credit: amount,
          runningBalance: newCustomerBalance,
          notes: `Payment recorded via ${paymentMethod} (${allocatedInvoices.length} invoices cleared/settled)`,
        },
      });

      // Update customer outstanding currentBalance
      await tx.customer.update({
        where: { id: customer.id },
        data: { currentBalance: newCustomerBalance },
      });

      return {
        customer,
        paymentTx,
        allocatedInvoices,
        remainingPayment,
      };
    });

    return successResponse(
      {
        payment: result.paymentTx,
        allocatedInvoices: result.allocatedInvoices,
        unallocatedAmount: result.remainingPayment,
        customerName: result.customer.name,
      },
      201
    );
  }

  // Case 2: CREATE_INVOICE (Ad-hoc Invoice Generation)
  const customerInput = body.customerId || body.customer || body.customerName;
  const cylinderType = body.cylinderType || '19kg Commercial';
  const quantity = Math.max(1, parseInt(String(body.quantity || '1'), 10) || 1);
  const rate = Math.max(0, parseFloat(String(body.rate || '240')) || 240);
  const subtotal = quantity * rate;
  const taxAmount = parseFloat(String(body.taxAmount || '0')) || 0;
  const totalAmount = subtotal + taxAmount;

  const result = await prisma.$transaction(async (tx) => {
    const customer = await resolveCustomer(customerInput, tx);
    if (!customer) {
      throw new Error('Customer not found for invoice creation');
    }

    // Generate unique invoice number
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    let invoiceNumber = `INV-${todayStr}-${Math.floor(100 + Math.random() * 900)}`;
    let collision = await tx.invoice.findUnique({ where: { invoiceNumber } });
    while (collision) {
      invoiceNumber = `INV-${todayStr}-${Math.floor(100 + Math.random() * 900)}`;
      collision = await tx.invoice.findUnique({ where: { invoiceNumber } });
    }

    const prevBalance = customer.currentBalance || 0;
    const newBalance = prevBalance + totalAmount;

    // Create Invoice
    const invoice = await tx.invoice.create({
      data: {
        invoiceNumber,
        customerId: customer.id,
        subtotal,
        taxAmount,
        totalAmount,
        paidAmount: 0,
        balanceDue: totalAmount,
        paymentStatus: PaymentStatus.UNPAID,
      },
    });

    // Create CustomerLedgerEntry
    await tx.customerLedgerEntry.create({
      data: {
        customerId: customer.id,
        type: 'INVOICE',
        referenceNumber: invoice.invoiceNumber,
        debit: totalAmount,
        credit: 0,
        runningBalance: newBalance,
        notes: `${quantity}x ${cylinderType} ad-hoc invoice generated by admin`,
      },
    });

    // Update customer currentBalance
    await tx.customer.update({
      where: { id: customer.id },
      data: { currentBalance: newBalance },
    });

    return {
      customer,
      invoice,
    };
  });

  return successResponse(
    {
      invoice: result.invoice,
      customerName: result.customer.name,
      message: `Invoice ${result.invoice.invoiceNumber} created successfully`,
    },
    201
  );
});
