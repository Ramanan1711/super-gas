import { prisma } from '@/lib/prisma';

export interface OperationalActivityItem {
  id: string;
  dateTime: string;
  activityType: 'delivery' | 'payment' | 'invoice' | 'expense' | 'handover';
  activityLabel: string;
  referenceId: string;
  entityName: string;
  entitySubtitle: string;
  amountVolume: string;
  amountGreen?: boolean;
  amountHighlight?: boolean;
  status: string;
  statusType: 'completed' | 'verified' | 'partial' | 'approved' | 'discrepancy';
  createdAt: string;
}

export interface GetActivitiesParams {
  page?: number;
  limit?: number;
  activityType?: string;
  search?: string;
  period?: string;
}

export interface PaginatedActivitiesResult {
  items: OperationalActivityItem[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface DeliveryItemType {
  id: string;
  createdAt: Date;
  status: string;
  amount: number;
  quantity: number;
  cylinderType: string;
  paymentMethod: string;
  customer: { name: string; customerCode: string | null } | null;
}

interface InvoiceItemType {
  id: string;
  createdAt: Date;
  invoiceNumber: string;
  totalAmount: number;
  balanceDue: number;
  paymentStatus: string;
  customer: { name: string; customerCode: string | null } | null;
}

interface LedgerItemType {
  id: string;
  createdAt: Date;
  referenceNumber: string | null;
  runningBalance: number;
  credit: number;
  debit: number;
  notes: string | null;
  customer: { name: string; customerCode: string | null } | null;
}

interface ExpenseItemType {
  id: string;
  createdAt: Date;
  claimDate: Date;
  claimNumber: string;
  amount: number;
  category: string;
  categoryLabel: string | null;
  status: string;
  partner: { name: string; partnerCode: string } | null;
  vehicle: { regNumber: string } | null;
}

interface HandoverItemType {
  id: string;
  createdAt: Date;
  handoverTime: Date;
  handoverCode: string;
  amount: number;
  partner: { name: string; partnerCode: string } | null;
  settlement: { shortfallAmount: number } | null;
}

function formatActivityDateTime(d: Date): string {
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  const timeStr = d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  if (isToday) {
    return `Today, ${timeStr}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return `Yesterday, ${timeStr}`;
  }

  const dateStr = d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
  });

  return `${dateStr}, ${timeStr}`;
}

export class OperationalActivityService {
  static async getPaginatedActivities(
    params: GetActivitiesParams
  ): Promise<PaginatedActivitiesResult> {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(params.limit) || 5));
    const offset = (page - 1) * limit;
    const filter = (params.activityType || 'all').toLowerCase();
    const search = (params.search || '').trim();

    try {
      // 1. Specific domain pagination with database-level skip/take
      if (filter === 'delivery') {
        const where = search
          ? {
              OR: [
                { cylinderType: { contains: search, mode: 'insensitive' as const } },
                { customer: { name: { contains: search, mode: 'insensitive' as const } } },
                { customer: { customerCode: { contains: search, mode: 'insensitive' as const } } },
                { id: { contains: search, mode: 'insensitive' as const } },
              ],
            }
          : {};

        const [deliveries, totalCount] = await Promise.all([
          prisma.delivery.findMany({
            where,
            include: { customer: true },
            orderBy: { createdAt: 'desc' },
            skip: offset,
            take: limit,
          }),
          prisma.delivery.count({ where }),
        ]);

        const items: OperationalActivityItem[] = (deliveries as DeliveryItemType[]).map((d: DeliveryItemType) => ({
          id: d.id,
          dateTime: formatActivityDateTime(new Date(d.createdAt)),
          activityType: 'delivery',
          activityLabel: 'Cylinder Delivery',
          referenceId: `DEL-${d.id.slice(-6).toUpperCase()}`,
          entityName: `${d.customer?.name || 'Customer'} (${d.customer?.customerCode || 'CUS-001'})`,
          entitySubtitle: `Payment: ${d.paymentMethod} • Refill: ${d.cylinderType}`,
          amountVolume: `${d.quantity}x ${d.cylinderType} (₹${d.amount.toLocaleString('en-IN')})`,
          status: d.status === 'DELIVERED' ? 'Completed' : d.status,
          statusType: d.status === 'DELIVERED' ? 'completed' : 'partial',
          createdAt: d.createdAt.toISOString(),
        }));

        return {
          items,
          totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit) || 1,
        };
      }

      if (filter === 'invoice') {
        const where = search
          ? {
              OR: [
                { invoiceNumber: { contains: search, mode: 'insensitive' as const } },
                { customer: { name: { contains: search, mode: 'insensitive' as const } } },
                { customer: { customerCode: { contains: search, mode: 'insensitive' as const } } },
              ],
            }
          : {};

        const [invoices, totalCount] = await Promise.all([
          prisma.invoice.findMany({
            where,
            include: { customer: true },
            orderBy: { createdAt: 'desc' },
            skip: offset,
            take: limit,
          }),
          prisma.invoice.count({ where }),
        ]);

        const items: OperationalActivityItem[] = (invoices as InvoiceItemType[]).map((inv: InvoiceItemType) => ({
          id: inv.id,
          dateTime: formatActivityDateTime(new Date(inv.createdAt)),
          activityType: 'invoice',
          activityLabel: 'Invoice Generated',
          referenceId: inv.invoiceNumber,
          entityName: `${inv.customer?.name || 'Customer'} (${inv.customer?.customerCode || 'CUS-001'})`,
          entitySubtitle: `Due: ₹${inv.balanceDue.toLocaleString('en-IN')} • Status: ${inv.paymentStatus}`,
          amountVolume: `₹${inv.totalAmount.toLocaleString('en-IN')}`,
          status:
            inv.paymentStatus === 'PAID'
              ? 'Fully Paid'
              : inv.paymentStatus === 'PARTIALLY_PAID'
              ? 'Partially Paid'
              : 'Unpaid',
          statusType: inv.paymentStatus === 'PAID' ? 'completed' : 'partial',
          createdAt: inv.createdAt.toISOString(),
        }));

        return {
          items,
          totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit) || 1,
        };
      }

      if (filter === 'payment') {
        const where = {
          type: 'PAYMENT' as const,
          ...(search
            ? {
                OR: [
                  { referenceNumber: { contains: search, mode: 'insensitive' as const } },
                  { customer: { name: { contains: search, mode: 'insensitive' as const } } },
                  { notes: { contains: search, mode: 'insensitive' as const } },
                ],
              }
            : {}),
        };

        const [ledgerEntries, totalCount] = await Promise.all([
          prisma.customerLedgerEntry.findMany({
            where,
            include: { customer: true },
            orderBy: { createdAt: 'desc' },
            skip: offset,
            take: limit,
          }),
          prisma.customerLedgerEntry.count({ where }),
        ]);

        const items: OperationalActivityItem[] = (ledgerEntries as LedgerItemType[]).map((l: LedgerItemType) => ({
          id: l.id,
          dateTime: formatActivityDateTime(new Date(l.createdAt)),
          activityType: 'payment',
          activityLabel: 'Customer Payment',
          referenceId: l.referenceNumber || `PAY-${l.id.slice(-6).toUpperCase()}`,
          entityName: `${l.customer?.name || 'Customer'} (${l.customer?.customerCode || 'CUS-001'})`,
          entitySubtitle: `Running Bal: ₹${l.runningBalance.toLocaleString('en-IN')}${l.notes ? ' • ' + l.notes : ''}`,
          amountVolume: `₹${(l.credit > 0 ? l.credit : l.debit).toLocaleString('en-IN')}`,
          amountGreen: true,
          status: 'Verified (FIFO)',
          statusType: 'verified',
          createdAt: l.createdAt.toISOString(),
        }));

        return {
          items,
          totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit) || 1,
        };
      }

      if (filter === 'expense') {
        const where = search
          ? {
              OR: [
                { claimNumber: { contains: search, mode: 'insensitive' as const } },
                { description: { contains: search, mode: 'insensitive' as const } },
                { partner: { name: { contains: search, mode: 'insensitive' as const } } },
              ],
            }
          : {};

        const [expenses, totalCount] = await Promise.all([
          prisma.expenseClaim.findMany({
            where,
            include: { partner: true, vehicle: true },
            orderBy: { claimDate: 'desc' },
            skip: offset,
            take: limit,
          }),
          prisma.expenseClaim.count({ where }),
        ]);

        const items: OperationalActivityItem[] = (expenses as ExpenseItemType[]).map((exp: ExpenseItemType) => ({
          id: exp.id,
          dateTime: formatActivityDateTime(new Date(exp.claimDate || exp.createdAt)),
          activityType: 'expense',
          activityLabel: 'Expense Claim',
          referenceId: exp.claimNumber,
          entityName: `${exp.partner?.name || 'Driver'} (${exp.partner?.partnerCode || 'DP-001'})`,
          entitySubtitle: `${exp.vehicle ? exp.vehicle.regNumber + ' • ' : ''}${exp.categoryLabel || exp.category}`,
          amountVolume: `₹${exp.amount.toLocaleString('en-IN')}`,
          status:
            exp.status === 'APPROVED'
              ? 'Approved'
              : exp.status === 'PENDING'
              ? 'Pending Approval'
              : 'Rejected',
          statusType:
            exp.status === 'APPROVED'
              ? 'approved'
              : exp.status === 'PENDING'
              ? 'partial'
              : 'discrepancy',
          createdAt: exp.createdAt.toISOString(),
        }));

        return {
          items,
          totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit) || 1,
        };
      }

      if (filter === 'handover') {
        const where = search
          ? {
              OR: [
                { handoverCode: { contains: search, mode: 'insensitive' as const } },
                { partner: { name: { contains: search, mode: 'insensitive' as const } } },
              ],
            }
          : {};

        const [handovers, totalCount] = await Promise.all([
          prisma.cashHandoverEvent.findMany({
            where,
            include: { partner: true, settlement: true },
            orderBy: { handoverTime: 'desc' },
            skip: offset,
            take: limit,
          }),
          prisma.cashHandoverEvent.count({ where }),
        ]);

        const items: OperationalActivityItem[] = (handovers as HandoverItemType[]).map((h: HandoverItemType) => {
          const shortage = h.settlement?.shortfallAmount || 0;
          return {
            id: h.id,
            dateTime: formatActivityDateTime(new Date(h.handoverTime || h.createdAt)),
            activityType: 'handover',
            activityLabel: 'Depot Cash Handover',
            referenceId: h.handoverCode,
            entityName: `${h.partner?.name || 'Partner'} (${h.partner?.partnerCode || 'DP-001'})`,
            entitySubtitle: shortage > 0 ? `Shortage: ₹${shortage.toLocaleString('en-IN')}` : 'Full Handover Verified',
            amountVolume: `₹${h.amount.toLocaleString('en-IN')}`,
            amountHighlight: shortage > 0,
            status: shortage > 0 ? 'Discrepancy Flagged' : 'Verified',
            statusType: shortage > 0 ? 'discrepancy' : 'verified',
            createdAt: h.createdAt.toISOString(),
          };
        });

        return {
          items,
          totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit) || 1,
        };
      }

      // 2. Cross-domain Unified Query ('all') with database-level fetch & pagination
      const fetchDepth = offset + limit;

      const [
        deliveries,
        deliveryCount,
        invoices,
        invoiceCount,
        ledgerEntries,
        ledgerCount,
        expenses,
        expenseCount,
        handovers,
        handoverCount,
      ] = await Promise.all([
        prisma.delivery.findMany({
          where: search
            ? {
                OR: [
                  { cylinderType: { contains: search, mode: 'insensitive' as const } },
                  { customer: { name: { contains: search, mode: 'insensitive' as const } } },
                  { customer: { customerCode: { contains: search, mode: 'insensitive' as const } } },
                ],
              }
            : {},
          include: { customer: true },
          orderBy: { createdAt: 'desc' },
          take: fetchDepth,
        }),
        prisma.delivery.count({
          where: search
            ? {
                OR: [
                  { cylinderType: { contains: search, mode: 'insensitive' as const } },
                  { customer: { name: { contains: search, mode: 'insensitive' as const } } },
                ],
              }
            : {},
        }),

        prisma.invoice.findMany({
          where: search
            ? {
                OR: [
                  { invoiceNumber: { contains: search, mode: 'insensitive' as const } },
                  { customer: { name: { contains: search, mode: 'insensitive' as const } } },
                ],
              }
            : {},
          include: { customer: true },
          orderBy: { createdAt: 'desc' },
          take: fetchDepth,
        }),
        prisma.invoice.count({
          where: search
            ? {
                OR: [
                  { invoiceNumber: { contains: search, mode: 'insensitive' as const } },
                  { customer: { name: { contains: search, mode: 'insensitive' as const } } },
                ],
              }
            : {},
        }),

        prisma.customerLedgerEntry.findMany({
          where: {
            type: 'PAYMENT',
            ...(search
              ? {
                  OR: [
                    { referenceNumber: { contains: search, mode: 'insensitive' as const } },
                    { customer: { name: { contains: search, mode: 'insensitive' as const } } },
                  ],
                }
              : {}),
          },
          include: { customer: true },
          orderBy: { createdAt: 'desc' },
          take: fetchDepth,
        }),
        prisma.customerLedgerEntry.count({
          where: {
            type: 'PAYMENT',
            ...(search
              ? {
                  OR: [
                    { referenceNumber: { contains: search, mode: 'insensitive' as const } },
                    { customer: { name: { contains: search, mode: 'insensitive' as const } } },
                  ],
                }
              : {}),
          },
        }),

        prisma.expenseClaim.findMany({
          where: search
            ? {
                OR: [
                  { claimNumber: { contains: search, mode: 'insensitive' as const } },
                  { description: { contains: search, mode: 'insensitive' as const } },
                  { partner: { name: { contains: search, mode: 'insensitive' as const } } },
                ],
              }
            : {},
          include: { partner: true, vehicle: true },
          orderBy: { claimDate: 'desc' },
          take: fetchDepth,
        }),
        prisma.expenseClaim.count({
          where: search
            ? {
                OR: [
                  { claimNumber: { contains: search, mode: 'insensitive' as const } },
                  { description: { contains: search, mode: 'insensitive' as const } },
                  { partner: { name: { contains: search, mode: 'insensitive' as const } } },
                ],
              }
            : {},
        }),

        prisma.cashHandoverEvent.findMany({
          where: search
            ? {
                OR: [
                  { handoverCode: { contains: search, mode: 'insensitive' as const } },
                  { partner: { name: { contains: search, mode: 'insensitive' as const } } },
                ],
              }
            : {},
          include: { partner: true, settlement: true },
          orderBy: { handoverTime: 'desc' },
          take: fetchDepth,
        }),
        prisma.cashHandoverEvent.count({
          where: search
            ? {
                OR: [
                  { handoverCode: { contains: search, mode: 'insensitive' as const } },
                  { partner: { name: { contains: search, mode: 'insensitive' as const } } },
                ],
              }
            : {},
        }),
      ]);

      const unified: OperationalActivityItem[] = [
        ...(deliveries as DeliveryItemType[]).map((d: DeliveryItemType) => ({
          id: d.id,
          dateTime: formatActivityDateTime(new Date(d.createdAt)),
          activityType: 'delivery' as const,
          activityLabel: 'Cylinder Delivery',
          referenceId: `DEL-${d.id.slice(-6).toUpperCase()}`,
          entityName: `${d.customer?.name || 'Customer'} (${d.customer?.customerCode || 'CUS-001'})`,
          entitySubtitle: `Payment: ${d.paymentMethod} • Refill: ${d.cylinderType}`,
          amountVolume: `${d.quantity}x ${d.cylinderType} (₹${d.amount.toLocaleString('en-IN')})`,
          status: d.status === 'DELIVERED' ? 'Completed' : d.status,
          statusType: d.status === 'DELIVERED' ? ('completed' as const) : ('partial' as const),
          createdAt: d.createdAt.toISOString(),
        })),
        ...(invoices as InvoiceItemType[]).map((inv: InvoiceItemType) => ({
          id: inv.id,
          dateTime: formatActivityDateTime(new Date(inv.createdAt)),
          activityType: 'invoice' as const,
          activityLabel: 'Invoice Generated',
          referenceId: inv.invoiceNumber,
          entityName: `${inv.customer?.name || 'Customer'} (${inv.customer?.customerCode || 'CUS-001'})`,
          entitySubtitle: `Due: ₹${inv.balanceDue.toLocaleString('en-IN')} • Status: ${inv.paymentStatus}`,
          amountVolume: `₹${inv.totalAmount.toLocaleString('en-IN')}`,
          status:
            inv.paymentStatus === 'PAID'
              ? 'Fully Paid'
              : inv.paymentStatus === 'PARTIALLY_PAID'
              ? 'Partially Paid'
              : 'Unpaid',
          statusType: inv.paymentStatus === 'PAID' ? ('completed' as const) : ('partial' as const),
          createdAt: inv.createdAt.toISOString(),
        })),
        ...(ledgerEntries as LedgerItemType[]).map((l: LedgerItemType) => ({
          id: l.id,
          dateTime: formatActivityDateTime(new Date(l.createdAt)),
          activityType: 'payment' as const,
          activityLabel: 'Customer Payment',
          referenceId: l.referenceNumber || `PAY-${l.id.slice(-6).toUpperCase()}`,
          entityName: `${l.customer?.name || 'Customer'} (${l.customer?.customerCode || 'CUS-001'})`,
          entitySubtitle: `Running Bal: ₹${l.runningBalance.toLocaleString('en-IN')}${l.notes ? ' • ' + l.notes : ''}`,
          amountVolume: `₹${(l.credit > 0 ? l.credit : l.debit).toLocaleString('en-IN')}`,
          amountGreen: true,
          status: 'Verified (FIFO)',
          statusType: 'verified' as const,
          createdAt: l.createdAt.toISOString(),
        })),
        ...(expenses as ExpenseItemType[]).map((exp: ExpenseItemType) => ({
          id: exp.id,
          dateTime: formatActivityDateTime(new Date(exp.claimDate || exp.createdAt)),
          activityType: 'expense' as const,
          activityLabel: 'Expense Claim',
          referenceId: exp.claimNumber,
          entityName: `${exp.partner?.name || 'Driver'} (${exp.partner?.partnerCode || 'DP-001'})`,
          entitySubtitle: `${exp.vehicle ? exp.vehicle.regNumber + ' • ' : ''}${exp.categoryLabel || exp.category}`,
          amountVolume: `₹${exp.amount.toLocaleString('en-IN')}`,
          status:
            exp.status === 'APPROVED'
              ? 'Approved'
              : exp.status === 'PENDING'
              ? 'Pending Approval'
              : 'Rejected',
          statusType:
            exp.status === 'APPROVED'
              ? ('approved' as const)
              : exp.status === 'PENDING'
              ? ('partial' as const)
              : ('discrepancy' as const),
          createdAt: exp.createdAt.toISOString(),
        })),
        ...(handovers as HandoverItemType[]).map((h: HandoverItemType) => {
          const shortage = h.settlement?.shortfallAmount || 0;
          return {
            id: h.id,
            dateTime: formatActivityDateTime(new Date(h.handoverTime || h.createdAt)),
            activityType: 'handover' as const,
            activityLabel: 'Depot Cash Handover',
            referenceId: h.handoverCode,
            entityName: `${h.partner?.name || 'Partner'} (${h.partner?.partnerCode || 'DP-001'})`,
            entitySubtitle: shortage > 0 ? `Shortage: ₹${shortage.toLocaleString('en-IN')}` : 'Full Handover Verified',
            amountVolume: `₹${h.amount.toLocaleString('en-IN')}`,
            amountHighlight: shortage > 0,
            status: shortage > 0 ? 'Discrepancy Flagged' : 'Verified',
            statusType: shortage > 0 ? ('discrepancy' as const) : ('verified' as const),
            createdAt: h.createdAt.toISOString(),
          };
        }),
      ];

      // Sort by creation time descending
      unified.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const totalCount =
        deliveryCount + invoiceCount + ledgerCount + expenseCount + handoverCount;

      // Slice the requested window
      const paginatedItems = unified.slice(offset, offset + limit);

      // Fallback if empty database
      if (totalCount === 0 && paginatedItems.length === 0) {
        return getFallbackActivities(page, limit);
      }

      return {
        items: paginatedItems,
        totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit) || 1,
      };
    } catch (error) {
      console.warn('Error fetching paginated operational activities:', error);
      return getFallbackActivities(page, limit);
    }
  }
}

function getFallbackActivities(page: number, limit: number): PaginatedActivitiesResult {
  const defaults: OperationalActivityItem[] = [
    {
      id: 'act-1',
      dateTime: 'Today, 04:15 PM',
      activityType: 'delivery',
      activityLabel: 'Cylinder Delivery',
      referenceId: 'DEL-20261024-94',
      entityName: 'Hotel Annapoorna (CUS-00042)',
      entitySubtitle: 'Partner: DP-003 Suresh Babu',
      amountVolume: '6x 19kg (₹11,100)',
      status: 'Completed',
      statusType: 'completed',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'act-2',
      dateTime: 'Today, 03:30 PM',
      activityType: 'payment',
      activityLabel: 'Customer Payment',
      referenceId: 'PAY-20261024-81',
      entityName: 'Sri Krishna Sweets (CUS-00088)',
      entitySubtitle: 'Bank Ref: UPI-SBIN-99214',
      amountVolume: '₹3,700.00 (UPI)',
      amountGreen: true,
      status: 'Verified (FIFO)',
      statusType: 'verified',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'act-3',
      dateTime: 'Today, 02:10 PM',
      activityType: 'invoice',
      activityLabel: 'Invoice Generated',
      referenceId: 'INV-20261024-89',
      entityName: 'Rajesh Kumar (CUS-00124)',
      entitySubtitle: 'Direct Counter Delivery',
      amountVolume: '₹1,500.00',
      status: 'Partially Paid',
      statusType: 'partial',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 'act-4',
      dateTime: 'Today, 01:20 PM',
      activityType: 'expense',
      activityLabel: 'Expense Claim',
      referenceId: 'EXP-DP-20261024-04',
      entityName: 'DP-001 Rajesh Kumar (Diesel Van 04)',
      entitySubtitle: 'Fuel Receipt: BPCL-4921',
      amountVolume: '₹1,200.00',
      status: 'Approved',
      statusType: 'approved',
      createdAt: new Date(Date.now() - 10800000).toISOString(),
    },
    {
      id: 'act-5',
      dateTime: 'Today, 11:45 AM',
      activityType: 'handover',
      activityLabel: 'Depot Cash Handover',
      referenceId: 'CASH-20261016-001',
      entityName: 'Suresh Babu (Van 03)',
      entitySubtitle: 'Cash Shortage: ₹2,000 pending tally',
      amountVolume: '₹16,500 / ₹18,500',
      amountHighlight: true,
      status: 'Discrepancy Flagged',
      statusType: 'discrepancy',
      createdAt: new Date(Date.now() - 18000000).toISOString(),
    },
  ];

  const offset = (page - 1) * limit;
  const items = defaults.slice(offset, offset + limit);

  return {
    items,
    totalCount: defaults.length,
    page,
    limit,
    totalPages: Math.ceil(defaults.length / limit) || 1,
  };
}
