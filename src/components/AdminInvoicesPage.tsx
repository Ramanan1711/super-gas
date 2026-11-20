'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  ArrowLeft,
  ClipboardList,
  GitBranch,
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

const detailedInvoicesList: InvoiceRecord[] = [];

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

export interface LedgerTransaction {
  date: string;
  dateTime?: string;
  type: 'Invoice Created' | 'Payment Received' | 'Invoice' | 'Payment' | 'Advance Credit';
  reference: string;
  description: string;
  debit: number | null;
  credit: number | null;
  runningBalance: number;
  note?: string;
  actionText?: string;
}

export interface CustomerLedgerRecord {
  id: string;
  name: string;
  customerCode: string;
  phone: string;
  address?: string;
  partnerVehicle?: string;
  category?: string;
  assignedPartner: string;
  assignedPartnerCode?: string;
  totalInvoiced: number;
  paymentsReceived: number;
  outstandingBalance: number;
  availableAdvance: number;
  totalAmountPaid?: number;
  paidInvoicesCount?: number;
  pendingInvoicesCount?: number;
  status: 'Outstanding' | 'Advance Available' | 'Settled' | 'Inactive';
  transactions: LedgerTransaction[];
}

interface AdminInvoicesPageProps {
  initialTab?: 'Overview' | 'Invoices' | 'Payments' | 'Cash Reconciliation' | 'Customer Ledger';
}

export default function AdminInvoicesPage({
  initialTab = 'Overview',
}: AdminInvoicesPageProps) {
  const [activeTab, setActiveTab] = useState<'Overview' | 'Invoices' | 'Payments' | 'Cash Reconciliation' | 'Customer Ledger'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [partnerFilter, setPartnerFilter] = useState('All Delivery Partners');
  const [customerFilter, setCustomerFilter] = useState('All Customers');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Invoices Tab Table Selection & Inspection
  const [invoicesList, setInvoicesList] = useState<InvoiceRecord[]>(detailedInvoicesList);
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
  const [inspectedInvoice, setInspectedInvoice] = useState<InvoiceRecord | null>(null);

  // Payments Tab State
  const [paymentsList, setPaymentsList] = useState<PaymentRecord[]>([]);
  const [selectedPaymentIds, setSelectedPaymentIds] = useState<string[]>([]);
  const [inspectedPayment, setInspectedPayment] = useState<PaymentRecord | null>(null);
  const [paymentSearchQuery, setPaymentSearchQuery] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('All Methods');
  const [paymentPartnerFilter, setPaymentPartnerFilter] = useState('All Delivery Partners');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All Statuses');

  // Cash Reconciliation Tab State
  const [cashReconciliationsList, setCashReconciliationsList] = useState<CashReconciliationRecord[]>([]);
  const [inspectedCashRecord, setInspectedCashRecord] = useState<CashReconciliationRecord | null>(null);
  const [cashSearchQuery, setCashSearchQuery] = useState('');
  const [cashPartnerFilter, setCashPartnerFilter] = useState('All Delivery Partners');
  const [cashStatusFilter, setCashStatusFilter] = useState('All Statuses');
  const [cashCountedInput, setCashCountedInput] = useState('14,000');
  const [discrepancyMemoInput, setDiscrepancyMemoInput] = useState(
    'Physical handover short by ₹1,000. Driver reported dispute on tare weight deduction.'
  );

  // Customer Ledger Tab State
  const [customerLedgerList, setCustomerLedgerList] = useState<CustomerLedgerRecord[]>([]);
  const [activeCustomerLedgerId, setActiveCustomerLedgerId] = useState<string | null>(null);
  const [individualTxFilter, setIndividualTxFilter] = useState('All Transactions');
  const [individualTxSearch, setIndividualTxSearch] = useState('');
  const [ledgerSearchQuery, setLedgerSearchQuery] = useState('');
  const [ledgerPartnerFilter, setLedgerPartnerFilter] = useState('All Partners');
  const [ledgerBalanceFilter, setLedgerBalanceFilter] = useState('Balance: All');
  const [ledgerStatusFilter, setLedgerStatusFilter] = useState('Active');
  const [selectedLedgerCustomer, setSelectedLedgerCustomer] = useState<CustomerLedgerRecord | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/admin/invoices')
      .then((res) => res.json())
      .then((json) => {
        if (!isMounted) return;
        if (json?.success && json?.data) {
          if (Array.isArray(json.data.invoices)) {
            setInvoicesList(json.data.invoices);
            if (json.data.invoices.length > 0) {
              setInspectedInvoice(json.data.invoices[0]);
              setSelectedInvoiceIds([json.data.invoices[0].id]);
            }
          }
          if (Array.isArray(json.data.payments)) {
            setPaymentsList(json.data.payments);
            if (json.data.payments.length > 0) {
              setInspectedPayment(json.data.payments[0]);
              setSelectedPaymentIds([json.data.payments[0].id]);
            }
          }
          if (Array.isArray(json.data.customerLedgers)) {
            setCustomerLedgerList(json.data.customerLedgers);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load live invoices:', err);
      });

    fetch('/api/settlements/history')
      .then((res) => res.json())
      .then((json) => {
        if (!isMounted) return;
        const rawList = Array.isArray(json?.data?.settlements)
          ? json.data.settlements
          : Array.isArray(json?.data)
          ? json.data
          : [];
        if (json?.success && rawList.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mapped: CashReconciliationRecord[] = rawList.map((s: any) => ({
            id: s.id,
            reconciliationId: `CASH-${s.id.slice(-6).toUpperCase()}`,
            collectionDate: s.date,
            partnerName: s.partnerName || 'Suresh Babu',
            partnerCode: s.partnerCode || 'DP-003',
            partnerInitials: (s.partnerName || 'SB').slice(0, 2).toUpperCase(),
            partnerAvatarBg: 'bg-slate-100',
            partnerAvatarText: 'text-slate-700',
            cashReported: s.expectedAmount ?? s.cashExpected ?? 0,
            cashReceived: s.handedOverAmount ?? s.cashHandedOver ?? 0,
            difference: (s.handedOverAmount ?? s.cashHandedOver ?? 0) - (s.expectedAmount ?? s.cashExpected ?? 0),
            status: (s.status === 'Verified' || s.rawStatus === 'VERIFIED') ? ('Verified' as const) : ('Pending Verification' as const),
            settlementRef: `#SET-${s.id.slice(-6).toUpperCase()}`,
            vehicle: 'TN 58 AX 4821',
            route: 'Madurai Route Beat',
            timestamp: s.date,
            depot: 'HQ Central Vault',
            invoicesBatchText: `${s.deliveriesCount || 1} Deliveries`,
            breakdown: [],
            totalReportedCash: s.expectedAmount ?? s.cashExpected ?? 0,
            cashCounted: s.handedOverAmount ?? s.cashHandedOver ?? 0,
            shortfall: Math.max(0, (s.expectedAmount ?? s.cashExpected ?? 0) - (s.handedOverAmount ?? s.cashHandedOver ?? 0)),
            discrepancyNotes: 'Handover record from live delivery cycle.',
            cashierName: 'Admin S. Raman (Staff ID #8841)',
            investigationSteps: [
              {
                title: 'Field Cash Dropped',
                subtitle: `${s.date} • Gate Handover Point`,
              },
            ],
            statusBadgeText: (s.status === 'Verified' || s.rawStatus === 'VERIFIED') ? 'Audit Clearance Passed' : 'Pending Verification',
          }));
          setCashReconciliationsList(mapped);
          if (mapped.length > 0) {
            setInspectedCashRecord(mapped[0]);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load settlements:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const currentLedgerCustomer = useMemo(() => {
    if (!activeCustomerLedgerId) return customerLedgerList[0] || null;
    return (
      customerLedgerList.find((c) => c.customerCode === activeCustomerLedgerId) ||
      customerLedgerList[0] ||
      null
    );
  }, [activeCustomerLedgerId, customerLedgerList]);

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

  const handleVerifyCashRecord = async () => {
    if (!inspectedCashRecord) return;
    try {
      const res = await fetch('/api/settlements/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settlementId: inspectedCashRecord.id,
          auditRemarks: discrepancyMemoInput.trim() || 'Verified by Admin in Cash Reconciliation',
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error?.message || 'Verification failed');
      }

      setCashReconciliationsList((prev) =>
        prev.map((r) =>
          r.id === inspectedCashRecord.id
            ? { ...r, status: 'Verified', statusBadgeText: 'Audit Clearance Passed' }
            : r
        )
      );
      setInspectedCashRecord((prev) =>
        prev ? { ...prev, status: 'Verified', statusBadgeText: 'Audit Clearance Passed' } : null
      );
      triggerToast(`Vault cash for ${inspectedCashRecord.reconciliationId} signed off & verified!`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error verifying settlement');
    }
  };

  const toggleSelectInvoice = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedInvoiceIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAllInvoices = () => {
    if (selectedInvoiceIds.length === invoicesList.length) {
      setSelectedInvoiceIds([]);
    } else {
      setSelectedInvoiceIds(invoicesList.map((i) => i.id));
    }
  };

  const toggleSelectPayment = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPaymentIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAllPayments = () => {
    if (selectedPaymentIds.length === paymentsList.length) {
      setSelectedPaymentIds([]);
    } else {
      setSelectedPaymentIds(paymentsList.map((p) => p.id));
    }
  };

  const invoiceStats = useMemo(() => {
    const invoicesCount = invoicesList.length;
    const totalCylinders = invoicesList.reduce((sum, inv) => sum + (inv.cylinders?.length || 0), 0);

    const totalCollected = paymentsList.reduce((sum, p) => sum + (p.receivedAmount || 0), 0);
    const cashCollected = paymentsList
      .filter((p) => p.method === 'Cash')
      .reduce((sum, p) => sum + (p.receivedAmount || 0), 0);
    const upiCollected = paymentsList
      .filter((p) => p.method === 'UPI')
      .reduce((sum, p) => sum + (p.receivedAmount || 0), 0);

    const cashPct = totalCollected > 0 ? Math.round((cashCollected / totalCollected) * 100) : 0;
    const upiPct = totalCollected > 0 ? 100 - cashPct : 0;

    const outstandingAccounts = customerLedgerList.filter(
      (c) => (c.outstandingBalance || 0) > 0
    );
    const outstandingCount = outstandingAccounts.length;
    const totalOutstanding = outstandingAccounts.reduce(
      (sum, c) => sum + (c.outstandingBalance || 0),
      0
    );

    const advanceAccounts = customerLedgerList.filter(
      (c) => (c.availableAdvance || 0) > 0
    );
    const advanceCount = advanceAccounts.length;
    const totalAdvances = advanceAccounts.reduce(
      (sum, c) => sum + (c.availableAdvance || 0),
      0
    );

    return {
      invoicesCount,
      totalCylinders,
      totalCollected,
      cashCollected,
      upiCollected,
      cashPct,
      upiPct,
      outstandingCount,
      totalOutstanding,
      advanceCount,
      totalAdvances,
    };
  }, [invoicesList, paymentsList, customerLedgerList]);

  const filteredInvoices = useMemo(() => {
    return invoicesList.filter((inv) => {
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
  }, [invoicesList, searchQuery, statusFilter, partnerFilter, customerFilter]);

  const filteredPayments = useMemo(() => {
    return paymentsList.filter((pay) => {
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
  }, [paymentsList, paymentSearchQuery, paymentMethodFilter, paymentPartnerFilter, paymentStatusFilter]);

  const filteredCashReconciliations = useMemo(() => {
    return cashReconciliationsList.filter((item) => {
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
  }, [cashReconciliationsList, cashSearchQuery, cashPartnerFilter, cashStatusFilter]);

  const filteredLedgerCustomers = useMemo(() => {
    return customerLedgerList.filter((item) => {
      if (ledgerSearchQuery.trim()) {
        const q = ledgerSearchQuery.toLowerCase();
        const match =
          item.name.toLowerCase().includes(q) ||
          item.customerCode.toLowerCase().includes(q) ||
          item.phone.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (ledgerPartnerFilter !== 'All Partners') {
        const pLower = ledgerPartnerFilter.toLowerCase();
        const matchPartner =
          item.assignedPartner.toLowerCase().includes(pLower) ||
          (item.assignedPartnerCode && item.assignedPartnerCode.toLowerCase().includes(pLower));
        if (!matchPartner) return false;
      }
      if (ledgerBalanceFilter === 'Has Balance (> ₹0)' || ledgerBalanceFilter === 'Outstanding Only') {
        if (item.outstandingBalance <= 0) return false;
      } else if (ledgerBalanceFilter === 'Settled (₹0)' || ledgerBalanceFilter === 'Settled Only') {
        if (item.outstandingBalance !== 0 || item.availableAdvance > 0) return false;
      } else if (ledgerBalanceFilter === 'Advance Available (< ₹0)' || ledgerBalanceFilter === 'Advance Available Only') {
        if (item.availableAdvance <= 0) return false;
      }
      if (ledgerStatusFilter === 'Active') {
        if (item.status === 'Inactive') return false;
      } else if (ledgerStatusFilter !== 'All Statuses' && ledgerStatusFilter !== 'All') {
        if (item.status !== ledgerStatusFilter) return false;
      }
      return true;
    });
  }, [customerLedgerList, ledgerSearchQuery, ledgerPartnerFilter, ledgerBalanceFilter, ledgerStatusFilter]);

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
            <Link href="/admin/invoices-payments" className="text-slate-500 hover:text-slate-800 transition">
              Invoices &amp; Payments
            </Link>
            {activeTab === 'Customer Ledger' && (
              <>
                <span className="text-slate-300">/</span>
                <button
                  type="button"
                  onClick={() => setActiveCustomerLedgerId(null)}
                  className={`transition cursor-pointer ${
                    activeCustomerLedgerId
                      ? 'text-slate-500 hover:text-slate-800'
                      : 'font-bold text-slate-800'
                  }`}
                >
                  Customer Ledger
                </button>
                {activeCustomerLedgerId && (
                  <>
                    <span className="text-slate-300">/</span>
                    <span className="font-bold text-slate-800">
                      {currentLedgerCustomer?.name} ({currentLedgerCustomer?.customerCode})
                    </span>
                  </>
                )}
              </>
            )}
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
          {!(activeTab === 'Customer Ledger' && activeCustomerLedgerId) && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {activeTab === 'Customer Ledger'
                      ? 'Customer Ledger'
                      : activeTab === 'Cash Reconciliation'
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
                  {activeTab === 'Customer Ledger'
                    ? 'View customer account balances, outstanding invoices, payments, and financial history.'
                    : activeTab === 'Cash Reconciliation'
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
                {activeTab === 'Customer Ledger' ? (
                  <button
                    type="button"
                    onClick={() => triggerToast('Exporting customer ledger list...')}
                    className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm px-4.5 py-2.5 rounded-xl shadow-2xs transition flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4 stroke-[2.2] text-slate-600" />
                    <span>Export Customer List</span>
                  </button>
                ) : activeTab === 'Cash Reconciliation' ? (
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
          )}

          {/* Navigation Tabs Bar */}
          {!(activeTab === 'Customer Ledger' && activeCustomerLedgerId) && (
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
          )}

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
                              checked={paymentsList.length > 0 && selectedPaymentIds.length === paymentsList.length}
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
                        onClick={() => {
                          setActiveTab('Customer Ledger');
                          setActiveCustomerLedgerId(inspectedPayment.customerCode || 'CUS-00124');
                        }}
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
                      ₹{invoiceStats.totalOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-medium text-slate-500 flex-wrap">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-4 h-4 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-[10px]">
                      !
                    </span>
                    <span>
                      Pending across <strong className="text-slate-800">{invoiceStats.outstandingCount}</strong> active customer accounts
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
                              checked={selectedInvoiceIds.length === invoicesList.length}
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
                          onClick={() => {
                            setActiveTab('Customer Ledger');
                            setActiveCustomerLedgerId(inspectedInvoice.customerCode || 'CUS-00124');
                          }}
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
                    <div className="text-3xl font-black text-slate-900 mt-2">{invoiceStats.invoicesCount}</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">
                      Invoices created today
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xs">
                    <span className="text-slate-600 font-bold">Total: {invoiceStats.totalCylinders} Cylinders</span>
                    <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md flex items-center gap-1 text-[11px]">
                      <span>↑</span> live sync
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
                    <div className="text-3xl font-black text-slate-900 mt-2">₹{invoiceStats.totalCollected.toLocaleString('en-IN')}</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">
                      Payments received today
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-4 mt-4 border-t border-slate-100 text-[11px] font-bold">
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md">• ₹{invoiceStats.cashCollected.toLocaleString('en-IN')} Cash</span>
                    <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded-md">• ₹{invoiceStats.upiCollected.toLocaleString('en-IN')} UPI</span>
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
                    <div className="text-3xl font-black text-slate-900 mt-2">₹{invoiceStats.totalOutstanding.toLocaleString('en-IN')}</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">
                      Pending across {invoiceStats.outstandingCount} accounts
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xs">
                    <span className="text-slate-600 font-bold">{invoiceStats.outstandingCount} Pending</span>
                    <span className="bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded-md flex items-center gap-1 text-[11px]">
                      <AlertTriangle className="w-3 h-3 text-red-600" />
                      <span>Ledger Active</span>
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
                    <div className="text-3xl font-black text-[#10B981] mt-2">₹{invoiceStats.totalAdvances.toLocaleString('en-IN')}</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">
                      Available customer credit pool
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xs">
                    <span className="text-slate-600 font-bold">Auto-FIFO Ready</span>
                    <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md text-[11px]">
                      • {invoiceStats.advanceCount} active credits
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
                      {(invoicesList.length > 0 ? invoicesList.slice(0, 5) : []).map((inv) => (
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
                      <span className="text-xs font-black text-[#BC0118]">Total: ₹{invoiceStats.totalCollected.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-700">Cash Collections ({invoiceStats.cashPct}%)</span>
                        <span className="text-slate-900 font-black">₹{invoiceStats.cashCollected.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex">
                        <div className="h-full bg-slate-800" style={{ width: `${invoiceStats.cashPct}%` }}></div>
                        <div className="h-full bg-[#E81B24]" style={{ width: `${invoiceStats.upiPct}%` }}></div>
                      </div>
                      <div className="flex items-center justify-between text-xs font-bold pt-1">
                        <span className="text-slate-700">UPI / Digital QR ({invoiceStats.upiPct}%)</span>
                        <span className="text-slate-900 font-black">₹{invoiceStats.upiCollected.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900">Customer Advances Pool</h3>
                        <p className="text-[11px] text-slate-400 font-medium">₹{invoiceStats.totalAdvances.toLocaleString('en-IN')} available across {invoiceStats.advanceCount} accounts</p>
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

                      {inspectedCashRecord.status === 'Verified' ? (
                        <div className="flex-1 bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-2xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Vault Cash Verified &amp; Signed Off</span>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={handleVerifyCashRecord}
                            className="flex-1 min-w-0 bg-[#059669] hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-xs py-2.5 px-3 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                            <span>Verify &amp; Sign Off Vault Cash</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => triggerToast(`Discrepancy confirmed & flagged for ${inspectedCashRecord.reconciliationId}`)}
                            className="border border-red-200 hover:bg-red-50 text-[#BC0118] font-bold text-xs py-2.5 px-3 rounded-xl transition cursor-pointer whitespace-nowrap"
                          >
                            Flag Diff
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB: CUSTOMER LEDGER TAB                                   */}
          {/* ========================================================= */}
          {activeTab === 'Customer Ledger' && (
            activeCustomerLedgerId ? (
              /* INDIVIDUAL CUSTOMER LEDGER PAGE (media_1794891492345_27e4eee1.png) */
              <div className="space-y-5">
                {/* Secondary Breadcrumbs & Back Row */}
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Link href="/admin/invoices-payments" className="hover:text-slate-800 transition">
                      Invoices &amp; Payments
                    </Link>
                    <span>&gt;</span>
                    <button
                      type="button"
                      onClick={() => setActiveCustomerLedgerId(null)}
                      className="hover:text-slate-800 transition cursor-pointer"
                    >
                      Customer Ledger
                    </button>
                    <span>&gt;</span>
                    <span className="font-bold text-slate-900">
                      {currentLedgerCustomer?.name} ({currentLedgerCustomer?.customerCode})
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveCustomerLedgerId(null)}
                    className="text-[#BC0118] hover:text-red-800 font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Back to Customer Ledger</span>
                  </button>
                </div>

                {/* Customer Profile Card */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-4">
                    {/* Dark navy square avatar RK */}
                    <div className="w-14 h-14 rounded-xl bg-[#1E293B] text-white font-extrabold text-lg flex items-center justify-center shrink-0 tracking-wide shadow-2xs">
                      {currentLedgerCustomer?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'RK'}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">
                          {currentLedgerCustomer?.name}
                        </h2>
                        <span className="bg-slate-100 text-slate-700 font-bold text-xs px-2.5 py-0.5 rounded-md border border-slate-200/80">
                          {currentLedgerCustomer?.customerCode}
                        </span>
                        <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          Active Account
                        </span>
                        <span className="bg-slate-100 text-slate-600 font-medium text-xs px-2.5 py-0.5 rounded-md">
                          {currentLedgerCustomer?.category || 'Domestic Consumer'}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{currentLedgerCustomer?.phone}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{currentLedgerCustomer?.address || 'Plot 14, Anna Nagar 2nd St, Madurai'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-slate-400" />
                          <span>{currentLedgerCustomer?.partnerVehicle || 'DP-001 (Van 04)'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Buttons */}
                  <div className="flex items-center gap-2.5 shrink-0 self-end lg:self-center">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => triggerToast(`Exporting Statement for ${currentLedgerCustomer?.name}...`)}
                        className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-2xs transition flex items-center gap-2 cursor-pointer"
                      >
                        <span>Export Statement</span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => triggerToast(`Viewing Customer Profile for ${currentLedgerCustomer?.name}...`)}
                      className="bg-[#BC0118] hover:bg-red-800 active:scale-98 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>View Customer Profile</span>
                      <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                </div>

                {/* 4 Financial Summary KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  {/* Card 1: TOTAL OUTSTANDING AMOUNT */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 border-l-4 border-l-[#BC0118] flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                        TOTAL OUTSTANDING AMOUNT
                      </span>
                      <div className="w-7 h-7 rounded-lg bg-red-50 text-[#BC0118] flex items-center justify-center">
                        <Wallet className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="text-2xl font-black text-[#BC0118] tracking-tight">
                        ₹{currentLedgerCustomer?.outstandingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '2,000.00'}
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium mt-1 leading-snug">
                        Total unpaid balance across all unpaid and partially paid invoices
                      </p>
                    </div>
                  </div>

                  {/* Card 2: TOTAL AMOUNT PAID */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 border-l-4 border-l-emerald-600 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                        TOTAL AMOUNT PAID
                      </span>
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Banknote className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="text-2xl font-black text-emerald-700 tracking-tight">
                        ₹{currentLedgerCustomer?.totalAmountPaid?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '2,000.00'}
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium mt-1 leading-snug">
                        Total customer payments received during the selected statement period
                      </p>
                    </div>
                  </div>

                  {/* Card 3: PAID INVOICES */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                        PAID INVOICES
                      </span>
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="text-2xl font-black text-slate-900 tracking-tight">
                        {currentLedgerCustomer?.paidInvoicesCount ?? 1}
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium mt-1 leading-snug">
                        Number of invoices fully paid during the selected statement period
                      </p>
                    </div>
                  </div>

                  {/* Card 4: TOTAL PENDING INVOICES */}
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                        TOTAL PENDING INVOICES
                      </span>
                      <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                        <ClipboardList className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="text-2xl font-black text-slate-900 tracking-tight">
                        {currentLedgerCustomer?.pendingInvoicesCount ?? 2}
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium mt-1 leading-snug">
                        Number of invoices that are unpaid or partially paid during the selected statement period
                      </p>
                    </div>
                  </div>
                </div>

                {/* Statement Filter Controls */}
                <div className="space-y-2">
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3.5 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-wrap">
                      {/* Date Range Picker */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => triggerToast('Statement Period: Oct 01, 2026 - Oct 24, 2026')}
                          className="w-full sm:w-auto bg-[#F8FAFC] border border-slate-200 hover:bg-slate-50 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 flex items-center justify-between gap-2.5 shadow-2xs cursor-pointer"
                        >
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>Oct 01, 2026 - Oct 24, 2026</span>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                      </div>

                      {/* Transaction Type Filter */}
                      <div className="relative">
                        <select
                          value={individualTxFilter}
                          onChange={(e) => setIndividualTxFilter(e.target.value)}
                          className="w-full sm:w-auto bg-[#F8FAFC] border border-slate-200 hover:bg-slate-50 pl-3.5 pr-8 py-2 rounded-xl text-xs font-semibold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer shadow-2xs"
                        >
                          <option value="All Transactions">All Transactions</option>
                          <option value="Invoice Created">Invoice Created</option>
                          <option value="Payment Received">Payment Received</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>

                      {/* Search Input */}
                      <div className="relative min-w-[280px] flex-1">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={individualTxSearch}
                          onChange={(e) => setIndividualTxSearch(e.target.value)}
                          placeholder="Search transaction reference, invoice ID..."
                          className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl pl-9.5 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                        />
                      </div>
                    </div>

                    {/* Reset and Apply Filters */}
                    <div className="flex items-center gap-3 shrink-0 self-end lg:self-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setIndividualTxFilter('All Transactions');
                          setIndividualTxSearch('');
                          triggerToast('Filters reset to default');
                        }}
                        className="text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer px-2 py-1"
                      >
                        Reset
                      </button>

                      <button
                        type="button"
                        onClick={() => triggerToast('Filters applied')}
                        className="bg-[#1E293B] hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Filter className="w-3.5 h-3.5" />
                        <span>Apply Filters</span>
                      </button>
                    </div>
                  </div>

                  {/* Micro Info Status Bar */}
                  <div className="flex items-center justify-between text-xs px-1">
                    <div className="flex items-center gap-1.5 text-slate-500 font-medium text-[11px]">
                      <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Derived from immutable agency ledger · FIFO Principle Enforced</span>
                    </div>
                    <div className="text-slate-500 font-semibold text-[11px]">
                      Showing {currentLedgerCustomer?.transactions?.length ?? 4} of {currentLedgerCustomer?.transactions?.length ?? 4} entries
                    </div>
                  </div>
                </div>

                {/* Transaction History Table Card */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-4">
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                        Transaction History
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Complete financial activity and running balance audit for {currentLedgerCustomer?.name} ({currentLedgerCustomer?.customerCode})
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 bg-red-50 text-[#BC0118] border border-red-200 text-xs font-bold px-2.5 py-1 rounded-lg self-start sm:self-auto">
                      <RefreshCw className="w-3 h-3 text-[#BC0118]" />
                      <span>FIFO Principle Enforced</span>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#EDF2F9] text-slate-500 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-200">
                          <th className="py-3.5 px-3 whitespace-nowrap">DATE &amp; TIME</th>
                          <th className="py-3.5 px-3 whitespace-nowrap">REFERENCE</th>
                          <th className="py-3.5 px-3 whitespace-nowrap">TRANSACTION TYPE</th>
                          <th className="py-3.5 px-3 whitespace-nowrap">DESCRIPTION</th>
                          <th className="py-3.5 px-3 text-right whitespace-nowrap">DEBIT (₹)</th>
                          <th className="py-3.5 px-3 text-right whitespace-nowrap">CREDIT (₹)</th>
                          <th className="py-3.5 px-3 text-right whitespace-nowrap">RUNNING BALANCE (₹)</th>
                          <th className="py-3.5 px-3 text-right whitespace-nowrap">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                        {currentLedgerCustomer?.transactions
                          ?.filter((tx) => {
                            if (individualTxFilter !== 'All Transactions') {
                              if (individualTxFilter === 'Invoice Created' && tx.type !== 'Invoice Created' && tx.type !== 'Invoice') return false;
                              if (individualTxFilter === 'Payment Received' && tx.type !== 'Payment Received' && tx.type !== 'Payment') return false;
                            }
                            if (individualTxSearch.trim()) {
                              const q = individualTxSearch.toLowerCase();
                              return (
                                tx.reference.toLowerCase().includes(q) ||
                                tx.description.toLowerCase().includes(q)
                              );
                            }
                            return true;
                          })
                          .map((tx, idx) => {
                            const isInvoice = tx.type === 'Invoice Created' || tx.type === 'Invoice';
                            return (
                              <tr key={idx} className="hover:bg-slate-50/80 transition">
                                {/* Date & Time */}
                                <td className="py-3.5 px-3 whitespace-nowrap font-medium text-slate-600">
                                  {tx.dateTime || tx.date}
                                </td>

                                {/* Reference */}
                                <td className="py-3.5 px-3 whitespace-nowrap font-bold">
                                  <span className={isInvoice ? 'text-[#BC0118]' : 'text-emerald-600'}>
                                    {tx.reference}
                                  </span>
                                </td>

                                {/* Transaction Type */}
                                <td className="py-3.5 px-3 whitespace-nowrap">
                                  {isInvoice ? (
                                    <span className="inline-block bg-red-50 text-[#BC0118] border border-red-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                                      Invoice Created
                                    </span>
                                  ) : (
                                    <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                                      Payment Received
                                    </span>
                                  )}
                                </td>

                                {/* Description */}
                                <td className="py-3.5 px-3 text-slate-600 max-w-[340px] truncate font-medium">
                                  {tx.description}
                                </td>

                                {/* Debit */}
                                <td className="py-3.5 px-3 text-right whitespace-nowrap font-black text-slate-900">
                                  {tx.debit !== null && tx.debit !== undefined ? `₹${tx.debit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                                </td>

                                {/* Credit */}
                                <td className="py-3.5 px-3 text-right whitespace-nowrap font-black text-emerald-700">
                                  {tx.credit !== null && tx.credit !== undefined ? `₹${tx.credit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                                </td>

                                {/* Running Balance */}
                                <td className="py-3.5 px-3 text-right whitespace-nowrap">
                                  <span className="font-black text-slate-900 block">
                                    ₹{tx.runningBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                  </span>
                                  {tx.note && (
                                    <span className="text-[10px] text-slate-400 font-medium block">
                                      {tx.note}
                                    </span>
                                  )}
                                </td>

                                {/* Actions */}
                                <td className="py-3.5 px-3 text-right whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={() => triggerToast(`Opening ${tx.actionText || (isInvoice ? 'Invoice' : 'Receipt')} for ${tx.reference}...`)}
                                    className="text-[#BC0118] hover:underline font-bold text-xs cursor-pointer"
                                  >
                                    {tx.actionText || (isInvoice ? 'View Invoice' : 'View Receipt')}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>

                  {/* Automated FIFO Allocation Breakdown Box */}
                  <div className="bg-[#F8FAFC] rounded-xl p-3.5 border border-slate-200/90 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-2">
                      <GitBranch className="w-3.5 h-3.5 text-slate-500" />
                      <span>Automated FIFO Allocation Breakdown for PAY-20261016-001 (₹1,000.00):</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                        <span className="text-slate-600">
                          Applied to oldest <strong className="text-slate-800">INV-20261010-001</strong>: <strong className="text-slate-900">₹1,000.00</strong> <span className="text-slate-500 font-normal">(Partially Paid, ₹500 remaining)</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0"></span>
                        <span className="text-slate-600">
                          <strong className="text-slate-800">INV-20261015-002</strong> Balance: <strong className="text-slate-900">₹1,500.00</strong> <span className="text-slate-500 font-normal">(Unpaid)</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#BC0118] shrink-0"></span>
                        <span className="text-slate-600">
                          Current Customer Outstanding: <strong className="text-[#BC0118]">₹2,000.00</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Movements Summary Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-200 text-xs">
                    <div className="font-black text-slate-900 uppercase tracking-wider text-[11px]">
                      TOTAL STATEMENT PERIOD MOVEMENTS:
                    </div>
                    <div className="flex items-center gap-6 sm:gap-10 font-bold">
                      <div>
                        <span className="text-slate-900 font-black text-sm">₹3,000.00</span>
                      </div>
                      <div>
                        <span className="text-emerald-700 font-black text-sm">₹2,000.00</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#BC0118] font-black text-sm">₹2,000.00</span>
                        <span className="text-slate-500 font-semibold text-xs">Total Outstanding</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Filter Controls Bar */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3.5 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-wrap">
                  {/* Search input */}
                  <div className="relative min-w-[320px] flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={ledgerSearchQuery}
                      onChange={(e) => setLedgerSearchQuery(e.target.value)}
                      placeholder="Search for customer Id, Customer Name, Phone Number"
                      className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl pl-9.5 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    />
                  </div>

                  {/* Partner dropdown */}
                  <div className="relative">
                    <select
                      value={ledgerPartnerFilter}
                      onChange={(e) => setLedgerPartnerFilter(e.target.value)}
                      className="w-full sm:w-auto bg-white border border-slate-200 hover:bg-slate-50 pl-3.5 pr-8 py-2 rounded-xl text-xs font-semibold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer shadow-2xs"
                    >
                      <option value="All Partners">All Partners</option>
                      <option value="Rajesh Kumar">Rajesh Kumar (DP-001)</option>
                      <option value="Suresh Babu">Suresh Babu (DP-003)</option>
                      <option value="Mohamed Irfan">Mohamed Irfan (DP-002)</option>
                      <option value="Unassigned">Unassigned</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* Balance dropdown */}
                  <div className="relative">
                    <select
                      value={ledgerBalanceFilter}
                      onChange={(e) => setLedgerBalanceFilter(e.target.value)}
                      className="w-full sm:w-auto bg-white border border-slate-200 hover:bg-slate-50 pl-3.5 pr-8 py-2 rounded-xl text-xs font-semibold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer shadow-2xs"
                    >
                      <option value="Balance: All">Balance: All</option>
                      <option value="Outstanding Only">Has Balance (&gt; ₹0)</option>
                      <option value="Settled Only">Settled (₹0)</option>
                      <option value="Advance Available Only">Advance Available</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* Status dropdown */}
                  <div className="relative">
                    <select
                      value={ledgerStatusFilter}
                      onChange={(e) => setLedgerStatusFilter(e.target.value)}
                      className="w-full sm:w-auto bg-white border border-slate-200 hover:bg-slate-50 pl-3.5 pr-8 py-2 rounded-xl text-xs font-semibold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer shadow-2xs"
                    >
                      <option value="Active">Active</option>
                      <option value="All Statuses">All Statuses</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Reset Filters button */}
                <div className="flex items-center gap-2 shrink-0 self-end lg:self-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setLedgerSearchQuery('');
                      setLedgerPartnerFilter('All Partners');
                      setLedgerBalanceFilter('Balance: All');
                      setLedgerStatusFilter('Active');
                      triggerToast('Customer ledger filters reset');
                    }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition cursor-pointer px-2 py-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Filters</span>
                  </button>
                </div>
              </div>

              {/* Customer Accounts Main Table Card */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                      Customer Accounts
                    </h2>
                    <span className="bg-[#EEF2FF] text-[#3730A3] font-bold text-xs px-2.5 py-0.5 rounded-full border border-indigo-100">
                      {customerLedgerList.length} Registered
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Comprehensive billing ledger balances derived from chronological transactions.
                  </p>
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#EDF2F9] text-slate-500 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-200">
                        <th className="py-3.5 px-3 whitespace-nowrap">CUSTOMER NAME &amp; ID</th>
                        <th className="py-3.5 px-3 whitespace-nowrap">PHONE NUMBER</th>
                        <th className="py-3.5 px-3 whitespace-nowrap">ASSIGNED PARTNER</th>
                        <th className="py-3.5 px-3 text-right whitespace-nowrap">TOTAL INVOICED</th>
                        <th className="py-3.5 px-3 text-right whitespace-nowrap">PAYMENTS RECEIVED</th>
                        <th className="py-3.5 px-3 text-right whitespace-nowrap">OUTSTANDING BALANCE</th>
                        <th className="py-3.5 px-3 text-right whitespace-nowrap">AVAILABLE ADVANCE</th>
                        <th className="py-3.5 px-3 text-center whitespace-nowrap">STATUS</th>
                        <th className="py-3.5 px-3 text-center whitespace-nowrap">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                      {filteredLedgerCustomers.map((cust) => (
                        <tr
                          key={cust.id}
                          className="hover:bg-slate-50/80 transition"
                        >
                          {/* Customer Name & ID */}
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <div className="font-extrabold text-slate-900 leading-tight">
                              {cust.name}
                            </div>
                            <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                              {cust.customerCode}
                            </div>
                          </td>

                          {/* Phone Number */}
                          <td className="py-3.5 px-3 text-slate-600 font-semibold whitespace-nowrap">
                            {cust.phone}
                          </td>

                          {/* Assigned Partner */}
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            {cust.assignedPartner === 'Unassigned' ? (
                              <span className="text-slate-400 font-medium">Unassigned</span>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-800">{cust.assignedPartner}</span>
                                {cust.assignedPartnerCode && (
                                  <span className="text-[11px] text-slate-400 font-medium">
                                    ({cust.assignedPartnerCode})
                                  </span>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Total Invoiced */}
                          <td className="py-3.5 px-3 text-right font-black text-slate-900 whitespace-nowrap">
                            ₹{cust.totalInvoiced.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>

                          {/* Payments Received */}
                          <td className="py-3.5 px-3 text-right font-black text-slate-900 whitespace-nowrap">
                            ₹{cust.paymentsReceived.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>

                          {/* Outstanding Balance */}
                          <td className="py-3.5 px-3 text-right font-black whitespace-nowrap">
                            {cust.outstandingBalance > 0 ? (
                              <span className="text-[#BC0118]">
                                ₹{cust.outstandingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </span>
                            ) : (
                              <span className="text-slate-800">
                                ₹{cust.outstandingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </span>
                            )}
                          </td>

                          {/* Available Advance */}
                          <td className="py-3.5 px-3 text-right whitespace-nowrap">
                            {cust.availableAdvance > 0 ? (
                              <span className="font-black text-emerald-600">
                                ₹{cust.availableAdvance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </span>
                            ) : (
                              <span className="text-slate-400 font-semibold">—</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-3 text-center whitespace-nowrap">
                            {cust.status === 'Outstanding' && (
                              <span className="inline-block bg-red-50 text-red-700 border border-red-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                                Outstanding
                              </span>
                            )}
                            {cust.status === 'Advance Available' && (
                              <span className="inline-block bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                                Advance Available
                              </span>
                            )}
                            {cust.status === 'Settled' && (
                              <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                                Settled
                              </span>
                            )}
                            {cust.status === 'Inactive' && (
                              <span className="inline-block bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                                Inactive
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => setActiveCustomerLedgerId(cust.customerCode)}
                                className="border border-red-200 hover:bg-red-50 text-[#BC0118] font-bold text-xs px-2.5 py-1 rounded-lg transition cursor-pointer whitespace-nowrap"
                              >
                                View Ledger
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedLedgerCustomer(cust)}
                                title="View Statement"
                                className="p-1 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                              >
                                <FileText className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => triggerToast(`Actions for ${cust.name}`)}
                                title="More options"
                                className="p-1 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span>
                      Showing {filteredLedgerCustomers.length > 0 ? 1 : 0} to {filteredLedgerCustomers.length} of {customerLedgerList.length} customers
                    </span>
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
                      &lt; Previous
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
                    <span className="px-1 text-slate-400">...</span>
                    <button
                      type="button"
                      onClick={() => triggerToast('Page 125')}
                      className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer text-xs"
                    >
                      125
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerToast('Next page')}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer text-xs"
                    >
                      Next &gt;
                    </button>
                  </div>
                </div>
              </div>
            </div>
            )
          )}

          {/* Customer Ledger Statement Detail Modal */}
          {selectedLedgerCustomer && (
            <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-black text-slate-900 tracking-tight">
                        {selectedLedgerCustomer.name}
                      </h3>
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {selectedLedgerCustomer.customerCode}
                      </span>
                      {selectedLedgerCustomer.status === 'Outstanding' && (
                        <span className="bg-red-50 text-red-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-red-200">
                          Outstanding
                        </span>
                      )}
                      {selectedLedgerCustomer.status === 'Advance Available' && (
                        <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
                          Advance Available
                        </span>
                      )}
                      {selectedLedgerCustomer.status === 'Settled' && (
                        <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                          Settled
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      Phone: {selectedLedgerCustomer.phone} · Partner: {selectedLedgerCustomer.assignedPartner}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedLedgerCustomer(null)}
                    className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Financial Summary 4 Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-xl p-3">
                    <span className="text-[10px] text-slate-400 font-bold block">Total Invoiced</span>
                    <span className="text-sm font-black text-slate-900 block mt-0.5">
                      ₹{selectedLedgerCustomer.totalInvoiced.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-xl p-3">
                    <span className="text-[10px] text-slate-400 font-bold block">Payments Received</span>
                    <span className="text-sm font-black text-slate-900 block mt-0.5">
                      ₹{selectedLedgerCustomer.paymentsReceived.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className={`rounded-xl p-3 border ${
                    selectedLedgerCustomer.outstandingBalance > 0
                      ? 'bg-red-50/70 border-red-200 text-[#BC0118]'
                      : 'bg-[#F8FAFC] border-slate-200/80 text-slate-900'
                  }`}>
                    <span className="text-[10px] font-bold block opacity-70">Outstanding</span>
                    <span className="text-sm font-black block mt-0.5">
                      ₹{selectedLedgerCustomer.outstandingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className={`rounded-xl p-3 border ${
                    selectedLedgerCustomer.availableAdvance > 0
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-700'
                      : 'bg-[#F8FAFC] border-slate-200/80 text-slate-500'
                  }`}>
                    <span className="text-[10px] font-bold block opacity-70">Available Advance</span>
                    <span className="text-sm font-black block mt-0.5">
                      {selectedLedgerCustomer.availableAdvance > 0
                        ? `₹${selectedLedgerCustomer.availableAdvance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                        : '₹0.00'}
                    </span>
                  </div>
                </div>

                {/* Chronological Ledger Transactions */}
                <div className="space-y-2">
                  <div className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Chronological Ledger Statement
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#EDF2F9] text-slate-500 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-200">
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Type</th>
                          <th className="py-2.5 px-3">Reference</th>
                          <th className="py-2.5 px-3">Description</th>
                          <th className="py-2.5 px-3 text-right">Debit (₹)</th>
                          <th className="py-2.5 px-3 text-right">Credit (₹)</th>
                          <th className="py-2.5 px-3 text-right">Balance (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {selectedLedgerCustomer.transactions.map((tx, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/80">
                            <td className="py-2.5 px-3 whitespace-nowrap text-slate-500">{tx.date}</td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                tx.type === 'Invoice'
                                  ? 'bg-blue-50 text-blue-700'
                                  : tx.type === 'Payment'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}>
                                {tx.type}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap font-bold text-slate-800">{tx.reference}</td>
                            <td className="py-2.5 px-3">{tx.description}</td>
                            <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                              {(tx.debit ?? 0) > 0 ? tx.debit?.toLocaleString('en-IN') : '—'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-emerald-600">
                              {(tx.credit ?? 0) > 0 ? tx.credit?.toLocaleString('en-IN') : '—'}
                            </td>
                            <td className={`py-2.5 px-3 text-right font-black ${
                              tx.runningBalance > 0 ? 'text-[#BC0118]' : 'text-slate-800'
                            }`}>
                              ₹{tx.runningBalance.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => triggerToast(`Downloading PDF statement for ${selectedLedgerCustomer.name}...`)}
                    className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <FileDown className="w-4 h-4 text-slate-600" />
                    <span>Download PDF Statement</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedLedgerCustomer(null)}
                    className="bg-[#BC0118] hover:bg-red-800 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-xs transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
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
