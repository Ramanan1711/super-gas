'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import AdminSidebar from '@/components/AdminSidebar';
import {
  Bell,
  Download,
  CreditCard,
  Receipt,
  Clock,
  Wallet,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Search,
  Filter,
  Calendar,
  Eye,
  Printer,
  ExternalLink,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Zap,
  Sparkles,
  X,
  Plus,
  Truck,
  Phone,
  MapPin,
  FileText,
  FileDown,
  History,
  BookOpen,
  Hourglass,
  Check,
  QrCode,
  Banknote,
  ShieldCheck,
  RefreshCw,
  MoreVertical,
  Info,
} from 'lucide-react';

export interface InvoiceRecord {
  id: string;
  invoiceNo: string;
  date: string;
  time: string;
  customerName: string;
  customerCode: string;
  category: 'Domestic' | 'Commercial' | 'Bulk Commercial' | 'Small Business';
  deliveryPartnerName: string;
  deliveryPartnerCode: string;
  vehicle: string;
  cylinders: string[];
  invoiceAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: 'Paid' | 'Partially Paid' | 'Unpaid';
  phone?: string;
  address?: string;
  deliveryPass?: string;
  unitRate?: string;
  emptyCollected?: number;
  allocationHistory?: Array<{
    amount: number;
    time: string;
    note: string;
    type: 'settled' | 'pending';
  }>;
}

export interface PaymentRecord {
  id: string;
  paymentRef: string;
  date: string;
  time: string;
  customerName: string;
  customerCode: string;
  relatedInvoicesText: string;
  isSpecialRelated?: boolean;
  deliveryPartner: string;
  receivedAmount: number;
  method: 'Cash' | 'UPI';
  allocatedAmount: number;
  advanceAmount: number;
  verification: 'Verified' | 'Pending Verif.' | 'Not Applicable';
  phone?: string;
  route?: string;
  cashDepotVerified?: boolean;
  fifoSteps?: Array<{
    title: string;
    invoiceNo: string;
    amount: number;
    statusBadge: 'Paid' | 'Credited';
    note: string;
    isSurplus?: boolean;
  }>;
  auditTrail?: string[];
}

const detailedInvoicesList: InvoiceRecord[] = [
  {
    id: 'inv-101',
    invoiceNo: 'INV-20261015-001',
    date: '15 Oct 2026',
    time: '15 Oct 2026, 09:15 AM',
    customerName: 'Rajesh Kumar',
    customerCode: 'CUS-00124',
    category: 'Domestic',
    deliveryPartnerName: 'DP-001 Rajesh',
    deliveryPartnerCode: 'DP-001',
    vehicle: 'Van 01',
    cylinders: ['10x 14.2kg'],
    invoiceAmount: 2200,
    paidAmount: 2200,
    balanceDue: 0,
    status: 'Paid',
    phone: '+91 98401 22340',
    address: '12 North Masi St, Madurai',
    deliveryPass: '#DEL-20261015-04',
    unitRate: '10 @ ₹220.00 / cylinder refill',
    emptyCollected: 10,
    allocationHistory: [
      {
        amount: 2200,
        time: '15 Oct, 09:30 AM',
        note: 'Settled via Customer UPI (#PAY-8821). Full payment received at delivery.',
        type: 'settled',
      },
    ],
  },
  {
    id: 'inv-102',
    invoiceNo: 'INV-20261015-002',
    date: '15 Oct 2026',
    time: '15 Oct 2026, 11:24 AM',
    customerName: 'Mohammed Ali',
    customerCode: 'CUS-00125',
    category: 'Commercial',
    deliveryPartnerName: 'DP-003 Suresh',
    deliveryPartnerCode: 'DP-003',
    vehicle: 'Truck 01',
    cylinders: ['5x 19kg'],
    invoiceAmount: 1200,
    paidAmount: 500,
    balanceDue: 700,
    status: 'Partially Paid',
    phone: '+91 98421 56789',
    address: '14/2, KK Nagar 4th Street, Madurai',
    deliveryPass: '#DEL-20261015-88',
    unitRate: '5 @ ₹240.00 / cylinder refill',
    emptyCollected: 5,
    allocationHistory: [
      {
        amount: 500,
        time: '15 Oct, 11:35 AM',
        note: 'Settled via Customer UPI (#PAY-9921). Oldest pending invoice prioritized.',
        type: 'settled',
      },
      {
        amount: 700,
        time: 'Due Next Cycle',
        note: 'Assigned to next settlement batch for DP-003 Suresh Babu.',
        type: 'pending',
      },
    ],
  },
  {
    id: 'inv-103',
    invoiceNo: 'INV-20261014-003',
    date: '14 Oct 2026',
    time: '14 Oct 2026, 16:20 PM',
    customerName: 'Priya Stores',
    customerCode: 'CUS-00126 · Commercial',
    category: 'Commercial',
    deliveryPartnerName: 'DP-001 Rajesh',
    deliveryPartnerCode: 'DP-001',
    vehicle: 'Van 01',
    cylinders: ['8x 19kg'],
    invoiceAmount: 1800,
    paidAmount: 0,
    balanceDue: 1800,
    status: 'Unpaid',
    phone: '+91 94432 10987',
    address: '88 East Veli St, Simmakkal, Madurai',
    deliveryPass: '#DEL-20261014-41',
    unitRate: '8 @ ₹225.00 / cylinder refill',
    emptyCollected: 8,
    allocationHistory: [
      {
        amount: 1800,
        time: 'Payment Overdue',
        note: 'Awaiting cashier bank deposit confirmation.',
        type: 'pending',
      },
    ],
  },
  {
    id: 'inv-104',
    invoiceNo: 'INV-20261014-004',
    date: '14 Oct 2026',
    time: '14 Oct 2026, 14:10 PM',
    customerName: 'Lakshmi Agencies',
    customerCode: 'CUS-00128 · Bulk',
    category: 'Bulk Commercial',
    deliveryPartnerName: 'DP-002 Mohamed',
    deliveryPartnerCode: 'DP-002',
    vehicle: 'Van 02',
    cylinders: ['6x 19kg'],
    invoiceAmount: 1400,
    paidAmount: 1400,
    balanceDue: 0,
    status: 'Paid',
    phone: '+91 97890 55412',
    address: '42 South Gate Industrial Estate, Madurai',
    deliveryPass: '#DEL-20261014-19',
    unitRate: '6 @ ₹233.33 / cylinder refill',
    emptyCollected: 6,
    allocationHistory: [
      {
        amount: 1400,
        time: '14 Oct, 14:40 PM',
        note: 'Full settlement processed via Counter Cash Handover.',
        type: 'settled',
      },
    ],
  },
  {
    id: 'inv-105',
    invoiceNo: 'INV-20261013-005',
    date: '13 Oct 2026',
    time: '13 Oct 2026, 12:45 PM',
    customerName: 'Kumar Traders',
    customerCode: 'CUS-00130',
    category: 'Commercial',
    deliveryPartnerName: 'DP-003 Suresh',
    deliveryPartnerCode: 'DP-003',
    vehicle: 'Truck 01',
    cylinders: ['12x 14.2kg'],
    invoiceAmount: 2700,
    paidAmount: 1000,
    balanceDue: 1700,
    status: 'Partially Paid',
    phone: '+91 98940 33441',
    address: '56 Goods Shed Street, Madurai',
    deliveryPass: '#DEL-20261013-72',
    unitRate: '12 @ ₹225.00 / cylinder refill',
    emptyCollected: 12,
    allocationHistory: [
      {
        amount: 1000,
        time: '13 Oct, 13:00 PM',
        note: 'Partial cash handover to driver DP-003 Suresh Babu.',
        type: 'settled',
      },
      {
        amount: 1700,
        time: 'Next Settlement Batch',
        note: 'Invoice balance queued for follow-up.',
        type: 'pending',
      },
    ],
  },
  {
    id: 'inv-106',
    invoiceNo: 'INV-20261013-006',
    date: '13 Oct 2026',
    time: '13 Oct 2026, 10:15 AM',
    customerName: 'Sri Krishna Sweets',
    customerCode: 'CUS-00088',
    category: 'Commercial',
    deliveryPartnerName: 'DP-002 Mohamed',
    deliveryPartnerCode: 'DP-002',
    vehicle: 'Van 02',
    cylinders: ['4x 19kg'],
    invoiceAmount: 3700,
    paidAmount: 3700,
    balanceDue: 0,
    status: 'Paid',
    phone: '+91 98401 54321',
    address: '77 Town Hall Road, Madurai',
    deliveryPass: '#DEL-20261013-11',
    unitRate: '4 @ ₹925.00 / cylinder refill',
    emptyCollected: 4,
    allocationHistory: [
      {
        amount: 3700,
        time: '13 Oct, 10:30 AM',
        note: 'Full settlement via Automated FIFO pool.',
        type: 'settled',
      },
    ],
  },
];

const initialPaymentsList: PaymentRecord[] = [
  {
    id: 'pay-001',
    paymentRef: 'PAY-20261015-001',
    date: '15 Oct 2026',
    time: '15 Oct 2026, 10:30 AM',
    customerName: 'Rajesh Kumar',
    customerCode: 'CUS-00124',
    relatedInvoicesText: 'INV-20261015-001',
    deliveryPartner: 'DP-001 Rajesh',
    receivedAmount: 2200,
    method: 'Cash',
    allocatedAmount: 2200,
    advanceAmount: 0,
    verification: 'Pending Verif.',
    phone: '+91 98401 22340',
    route: 'West Veli St, Madurai',
    cashDepotVerified: false,
    fifoSteps: [
      {
        title: 'Step 1 · Oldest Invoice',
        invoiceNo: 'INV-20261015-001 (15 Oct 2026)',
        amount: 2200,
        statusBadge: 'Paid',
        note: 'Cleared full invoice balance; zero pending balance remaining.',
      },
    ],
    auditTrail: [
      'Field Collection: Handed over in cash to Rajesh at 10:30 AM via Driver App #SG-M01.',
      'FIFO Allocation: Automated clearance executed in real time by the Super Gas Core Billing engine.',
      'Depot Physical Audit: Awaiting physical counter cash verification at HQ Depot.',
    ],
  },
  {
    id: 'pay-002',
    paymentRef: 'PAY-20261015-002',
    date: '15 Oct 2026',
    time: '15 Oct 2026, 11:15 AM',
    customerName: 'Mohammed Ali',
    customerCode: 'CUS-00125',
    relatedInvoicesText: '2 Invoices Settled',
    deliveryPartner: 'DP-003 Suresh',
    receivedAmount: 1200,
    method: 'UPI',
    allocatedAmount: 1200,
    advanceAmount: 0,
    verification: 'Not Applicable',
    phone: '+91 98421 56789',
    route: 'KK Nagar 4th St, Madurai',
    cashDepotVerified: false,
    fifoSteps: [
      {
        title: 'Step 1 · Oldest Invoice',
        invoiceNo: 'INV-20261012-044 (12 Oct 2026)',
        amount: 500,
        statusBadge: 'Paid',
        note: 'Cleared historical balance in chronological priority.',
      },
      {
        title: 'Step 2 · Subsequent Invoice',
        invoiceNo: 'INV-20261015-002 (15 Oct 2026)',
        amount: 700,
        statusBadge: 'Paid',
        note: 'Settled delivery bill upon gate handover.',
      },
    ],
    auditTrail: [
      'Digital Gateway: Received via BharatPe / UPI Terminal Ref #BH-98213.',
      'FIFO Allocation: Automated clearance executed in real time by Super Gas Core.',
      'Bank Reconciliation: Verified against HDFC Current Account statement.',
    ],
  },
  {
    id: 'pay-003',
    paymentRef: 'PAY-20261015-003',
    date: '15 Oct 2026',
    time: '15 Oct 2026, 12:05 PM',
    customerName: 'Priya Stores',
    customerCode: 'CUS-00126 · Retail',
    relatedInvoicesText: '2 Cleared + Advance',
    isSpecialRelated: true,
    deliveryPartner: 'DP-002 Mohamed',
    receivedAmount: 3000,
    method: 'Cash',
    allocatedAmount: 2500,
    advanceAmount: 500,
    verification: 'Verified',
    phone: '+91 98945 12345',
    route: 'Bypass Rd, Madurai',
    cashDepotVerified: true,
    fifoSteps: [
      {
        title: 'Step 1 · Oldest Invoice',
        invoiceNo: 'INV-20261010-078 (10 Oct 2026)',
        amount: 1500,
        statusBadge: 'Paid',
        note: 'Cleared full outstanding invoice balance in sequence.',
      },
      {
        title: 'Step 2 · Subsequent Invoice',
        invoiceNo: 'INV-20261012-081 (12 Oct 2026)',
        amount: 1000,
        statusBadge: 'Paid',
        note: 'Cleared full invoice balance; zero pending balance remaining.',
      },
      {
        title: 'Step 3 · Surplus Customer Advance',
        invoiceNo: 'Customer Advance Pool (#ADV-20261015-09)',
        amount: 500,
        statusBadge: 'Credited',
        note: 'All past invoices are satisfied. Excess funds retained as pre-payment credit.',
        isSurplus: true,
      },
    ],
    auditTrail: [
      'Field Collection: Handed over in cash to Mohamed Irfan at 12:05 PM via Driver App #SG-M04.',
      'FIFO Allocation: Automated clearance executed in real time by the Super Gas Core Billing engine.',
      'Depot Physical Audit: Cash physically deposited and verified at HQ Depot at 05:30 PM by Admin S. Raman.',
    ],
  },
  {
    id: 'pay-004',
    paymentRef: 'PAY-20261014-004',
    date: '14 Oct 2026',
    time: '14 Oct 2026, 04:20 PM',
    customerName: 'Lakshmi Agencies',
    customerCode: 'CUS-00128',
    relatedInvoicesText: 'INV-20261014-004',
    deliveryPartner: 'DP-001 Rajesh',
    receivedAmount: 1400,
    method: 'UPI',
    allocatedAmount: 1400,
    advanceAmount: 0,
    verification: 'Not Applicable',
    phone: '+91 97890 55412',
    route: 'South Gate Industrial, Madurai',
    cashDepotVerified: false,
    fifoSteps: [
      {
        title: 'Step 1 · Oldest Invoice',
        invoiceNo: 'INV-20261014-004 (14 Oct 2026)',
        amount: 1400,
        statusBadge: 'Paid',
        note: 'Cleared complete dispatch order total.',
      },
    ],
    auditTrail: [
      'Digital Collection: Customer scanned QR on delivery confirmation receipt.',
      'FIFO Allocation: Automated clearance executed in real time by Super Gas Core.',
      'Bank Reconciliation: Verified and tagged to HDFC Settlement ledger.',
    ],
  },
  {
    id: 'pay-005',
    paymentRef: 'PAY-20261014-005',
    date: '14 Oct 2026',
    time: '14 Oct 2026, 02:10 PM',
    customerName: 'Hotel Annapoorna',
    customerCode: 'CUS-00542 · Commercial',
    relatedInvoicesText: 'INV-20261011-065',
    deliveryPartner: 'DP-003 Suresh',
    receivedAmount: 4500,
    method: 'Cash',
    allocatedAmount: 4500,
    advanceAmount: 0,
    verification: 'Verified',
    phone: '+91 94432 98765',
    route: 'Simmakkal Route, Madurai',
    cashDepotVerified: true,
    fifoSteps: [
      {
        title: 'Step 1 · Oldest Invoice',
        invoiceNo: 'INV-20261011-065 (11 Oct 2026)',
        amount: 4500,
        statusBadge: 'Paid',
        note: 'High-volume commercial dispatch invoice cleared.',
      },
    ],
    auditTrail: [
      'Field Collection: Bulk cash handover logged by DP-003 Suresh Babu.',
      'FIFO Allocation: Real-time invoice liquidation completed.',
      'Depot Physical Audit: Physical cash verified and sealed in depot night vault.',
    ],
  },
  {
    id: 'pay-006',
    paymentRef: 'PAY-20261013-006',
    date: '13 Oct 2026',
    time: '13 Oct 2026, 05:45 PM',
    customerName: 'Sri Krishna Sweets',
    customerCode: 'CUS-00088',
    relatedInvoicesText: '3 Invoices Settled',
    deliveryPartner: 'DP-002 Mohamed',
    receivedAmount: 4000,
    method: 'UPI',
    allocatedAmount: 4000,
    advanceAmount: 0,
    verification: 'Not Applicable',
    phone: '+91 98401 54321',
    route: 'Town Hall Road, Madurai',
    cashDepotVerified: false,
    fifoSteps: [
      {
        title: 'Step 1 · Oldest Invoice',
        invoiceNo: 'INV-20261009-021 (09 Oct 2026)',
        amount: 1500,
        statusBadge: 'Paid',
        note: 'Prioritized oldest outstanding invoice balance.',
      },
      {
        title: 'Step 2 · Intermediate Invoice',
        invoiceNo: 'INV-20261011-039 (11 Oct 2026)',
        amount: 2200,
        statusBadge: 'Paid',
        note: 'Full invoice cleared.',
      },
      {
        title: 'Step 3 · Current Invoice',
        invoiceNo: 'INV-20261013-006 (13 Oct 2026)',
        amount: 300,
        statusBadge: 'Paid',
        note: 'Partial invoice balance settled.',
      },
    ],
    auditTrail: [
      'Digital Gateway: Instant UPI clearance ref #UPI-880291.',
      'FIFO Allocation: Real-time automated liquidation executed.',
      'Depot Audit: Ledger confirmed atomically.',
    ],
  },
];

export interface CashBreakdownItem {
  paymentRef: string;
  invoiceNo: string;
  customerName: string;
  time: string;
  amount: number;
}

export interface CashReconciliationRecord {
  id: string;
  reconciliationId: string;
  collectionDate: string;
  partnerName: string;
  partnerCode: string;
  partnerInitials: string;
  partnerAvatarBg: string;
  partnerAvatarText: string;
  cashReported: number;
  cashReceived: number | null;
  difference: number | null;
  status: 'Pending Verification' | 'Verified' | 'Discrepancy Found' | 'Under Investigation';
  
  settlementRef: string;
  vehicle: string;
  route: string;
  timestamp: string;
  depot: string;
  invoicesBatchText: string;
  
  breakdown: CashBreakdownItem[];
  totalReportedCash: number;
  
  cashCounted: number;
  shortfall: number;
  discrepancyNotes: string;
  
  cashierName: string;
  investigationSteps: Array<{
    title: string;
    subtitle: string;
    isFlagged?: boolean;
  }>;
  statusBadgeText: string;
}

const initialCashReconciliationsList: CashReconciliationRecord[] = [
  {
    id: 'cash-001',
    reconciliationId: 'CASH-20261016-001',
    collectionDate: '16 Oct 2026',
    partnerName: 'Rajesh Kumar',
    partnerCode: 'DP-001',
    partnerInitials: 'RK',
    partnerAvatarBg: 'bg-slate-100',
    partnerAvatarText: 'text-slate-700',
    cashReported: 12000,
    cashReceived: null,
    difference: null,
    status: 'Pending Verification',
    settlementRef: '#SET-20261016-01',
    vehicle: 'Tata Ace (Van 01)',
    route: 'Anna Nagar Route 1A',
    timestamp: '16 Oct 2026, 05:30 PM',
    depot: 'HQ Central Vault',
    invoicesBatchText: '2 Commercial Invoices',
    breakdown: [
      {
        paymentRef: 'PAY-20261016-001',
        invoiceNo: 'INV-099',
        customerName: 'Hotel Saravana',
        time: '02:15 PM',
        amount: 6500,
      },
      {
        paymentRef: 'PAY-20261016-002',
        invoiceNo: 'INV-100',
        customerName: 'A1 Bakery',
        time: '04:45 PM',
        amount: 5500,
      },
    ],
    totalReportedCash: 12000,
    cashCounted: 0,
    shortfall: 0,
    discrepancyNotes: 'Awaiting driver physical cash drop at depot vault.',
    cashierName: 'Admin S. Raman (Staff ID #8841)',
    investigationSteps: [
      {
        title: 'Field App Synchronized',
        subtitle: '16 Oct, 05:15 PM • DP Mobile App v3.4',
      },
      {
        title: 'Cash Tray Physical Count Pending',
        subtitle: 'Awaiting Partner Arrival',
      },
    ],
    statusBadgeText: 'Pending Depot Verification',
  },
  {
    id: 'cash-002',
    reconciliationId: 'CASH-20261016-002',
    collectionDate: '16 Oct 2026',
    partnerName: 'Suresh Babu',
    partnerCode: 'DP-003',
    partnerInitials: 'SB',
    partnerAvatarBg: 'bg-slate-100',
    partnerAvatarText: 'text-slate-700',
    cashReported: 8500,
    cashReceived: 8500,
    difference: 0,
    status: 'Verified',
    settlementRef: '#SET-20261016-02',
    vehicle: 'Mahindra Bolero (Van 03)',
    route: 'Simmakkal Central 2B',
    timestamp: '16 Oct 2026, 05:45 PM',
    depot: 'HQ Central Vault',
    invoicesBatchText: '2 Commercial Invoices',
    breakdown: [
      {
        paymentRef: 'PAY-20261016-005',
        invoiceNo: 'INV-095',
        customerName: 'Madurai Mess',
        time: '01:40 PM',
        amount: 4500,
      },
      {
        paymentRef: 'PAY-20261016-008',
        invoiceNo: 'INV-096',
        customerName: 'Annapoorna Express',
        time: '04:10 PM',
        amount: 4000,
      },
    ],
    totalReportedCash: 8500,
    cashCounted: 8500,
    shortfall: 0,
    discrepancyNotes: 'Cash physically counted and verified matching report.',
    cashierName: 'Admin S. Raman (Staff ID #8841)',
    investigationSteps: [
      {
        title: 'Field App Synchronized',
        subtitle: '16 Oct, 05:20 PM • DP Mobile App v3.4',
      },
      {
        title: 'Cash Tray Physical Count Completed',
        subtitle: '16 Oct, 05:50 PM • Cashier S. Raman',
      },
    ],
    statusBadgeText: 'Audit Clearance Passed',
  },
  {
    id: 'cash-003',
    reconciliationId: 'CASH-20261015-003',
    collectionDate: '15 Oct 2026',
    partnerName: 'Ravi Shanker',
    partnerCode: 'DP-004',
    partnerInitials: 'RS',
    partnerAvatarBg: 'bg-[#FFE4E6]',
    partnerAvatarText: 'text-[#BE123C]',
    cashReported: 15000,
    cashReceived: 14000,
    difference: -1000,
    status: 'Discrepancy Found',
    settlementRef: '#SET-20261015-04',
    vehicle: 'Tata Ace (Van 01)',
    route: 'South City Route 4B',
    timestamp: '15 Oct 2026, 06:10 PM',
    depot: 'HQ Central Vault',
    invoicesBatchText: '3 Commercial Invoices',
    breakdown: [
      {
        paymentRef: 'PAY-20261015-012',
        invoiceNo: 'INV-091',
        customerName: 'Hotel Annapoorna',
        time: '01:20 PM',
        amount: 5550,
      },
      {
        paymentRef: 'PAY-20261015-015',
        invoiceNo: 'INV-094',
        customerName: 'Sri Krishna Sweets',
        time: '03:45 PM',
        amount: 4500,
      },
      {
        paymentRef: 'PAY-20261015-018',
        invoiceNo: 'INV-098',
        customerName: 'Priya Enterprises',
        time: '05:10 PM',
        amount: 4950,
      },
    ],
    totalReportedCash: 15000,
    cashCounted: 14000,
    shortfall: -1000,
    discrepancyNotes: 'Physical handover short by ₹1,000. Driver Ravi reported that customer Hotel Annapoorna paid ₹4,550 instead of ₹5,550 due to a pending dispute on tare weight deduction.',
    cashierName: 'Admin S. Raman (Staff ID #8841)',
    investigationSteps: [
      {
        title: 'Field App Synchronized',
        subtitle: '15 Oct, 05:40 PM • DP Mobile App v3.4',
      },
      {
        title: 'Cash Tray Physical Count Completed',
        subtitle: '15 Oct, 06:15 PM • Cashier S. Raman',
      },
      {
        title: 'Shortfall Flagged & Dispute Logged',
        subtitle: '15 Oct, 06:22 PM • Ref Case #DISC-901',
        isFlagged: true,
      },
    ],
    statusBadgeText: 'In Audit Inquiry',
  },
  {
    id: 'cash-004',
    reconciliationId: 'CASH-20261015-004',
    collectionDate: '15 Oct 2026',
    partnerName: 'Rajesh Kumar',
    partnerCode: 'DP-001',
    partnerInitials: 'RK',
    partnerAvatarBg: 'bg-slate-100',
    partnerAvatarText: 'text-slate-700',
    cashReported: 6000,
    cashReceived: 6000,
    difference: 0,
    status: 'Verified',
    settlementRef: '#SET-20261015-05',
    vehicle: 'Tata Ace (Van 01)',
    route: 'Anna Nagar Route 1A',
    timestamp: '15 Oct 2026, 06:00 PM',
    depot: 'HQ Central Vault',
    invoicesBatchText: '2 Commercial Invoices',
    breakdown: [
      {
        paymentRef: 'PAY-20261015-021',
        invoiceNo: 'INV-088',
        customerName: 'Royal Caterers',
        time: '02:00 PM',
        amount: 3500,
      },
      {
        paymentRef: 'PAY-20261015-022',
        invoiceNo: 'INV-089',
        customerName: 'Blue Star Tea',
        time: '04:30 PM',
        amount: 2500,
      },
    ],
    totalReportedCash: 6000,
    cashCounted: 6000,
    shortfall: 0,
    discrepancyNotes: 'Exact match verified by cashier.',
    cashierName: 'Admin S. Raman (Staff ID #8841)',
    investigationSteps: [
      {
        title: 'Field App Synchronized',
        subtitle: '15 Oct, 05:40 PM • DP Mobile App v3.4',
      },
      {
        title: 'Cash Tray Physical Count Completed',
        subtitle: '15 Oct, 06:05 PM • Cashier S. Raman',
      },
    ],
    statusBadgeText: 'Audit Clearance Passed',
  },
  {
    id: 'cash-005',
    reconciliationId: 'CASH-20261014-005',
    collectionDate: '14 Oct 2026',
    partnerName: 'Mohamed Irfan',
    partnerCode: 'DP-002',
    partnerInitials: 'MI',
    partnerAvatarBg: 'bg-[#EEF2FF]',
    partnerAvatarText: 'text-[#4F46E5]',
    cashReported: 10500,
    cashReceived: 9500,
    difference: -1000,
    status: 'Under Investigation',
    settlementRef: '#SET-20261014-08',
    vehicle: 'Mahindra Maxx (Van 02)',
    route: 'K.K. Nagar North 3C',
    timestamp: '14 Oct 2026, 06:30 PM',
    depot: 'HQ Central Vault',
    invoicesBatchText: '3 Commercial Invoices',
    breakdown: [
      {
        paymentRef: 'PAY-20261014-031',
        invoiceNo: 'INV-081',
        customerName: 'Vasavi Sweets',
        time: '01:15 PM',
        amount: 3500,
      },
      {
        paymentRef: 'PAY-20261014-032',
        invoiceNo: 'INV-082',
        customerName: 'Meenakshi Bhavan',
        time: '03:20 PM',
        amount: 4000,
      },
      {
        paymentRef: 'PAY-20261014-033',
        invoiceNo: 'INV-083',
        customerName: 'City Cafe',
        time: '05:00 PM',
        amount: 3000,
      },
    ],
    totalReportedCash: 10500,
    cashCounted: 9500,
    shortfall: -1000,
    discrepancyNotes: 'Shortfall of ₹1,000 reported from Vasavi Sweets delivery.',
    cashierName: 'Admin S. Raman (Staff ID #8841)',
    investigationSteps: [
      {
        title: 'Field App Synchronized',
        subtitle: '14 Oct, 05:55 PM • DP Mobile App v3.4',
      },
      {
        title: 'Cash Tray Physical Count Completed',
        subtitle: '14 Oct, 06:35 PM • Cashier S. Raman',
      },
      {
        title: 'Shortfall Flagged & Dispute Logged',
        subtitle: '14 Oct, 06:40 PM • Ref Case #DISC-887',
        isFlagged: true,
      },
    ],
    statusBadgeText: 'In Audit Inquiry',
  },
];

const overviewInvoices: InvoiceRecord[] = [
  {
    id: 'inv-1',
    invoiceNo: 'INV-20261024-086',
    date: '24 Oct 2026',
    time: 'Today, 14:15 PM',
    customerName: 'Rajesh Kumar',
    customerCode: 'CUS-00124',
    category: 'Domestic',
    deliveryPartnerName: 'Rajesh Kumar',
    deliveryPartnerCode: 'DP-001',
    vehicle: '(Van 01)',
    cylinders: ['2x 14.2kg Domestic', '1x 19kg Domestic'],
    invoiceAmount: 1200,
    paidAmount: 1000,
    balanceDue: 200,
    status: 'Partially Paid',
  },
  {
    id: 'inv-2',
    invoiceNo: 'INV-20261024-085',
    date: '24 Oct 2026',
    time: 'Today, 13:40 PM',
    customerName: 'Sri Krishna Sweets',
    customerCode: 'CUS-00366',
    category: 'Commercial',
    deliveryPartnerName: 'Mohamed Irfan',
    deliveryPartnerCode: 'DP-002',
    vehicle: '(Van 02)',
    cylinders: ['4x 19kg Commercial'],
    invoiceAmount: 3700,
    paidAmount: 3700,
    balanceDue: 0,
    status: 'Paid',
  },
  {
    id: 'inv-3',
    invoiceNo: 'INV-20261024-084',
    date: '24 Oct 2026',
    time: 'Today, 12:10 PM',
    customerName: 'Hotel Annapoorna',
    customerCode: 'CUS-00542',
    category: 'Bulk Commercial',
    deliveryPartnerName: 'Suresh Babu',
    deliveryPartnerCode: 'DP-003',
    vehicle: '(Truck 01)',
    cylinders: ['6x 19kg Commercial'],
    invoiceAmount: 5580,
    paidAmount: 0,
    balanceDue: 5580,
    status: 'Unpaid',
  },
  {
    id: 'inv-4',
    invoiceNo: 'INV-20261024-083',
    date: '24 Oct 2026',
    time: 'Today, 11:20 AM',
    customerName: 'Priya Enterprises',
    customerCode: 'CUS-00830',
    category: 'Small Business',
    deliveryPartnerName: 'Rajesh Kumar',
    deliveryPartnerCode: 'DP-001',
    vehicle: '(Van 01)',
    cylinders: ['2x 14.2kg Domestic'],
    invoiceAmount: 1500,
    paidAmount: 750,
    balanceDue: 750,
    status: 'Partially Paid',
  },
  {
    id: 'inv-5',
    invoiceNo: 'INV-20261024-082',
    date: '24 Oct 2026',
    time: 'Today, 10:45 AM',
    customerName: 'Suresh Babu (Res)',
    customerCode: 'CUS-00877',
    category: 'Domestic',
    deliveryPartnerName: 'Mohamed Irfan',
    deliveryPartnerCode: 'DP-002',
    vehicle: '(Van 02)',
    cylinders: ['1x 14.2kg Domestic'],
    invoiceAmount: 950,
    paidAmount: 950,
    balanceDue: 0,
    status: 'Paid',
  },
];

interface AdminInvoicesPageProps {
  initialTab?: 'Overview' | 'Invoices' | 'Payments' | 'Cash Reconciliation' | 'Customer Ledger';
}

export default function AdminInvoicesPage({
  initialTab = 'Cash Reconciliation',
}: AdminInvoicesPageProps) {
  const [activeTab, setActiveTab] = useState<'Overview' | 'Invoices' | 'Payments' | 'Cash Reconciliation' | 'Customer Ledger'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [partnerFilter, setPartnerFilter] = useState('All Delivery Partners');
  const [customerFilter, setCustomerFilter] = useState('All Customers');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Invoices Tab Table Selection & Inspection
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>(['inv-101']);
  const [inspectedInvoice, setInspectedInvoice] = useState<InvoiceRecord | null>(detailedInvoicesList[1]); // Default to Mohammed Ali (INV-20261015-002)

  // Payments Tab State
  const [selectedPaymentIds, setSelectedPaymentIds] = useState<string[]>(['pay-003']); // Default checked on Priya Stores (PAY-20261015-003)
  const [inspectedPayment, setInspectedPayment] = useState<PaymentRecord | null>(initialPaymentsList[2]); // Default to PAY-20261015-003 Priya Stores
  const [paymentSearchQuery, setPaymentSearchQuery] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('All Methods');
  const [paymentPartnerFilter, setPaymentPartnerFilter] = useState('All Delivery Partners');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All Statuses');

  // Cash Reconciliation Tab State
  const [inspectedCashRecord, setInspectedCashRecord] = useState<CashReconciliationRecord | null>(initialCashReconciliationsList[2]); // Default to CASH-20261015-003 Ravi Shanker
  const [cashSearchQuery, setCashSearchQuery] = useState('');
  const [cashPartnerFilter, setCashPartnerFilter] = useState('All Delivery Partners');
  const [cashStatusFilter, setCashStatusFilter] = useState('All Statuses');
  const [cashCountedInput, setCashCountedInput] = useState('14,000');
  const [discrepancyMemoInput, setDiscrepancyMemoInput] = useState(
    'Physical handover short by ₹1,000. Driver Ravi reported that customer Hotel Annapoorna paid ₹4,550 instead of ₹5,550 due to a pending dispute on tare weight deduction.'
  );

  // Modals
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
  const [showRecordPaymentModal, setShowRecordPaymentModal] = useState(false);
  const [showInvestigateModal, setShowInvestigateModal] = useState(false);

  // Record Payment form
  const [paymentCustomer, setPaymentCustomer] = useState('Sri Krishna Sweets (CUS-00366)');
  const [paymentAmount, setPaymentAmount] = useState('4,000');
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Bank Transfer'>('Cash');
  const [paymentRef, setPaymentRef] = useState('PAY-558802');

  // Create Invoice form
  const [newCustomer, setNewCustomer] = useState('Mohammed Ali (CUS-00125)');
  const [newCylinderType, setNewCylinderType] = useState('19kg Commercial');
  const [newQuantity, setNewQuantity] = useState('5');
  const [newRate, setNewRate] = useState('240');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleSelectInvoice = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedInvoiceIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAllInvoices = () => {
    if (selectedInvoiceIds.length === detailedInvoicesList.length) {
      setSelectedInvoiceIds([]);
    } else {
      setSelectedInvoiceIds(detailedInvoicesList.map((i) => i.id));
    }
  };

  const toggleSelectPayment = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPaymentIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAllPayments = () => {
    if (selectedPaymentIds.length === initialPaymentsList.length) {
      setSelectedPaymentIds([]);
    } else {
      setSelectedPaymentIds(initialPaymentsList.map((p) => p.id));
    }
  };

  const filteredInvoices = useMemo(() => {
    return detailedInvoicesList.filter((inv) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          inv.invoiceNo.toLowerCase().includes(q) ||
          inv.customerName.toLowerCase().includes(q) ||
          inv.customerCode.toLowerCase().includes(q) ||
          inv.deliveryPartnerName.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (statusFilter !== 'All' && statusFilter !== 'All Statuses') {
        if (inv.status !== statusFilter) return false;
      }
      if (partnerFilter !== 'All Delivery Partners') {
        if (!inv.deliveryPartnerName.toLowerCase().includes(partnerFilter.toLowerCase())) return false;
      }
      if (customerFilter !== 'All Customers') {
        if (customerFilter === 'Commercial' && !inv.category.includes('Commercial')) return false;
        if (customerFilter === 'Domestic' && inv.category !== 'Domestic') return false;
      }
      return true;
    });
  }, [searchQuery, statusFilter, partnerFilter, customerFilter]);

  const filteredPayments = useMemo(() => {
    return initialPaymentsList.filter((pay) => {
      if (paymentSearchQuery.trim()) {
        const q = paymentSearchQuery.toLowerCase();
        const match =
          pay.paymentRef.toLowerCase().includes(q) ||
          pay.customerName.toLowerCase().includes(q) ||
          pay.customerCode.toLowerCase().includes(q) ||
          pay.relatedInvoicesText.toLowerCase().includes(q) ||
          pay.deliveryPartner.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (paymentMethodFilter !== 'All Methods' && paymentMethodFilter !== 'All Methods (Cash, UPI)') {
        if (pay.method !== paymentMethodFilter) return false;
      }
      if (paymentPartnerFilter !== 'All Delivery Partners') {
        if (!pay.deliveryPartner.toLowerCase().includes(paymentPartnerFilter.toLowerCase())) return false;
      }
      if (paymentStatusFilter !== 'All Statuses' && paymentStatusFilter !== 'All') {
        if (pay.verification !== paymentStatusFilter) return false;
      }
      return true;
    });
  }, [paymentSearchQuery, paymentMethodFilter, paymentPartnerFilter, paymentStatusFilter]);

  const filteredCashReconciliations = useMemo(() => {
    return initialCashReconciliationsList.filter((item) => {
      if (cashSearchQuery.trim()) {
        const q = cashSearchQuery.toLowerCase();
        const match =
          item.reconciliationId.toLowerCase().includes(q) ||
          item.partnerName.toLowerCase().includes(q) ||
          item.partnerCode.toLowerCase().includes(q) ||
          item.settlementRef.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (cashPartnerFilter !== 'All Delivery Partners') {
        const pLower = cashPartnerFilter.toLowerCase();
        const matchPartner =
          item.partnerName.toLowerCase().includes(pLower) ||
          item.partnerCode.toLowerCase().includes(pLower);
        if (!matchPartner) return false;
      }
      if (cashStatusFilter !== 'All Statuses' && cashStatusFilter !== 'All') {
        if (item.status !== cashStatusFilter) return false;
      }
      return true;
    });
  }, [cashSearchQuery, cashPartnerFilter, cashStatusFilter]);

  const handleCreateInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowCreateInvoiceModal(false);
    triggerToast(`Invoice for ${newCustomer} generated successfully!`);
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowRecordPaymentModal(false);
    triggerToast(`Payment of ₹${paymentAmount} recorded successfully with FIFO allocation!`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-800 font-sans antialiased">
      {/* 1. Left Sidebar Navigation */}
      <AdminSidebar
        className="sticky top-0 h-screen z-30 border-r border-slate-200/90 rounded-none shrink-0"
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200/90 px-6 flex items-center justify-between sticky top-0 z-20">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs">
            <span className="w-4 h-4 rounded-full bg-[#E81B24] inline-block shrink-0"></span>
            <Link href="/admin" className="text-slate-500 hover:text-slate-800 transition">
              Dashboard
            </Link>
            <span className="text-slate-300">/</span>
            <span className="font-bold text-slate-800">
              Invoices &amp; Payments
            </span>
          </div>

          {/* Right Header Status, Alerts & Admin Profile */}
          <div className="flex items-center gap-4">
            {/* Operational Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Agency: Operational</span>
            </div>

            {/* Notification Bell */}
            <button
              type="button"
              onClick={() => triggerToast('No unread notifications')}
              className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E81B24] rounded-full ring-2 ring-white"></span>
            </button>

            {/* Profile Avatar & Info */}
            <div className="flex items-center gap-2.5 pl-2 sm:border-l sm:border-slate-200">
              <div className="w-8 h-8 rounded-full bg-[#BC0118] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                A
              </div>
              <div className="hidden md:block leading-tight">
                <div className="text-xs font-bold text-slate-800">Agency Admin</div>
                <div className="text-[10px] text-slate-400 font-medium">HQ Branch</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 sm:p-8 space-y-6 max-w-[1600px] w-full mx-auto pb-16">
          {/* Header Title Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {activeTab === 'Cash Reconciliation'
                    ? 'Cash Reconciliation'
                    : activeTab === 'Invoices'
                    ? 'Invoices'
                    : activeTab === 'Payments'
                    ? 'Payments'
                    : 'Invoices & Payments'}
                </h1>
                {activeTab === 'Invoices' && (
                  <span className="bg-slate-100 text-slate-600 font-bold text-xs px-2.5 py-0.5 rounded-full">
                    86 Total
                  </span>
                )}
                {activeTab === 'Payments' && (
                  <span className="bg-slate-100 text-slate-600 font-bold text-xs px-2.5 py-0.5 rounded-full">
                    58 Entries
                  </span>
                )}
                {activeTab === 'Overview' && (
                  <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                    Live Sync Active
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                {activeTab === 'Cash Reconciliation'
                  ? 'Verify delivery partner cash handovers and investigate collection discrepancies.'
                  : activeTab === 'Invoices'
                  ? 'View and manage customer invoices, payment status, and outstanding balances.'
                  : activeTab === 'Payments'
                  ? 'Track customer payments, collection methods, invoice allocations, and customer credit balance.'
                  : 'Manage customer invoices, payment collections, outstanding balances, and customer advances with automated FIFO liquidation.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 shrink-0">
              {activeTab === 'Cash Reconciliation' ? (
                <button
                  type="button"
                  onClick={() => triggerToast('Exporting cash reconciliation report...')}
                  className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm px-4.5 py-2.5 rounded-xl shadow-2xs transition flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4 stroke-[2.2] text-slate-600" />
                  <span>Export Report</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      triggerToast(
                        activeTab === 'Payments'
                          ? 'Exporting payments registry...'
                          : 'Exporting invoices register...'
                      )
                    }
                    className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm px-4.5 py-2.5 rounded-xl shadow-2xs transition flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4 stroke-[2.2] text-slate-600" />
                    <span>{activeTab === 'Payments' ? 'Export Payments' : 'Export'}</span>
                  </button>

                  {activeTab === 'Invoices' ? (
                    <button
                      type="button"
                      onClick={() => setShowCreateInvoiceModal(true)}
                      className="bg-[#BC0118] hover:bg-red-800 active:scale-98 text-white font-bold text-xs sm:text-sm px-4.5 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                      <span>Create Invoice</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowRecordPaymentModal(true)}
                      className="bg-[#BC0118] hover:bg-red-800 active:scale-98 text-white font-bold text-xs sm:text-sm px-4.5 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4 stroke-[2.2]" />
                      <span>Record Payment</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs sm:text-sm font-bold border-b border-slate-200/80">
            {(['Overview', 'Invoices', 'Payments', 'Cash Reconciliation', 'Customer Ledger'] as const).map(
              (tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-[#FEE2E2] text-[#801317] font-black shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {tab}
                  </button>
                );
              }
            )}
          </div>

          {/* ========================================================= */}
          {/* TAB: PAYMENTS TAB (Exact matching attached Figma image)    */}
          {/* ========================================================= */}
          {activeTab === 'Payments' && (
            <div className="space-y-5">
              {/* Automatic FIFO Engine Active Banner */}
              <div className="bg-[#F0F5FF] rounded-2xl border border-blue-200/70 p-4 shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-200/80 text-slate-700 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4 fill-slate-700 text-slate-700" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs sm:text-sm font-black text-slate-900">
                        Automatic FIFO Engine Active
                      </h3>
                      <span className="bg-emerald-800 text-white text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded">
                        ENFORCED
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium mt-0.5 leading-relaxed">
                      Incoming payments strictly clear the oldest outstanding invoices first in chronological sequence. Admins and field delivery partners cannot manually override allocation order. Any surplus payment is automatically preserved and credited to Customer Advances for future billing.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => triggerToast('Opening FIFO Engine Audit Logic')}
                  className="text-xs font-bold text-[#BC0118] hover:underline flex items-center gap-1 shrink-0 self-end md:self-center cursor-pointer"
                >
                  <span>Audit Logic</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Payments Title & Reset Bar */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Payments</h2>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentSearchQuery('');
                      setPaymentMethodFilter('All Methods');
                      setPaymentPartnerFilter('All Delivery Partners');
                      setPaymentStatusFilter('All Statuses');
                      triggerToast('Payments filters reset');
                    }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Filters</span>
                  </button>
                </div>

                {/* Filter Controls Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
                  {/* Search input */}
                  <div className="lg:col-span-4 relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={paymentSearchQuery}
                      onChange={(e) => setPaymentSearchQuery(e.target.value)}
                      placeholder="Search payment ref, customer name or invoice..."
                      className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl pl-9.5 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    />
                  </div>

                  {/* Date range */}
                  <div className="lg:col-span-3">
                    <button
                      type="button"
                      onClick={() => triggerToast('Date range: Oct 01, 2026 - Oct 24, 2026')}
                      className="w-full bg-white border border-slate-200 hover:bg-slate-50 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-between gap-2 shadow-2xs cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>Oct 01, 2026 - Oct 24, 2026</span>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </div>

                  {/* Method dropdown */}
                  <div className="lg:col-span-2 relative">
                    <select
                      value={paymentMethodFilter}
                      onChange={(e) => setPaymentMethodFilter(e.target.value)}
                      className="w-full bg-white border border-slate-200 hover:bg-slate-50 pl-3.5 pr-8 py-2 rounded-xl text-xs font-semibold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer shadow-2xs"
                    >
                      <option value="All Methods">All Methods (Cash, UPI)</option>
                      <option value="Cash">Cash Only</option>
                      <option value="UPI">UPI Only</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* Partner dropdown */}
                  <div className="lg:col-span-2 relative">
                    <select
                      value={paymentPartnerFilter}
                      onChange={(e) => setPaymentPartnerFilter(e.target.value)}
                      className="w-full bg-white border border-slate-200 hover:bg-slate-50 pl-3.5 pr-8 py-2 rounded-xl text-xs font-semibold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer shadow-2xs"
                    >
                      <option value="All Delivery Partners">All Delivery Partners</option>
                      <option value="Rajesh">DP-001 Rajesh</option>
                      <option value="Mohamed">DP-002 Mohamed</option>
                      <option value="Suresh">DP-003 Suresh</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* Statuses dropdown */}
                  <div className="lg:col-span-1 relative">
                    <select
                      value={paymentStatusFilter}
                      onChange={(e) => setPaymentStatusFilter(e.target.value)}
                      className="w-full bg-white border border-slate-200 hover:bg-slate-50 pl-3 pr-7 py-2 rounded-xl text-xs font-semibold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer shadow-2xs"
                    >
                      <option value="All Statuses">All</option>
                      <option value="Verified">Verified</option>
                      <option value="Pending Verif.">Pending</option>
                      <option value="Not Applicable">N/A</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Main Content Split: Left Table + Right Flyout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* Left Table (Cols 8 when drawer open) */}
                <div className={`${inspectedPayment ? 'lg:col-span-8' : 'lg:col-span-12'} bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 transition-all space-y-4`}>
                  <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#EDF2F9] text-slate-500 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-200">
                          <th className="py-3 px-3 w-8">
                            <input
                              type="checkbox"
                              checked={selectedPaymentIds.length === initialPaymentsList.length}
                              onChange={toggleSelectAllPayments}
                              className="rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                            />
                          </th>
                          <th className="py-3 px-3">PAYMENT REF &amp; DATE</th>
                          <th className="py-3 px-3">CUSTOMER</th>
                          <th className="py-3 px-3 text-center">RELATED INVOICES</th>
                          <th className="py-3 px-3">DP / AGENT</th>
                          <th className="py-3 px-3 text-right">RECEIVED</th>
                          <th className="py-3 px-3 text-center">METHOD</th>
                          <th className="py-3 px-3 text-right">ALLOCATED</th>
                          <th className="py-3 px-3 text-right">ADVANCE</th>
                          <th className="py-3 px-3 text-center">VERIFICATION</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                        {filteredPayments.map((pay) => {
                          const isInspected = inspectedPayment?.id === pay.id;
                          const isChecked = selectedPaymentIds.includes(pay.id);

                          return (
                            <tr
                              key={pay.id}
                              onClick={() => setInspectedPayment(pay)}
                              className={`transition cursor-pointer ${
                                isInspected
                                  ? 'bg-red-50/40 hover:bg-red-50/60'
                                  : 'hover:bg-slate-50/80'
                              }`}
                            >
                              {/* Checkbox */}
                              <td className="py-3.5 px-3" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => toggleSelectPayment(pay.id, e as unknown as React.MouseEvent)}
                                  className="rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                                />
                              </td>

                              {/* Payment Ref & Date */}
                              <td className="py-3.5 px-3">
                                <div
                                  className={`font-black ${
                                    isInspected ? 'text-[#BC0118]' : 'text-slate-900'
                                  }`}
                                >
                                  {pay.paymentRef}
                                </div>
                                <div className="text-[10px] text-slate-400 mt-0.5 whitespace-nowrap">
                                  {pay.time}
                                </div>
                              </td>

                              {/* Customer */}
                              <td className="py-3.5 px-3">
                                <div className="font-extrabold text-slate-900 leading-tight">
                                  {pay.customerName}
                                </div>
                                <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                                  {pay.customerCode}
                                </div>
                              </td>

                              {/* Related Invoices */}
                              <td className="py-3.5 px-3 text-center whitespace-nowrap">
                                {pay.isSpecialRelated ? (
                                  <span className="inline-block bg-red-50 text-red-700 border border-red-100 font-extrabold text-[10px] px-2 py-0.5 rounded leading-tight">
                                    2<br />Cleared<br />+<br />Advance
                                  </span>
                                ) : (
                                  <span className="bg-blue-50 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-100/70">
                                    {pay.relatedInvoicesText}
                                  </span>
                                )}
                              </td>

                              {/* DP / Agent */}
                              <td className="py-3.5 px-3 whitespace-nowrap text-slate-700 font-semibold text-xs">
                                {pay.deliveryPartner}
                              </td>

                              {/* Received */}
                              <td className="py-3.5 px-3 text-right font-black text-slate-900 whitespace-nowrap">
                                ₹{pay.receivedAmount.toLocaleString()}
                              </td>

                              {/* Method */}
                              <td className="py-3.5 px-3 text-center whitespace-nowrap">
                                {pay.method === 'Cash' ? (
                                  <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-100/80 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                    <Banknote className="w-3 h-3" />
                                    <span>Cash</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-100/80 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                    <QrCode className="w-3 h-3" />
                                    <span>UPI</span>
                                  </span>
                                )}
                              </td>

                              {/* Allocated */}
                              <td className="py-3.5 px-3 text-right font-black whitespace-nowrap">
                                <span className={pay.isSpecialRelated ? 'text-emerald-700' : 'text-slate-900'}>
                                  ₹{pay.allocatedAmount.toLocaleString()}
                                </span>
                              </td>

                              {/* Advance */}
                              <td className="py-3.5 px-3 text-right font-black whitespace-nowrap">
                                {pay.advanceAmount > 0 ? (
                                  <span className="text-[#BC0118]">
                                    ₹{pay.advanceAmount.toLocaleString()}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 font-bold">₹0</span>
                                )}
                              </td>

                              {/* Verification */}
                              <td className="py-3.5 px-3 text-center whitespace-nowrap">
                                {pay.verification === 'Verified' && (
                                  <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[10px] px-2 py-0.5 rounded">
                                    Verified
                                  </span>
                                )}
                                {pay.verification === 'Pending Verif.' && (
                                  <span className="bg-amber-50 text-amber-700 border border-amber-200 font-extrabold text-[10px] px-2 py-0.5 rounded">
                                    Pending Verif.
                                  </span>
                                )}
                                {pay.verification === 'Not Applicable' && (
                                  <span className="bg-slate-100 text-slate-500 font-bold text-[10px] px-2 py-0.5 rounded">
                                    Not Applicable
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Footer */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 text-xs text-slate-500 font-medium">
                    <div className="flex items-center gap-3">
                      <span>
                        Showing <strong className="text-slate-900">1 to 6</strong> of <strong className="text-slate-900">58</strong> payments
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-400">Rows per page:</span>
                        <span className="bg-slate-100 font-extrabold text-slate-800 px-2 py-0.5 rounded-md">
                          10
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => triggerToast('Page 1 active')}
                        className="w-7 h-7 bg-white border border-slate-200 text-slate-600 rounded-lg font-bold flex items-center justify-center hover:bg-slate-50 cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        className="w-7 h-7 bg-[#BC0118] text-white rounded-lg font-black flex items-center justify-center cursor-pointer shadow-2xs"
                      >
                        1
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerToast('Navigating to page 2')}
                        className="w-7 h-7 bg-white border border-slate-200 text-slate-600 rounded-lg font-bold flex items-center justify-center hover:bg-slate-50 cursor-pointer"
                      >
                        2
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerToast('Navigating to page 3')}
                        className="w-7 h-7 bg-white border border-slate-200 text-slate-600 rounded-lg font-bold flex items-center justify-center hover:bg-slate-50 cursor-pointer"
                      >
                        3
                      </button>
                      <span className="px-1 text-slate-400">..</span>
                      <button
                        type="button"
                        onClick={() => triggerToast('Navigating to page 6')}
                        className="w-7 h-7 bg-white border border-slate-200 text-slate-600 rounded-lg font-bold flex items-center justify-center hover:bg-slate-50 cursor-pointer"
                      >
                        6
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerToast('Navigating to next page')}
                        className="w-7 h-7 bg-white border border-slate-200 text-slate-600 rounded-lg font-bold flex items-center justify-center hover:bg-slate-50 cursor-pointer"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Flyout / Inspection Card (Cols 4) */}
                {inspectedPayment && (
                  <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4 animate-in fade-in duration-150">
                    {/* Top Title & Close Button */}
                    <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                            {inspectedPayment.paymentRef}
                          </h3>
                          <span className="bg-emerald-50 text-emerald-700 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            Verified Cash
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                          Recorded on {inspectedPayment.time} by Driver Terminal ({inspectedPayment.deliveryPartner})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setInspectedPayment(null)}
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                        title="Close Inspector"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Customer Box */}
                    <div className="bg-[#F8FAFC] rounded-xl p-3.5 border border-slate-200/70 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 font-black text-xs flex items-center justify-center">
                            PS
                          </div>
                          <div>
                            <span className="font-black text-sm text-slate-900 block leading-tight">
                              {inspectedPayment.customerName}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">
                              {inspectedPayment.customerCode}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => triggerToast(`Opening customer details for ${inspectedPayment.customerName}`)}
                          className="text-[#BC0118] hover:text-red-800 transition cursor-pointer"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Contact & Depot Route */}
                      <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                        <div className="bg-white rounded-lg p-2 border border-slate-200/80">
                          <span className="text-[10px] text-slate-400 font-semibold block">Contact Phone</span>
                          <span className="font-bold text-slate-900 text-[11px] block mt-0.5">
                            {inspectedPayment.phone ?? '+91 98945 12345'}
                          </span>
                        </div>
                        <div className="bg-white rounded-lg p-2 border border-slate-200/80">
                          <span className="text-[10px] text-slate-400 font-semibold block">Depot Route</span>
                          <span className="font-bold text-slate-900 text-[11px] block mt-0.5">
                            {inspectedPayment.route ?? 'Bypass Rd, Madurai'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Financial Summary Box */}
                    <div className="bg-[#F8FAFC] rounded-xl p-3.5 border border-slate-200/70 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 font-bold">Total Received</span>
                        <span className="text-lg font-black text-slate-900">
                          ₹{inspectedPayment.receivedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-600 font-semibold text-[11px]">
                        <span>Payment Method</span>
                        <span className="text-slate-800 font-bold flex items-center gap-1">
                          <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Cash (Depot Verified)</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                        <span>Invoices Settled</span>
                        <span className="text-emerald-700 font-black">
                          ₹{inspectedPayment.allocatedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[11px] font-bold">
                        <span className="text-slate-700">Surplus Credited to Advance</span>
                        <span className="text-[#BC0118] font-black">
                          ₹{inspectedPayment.advanceAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    {/* Section: Chronological FIFO Allocation */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                          CHRONOLOGICAL FIFO ALLOCATION
                        </span>
                        <span className="text-[10px] font-extrabold text-emerald-700 flex items-center gap-1">
                          <RefreshCw className="w-3 h-3 text-emerald-600" />
                          <span>Automated</span>
                        </span>
                      </div>

                      {/* Timeline Steps */}
                      <div className="relative pl-5 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                        {inspectedPayment.fifoSteps?.map((step, idx) => (
                          <div key={idx} className="relative">
                            {/* Dot on line */}
                            <span
                              className={`absolute -left-5 top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-white ${
                                step.isSurplus ? 'bg-[#BC0118]' : 'bg-emerald-500'
                              }`}
                            ></span>

                            <div className="bg-[#F8FAFC] rounded-xl p-2.5 border border-slate-200/80 space-y-1">
                              <div className="flex items-center justify-between text-xs font-black">
                                <span className="text-slate-900">{step.title}</span>
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                                      step.statusBadge === 'Credited'
                                        ? 'bg-red-50 text-[#BC0118] border border-red-100'
                                        : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                    }`}
                                  >
                                    {step.statusBadge}
                                  </span>
                                  <span
                                    className={`font-black ${
                                      step.isSurplus ? 'text-[#BC0118]' : 'text-slate-900'
                                    }`}
                                  >
                                    ₹{step.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                  </span>
                                </div>
                              </div>
                              <div className="text-[10px] text-slate-400 font-semibold">
                                {step.invoiceNo}
                              </div>
                              <p className="text-[10px] text-slate-600 font-medium leading-tight">
                                {step.note}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Section: Settlement & Audit Trail */}
                    <div className="space-y-2">
                      <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span>SETTLEMENT &amp; AUDIT TRAIL</span>
                      </div>

                      <div className="bg-[#F8FAFC] rounded-xl p-3 border border-slate-200/80 space-y-2 text-[11px]">
                        {inspectedPayment.auditTrail?.map((trail, idx) => (
                          <div key={idx} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="text-slate-600 font-medium leading-tight">{trail}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => triggerToast(`Downloading receipt for ${inspectedPayment.paymentRef}...`)}
                        className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs py-2.5 rounded-xl shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <FileDown className="w-3.5 h-3.5 text-slate-600" />
                        <span>Download Receipt</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerToast(`Navigating to ledger for ${inspectedPayment.customerName}`)}
                        className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs py-2.5 rounded-xl shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-slate-600" />
                        <span>View Ledger</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: INVOICES TAB                                          */}
          {/* ========================================================= */}
          {activeTab === 'Invoices' && (
            <div className="space-y-5">
              {/* Summary Banner Card */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 block">
                      Total Outstanding Balance
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      ₹1,85,000.00
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-medium text-slate-500 flex-wrap">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-4 h-4 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-[10px]">
                      !
                    </span>
                    <span>
                      Pending across <strong className="text-slate-800">32</strong> active customer accounts
                    </span>
                  </div>
                  <span className="text-slate-300 hidden sm:inline">|</span>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Customer advances segregated via FIFO pool</span>
                  </div>
                </div>
              </div>

              {/* Filters & Search Bar */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-wrap">
                  <div className="relative min-w-[240px] flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search invoice number, customer name or customer ID..."
                      className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl pl-9.5 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    />
                  </div>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => triggerToast('Date range: Oct 01, 2026 - Oct 24, 2026')}
                      className="w-full sm:w-auto bg-white border border-slate-200 hover:bg-slate-50 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-between gap-2 shadow-2xs cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>Oct 01, 2026 - Oct 24, 2026</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </div>

                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full sm:w-auto bg-white border border-slate-200 hover:bg-slate-50 pl-3.5 pr-8 py-2 rounded-xl text-xs font-semibold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer shadow-2xs"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Paid">Paid</option>
                      <option value="Partially Paid">Partially Paid</option>
                      <option value="Unpaid">Unpaid</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  <div className="relative">
                    <select
                      value={partnerFilter}
                      onChange={(e) => setPartnerFilter(e.target.value)}
                      className="w-full sm:w-auto bg-white border border-slate-200 hover:bg-slate-50 pl-3.5 pr-8 py-2 rounded-xl text-xs font-semibold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer shadow-2xs"
                    >
                      <option value="All Delivery Partners">All Delivery Partners</option>
                      <option value="Rajesh">DP-001 Rajesh</option>
                      <option value="Mohamed">DP-002 Mohamed</option>
                      <option value="Suresh">DP-003 Suresh</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  <div className="relative">
                    <select
                      value={customerFilter}
                      onChange={(e) => setCustomerFilter(e.target.value)}
                      className="w-full sm:w-auto bg-white border border-slate-200 hover:bg-slate-50 pl-3.5 pr-8 py-2 rounded-xl text-xs font-semibold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer shadow-2xs"
                    >
                      <option value="All Customers">All Customers</option>
                      <option value="Commercial">Commercial Only</option>
                      <option value="Domestic">Domestic Only</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('All');
                      setPartnerFilter('All Delivery Partners');
                      setCustomerFilter('All Customers');
                      triggerToast('Filters reset to default');
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                  <span className="text-xs font-extrabold text-slate-800">All Customers</span>
                </div>
              </div>

              {/* Main Content Split: Left Table + Right Flyout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                <div className={`${inspectedInvoice ? 'lg:col-span-8' : 'lg:col-span-12'} bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 transition-all space-y-4`}>
                  <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#EDF2F9] text-slate-500 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-200">
                          <th className="py-3 px-3 w-8">
                            <input
                              type="checkbox"
                              checked={selectedInvoiceIds.length === detailedInvoicesList.length}
                              onChange={toggleSelectAllInvoices}
                              className="rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                            />
                          </th>
                          <th className="py-3 px-3">Invoice Number</th>
                          <th className="py-3 px-3">Date</th>
                          <th className="py-3 px-3">Customer</th>
                          <th className="py-3 px-3">Delivery Partner</th>
                          <th className="py-3 px-3">Cylinders</th>
                          <th className="py-3 px-3 text-right">Inv Amount</th>
                          <th className="py-3 px-3 text-right">Paid</th>
                          <th className="py-3 px-3 text-right">Balance Due</th>
                          <th className="py-3 px-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                        {filteredInvoices.map((inv) => {
                          const isInspected = inspectedInvoice?.id === inv.id;
                          const isChecked = selectedInvoiceIds.includes(inv.id);

                          return (
                            <tr
                              key={inv.id}
                              onClick={() => setInspectedInvoice(inv)}
                              className={`transition cursor-pointer ${
                                isInspected
                                  ? 'bg-red-50/40 hover:bg-red-50/60'
                                  : 'hover:bg-slate-50/80'
                              }`}
                            >
                              <td className="py-3.5 px-3" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => toggleSelectInvoice(inv.id, e as unknown as React.MouseEvent)}
                                  className="rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                                />
                              </td>
                              <td className="py-3.5 px-3">
                                <span className={`font-black ${isInspected ? 'text-[#BC0118]' : 'text-slate-900'}`}>
                                  {inv.invoiceNo}
                                </span>
                              </td>
                              <td className="py-3.5 px-3 text-slate-600 font-semibold whitespace-nowrap">
                                {inv.date}
                              </td>
                              <td className="py-3.5 px-3">
                                <div className="font-extrabold text-slate-900 leading-tight">
                                  {inv.customerName}
                                </div>
                                <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                                  {inv.customerCode}
                                </div>
                              </td>
                              <td className="py-3.5 px-3 whitespace-nowrap">
                                <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs">
                                  <Truck className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{inv.deliveryPartnerName}</span>
                                </div>
                              </td>
                              <td className="py-3.5 px-3">
                                <div className="flex flex-wrap gap-1">
                                  {inv.cylinders.map((cyl, idx) => (
                                    <span
                                      key={idx}
                                      className="bg-blue-50/90 text-blue-900 text-[11px] font-bold px-2 py-0.5 rounded-md border border-blue-100"
                                    >
                                      {cyl}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="py-3.5 px-3 text-right font-black text-slate-900 whitespace-nowrap">
                                ₹{inv.invoiceAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="py-3.5 px-3 text-right font-black whitespace-nowrap">
                                {inv.paidAmount > 0 ? (
                                  <span className="text-emerald-700">
                                    ₹{inv.paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                  </span>
                                ) : (
                                  <span className="text-slate-500 font-bold">₹0.00</span>
                                )}
                              </td>
                              <td className="py-3.5 px-3 text-right font-black whitespace-nowrap">
                                {inv.balanceDue > 0 ? (
                                  <span className="text-[#BC0118]">
                                    ₹{inv.balanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 font-bold">₹0.00</span>
                                )}
                              </td>
                              <td className="py-3.5 px-3 text-center whitespace-nowrap">
                                {inv.status === 'Paid' && (
                                  <span className="bg-emerald-50 text-emerald-700 font-bold text-[10px] px-2 py-0.5 rounded-md border border-emerald-100">
                                    Paid
                                  </span>
                                )}
                                {inv.status === 'Partially Paid' && (
                                  <span className="bg-blue-50 text-blue-700 font-bold text-[10px] px-2 py-0.5 rounded-md border border-blue-100">
                                    Partially Paid
                                  </span>
                                )}
                                {inv.status === 'Unpaid' && (
                                  <span className="bg-red-50 text-red-700 font-bold text-[10px] px-2 py-0.5 rounded-md border border-red-100">
                                    Unpaid
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Footer */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 text-xs text-slate-500 font-medium">
                    <div className="flex items-center gap-3">
                      <span>
                        Showing <strong className="text-slate-900">1 to 6</strong> of <strong className="text-slate-900">86</strong> invoices
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-400">Rows per page:</span>
                        <span className="bg-slate-100 font-extrabold text-slate-800 px-2 py-0.5 rounded-md">
                          10
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => triggerToast('Page 1 active')}
                        className="w-7 h-7 bg-white border border-slate-200 text-slate-600 rounded-lg font-bold flex items-center justify-center hover:bg-slate-50 cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        className="w-7 h-7 bg-[#BC0118] text-white rounded-lg font-black flex items-center justify-center cursor-pointer shadow-2xs"
                      >
                        1
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerToast('Navigating to page 2')}
                        className="w-7 h-7 bg-white border border-slate-200 text-slate-600 rounded-lg font-bold flex items-center justify-center hover:bg-slate-50 cursor-pointer"
                      >
                        2
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerToast('Navigating to page 3')}
                        className="w-7 h-7 bg-white border border-slate-200 text-slate-600 rounded-lg font-bold flex items-center justify-center hover:bg-slate-50 cursor-pointer"
                      >
                        3
                      </button>
                      <span className="px-1 text-slate-400">..</span>
                      <button
                        type="button"
                        onClick={() => triggerToast('Navigating to page 9')}
                        className="w-7 h-7 bg-white border border-slate-200 text-slate-600 rounded-lg font-bold flex items-center justify-center hover:bg-slate-50 cursor-pointer"
                      >
                        9
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerToast('Navigating to next page')}
                        className="w-7 h-7 bg-white border border-slate-200 text-slate-600 rounded-lg font-bold flex items-center justify-center hover:bg-slate-50 cursor-pointer"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Flyout / Inspection Card (Cols 4) */}
                {inspectedInvoice && (
                  <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4 animate-in fade-in duration-150">
                    <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                            {inspectedInvoice.invoiceNo}
                          </h3>
                          <span className="bg-blue-50 text-blue-700 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-blue-100">
                            {inspectedInvoice.status}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                          Created on {inspectedInvoice.time}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setInspectedInvoice(null)}
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                        title="Close Inspector"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                        CUSTOMER INFORMATION
                      </div>
                      <div className="bg-[#F8FAFC] rounded-xl p-3.5 border border-slate-200/70 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-sm text-slate-900">
                            {inspectedInvoice.customerName}
                          </span>
                          <button
                            type="button"
                            onClick={() => triggerToast(`Opening ledger for ${inspectedInvoice.customerName}`)}
                            className="text-[11px] font-bold text-[#BC0118] hover:underline flex items-center gap-0.5 cursor-pointer"
                          >
                            <span>Ledger</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {inspectedInvoice.customerCode} · Commercial Catering
                        </div>
                        <div className="space-y-1 pt-1 text-xs text-slate-600 font-medium">
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{inspectedInvoice.phone ?? '+91 98421 56789'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{inspectedInvoice.address ?? '14/2, KK Nagar 4th Street, Madurai'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="bg-[#F8FAFC] rounded-xl p-2.5 border border-slate-200/70">
                          <span className="text-[10px] text-slate-400 font-bold block">Assigned Partner</span>
                          <span className="text-xs font-black text-slate-900 block mt-0.5">
                            {inspectedInvoice.deliveryPartnerName === 'DP-003 Suresh'
                              ? 'Suresh Babu (DP-003)'
                              : inspectedInvoice.deliveryPartnerName}
                          </span>
                        </div>
                        <div className="bg-[#F8FAFC] rounded-xl p-2.5 border border-slate-200/70">
                          <span className="text-[10px] text-slate-400 font-bold block">Delivery Pass</span>
                          <span className="text-xs font-black text-slate-900 block mt-0.5">
                            {inspectedInvoice.deliveryPass ?? '#DEL-20261015-88'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                        CYLINDER DISPATCH BREAKDOWN
                      </div>
                      <div className="bg-[#F8FAFC] rounded-xl p-3 border border-slate-200/70 space-y-2">
                        <div className="flex items-center justify-between text-xs font-black text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#BC0118]"></span>
                            <span>{inspectedInvoice.cylinders[0] ?? '5x 19kg'} Commercial LPG</span>
                          </div>
                          <span>₹{inspectedInvoice.invoiceAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                          <span>{inspectedInvoice.unitRate ?? 'Unit Rate: 5 @ ₹240.00 / cylinder refill'}</span>
                          <span>Tax: ₹0.00 (Exempt)</span>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-200/80 rounded-lg p-2 flex items-center gap-1.5 text-xs font-bold text-emerald-800 mt-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{inspectedInvoice.emptyCollected ?? 5} Empty Cylinders Collected &amp; Logged</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                        PAYMENT SUMMARY
                      </div>
                      <div className="bg-[#F8FAFC] rounded-xl p-3 border border-slate-200/70 space-y-1.5 text-xs font-bold">
                        <div className="flex items-center justify-between text-slate-600">
                          <span>Gross Invoice Amount:</span>
                          <span className="text-slate-900 font-black">
                            ₹{inspectedInvoice.invoiceAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600">
                          <span>Total Amount Paid:</span>
                          <span className="text-emerald-700 font-black">
                            - ₹{inspectedInvoice.paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-1.5 border-t border-slate-200">
                          <span className="text-slate-900 font-black">Outstanding Balance:</span>
                          <span className="text-base font-black text-[#BC0118]">
                            ₹{inspectedInvoice.balanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                          FIFO ALLOCATION HISTORY
                        </span>
                        <span className="text-[10px] font-extrabold text-[#BC0118]">
                          Automated Engine
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="bg-[#F0FDF4] rounded-xl p-2.5 border border-emerald-200/80 space-y-1">
                          <div className="flex items-center justify-between text-xs font-extrabold">
                            <span className="flex items-center gap-1.5 text-emerald-800">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Auto-allocated ₹500.00
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">15 Oct, 11:35 AM</span>
                          </div>
                          <p className="text-[10px] text-slate-600 font-medium pl-5 leading-tight">
                            Settled via Customer UPI (#PAY-9921). Oldest pending invoice prioritized.
                          </p>
                        </div>

                        <div className="bg-[#F8FAFC] rounded-xl p-2.5 border border-slate-200 space-y-1">
                          <div className="flex items-center justify-between text-xs font-extrabold">
                            <span className="flex items-center gap-1.5 text-slate-700">
                              <Hourglass className="w-3.5 h-3.5 text-slate-500" />
                              ₹700.00 Awaiting Collection
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">Due Next Cycle</span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-medium pl-5 leading-tight">
                            Assigned to next settlement batch for DP-003 Suresh Babu.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <button
                        type="button"
                        onClick={() => triggerToast(`Downloading PDF for ${inspectedInvoice.invoiceNo}...`)}
                        className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-extrabold text-xs py-2.5 rounded-xl shadow-2xs transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <FileDown className="w-4 h-4 text-slate-600" />
                        <span>Download PDF Invoice</span>
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => triggerToast(`Navigating to customer ledger for ${inspectedInvoice.customerName}`)}
                          className="bg-[#F1F4FA] hover:bg-slate-200 text-slate-800 font-bold text-xs py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-slate-600" />
                          <span>Customer Ledger</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => triggerToast(`Opening payment history for ${inspectedInvoice.customerName}`)}
                          className="bg-[#F1F4FA] hover:bg-slate-200 text-slate-800 font-bold text-xs py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <History className="w-3.5 h-3.5 text-slate-600" />
                          <span>Payment History</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: OVERVIEW TAB                                          */}
          {/* ========================================================= */}
          {activeTab === 'Overview' && (
            <div className="space-y-6">
              {/* 4 Metric KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                        INVOICES TODAY
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                        <Receipt className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-3xl font-black text-slate-900 mt-2">24</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">
                      Invoices created today
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xs">
                    <span className="text-slate-600 font-bold">Total: 48 Cylinders</span>
                    <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md flex items-center gap-1 text-[11px]">
                      <span>↑</span> +3 vs yesterday
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                        COLLECTED TODAY
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                        <Wallet className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-3xl font-black text-slate-900 mt-2">₹42,500</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">
                      Payments received today
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-4 mt-4 border-t border-slate-100 text-[11px] font-bold">
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md">• ₹28,000 Cash</span>
                    <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded-md">• ₹14,500 UPI</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                        OUTSTANDING RECEIVABLES
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                        <Clock className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-3xl font-black text-slate-900 mt-2">₹1,85,000</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">
                      Pending across 42 accounts
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xs">
                    <span className="text-slate-600 font-bold">16 Overdue</span>
                    <span className="bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded-md flex items-center gap-1 text-[11px]">
                      <AlertTriangle className="w-3 h-3 text-red-600" />
                      <span>₹58,200 &gt; 7 days</span>
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                        CUSTOMER ADVANCES
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <CreditCard className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-3xl font-black text-[#10B981] mt-2">₹12,500</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">
                      Available customer credit pool
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xs">
                    <span className="text-slate-600 font-bold">Auto-FIFO Ready</span>
                    <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md text-[11px]">
                      • 8 active credits
                    </span>
                  </div>
                </div>
              </div>

              {/* FIFO Allocation Engine Banner */}
              <div className="bg-[#F0F5FF] rounded-[24px] p-6 border border-blue-200/60 shadow-2xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#BC0118] text-white flex items-center justify-center shrink-0 shadow-xs font-black">
                      <Zap className="w-5 h-5 fill-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                          Automatic FIFO Payment Allocation Engine
                        </h2>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                          ACTIVE RULE
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed max-w-3xl">
                        <strong className="text-slate-900">Rule Enforced:</strong> Incoming customer payments automatically liquidate oldest outstanding invoices chronologically before settling newer bills. Excess funds credit to Customer Advance ledger.
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 text-xs font-bold px-3 py-1.5 rounded-full border border-red-100 shadow-2xs">
                      <Sparkles className="w-3.5 h-3.5 text-red-600" />
                      <span>Admin &amp; DP can override FIFO priority</span>
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-blue-100 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-800 text-white font-black text-xs flex items-center justify-center shrink-0">
                        SKS
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-extrabold text-slate-900">Sri Krishna Sweets</span>
                          <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded">
                            CUS-00366
                          </span>
                          <span className="bg-red-50 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded border border-red-100">
                            Commercial
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium block">
                          Simulated real-time automated breakdown of incoming lump-sum collection
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        RECEIVED PAYMENT
                      </span>
                      <span className="text-base sm:text-lg font-black text-[#BC0118]">
                        ₹4,000
                      </span>
                      <span className="bg-slate-100 text-slate-600 text-[10px] font-extrabold px-2 py-0.5 rounded">
                        PAY-558802
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    <div className="bg-[#F8FAFC] rounded-xl p-3.5 border border-slate-200/80 flex flex-col justify-between space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                          STEP 1: OLDEST
                        </span>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                          Fully Paid
                        </span>
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900">INV-20261019-050</div>
                        <div className="text-[11px] text-slate-400 font-medium mt-0.5">Date: Oct 19 · Bill: ₹1,500</div>
                      </div>
                      <div className="bg-[#EBF2FF] rounded-lg p-2.5 flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-600">Allocated</span>
                        <span className="text-emerald-700 font-extrabold text-sm">₹1,500</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 pt-1">
                        <span>Remaining pool</span>
                        <span className="text-slate-700 font-extrabold">₹2,500</span>
                      </div>
                    </div>

                    <div className="bg-[#F8FAFC] rounded-xl p-3.5 border border-slate-200/80 flex flex-col justify-between space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                          STEP 2: INTERMEDIATE
                        </span>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                          Fully Paid
                        </span>
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900">INV-20261021-065</div>
                        <div className="text-[11px] text-slate-400 font-medium mt-0.5">Date: Oct 21 · Bill: ₹2,200</div>
                      </div>
                      <div className="bg-[#EBF2FF] rounded-lg p-2.5 flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-600">Allocated</span>
                        <span className="text-emerald-700 font-extrabold text-sm">₹2,200</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 pt-1">
                        <span>Remaining pool</span>
                        <span className="text-slate-700 font-extrabold">₹300</span>
                      </div>
                    </div>

                    <div className="bg-[#F8FAFC] rounded-xl p-3.5 border border-slate-200/80 flex flex-col justify-between space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                          STEP 3: CURRENT
                        </span>
                        <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                          <Zap className="w-3 h-3 text-blue-700 fill-blue-700" />
                          Partial
                        </span>
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900">INV-20261024-091</div>
                        <div className="text-[11px] text-slate-400 font-medium mt-0.5">Date: Oct 24 · Bill: ₹1,100</div>
                      </div>
                      <div className="bg-[#EBF2FF] rounded-lg p-2.5 flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-600">Allocated</span>
                        <span className="text-slate-900 font-extrabold text-sm">₹300</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 pt-1">
                        <span className="text-red-600">Remaining Due</span>
                        <span className="text-red-600 font-black">₹800</span>
                      </div>
                    </div>

                    <div className="bg-[#F8FAFC] rounded-xl p-3.5 border border-slate-200/80 flex flex-col justify-between space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                          STEP 4: EXCESS
                        </span>
                        <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded">
                          Exhausted
                        </span>
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900">Customer Advance</div>
                        <div className="text-[11px] text-slate-400 font-medium mt-0.5">No overpayment surplus</div>
                      </div>
                      <div className="bg-[#EBF2FF] rounded-lg p-2.5 flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-600">Credit Added</span>
                        <span className="text-slate-900 font-extrabold text-sm">₹0</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 pt-1">
                        <span>Advance Balance</span>
                        <span className="text-slate-700 font-extrabold">₹0.00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Overview Invoices Table Section */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                      Invoices &amp; Delivery Collections
                    </h2>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      Comprehensive billing register with itemized cylinder volume and payment settlement status
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => triggerToast('Date filter: Today (Oct 24, 2026)')}
                      className="bg-[#F1F4FA] hover:bg-slate-200 text-slate-800 font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>Today : Oct 24, 2026</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerToast('Filters: 3 active')}
                      className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Filter className="w-3.5 h-3.5 text-slate-500" />
                      <span>Filters (3 Active)</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#EDF2F9] text-slate-500 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-200">
                        <th className="py-3 px-4">INVOICE DETAILS</th>
                        <th className="py-3 px-4">CUSTOMER &amp; CATEGORY</th>
                        <th className="py-3 px-4">DELIVERY PARTNER</th>
                        <th className="py-3 px-4">CYLINDERS</th>
                        <th className="py-3 px-4">INVOICE AMT</th>
                        <th className="py-3 px-4">PAID</th>
                        <th className="py-3 px-4">BALANCE DUE</th>
                        <th className="py-3 px-4">PAYMENT STATUS</th>
                        <th className="py-3 px-4 text-center">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                      {overviewInvoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4">
                            <div className="font-extrabold text-slate-900">{inv.invoiceNo}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{inv.time}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-extrabold text-slate-900">{inv.customerName}</div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[11px] text-slate-400">{inv.customerCode}</span>
                              <span
                                className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ${
                                  inv.category === 'Commercial' || inv.category === 'Bulk Commercial'
                                    ? 'bg-red-50 text-red-700 border border-red-100'
                                    : 'bg-blue-50 text-blue-700'
                                }`}
                              >
                                {inv.category}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{inv.deliveryPartnerName}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {inv.deliveryPartnerCode} · {inv.vehicle}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {inv.cylinders.map((cyl, idx) => (
                              <div key={idx} className="text-slate-700 font-medium text-xs leading-snug">
                                {cyl}
                              </div>
                            ))}
                          </td>
                          <td className="py-3 px-4 font-black text-slate-900">₹{inv.invoiceAmount.toLocaleString()}</td>
                          <td className="py-3 px-4 font-black text-emerald-700">₹{inv.paidAmount.toLocaleString()}</td>
                          <td className="py-3 px-4">
                            {inv.balanceDue > 0 ? (
                              <span className="font-black text-red-600">₹{inv.balanceDue.toLocaleString()}</span>
                            ) : (
                              <span className="text-slate-400 font-bold">₹0</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {inv.status === 'Paid' && (
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-extrabold text-[11px] px-2.5 py-1 rounded-full border border-emerald-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Paid
                              </span>
                            )}
                            {inv.status === 'Partially Paid' && (
                              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 font-extrabold text-[11px] px-2.5 py-1 rounded-full border border-blue-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                Partially Paid
                              </span>
                            )}
                            {inv.status === 'Unpaid' && (
                              <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 font-extrabold text-[11px] px-2.5 py-1 rounded-full border border-red-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                Unpaid
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="inline-flex items-center gap-2 text-slate-500">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveTab('Invoices');
                                  setInspectedInvoice(inv);
                                }}
                                className="p-1 hover:text-slate-900 hover:bg-slate-100 rounded transition cursor-pointer"
                                title="Inspect Invoice"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => triggerToast(`Printing ${inv.invoiceNo}...`)}
                                className="p-1 hover:text-slate-900 hover:bg-slate-100 rounded transition cursor-pointer"
                                title="Print / Download Receipt"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom Split: Left Box & Right Boxes */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                        Partner Cash Reconciliation
                      </h2>
                      <span className="bg-slate-100 text-slate-600 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                        Depot Shift-End
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => triggerToast('Reconciliation status refreshed')}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3 pt-1">
                    <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 font-black text-xs flex items-center justify-center shrink-0">
                          DP1
                        </div>
                        <div>
                          <div className="font-black text-slate-900 text-sm">Rajesh Kumar</div>
                          <div className="text-[11px] text-slate-400 font-medium mt-0.5">ID: DP-001 · 12 Cash Deliveries</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <div className="text-center sm:text-right">
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Reported</div>
                          <div className="font-extrabold text-slate-800">₹16,500</div>
                        </div>
                        <div className="text-center sm:text-right">
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Counted</div>
                          <div className="font-extrabold text-slate-900">₹16,500</div>
                        </div>
                        <div className="text-center sm:text-right">
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Diff</div>
                          <div className="font-extrabold text-emerald-700">₹0</div>
                        </div>
                        <span className="bg-emerald-100 text-emerald-800 font-extrabold text-xs px-3 py-1 rounded-lg flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          Verified
                        </span>
                      </div>
                    </div>

                    <div className="bg-[#FFF8F8] rounded-2xl p-4 border border-red-200/90 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-100 text-red-800 font-black text-xs flex items-center justify-center shrink-0">
                          DP3
                        </div>
                        <div>
                          <div className="font-black text-slate-900 text-sm">Suresh Babu</div>
                          <div className="text-[11px] text-slate-400 font-medium mt-0.5">ID: DP-003 · 14 Cash Deliveries</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3.5 text-xs">
                        <div className="text-center sm:text-right">
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Reported</div>
                          <div className="font-extrabold text-slate-800">₹18,500</div>
                        </div>
                        <div className="text-center sm:text-right">
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Counted</div>
                          <div className="font-extrabold text-slate-900">₹16,500</div>
                        </div>
                        <div className="text-center sm:text-right">
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Diff</div>
                          <div className="font-black text-red-600">-₹2,000</div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setShowInvestigateModal(true)}
                            className="bg-[#BC0118] hover:bg-red-800 text-white font-bold text-xs px-3 py-1 rounded-lg transition cursor-pointer shadow-2xs"
                          >
                            Investigate
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-5">
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-extrabold text-slate-900">Payment Methods Today</h3>
                      <span className="text-xs font-black text-[#BC0118]">Total: ₹42,500</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-700">Cash Collections (66%)</span>
                        <span className="text-slate-900 font-black">₹28,000</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex">
                        <div className="h-full bg-slate-800" style={{ width: '66%' }}></div>
                        <div className="h-full bg-[#E81B24]" style={{ width: '34%' }}></div>
                      </div>
                      <div className="flex items-center justify-between text-xs font-bold pt-1">
                        <span className="text-slate-700">UPI / Digital QR (34%)</span>
                        <span className="text-slate-900 font-black">₹14,500</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900">Customer Advances Pool</h3>
                        <p className="text-[11px] text-slate-400 font-medium">₹12,500 available across 8 accounts</p>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-md">
                        Auto-Apply
                      </span>
                    </div>
                    <div className="space-y-2.5 divide-y divide-slate-100 pt-1">
                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <div className="text-xs font-bold text-slate-900">Priya Enterprises</div>
                          <div className="text-[10px] text-slate-400 font-medium">CUS-00128 · Advance Deposit</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-black text-emerald-600">₹4,200</div>
                          <div className="text-[10px] text-slate-400 font-medium">Next bill priority</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <div>
                          <div className="text-xs font-bold text-slate-900">Madurai Mess</div>
                          <div className="text-[10px] text-slate-400 font-medium">CUS-00234 · Overpayment</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-black text-emerald-600">₹3,500</div>
                          <div className="text-[10px] text-slate-400 font-medium">Next bill priority</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: CASH RECONCILIATION TAB                               */}
          {/* ========================================================= */}
          {activeTab === 'Cash Reconciliation' && (
            <div className="space-y-5">
              {/* Filter Controls Bar */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3.5 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-wrap">
                  {/* Search input */}
                  <div className="relative min-w-[280px] flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={cashSearchQuery}
                      onChange={(e) => setCashSearchQuery(e.target.value)}
                      placeholder="Search reconciliation ID or partner name..."
                      className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl pl-9.5 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    />
                  </div>

                  {/* Date range */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => triggerToast('Date range: Oct 01, 2026 - Oct 24, 2026')}
                      className="w-full sm:w-auto bg-white border border-slate-200 hover:bg-slate-50 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-between gap-2 shadow-2xs cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Oct 01, 2026 - Oct 24, 2026</span>
                      </div>
                    </button>
                  </div>

                  {/* Partner dropdown */}
                  <div className="relative">
                    <select
                      value={cashPartnerFilter}
                      onChange={(e) => setCashPartnerFilter(e.target.value)}
                      className="w-full sm:w-auto bg-white border border-slate-200 hover:bg-slate-50 pl-3.5 pr-8 py-2 rounded-xl text-xs font-semibold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer shadow-2xs"
                    >
                      <option value="All Delivery Partners">All Delivery Partners</option>
                      <option value="Rajesh">Rajesh Kumar (DP-001)</option>
                      <option value="Mohamed">Mohamed Irfan (DP-002)</option>
                      <option value="Suresh">Suresh Babu (DP-003)</option>
                      <option value="Ravi">Ravi Shanker (DP-004)</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* Statuses dropdown */}
                  <div className="relative">
                    <select
                      value={cashStatusFilter}
                      onChange={(e) => setCashStatusFilter(e.target.value)}
                      className="w-full sm:w-auto bg-white border border-slate-200 hover:bg-slate-50 pl-3.5 pr-8 py-2 rounded-xl text-xs font-semibold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer shadow-2xs"
                    >
                      <option value="All Statuses">All Statuses</option>
                      <option value="Pending Verification">Pending Verification</option>
                      <option value="Verified">Verified</option>
                      <option value="Discrepancy Found">Discrepancy Found</option>
                      <option value="Under Investigation">Under Investigation</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Reset Filters button */}
                <div className="flex items-center gap-2 shrink-0 self-end lg:self-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setCashSearchQuery('');
                      setCashPartnerFilter('All Delivery Partners');
                      setCashStatusFilter('All Statuses');
                      triggerToast('Reconciliation filters reset');
                    }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition cursor-pointer px-2 py-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Filters</span>
                  </button>
                </div>
              </div>

              {/* Main Content Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* Left: Table Container */}
                <div className={`${inspectedCashRecord ? 'lg:col-span-8' : 'lg:col-span-12'} bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 transition-all space-y-4`}>
                  {/* Table Card Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                        Cash Handover Records
                      </h2>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Review reported collections, confirm physical cash received, and investigate differences.
                      </p>
                    </div>
                    <span className="bg-slate-100 text-slate-600 font-bold text-xs px-2.5 py-0.5 rounded-full border border-slate-200">
                      28 Entries
                    </span>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#EDF2F9] text-slate-500 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-200">
                          <th className="py-3.5 px-3 whitespace-nowrap">DELIVERY PARTNER ID</th>
                          <th className="py-3.5 px-3 whitespace-nowrap">COLLECTION DATE</th>
                          <th className="py-3.5 px-3 whitespace-nowrap">DELIVERY PARTNER</th>
                          <th className="py-3.5 px-3 text-right whitespace-nowrap">CASH REPORTED</th>
                          <th className="py-3.5 px-3 text-right whitespace-nowrap">CASH RECEIVED</th>
                          <th className="py-3.5 px-3 text-center whitespace-nowrap">DIFFERENCE</th>
                          <th className="py-3.5 px-3 whitespace-nowrap">STATUS</th>
                          <th className="py-3.5 px-3 text-center whitespace-nowrap">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                        {filteredCashReconciliations.map((rec) => {
                          const isInspected = inspectedCashRecord?.id === rec.id;

                          return (
                            <tr
                              key={rec.id}
                              onClick={() => {
                                setInspectedCashRecord(rec);
                                if (rec.cashCounted !== undefined) {
                                  setCashCountedInput(rec.cashCounted.toLocaleString('en-IN'));
                                }
                                if (rec.discrepancyNotes) {
                                  setDiscrepancyMemoInput(rec.discrepancyNotes);
                                }
                              }}
                              className={`transition cursor-pointer ${
                                isInspected
                                  ? 'bg-[#FFF8F8] hover:bg-[#FFF2F2]'
                                  : 'hover:bg-slate-50/80'
                              }`}
                            >
                              {/* Reconciliation ID */}
                              <td className="py-3.5 px-3 whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  {isInspected && (
                                    <span className="w-1.5 h-3.5 bg-red-600 rounded-full inline-block"></span>
                                  )}
                                  <span
                                    className={`font-black ${
                                      isInspected || rec.reconciliationId === 'CASH-20261016-001'
                                        ? 'text-[#BC0118]'
                                        : 'text-slate-900'
                                    }`}
                                  >
                                    {rec.reconciliationId}
                                  </span>
                                </div>
                              </td>

                              {/* Collection Date */}
                              <td className="py-3.5 px-3 text-slate-600 font-semibold whitespace-nowrap">
                                {rec.collectionDate}
                              </td>

                              {/* Delivery Partner */}
                              <td className="py-3.5 px-3 whitespace-nowrap">
                                <div className="flex items-center gap-2.5">
                                  <div
                                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${rec.partnerAvatarBg} ${rec.partnerAvatarText}`}
                                  >
                                    {rec.partnerInitials}
                                  </div>
                                  <div>
                                    <div className="font-extrabold text-slate-900 leading-tight">
                                      {rec.partnerName}
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-medium">
                                      {rec.partnerCode}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Cash Reported */}
                              <td className="py-3.5 px-3 text-right font-black text-slate-900 whitespace-nowrap">
                                ₹{rec.cashReported.toLocaleString('en-IN')}
                              </td>

                              {/* Cash Received */}
                              <td className="py-3.5 px-3 text-right font-black whitespace-nowrap">
                                {rec.cashReceived === null ? (
                                  <span className="text-slate-400 font-semibold">—</span>
                                ) : rec.difference === 0 ? (
                                  <span className="text-emerald-600">
                                    ₹{rec.cashReceived.toLocaleString('en-IN')}
                                  </span>
                                ) : (
                                  <span className="text-slate-900">
                                    ₹{rec.cashReceived.toLocaleString('en-IN')}
                                  </span>
                                )}
                              </td>

                              {/* Difference */}
                              <td className="py-3.5 px-3 text-center whitespace-nowrap">
                                {rec.difference === null ? (
                                  <span className="bg-blue-50/70 text-slate-600 border border-slate-200 text-[11px] font-semibold px-2 py-0.5 rounded">
                                    Pending
                                  </span>
                                ) : rec.difference === 0 ? (
                                  <span className="text-slate-700 font-semibold">₹0</span>
                                ) : (
                                  <span className="text-[#BC0118] font-black">
                                    -₹{Math.abs(rec.difference).toLocaleString('en-IN')}
                                  </span>
                                )}
                              </td>

                              {/* Status */}
                              <td className="py-3.5 px-3 whitespace-nowrap">
                                {rec.status === 'Pending Verification' && (
                                  <span className="inline-flex items-center gap-1.5 bg-[#FEF3C7] text-[#B45309] font-bold text-[11px] px-2.5 py-1 rounded-full border border-amber-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                    Pending Verification
                                  </span>
                                )}
                                {rec.status === 'Verified' && (
                                  <span className="inline-flex items-center gap-1.5 bg-[#DCFCE7] text-[#15803D] font-bold text-[11px] px-2.5 py-1 rounded-full border border-emerald-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    Verified
                                  </span>
                                )}
                                {rec.status === 'Discrepancy Found' && (
                                  <span className="inline-flex items-center gap-1.5 bg-[#FEE2E2] text-[#B91C1C] font-bold text-[11px] px-2.5 py-1 rounded-full border border-red-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                    Discrepancy Found
                                  </span>
                                )}
                                {rec.status === 'Under Investigation' && (
                                  <span className="inline-flex items-center gap-1.5 bg-[#DBEAFE] text-[#1D4ED8] font-bold text-[11px] px-2.5 py-1 rounded-full border border-blue-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                    Under Investigation
                                  </span>
                                )}
                              </td>

                              {/* Actions */}
                              <td className="py-3.5 px-3 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-center gap-1 text-slate-400">
                                  <button
                                    type="button"
                                    onClick={() => setInspectedCashRecord(rec)}
                                    title="View Record"
                                    className="p-1 hover:text-slate-800 transition cursor-pointer"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => triggerToast(`Actions for ${rec.reconciliationId}`)}
                                    title="More Options"
                                    className="p-1 hover:text-slate-800 transition cursor-pointer"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <span>Showing 1 to 5 of 28 records</span>
                      <span>•</span>
                      <div className="flex items-center gap-1.5">
                        <span>Rows per page:</span>
                        <div className="relative">
                          <select className="bg-white border border-slate-200 text-slate-800 font-bold px-2 py-0.5 rounded-md appearance-none pr-5 text-xs focus:outline-none cursor-pointer">
                            <option>10</option>
                            <option>25</option>
                            <option>50</option>
                          </select>
                          <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 font-bold">
                      <button
                        type="button"
                        onClick={() => triggerToast('Previous page')}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer text-xs"
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        className="px-3 py-1 rounded-lg bg-[#BC0118] text-white font-black text-xs shadow-xs"
                      >
                        1
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerToast('Page 2')}
                        className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer text-xs"
                      >
                        2
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerToast('Page 3')}
                        className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer text-xs"
                      >
                        3
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerToast('Next page')}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer text-xs"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Inspection Flyout */}
                {inspectedCashRecord && (
                  <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4 animate-in fade-in duration-200">
                    {/* Header */}
                    <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                          <Banknote className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-black text-slate-900 tracking-tight">
                              {inspectedCashRecord.reconciliationId}
                            </h3>
                            {inspectedCashRecord.status === 'Discrepancy Found' && (
                              <span className="bg-red-100 text-red-700 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-red-200">
                                Discrepancy Found
                              </span>
                            )}
                            {inspectedCashRecord.status === 'Verified' && (
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-emerald-200">
                                Verified
                              </span>
                            )}
                            {inspectedCashRecord.status === 'Pending Verification' && (
                              <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-amber-200">
                                Pending
                              </span>
                            )}
                            {inspectedCashRecord.status === 'Under Investigation' && (
                              <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-blue-200">
                                Under Investigation
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 font-semibold mt-0.5">
                            Physical Handover Audit &amp; Verification
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setInspectedCashRecord(null)}
                        className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                        title="Close Flyout"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* SECTION A: HANDOVER INFORMATION */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] sm:text-[11px] font-black text-slate-500 uppercase tracking-wider">
                          SECTION A: HANDOVER INFORMATION
                        </span>
                        <button
                          type="button"
                          onClick={() => triggerToast(`Viewing settlement ${inspectedCashRecord.settlementRef}`)}
                          className="text-[11px] font-bold text-[#BC0118] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>Settlement Ref {inspectedCashRecord.settlementRef}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="bg-[#F8FAFC] rounded-2xl p-3.5 border border-slate-200/80">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-[11px] font-medium text-slate-400 block">
                              Delivery Partner
                            </span>
                            <span className="text-xs sm:text-sm font-extrabold text-slate-900 block mt-0.5 leading-tight">
                              {inspectedCashRecord.partnerName} ({inspectedCashRecord.partnerCode})
                            </span>
                            <span className="text-[11px] font-medium text-slate-500 block mt-0.5">
                              Vehicle: {inspectedCashRecord.vehicle}
                            </span>

                            <span className="text-[11px] font-medium text-slate-400 block mt-3">
                              Shift Route
                            </span>
                            <span className="text-xs sm:text-sm font-extrabold text-slate-900 block mt-0.5 leading-tight">
                              {inspectedCashRecord.route}
                            </span>
                          </div>

                          <div>
                            <span className="text-[11px] font-medium text-slate-400 block">
                              Handover Timestamp
                            </span>
                            <span className="text-xs sm:text-sm font-extrabold text-slate-900 block mt-0.5 leading-tight">
                              {inspectedCashRecord.timestamp}
                            </span>
                            <span className="text-[11px] font-medium text-slate-500 block mt-0.5">
                              Depot: {inspectedCashRecord.depot}
                            </span>

                            <span className="text-[11px] font-medium text-slate-400 block mt-3">
                              Invoices In Cash Batch
                            </span>
                            <span className="text-xs sm:text-sm font-extrabold text-slate-900 block mt-0.5 leading-tight">
                              {inspectedCashRecord.invoicesBatchText}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SECTION B: REPORTED CASH BREAKDOWN */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] sm:text-[11px] font-black text-slate-500 uppercase tracking-wider">
                          SECTION B: REPORTED CASH BREAKDOWN
                        </span>
                        <span className="text-[11px] font-medium text-slate-400">
                          Automated Field Ingestion
                        </span>
                      </div>

                      <div className="rounded-2xl border border-slate-200/90 overflow-hidden bg-white">
                        <div className="bg-[#F0F5FF] px-4 py-2 flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          <span className="w-1/2">Ref &amp; Customer</span>
                          <span className="w-1/4 text-center">Time</span>
                          <span className="w-1/4 text-right">Collected</span>
                        </div>
                        <div className="divide-y divide-slate-100">
                          {inspectedCashRecord.breakdown.map((item, idx) => (
                            <div key={idx} className="px-4 py-2.5 flex items-center justify-between text-xs">
                              <div className="w-1/2">
                                <div className="font-extrabold text-slate-900">{item.paymentRef}</div>
                                <div className="text-[10px] text-slate-500 font-medium">
                                  {item.invoiceNo} • {item.customerName}
                                </div>
                              </div>
                              <div className="w-1/4 text-center text-slate-600 font-medium text-xs">
                                {item.time}
                              </div>
                              <div className="w-1/4 text-right font-black text-slate-900 text-xs">
                                ₹{item.amount.toLocaleString('en-IN')}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="bg-[#EFF6FF] px-4 py-2.5 flex items-center justify-between border-t border-blue-100">
                          <span className="text-xs font-bold text-slate-800">Total Reported Cash</span>
                          <span className="text-xs font-black text-slate-900">
                            ₹{inspectedCashRecord.totalReportedCash.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* SECTION C: PHYSICAL VERIFICATION */}
                    <div className="space-y-2.5">
                      <div className="text-[10px] sm:text-[11px] font-black text-slate-500 uppercase tracking-wider">
                        SECTION C: PHYSICAL VERIFICATION
                      </div>

                      <div className="grid grid-cols-3 gap-2.5">
                        {/* Reported */}
                        <div className="bg-white border border-slate-200/90 rounded-xl p-2.5 sm:p-3">
                          <span className="text-[10px] font-bold text-slate-400 block">Reported</span>
                          <span className="text-sm sm:text-base font-black text-slate-900 block mt-0.5">
                            ₹{inspectedCashRecord.cashReported.toLocaleString('en-IN')}
                          </span>
                        </div>

                        {/* Cash Counted */}
                        <div className="bg-white border border-slate-200/90 rounded-xl p-2.5 sm:p-3">
                          <span className="text-[10px] font-bold text-slate-500 block">Cash Counted</span>
                          <div className="mt-0.5 border border-slate-300 rounded-lg px-2 py-1 bg-white flex items-center gap-1">
                            <span className="text-xs font-bold text-slate-500">₹</span>
                            <input
                              type="text"
                              value={cashCountedInput}
                              onChange={(e) => setCashCountedInput(e.target.value)}
                              className="w-full text-xs sm:text-sm font-black text-slate-900 focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Shortfall */}
                        <div className="bg-[#FEE2E2] border border-red-100 rounded-xl p-2.5 sm:p-3">
                          <span className="text-[10px] font-bold text-red-600 block">Shortfall</span>
                          <span className="text-sm sm:text-base font-black text-red-600 block mt-0.5">
                            -₹{Math.abs(inspectedCashRecord.shortfall || 1000).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Discrepancy Notes / Verification Memo */}
                      <div className="space-y-1">
                        <label className="text-[10px] sm:text-xs font-bold text-slate-600 block">
                          Discrepancy Notes / Verification Memo <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={3}
                          value={discrepancyMemoInput}
                          onChange={(e) => setDiscrepancyMemoInput(e.target.value)}
                          className="w-full bg-[#F8FAFC] border border-slate-200/90 rounded-xl p-3 text-xs text-slate-800 font-medium leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-red-500/20"
                        />
                      </div>
                    </div>

                    {/* SECTION D: INVESTIGATION WORKFLOW */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] sm:text-[11px] font-black text-slate-500 uppercase tracking-wider">
                          SECTION D: INVESTIGATION WORKFLOW
                        </span>
                        <span className="bg-[#EFF6FF] text-[#2563EB] text-[10px] font-extrabold px-2 py-0.5 rounded border border-blue-200">
                          {inspectedCashRecord.statusBadgeText}
                        </span>
                      </div>

                      <div className="bg-[#F8FAFC] rounded-2xl p-3.5 border border-slate-200/80 space-y-3">
                        <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-200/60">
                          <span className="text-slate-500 font-medium">Depot Cashier:</span>
                          <span className="font-extrabold text-slate-900">{inspectedCashRecord.cashierName}</span>
                        </div>

                        {/* Timeline */}
                        <div className="space-y-2.5">
                          {inspectedCashRecord.investigationSteps.map((step, idx) => (
                            <div key={idx} className="flex items-start gap-2.5">
                              <span
                                className={`w-2 h-2 rounded-full shrink-0 mt-1 ${
                                  step.isFlagged ? 'bg-red-600' : 'bg-slate-500'
                                }`}
                              ></span>
                              <div>
                                <div
                                  className={`text-xs font-bold leading-tight ${
                                    step.isFlagged ? 'text-red-600' : 'text-slate-800'
                                  }`}
                                >
                                  {step.title}
                                </div>
                                <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                                  {step.subtitle}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Depot Policy */}
                        <div className="bg-white rounded-xl p-3 border border-slate-200/90 flex items-start gap-2.5 text-[11px]">
                          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          <p className="text-slate-600 font-medium leading-relaxed">
                            <strong className="text-slate-800 font-bold">Depot Policy:</strong> Confirmed cash shortfall does not automatically deduct partner earnings without supervisory settlement sign-off.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="flex items-center gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => triggerToast(`Generating Handover PDF for ${inspectedCashRecord.reconciliationId}...`)}
                        className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-extrabold text-xs px-3.5 py-2.5 rounded-xl shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap"
                      >
                        <FileDown className="w-4 h-4 text-slate-600 shrink-0" />
                        <span>Handover PDF</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => triggerToast(`Discrepancy confirmed & flagged for ${inspectedCashRecord.reconciliationId}`)}
                        className="flex-1 min-w-0 bg-[#BC0118] hover:bg-red-800 active:scale-98 text-white font-extrabold text-xs py-2.5 px-3 rounded-xl shadow-xs transition text-center cursor-pointer whitespace-nowrap"
                      >
                        Confirm &amp; Flag Discrepancy
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Placeholders for Other Tabs */}
          {activeTab === 'Customer Ledger' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#BC0118] flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">{activeTab}</h3>
              <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
                Comprehensive tracking module for customer ledger entries, balance statements, and credit accounts.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('Cash Reconciliation')}
                className="mt-3 px-4 py-2 bg-[#BC0118] hover:bg-red-800 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                Back to Cash Reconciliation
              </button>
            </div>
          )}
        </main>
      </div>

      {/* MODAL: Create Invoice Modal */}
      {showCreateInvoiceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Create New Invoice</h3>
                <p className="text-xs text-slate-400 font-medium">
                  Issue cylinder refill invoice and assign dispatch pass
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateInvoiceModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoiceSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Select Customer *</label>
                <select
                  value={newCustomer}
                  onChange={(e) => setNewCustomer(e.target.value)}
                  className="w-full bg-[#F1F4FA] rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                >
                  <option value="Mohammed Ali (CUS-00125)">Mohammed Ali (CUS-00125) · Commercial Catering</option>
                  <option value="Rajesh Kumar (CUS-00124)">Rajesh Kumar (CUS-00124) · Domestic</option>
                  <option value="Priya Stores (CUS-00126)">Priya Stores (CUS-00126) · Commercial</option>
                  <option value="Lakshmi Agencies (CUS-00128)">Lakshmi Agencies (CUS-00128) · Bulk</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Cylinder Size *</label>
                  <select
                    value={newCylinderType}
                    onChange={(e) => setNewCylinderType(e.target.value)}
                    className="w-full bg-[#F1F4FA] rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  >
                    <option value="19kg Commercial">19kg Commercial LPG</option>
                    <option value="14.2kg Domestic">14.2kg Domestic LPG</option>
                    <option value="47.5kg Industrial">47.5kg Industrial LPG</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Quantity *</label>
                  <input
                    type="number"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                    className="w-full bg-[#F1F4FA] rounded-xl px-4 py-3 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    min="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Unit Rate (₹) *</label>
                  <input
                    type="number"
                    value={newRate}
                    onChange={(e) => setNewRate(e.target.value)}
                    className="w-full bg-[#F1F4FA] rounded-xl px-4 py-3 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Total Bill</label>
                  <div className="w-full bg-[#EDF4FF] rounded-xl px-4 py-3 text-xs font-black text-slate-900 border border-blue-200">
                    ₹{(Number(newQuantity) * Number(newRate)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateInvoiceModal(false)}
                  className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#BC0118] hover:bg-red-800 active:scale-98 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Generate Invoice</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Record Payment Modal */}
      {showRecordPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Record Customer Payment</h3>
                <p className="text-xs text-slate-400 font-medium">
                  FIFO engine will automatically clear oldest bills first
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRecordPaymentModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Select Customer *</label>
                <select
                  value={paymentCustomer}
                  onChange={(e) => setPaymentCustomer(e.target.value)}
                  className="w-full bg-[#F1F4FA] rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                >
                  <option value="Sri Krishna Sweets (CUS-00366)">Sri Krishna Sweets (CUS-00366) · ₹4,800 total due</option>
                  <option value="Mohammed Ali (CUS-00125)">Mohammed Ali (CUS-00125) · ₹700 total due</option>
                  <option value="Hotel Annapoorna (CUS-00542)">Hotel Annapoorna (CUS-00542) · ₹5,580 total due</option>
                  <option value="Priya Stores (CUS-00126)">Priya Stores (CUS-00126) · ₹1,800 total due</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Amount Received (₹) *</label>
                  <input
                    type="text"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="4,000"
                    className="w-full bg-[#F1F4FA] rounded-xl px-4 py-3 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">Payment Mode *</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as 'Cash' | 'UPI' | 'Bank Transfer')}
                    className="w-full bg-[#F1F4FA] rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  >
                    <option value="Cash">Cash Handover</option>
                    <option value="UPI">UPI / QR Code</option>
                    <option value="Bank Transfer">Bank Transfer / NEFT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">Reference / UTR #</label>
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="PAY-558802 or UPI Ref"
                  className="w-full bg-[#F1F4FA] rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRecordPaymentModal(false)}
                  className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#BC0118] hover:bg-red-800 active:scale-98 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Confirm &amp; Allocate</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Investigate Cash Discrepancy Modal */}
      {showInvestigateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">Investigate Cash Discrepancy</h3>
                  <p className="text-xs text-slate-400 font-medium">Suresh Babu · ID: DP-003</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInvestigateModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div className="bg-[#FFF5F5] rounded-2xl p-4 border border-red-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-semibold">Reported Cash Collections</span>
                  <span className="font-extrabold text-slate-900">₹18,500</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-semibold">Counted at Depot Counter</span>
                  <span className="font-extrabold text-slate-900">₹16,500</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-red-200/80 font-black">
                  <span className="text-red-700">Shortage / Variance</span>
                  <span className="text-red-600 text-sm">-₹2,000</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowInvestigateModal(false);
                    triggerToast('Re-count requested with Depot Cashier.');
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Request Re-count
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowInvestigateModal(false);
                    triggerToast('Variance logged to Partner Recovery Account.');
                  }}
                  className="px-4 py-2 bg-[#BC0118] hover:bg-red-800 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                >
                  Log Variance Flag
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
