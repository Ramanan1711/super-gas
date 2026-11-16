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
  Zap,
  Sparkles,
  X,
  Plus,
} from 'lucide-react';

export interface InvoiceRecord {
  id: string;
  invoiceNo: string;
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
}

const initialInvoices: InvoiceRecord[] = [
  {
    id: 'inv-1',
    invoiceNo: 'INV-20261024-086',
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

export default function AdminInvoicesPage() {
  const [activeTab, setActiveTab] = useState<'Overview' | 'Invoices' | 'Payments' | 'Cash Reconciliation' | 'Customer Ledger'>('Overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [customerFilter, setCustomerFilter] = useState('All Customers');
  const [partnerFilter, setPartnerFilter] = useState('All Delivery Partners');
  const [statusFilter, setStatusFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [showRecordPaymentModal, setShowRecordPaymentModal] = useState(false);
  const [showInvestigateModal, setShowInvestigateModal] = useState(false);
  const [selectedInvoiceForView, setSelectedInvoiceForView] = useState<InvoiceRecord | null>(null);

  // Record Payment form state
  const [paymentCustomer, setPaymentCustomer] = useState('Sri Krishna Sweets (CUS-00366)');
  const [paymentAmount, setPaymentAmount] = useState('4,000');
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Bank Transfer'>('Cash');
  const [paymentRef, setPaymentRef] = useState('PAY-558802');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredInvoices = useMemo(() => {
    return initialInvoices.filter((inv) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          inv.invoiceNo.toLowerCase().includes(q) ||
          inv.customerName.toLowerCase().includes(q) ||
          inv.customerCode.toLowerCase().includes(q) ||
          inv.deliveryPartnerName.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (statusFilter !== 'All' && inv.status !== statusFilter) {
        return false;
      }
      if (customerFilter !== 'All Customers') {
        if (customerFilter === 'Commercial' && !inv.category.includes('Commercial')) return false;
        if (customerFilter === 'Domestic' && inv.category !== 'Domestic') return false;
      }
      if (partnerFilter !== 'All Delivery Partners') {
        if (!inv.deliveryPartnerName.toLowerCase().includes(partnerFilter.toLowerCase())) return false;
      }
      return true;
    });
  }, [searchQuery, statusFilter, customerFilter, partnerFilter]);

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
          {/* Title Row & Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Invoices &amp; Payments
                </h1>
                <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                  Live Sync Active
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Manage customer invoices, payment collections, outstanding balances, and customer advances with automated FIFO liquidation.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => triggerToast('Exporting billing & collection report...')}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm px-4.5 py-2.5 rounded-xl shadow-2xs transition flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 stroke-[2.2] text-slate-600" />
                <span>Export Report</span>
              </button>

              <button
                type="button"
                onClick={() => setShowRecordPaymentModal(true)}
                className="bg-[#BC0118] hover:bg-red-800 active:scale-98 text-white font-bold text-xs sm:text-sm px-4.5 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
              >
                <CreditCard className="w-4 h-4 stroke-[2.2]" />
                <span>Record Payment</span>
              </button>
            </div>
          </div>

          {/* 4 Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* Card 1: Invoices Today */}
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

            {/* Card 2: Collected Today */}
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
                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md">
                  • ₹28,000 Cash
                </span>
                <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded-md">
                  • ₹14,500 UPI
                </span>
              </div>
            </div>

            {/* Card 3: Outstanding Receivables */}
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

            {/* Card 4: Customer Advances */}
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

          {/* Navigation Tabs */}
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

          {/* Automatic FIFO Payment Allocation Engine Banner */}
          <div className="bg-[#F0F5FF] rounded-[24px] p-6 border border-blue-200/60 shadow-2xs space-y-5">
            {/* Engine Header Row */}
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

            {/* Real-time simulation sub-card */}
            <div className="bg-white rounded-2xl p-5 border border-blue-100 shadow-2xs space-y-4">
              {/* Simulation Header */}
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

              {/* 4 Step Cards Progression */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* Step 1: Oldest */}
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
                    <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                      Date: Oct 19 · Bill: ₹1,500
                    </div>
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

                {/* Step 2: Intermediate */}
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
                    <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                      Date: Oct 21 · Bill: ₹2,200
                    </div>
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

                {/* Step 3: Current */}
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
                    <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                      Date: Oct 24 · Bill: ₹1,100
                    </div>
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

                {/* Step 4: Excess */}
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
                    <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                      No overpayment surplus
                    </div>
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

          {/* Invoices & Delivery Collections Table Section */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-5">
            {/* Section Header */}
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

            {/* Search and Filters Bar */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Search Input */}
              <div className="md:col-span-5 relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by invoice #, customer name, CUS-ID..."
                  className="w-full bg-[#F1F4FA] rounded-xl pl-9.5 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              {/* Customer Category Filter */}
              <div className="md:col-span-3">
                <div className="relative">
                  <select
                    value={customerFilter}
                    onChange={(e) => setCustomerFilter(e.target.value)}
                    className="w-full bg-[#F1F4FA] rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer pr-8"
                  >
                    <option value="All Customers">All Customers (Domestic &amp; Commercial)</option>
                    <option value="Commercial">Commercial Only</option>
                    <option value="Domestic">Domestic Only</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Delivery Partner Filter */}
              <div className="md:col-span-2">
                <div className="relative">
                  <select
                    value={partnerFilter}
                    onChange={(e) => setPartnerFilter(e.target.value)}
                    className="w-full bg-[#F1F4FA] rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer pr-8"
                  >
                    <option value="All Delivery Partners">All Delivery Partners</option>
                    <option value="Rajesh Kumar">Rajesh Kumar (DP-001)</option>
                    <option value="Mohamed Irfan">Mohamed Irfan (DP-002)</option>
                    <option value="Suresh Babu">Suresh Babu (DP-003)</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Status Filter */}
              <div className="md:col-span-2">
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full bg-[#F1F4FA] rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer pr-8"
                  >
                    <option value="All">Status: All</option>
                    <option value="Paid">Paid</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="Unpaid">Unpaid</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Table */}
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
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition">
                      {/* Invoice Details */}
                      <td className="py-3 px-4">
                        <div className="font-extrabold text-slate-900">{inv.invoiceNo}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{inv.time}</div>
                      </td>

                      {/* Customer & Category */}
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

                      {/* Delivery Partner */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{inv.deliveryPartnerName}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {inv.deliveryPartnerCode} · {inv.vehicle}
                        </div>
                      </td>

                      {/* Cylinders */}
                      <td className="py-3 px-4">
                        {inv.cylinders.map((cyl, idx) => (
                          <div key={idx} className="text-slate-700 font-medium text-xs leading-snug">
                            {cyl}
                          </div>
                        ))}
                      </td>

                      {/* Invoice Amt */}
                      <td className="py-3 px-4 font-black text-slate-900">
                        ₹{inv.invoiceAmount.toLocaleString()}
                      </td>

                      {/* Paid */}
                      <td className="py-3 px-4 font-black text-emerald-700">
                        ₹{inv.paidAmount.toLocaleString()}
                      </td>

                      {/* Balance Due */}
                      <td className="py-3 px-4">
                        {inv.balanceDue > 0 ? (
                          <span className="font-black text-red-600">
                            ₹{inv.balanceDue.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-bold">₹0</span>
                        )}
                      </td>

                      {/* Payment Status */}
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

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-2 text-slate-500">
                          <button
                            type="button"
                            onClick={() => setSelectedInvoiceForView(inv)}
                            className="p-1 hover:text-slate-900 hover:bg-slate-100 rounded transition cursor-pointer"
                            title="View Invoice"
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
                          <button
                            type="button"
                            onClick={() => triggerToast(`Opening details for ${inv.customerName}`)}
                            className="p-1 hover:text-slate-900 hover:bg-slate-100 rounded transition cursor-pointer"
                            title="External Customer Record"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Pagination Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 text-xs text-slate-500 font-medium">
              <div>
                Showing <strong className="text-slate-900">1 to 5</strong> of <strong className="text-slate-900">24</strong> invoices today (Total value: ₹34,400)
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => triggerToast('Page 1 active')}
                  className="px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Previous
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
                <button
                  type="button"
                  onClick={() => triggerToast('Navigating to next page')}
                  className="px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Split: Left Box & Right Boxes */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Box: Partner Cash Reconciliation (Cols 7) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
              {/* Header */}
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
                  title="Refresh"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Verify all physical cash handovers by delivery partners at depot check-in independent of customer invoice allocation
              </p>

              {/* 3 Partner Rows */}
              <div className="space-y-3 pt-1">
                {/* Partner 1: Rajesh Kumar */}
                <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 font-black text-xs flex items-center justify-center shrink-0">
                      DP1
                    </div>
                    <div>
                      <div className="font-black text-slate-900 text-sm">Rajesh Kumar</div>
                      <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                        ID: DP-001 · 12 Cash Deliveries
                      </div>
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
                    <div className="shrink-0">
                      <span className="bg-emerald-100 text-emerald-800 font-extrabold text-xs px-3 py-1 rounded-lg flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                        Verified
                      </span>
                    </div>
                  </div>
                </div>

                {/* Partner 2: Suresh Babu */}
                <div className="bg-[#FFF8F8] rounded-2xl p-4 border border-red-200/90 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-100 text-red-800 font-black text-xs flex items-center justify-center shrink-0">
                      DP3
                    </div>
                    <div>
                      <div className="font-black text-slate-900 text-sm">Suresh Babu</div>
                      <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                        ID: DP-003 · 14 Cash Deliveries
                      </div>
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
                      <span className="bg-red-50 text-red-700 font-extrabold text-xs px-2.5 py-1 rounded-lg border border-red-200 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                        Discrepancy
                      </span>
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

                {/* Partner 3: Mohamed Irfan */}
                <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 font-black text-xs flex items-center justify-center shrink-0">
                      DP2
                    </div>
                    <div>
                      <div className="font-black text-slate-900 text-sm">Mohamed Irfan</div>
                      <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                        ID: DP-002 · In Route
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-center sm:text-right">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Reported</div>
                      <div className="font-extrabold text-slate-800">₹12,000</div>
                    </div>
                    <div className="text-center sm:text-right">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Counted</div>
                      <div className="text-slate-400 font-bold">Awaiting Depot</div>
                    </div>
                    <div className="text-center sm:text-right">
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Diff</div>
                      <div className="text-slate-400 font-bold">--</div>
                    </div>
                    <div className="shrink-0">
                      <span className="bg-slate-100 text-slate-500 font-extrabold text-xs px-3 py-1 rounded-lg flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        Awaiting Check-in
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: 2 Stacked Cards (Cols 5) */}
            <div className="lg:col-span-5 space-y-5">
              {/* Card 1: Payment Methods Today */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900">Payment Methods Today</h3>
                  <span className="text-xs font-black text-[#BC0118]">Total: ₹42,500</span>
                </div>

                <div className="space-y-3">
                  {/* Row 1: Cash Collections */}
                  <div className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm bg-slate-800"></span>
                      <span className="text-slate-700">Cash Collections (66%)</span>
                    </div>
                    <span className="text-slate-900 font-black">₹28,000</span>
                  </div>

                  {/* Dual Segment Progress Bar */}
                  <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex">
                    <div className="h-full bg-slate-800" style={{ width: '66%' }}></div>
                    <div className="h-full bg-[#E81B24]" style={{ width: '34%' }}></div>
                  </div>

                  {/* Row 2: UPI / Digital QR */}
                  <div className="flex items-center justify-between text-xs font-bold pt-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm bg-[#E81B24]"></span>
                      <span className="text-slate-700">UPI / Digital QR (34%)</span>
                    </div>
                    <span className="text-slate-900 font-black">₹14,500</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Customer Advances Pool */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Customer Advances Pool</h3>
                    <p className="text-[11px] text-slate-400 font-medium">
                      ₹12,500 available across 8 accounts
                    </p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-md">
                    Auto-Apply
                  </span>
                </div>

                {/* List of advances */}
                <div className="space-y-2.5 divide-y divide-slate-100 pt-1">
                  {/* Item 1 */}
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

                  {/* Item 2 */}
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

                  {/* Item 3 */}
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <div className="text-xs font-bold text-slate-900">City Cafe &amp; Bakery</div>
                      <div className="text-[10px] text-slate-400 font-medium">CUS-00411 · Pre-paid Balance</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-emerald-600">₹2,800</div>
                      <div className="text-[10px] text-slate-400 font-medium">Next bill priority</div>
                    </div>
                  </div>
                </div>

                {/* Footer Link */}
                <div className="pt-2 text-center border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => triggerToast('Viewing all 8 advance customer accounts')}
                    className="text-xs font-bold text-slate-700 hover:text-slate-900 transition cursor-pointer"
                  >
                    View All 8 Advance Accounts &gt;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL 1: Record Payment Modal */}
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
                  <option value="Hotel Annapoorna (CUS-00542)">Hotel Annapoorna (CUS-00542) · ₹5,580 total due</option>
                  <option value="Priya Enterprises (CUS-00830)">Priya Enterprises (CUS-00830) · ₹750 total due</option>
                  <option value="Rajesh Kumar (CUS-00124)">Rajesh Kumar (CUS-00124) · ₹200 total due</option>
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

              {/* FIFO Allocation Preview Box */}
              <div className="bg-[#EDF4FF] rounded-2xl p-4 border border-blue-200/70 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
                    FIFO Auto-Liquidation Plan
                  </span>
                  <span>₹{paymentAmount} to Allocate</span>
                </div>
                <div className="text-[11px] text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span>1. INV-20261019-050 (Oct 19)</span>
                    <span className="font-bold text-emerald-700">₹1,500 (Cleared)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>2. INV-20261021-065 (Oct 21)</span>
                    <span className="font-bold text-emerald-700">₹2,200 (Cleared)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>3. INV-20261024-091 (Oct 24)</span>
                    <span className="font-bold text-blue-700">₹300 (Partial, ₹800 left)</span>
                  </div>
                </div>
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

      {/* MODAL 2: Investigate Cash Discrepancy Modal */}
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

              <div className="text-xs text-slate-600 space-y-1.5">
                <div className="font-bold text-slate-800">Possible Contributing Orders:</div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>• Hotel Annapoorna (CUS-00542)</span>
                    <span className="font-semibold text-slate-700">₹5,580 (Marked Unpaid / Pending)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Sri Krishna Sweets (CUS-00366)</span>
                    <span className="font-semibold text-slate-700">₹3,700 (Received via UPI)</span>
                  </div>
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

      {/* MODAL 3: View Invoice Details Modal */}
      {selectedInvoiceForView && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">{selectedInvoiceForView.invoiceNo}</h3>
                <p className="text-xs text-slate-400 font-medium">{selectedInvoiceForView.time}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInvoiceForView(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Customer:</span>
                <span className="font-extrabold text-slate-900">
                  {selectedInvoiceForView.customerName} ({selectedInvoiceForView.customerCode})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Delivery Partner:</span>
                <span className="font-bold text-slate-800">
                  {selectedInvoiceForView.deliveryPartnerName} {selectedInvoiceForView.vehicle}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Cylinders:</span>
                <span className="font-bold text-slate-800">{selectedInvoiceForView.cylinders.join(', ')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Invoice Amount:</span>
                <span className="font-black text-slate-900">₹{selectedInvoiceForView.invoiceAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Paid Amount:</span>
                <span className="font-black text-emerald-700">₹{selectedInvoiceForView.paidAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Balance Due:</span>
                <span className="font-black text-red-600">₹{selectedInvoiceForView.balanceDue.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSelectedInvoiceForView(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerToast(`Printed ${selectedInvoiceForView.invoiceNo}`);
                  setSelectedInvoiceForView(null);
                }}
                className="px-4 py-2 bg-[#BC0118] hover:bg-red-800 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>
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
