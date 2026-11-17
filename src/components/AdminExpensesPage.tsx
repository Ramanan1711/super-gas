'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import AdminSidebar from './AdminSidebar';
import {
  Search,
  Bell,
  ChevronDown,
  Download,
  Plus,
  Calendar,
  Truck,
  Building2,
  Clock,
  Receipt,
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  Smartphone,
  User,
  ShieldAlert,
  Info,
  Check,
  X,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';

export interface PendingClaim {
  id: string;
  claimId: string;
  partnerName: string;
  partnerCode: string;
  initials: string;
  avatarBg: string;
  category: 'Fuel' | 'Vehicle Repair' | 'Parking' | 'Maintenance' | 'Toll' | 'Meals';
  description: string;
  subDescription: string;
  amount: number;
  time: string;
  status: 'Pending Approval' | 'Approved' | 'Rejected';
  stationName: string;
  stationOutlet: string;
  fuelQuantity?: string;
  terminalTimestamp: string;
  receiptType: string;
}

export interface ExpenseRecord {
  id: string;
  expenseId: string;
  partnerName: string;
  partnerCode: string;
  category: 'Fuel' | 'Vehicle Repair' | 'Parking' | 'Maintenance' | 'Other' | 'Utilities' | 'Rent' | 'Supplies';
  description: string;
  amount: number;
  isRedAmount?: boolean;
  expenseDate: string;
  source: 'App Submission' | 'Admin Recorded';
  approvalStatus: 'Approved' | 'Pending Approval' | 'Rejected (Policy)' | 'Under Review';
  paymentStatus: 'Reimbursed (Bank)' | 'Paid (Cash)' | 'Reimbursed (UPI)' | 'Disallowed' | 'Unpaid';
  type: 'delivery' | 'agency' | 'other';
}

const initialPendingClaims: PendingClaim[] = [
  {
    id: 'claim-1',
    claimId: 'EXP-DP-PENDING-01',
    partnerName: 'Rajesh Kumar',
    partnerCode: 'DP-001',
    initials: 'RK',
    avatarBg: 'bg-red-100 text-[#BC0118]',
    category: 'Fuel',
    description: 'Diesel Top-up for Van 04',
    subDescription: 'Trip #SG-8812',
    amount: 1200,
    time: '24 Oct, 09:30 AM',
    status: 'Pending Approval',
    stationName: 'HINDUSTAN PETROLEUM',
    stationOutlet: 'Outlet #88219 - North Bypass',
    fuelQuantity: '13.36 Litres',
    terminalTimestamp: '24 Oct 2026, 09:28:44 IST',
    receiptType: 'Fuel Dispenser POS Slip',
  },
  {
    id: 'claim-2',
    claimId: 'EXP-DP-PENDING-02',
    partnerName: 'Suresh Babu',
    partnerCode: 'DP-003',
    initials: 'SB',
    avatarBg: 'bg-amber-100 text-amber-800',
    category: 'Vehicle Repair',
    description: 'Puncture Repair & Valve Replacement',
    subDescription: 'Rear Tyre #2',
    amount: 450,
    time: '24 Oct, 11:15 AM',
    status: 'Pending Approval',
    stationName: 'SIMMAKKAL TYRE CARE',
    stationOutlet: 'Shop #14, West Veli Street',
    terminalTimestamp: '24 Oct 2026, 11:12:10 IST',
    receiptType: 'Manual Bill / Cash Memo',
  },
  {
    id: 'claim-3',
    claimId: 'EXP-DP-PENDING-03',
    partnerName: 'Mohamed Irfan',
    partnerCode: 'DP-002',
    initials: 'MI',
    avatarBg: 'bg-blue-100 text-blue-800',
    category: 'Parking',
    description: 'Commercial Toll & Depot Pass',
    subDescription: 'Highway Express Gate',
    amount: 250,
    time: '24 Oct, 01:20 PM',
    status: 'Pending Approval',
    stationName: 'FASTAG TOLL PLAZA',
    stationOutlet: 'Madurai Ring Road Plaza #03',
    terminalTimestamp: '24 Oct 2026, 01:18:05 IST',
    receiptType: 'Digital Toll Receipt',
  },
  {
    id: 'claim-4',
    claimId: 'EXP-DP-PENDING-04',
    partnerName: 'Ramesh Varma',
    partnerCode: 'DP-006',
    initials: 'RV',
    avatarBg: 'bg-rose-100 text-rose-800',
    category: 'Maintenance',
    description: 'Engine Oil Top-Up & Brake Inspection',
    subDescription: 'Castrol 20W40 1L',
    amount: 1300,
    time: '24 Oct, 02:45 PM',
    status: 'Pending Approval',
    stationName: 'SRI BALAJI AUTO SPARES',
    stationOutlet: 'Depot Link Road, Madurai',
    terminalTimestamp: '24 Oct 2026, 02:42:30 IST',
    receiptType: 'Tax Invoice / GST Memo',
  },
];

const initialExpenseRecords: ExpenseRecord[] = [
  {
    id: 'exp-01',
    expenseId: 'EXP-DP-20261024-01',
    partnerName: 'Rajesh Kumar',
    partnerCode: 'DP-001',
    category: 'Fuel',
    description: 'Diesel 15L Van 04',
    amount: 1450,
    expenseDate: '24 Oct 2026',
    source: 'App Submission',
    approvalStatus: 'Approved',
    paymentStatus: 'Reimbursed (Bank)',
    type: 'delivery',
  },
  {
    id: 'exp-02',
    expenseId: 'EXP-DP-20261024-02',
    partnerName: 'Suresh Babu',
    partnerCode: 'DP-003',
    category: 'Vehicle Repair',
    description: 'Hydraulic Lift Grease & Cable',
    amount: 650,
    expenseDate: '24 Oct 2026',
    source: 'Admin Recorded',
    approvalStatus: 'Approved',
    paymentStatus: 'Paid (Cash)',
    type: 'delivery',
  },
  {
    id: 'exp-03',
    expenseId: 'EXP-DP-20261023-04',
    partnerName: 'Mohamed Irfan',
    partnerCode: 'DP-002',
    category: 'Fuel',
    description: 'Diesel Top-up #SG-9011',
    amount: 1200,
    expenseDate: '23 Oct 2026',
    source: 'App Submission',
    approvalStatus: 'Approved',
    paymentStatus: 'Reimbursed (UPI)',
    type: 'delivery',
  },
  {
    id: 'exp-04',
    expenseId: 'EXP-DP-20261023-08',
    partnerName: 'Ravi Shanker',
    partnerCode: 'DP-004',
    category: 'Other',
    description: 'Unauthorized route detour lunch',
    amount: 500,
    isRedAmount: true,
    expenseDate: '23 Oct 2026',
    source: 'App Submission',
    approvalStatus: 'Rejected (Policy)',
    paymentStatus: 'Disallowed',
    type: 'delivery',
  },
  {
    id: 'exp-05',
    expenseId: 'EXP-DP-20261024-09',
    partnerName: 'Ramesh Varma',
    partnerCode: 'DP-006',
    category: 'Maintenance',
    description: 'Brake Pad Adjustment',
    amount: 1100,
    expenseDate: '24 Oct 2026',
    source: 'App Submission',
    approvalStatus: 'Pending Approval',
    paymentStatus: 'Unpaid',
    type: 'delivery',
  },
  {
    id: 'exp-06',
    expenseId: 'EXP-AG-20261024-11',
    partnerName: 'Agency Central',
    partnerCode: 'HQ-HUB',
    category: 'Utilities',
    description: 'Depot 3-Phase Electricity Bill Sub-meter',
    amount: 5790,
    expenseDate: '24 Oct 2026',
    source: 'Admin Recorded',
    approvalStatus: 'Approved',
    paymentStatus: 'Paid (Cash)',
    type: 'agency',
  },
  {
    id: 'exp-07',
    expenseId: 'EXP-AG-20261022-03',
    partnerName: 'HQ Facility',
    partnerCode: 'HQ-HUB',
    category: 'Supplies',
    description: 'Safety Seals & Brass Valve Rings (Pack of 500)',
    amount: 6610,
    expenseDate: '22 Oct 2026',
    source: 'Admin Recorded',
    approvalStatus: 'Approved',
    paymentStatus: 'Reimbursed (Bank)',
    type: 'agency',
  },
  {
    id: 'exp-08',
    expenseId: 'EXP-OT-20261020-01',
    partnerName: 'Office Admin',
    partnerCode: 'ADMIN-01',
    category: 'Other',
    description: 'Dispatch Room Tea, Coffee & Drinking Water',
    amount: 1250,
    expenseDate: '20 Oct 2026',
    source: 'Admin Recorded',
    approvalStatus: 'Approved',
    paymentStatus: 'Paid (Cash)',
    type: 'other',
  },
];

export default function AdminExpensesPage() {
  const [pendingClaims, setPendingClaims] = useState<PendingClaim[]>(initialPendingClaims);
  const [selectedClaimId, setSelectedClaimId] = useState<string>('claim-1');
  const [expenseRecords, setExpenseRecords] = useState<ExpenseRecord[]>(initialExpenseRecords);
  const [activeSubTab, setActiveSubTab] = useState<'delivery' | 'agency' | 'other'>('delivery');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Table Filters
  const [tableSearch, setTableSearch] = useState('');
  const [partnerFilter, setPartnerFilter] = useState('All Delivery Partners');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [approvalStatusFilter, setApprovalStatusFilter] = useState('All Approval Status');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All Payment Status');

  // Modals
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('Exceeds Daily Route Fuel Allowance');
  const [rejectCustomNote, setRejectCustomNote] = useState('');
  const [inspectedExpenseRecord, setInspectedExpenseRecord] = useState<ExpenseRecord | null>(null);

  // Add Expense Form State
  const [addExpenseCategory, setAddExpenseCategory] = useState<'Fuel' | 'Vehicle Repair' | 'Maintenance' | 'Other'>('Fuel');
  const [addExpensePartner, setAddExpensePartner] = useState('Rajesh Kumar (DP-001)');
  const [addExpenseAmount, setAddExpenseAmount] = useState('');
  const [addExpenseDesc, setAddExpenseDesc] = useState('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const selectedClaim = useMemo(() => {
    return pendingClaims.find((c) => c.id === selectedClaimId) || pendingClaims[0];
  }, [pendingClaims, selectedClaimId]);

  // Filtered expense table rows
  const filteredExpenseRecords = useMemo(() => {
    return expenseRecords.filter((rec) => {
      // Subtab filter
      if (rec.type !== activeSubTab) return false;

      // Table search
      if (tableSearch.trim()) {
        const q = tableSearch.toLowerCase();
        const match =
          rec.expenseId.toLowerCase().includes(q) ||
          rec.partnerName.toLowerCase().includes(q) ||
          rec.partnerCode.toLowerCase().includes(q) ||
          rec.description.toLowerCase().includes(q);
        if (!match) return false;
      }

      // Partner filter
      if (partnerFilter !== 'All Delivery Partners') {
        if (!rec.partnerName.toLowerCase().includes(partnerFilter.toLowerCase())) return false;
      }

      // Category filter
      if (categoryFilter !== 'All Categories') {
        if (rec.category !== categoryFilter) return false;
      }

      // Approval filter
      if (approvalStatusFilter !== 'All Approval Status') {
        if (rec.approvalStatus !== approvalStatusFilter) return false;
      }

      // Payment filter
      if (paymentStatusFilter !== 'All Payment Status') {
        if (rec.paymentStatus !== paymentStatusFilter) return false;
      }

      return true;
    });
  }, [expenseRecords, activeSubTab, tableSearch, partnerFilter, categoryFilter, approvalStatusFilter, paymentStatusFilter]);

  const handleApproveCurrentClaim = () => {
    if (!selectedClaim) return;
    const currentId = selectedClaim.id;

    // Add to approved records
    const newRecord: ExpenseRecord = {
      id: `exp-${Date.now()}`,
      expenseId: selectedClaim.claimId.replace('PENDING', '20261024'),
      partnerName: selectedClaim.partnerName,
      partnerCode: selectedClaim.partnerCode,
      category: selectedClaim.category as ExpenseRecord['category'],
      description: selectedClaim.description,
      amount: selectedClaim.amount,
      expenseDate: '24 Oct 2026',
      source: 'App Submission',
      approvalStatus: 'Approved',
      paymentStatus: 'Reimbursed (Bank)',
      type: 'delivery',
    };

    setExpenseRecords((prev) => [newRecord, ...prev]);
    setPendingClaims((prev) => prev.filter((c) => c.id !== currentId));
    triggerToast(`Approved claim ${selectedClaim.claimId} (₹${selectedClaim.amount.toLocaleString('en-IN')}) for ${selectedClaim.partnerName}`);
    if (pendingClaims.length > 1) {
      const next = pendingClaims.find((c) => c.id !== currentId);
      if (next) setSelectedClaimId(next.id);
    }
  };

  const handleConfirmRejectClaim = () => {
    if (!selectedClaim) return;
    const currentId = selectedClaim.id;

    const newRecord: ExpenseRecord = {
      id: `exp-${Date.now()}`,
      expenseId: selectedClaim.claimId.replace('PENDING', '20261024'),
      partnerName: selectedClaim.partnerName,
      partnerCode: selectedClaim.partnerCode,
      category: selectedClaim.category as ExpenseRecord['category'],
      description: `${selectedClaim.description} · Disallowed: ${rejectReason}`,
      amount: selectedClaim.amount,
      isRedAmount: true,
      expenseDate: '24 Oct 2026',
      source: 'App Submission',
      approvalStatus: 'Rejected (Policy)',
      paymentStatus: 'Disallowed',
      type: 'delivery',
    };

    setExpenseRecords((prev) => [newRecord, ...prev]);
    setPendingClaims((prev) => prev.filter((c) => c.id !== currentId));
    setShowRejectModal(false);
    triggerToast(`Rejected claim ${selectedClaim.claimId}: ${rejectReason}`);
    if (pendingClaims.length > 1) {
      const next = pendingClaims.find((c) => c.id !== currentId);
      if (next) setSelectedClaimId(next.id);
    }
  };

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addExpenseAmount.trim()) return;

    const amt = parseFloat(addExpenseAmount.replace(/,/g, '')) || 0;
    const newRecord: ExpenseRecord = {
      id: `exp-${Date.now()}`,
      expenseId: `EXP-REC-${Date.now().toString().slice(-6)}`,
      partnerName: addExpensePartner.split(' (')[0],
      partnerCode: addExpensePartner.includes('(') ? addExpensePartner.split('(')[1].replace(')', '') : 'DP-001',
      category: addExpenseCategory,
      description: addExpenseDesc || `${addExpenseCategory} recorded by Admin`,
      amount: amt,
      expenseDate: '24 Oct 2026',
      source: 'Admin Recorded',
      approvalStatus: 'Approved',
      paymentStatus: 'Paid (Cash)',
      type: 'delivery',
    };

    setExpenseRecords((prev) => [newRecord, ...prev]);
    setShowAddExpenseModal(false);
    setAddExpenseAmount('');
    setAddExpenseDesc('');
    triggerToast(`Added expense of ₹${amt.toLocaleString('en-IN')} for ${newRecord.partnerName}`);
  };

  const handleExportCSV = () => {
    const headers = [
      'Expense ID',
      'Partner Name',
      'Partner Code',
      'Category',
      'Description',
      'Amount',
      'Expense Date',
      'Source',
      'Approval Status',
      'Payment Status',
    ];

    const rows = filteredExpenseRecords.map((r) => [
      r.expenseId,
      r.partnerName,
      r.partnerCode,
      r.category,
      `"${r.description}"`,
      r.amount.toString(),
      r.expenseDate,
      r.source,
      r.approvalStatus,
      r.paymentStatus,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `supergas_expenses_${activeSubTab}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Expenses CSV exported successfully');
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
            <span className="font-bold text-slate-800">Expenses</span>
          </div>

          {/* Right Header Status, Alerts & Admin Profile */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Agency: Operational
            </div>

            <button
              type="button"
              onClick={() => triggerToast('4 pending operational claims awaiting review')}
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

        {/* Page Content Body */}
        <main className="p-6 sm:p-8 space-y-6 max-w-[1600px] w-full mx-auto pb-16">
          {/* Supertitle & Title Header Row */}
          <div>
            <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              <span>FINANCIAL OPERATIONS</span>
              <span className="text-[#BC0118]">▪</span>
              <span className="text-slate-700 font-bold">Ledger 2026.4</span>
            </div>

            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mt-1">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Expenses
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                  Manage delivery partner expenses, agency operating costs, and miscellaneous expenses from one centralized ledger.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 stroke-[2.2] text-slate-600" />
                  <span>Export CSV / PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => triggerToast('Selected date: Today (24 Oct 2026)')}
                  className="bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-2xs transition flex items-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Today (24 Oct 2026)</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(true)}
                  className="bg-[#BC0118] hover:bg-red-800 active:scale-98 text-white font-extrabold text-xs px-4.5 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Add Expense</span>
                </button>
              </div>
            </div>
          </div>

          {/* Top 3 KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: DELIVERY PARTNER EXPENSES TODAY */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  DELIVERY PARTNER EXPENSES TODAY
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  ₹4,850.00
                </div>
                <div className="flex items-center justify-between mt-2 pt-1 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Approved across 6 active drivers today</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Strictly isolates pending &amp; rejected claims
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: AGENCY EXPENSES TODAY */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  AGENCY EXPENSES TODAY
                </span>
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  ₹12,400.00
                </div>
                <div className="flex items-center justify-between mt-2 pt-1 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                    <span>Operational agency costs recorded today</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Hub power, cylinder valve maintenance &amp; safety ops
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: PENDING APPROVAL */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  PENDING APPROVAL
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {pendingClaims.length} Claims
                  </span>
                  <span className="text-sm font-bold text-slate-500">
                    (₹{pendingClaims.reduce((acc, c) => acc + c.amount, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })})
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-amber-800 font-medium mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  <span>Awaiting Admin verification · Action required</span>
                </div>
                <div className="flex items-center justify-between mt-2 pt-1 text-xs">
                  <a
                    href="#awaiting-queue"
                    className="text-[#BC0118] font-bold hover:underline cursor-pointer"
                  >
                    Click to review queue ↓
                  </a>
                  <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {pendingClaims.length} Urgent
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Section: Delivery Partners Awaiting Approval & Claim Review */}
          <div id="awaiting-queue" className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column: Awaiting Approval Queue (8 cols) */}
            <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                    <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                      Delivery Partners Awaiting Approval
                    </h2>
                    <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-2.5 py-0.5 rounded-md">
                      {pendingClaims.length} Pending Claims
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Review and approve operational claims submitted by delivery partners from their handheld terminals.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-bold">
                  <span className="text-slate-400 font-medium text-[11px]">Auto-batch approval:</span>
                  <button
                    type="button"
                    onClick={() => triggerToast('Select claims using checkboxes for bulk approval')}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 transition cursor-pointer"
                  >
                    Approve Selected (0)
                  </button>
                </div>
              </div>

              {/* Claims Queue Table */}
              {pendingClaims.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2 opacity-80" />
                  <p className="font-bold text-slate-700">All pending claims cleared!</p>
                  <p className="text-slate-400 mt-0.5">No delivery partner expense claims are awaiting verification.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#EDF2F9] text-slate-500 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-200">
                        <th className="py-3 px-3.5 whitespace-nowrap">PARTNER</th>
                        <th className="py-3 px-3 whitespace-nowrap">CATEGORY</th>
                        <th className="py-3 px-3.5 whitespace-nowrap">DESCRIPTION</th>
                        <th className="py-3 px-3.5 text-right whitespace-nowrap">AMOUNT</th>
                        <th className="py-3 px-3 whitespace-nowrap">TIME</th>
                        <th className="py-3 px-3 text-center whitespace-nowrap">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                      {pendingClaims.map((claim) => {
                        const isSelected = selectedClaim?.id === claim.id;
                        return (
                          <tr
                            key={claim.id}
                            onClick={() => setSelectedClaimId(claim.id)}
                            className={`cursor-pointer transition ${
                              isSelected
                                ? 'bg-amber-50/50 hover:bg-amber-50/80 ring-1 ring-inset ring-amber-300'
                                : 'hover:bg-slate-50/80'
                            }`}
                          >
                            {/* Partner Info */}
                            <td className="py-3 px-3.5 whitespace-nowrap">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${claim.avatarBg}`}
                                >
                                  {claim.initials}
                                </div>
                                <div>
                                  <div className="font-extrabold text-slate-900 leading-tight">
                                    {claim.partnerName}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                                    {claim.partnerCode}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Category Badge */}
                            <td className="py-3 px-3 whitespace-nowrap">
                              <span className="inline-block bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                                {claim.category}
                              </span>
                            </td>

                            {/* Description */}
                            <td className="py-3 px-3.5 max-w-[280px]">
                              <div className="font-bold text-slate-800 leading-snug">
                                {claim.description}
                              </div>
                              <div className="text-[11px] text-slate-400 font-medium leading-tight mt-0.5">
                                {claim.subDescription}
                              </div>
                            </td>

                            {/* Amount */}
                            <td className="py-3 px-3.5 text-right whitespace-nowrap font-black text-slate-900 text-sm">
                              ₹{claim.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>

                            {/* Time */}
                            <td className="py-3 px-3 whitespace-nowrap text-slate-500 font-medium text-[11px]">
                              {claim.time}
                            </td>

                            {/* Status */}
                            <td className="py-3 px-3 text-center whitespace-nowrap">
                              <span className="inline-block bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                                Pending Approval
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Right Column: Claim Review Inspector Card (4 cols) */}
            <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 flex flex-col justify-between space-y-4">
              {selectedClaim ? (
                <>
                  <div>
                    {/* Header */}
                    <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                      <Receipt className="w-4 h-4 text-[#BC0118]" />
                      <span className="font-extrabold text-xs text-slate-900">
                        Claim Review: {selectedClaim.claimId}
                      </span>
                    </div>

                    {/* Outlet & Amount */}
                    <div className="flex items-start justify-between gap-2 mt-3">
                      <div>
                        <div className="font-black text-slate-900 text-xs uppercase tracking-wide">
                          {selectedClaim.stationName}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                          {selectedClaim.stationOutlet}
                        </div>
                      </div>
                      <div className="text-xl font-black text-[#BC0118]">
                        ₹{selectedClaim.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    {/* Receipt Image Photo Card */}
                    <div className="mt-4 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shadow-inner relative group">
                      {/* Realistic thermal slip design representation */}
                      <div className="bg-[#FAF7F0] p-4 text-slate-800 font-mono text-[10px] leading-tight space-y-1.5 shadow-md">
                        <div className="text-center font-bold tracking-widest text-[11px] border-b border-dashed border-slate-400 pb-1.5">
                          {selectedClaim.stationName}
                        </div>
                        <div className="text-center text-[9px] text-slate-500">
                          {selectedClaim.stationOutlet}
                        </div>
                        <div className="text-center text-[9px] text-slate-500 border-b border-dashed border-slate-300 pb-1">
                          GSTIN: 33AAACH1234F1Z8 · POS TX #48921
                        </div>

                        <div className="pt-1 flex justify-between">
                          <span>DATE: 24/10/2026</span>
                          <span>TIME: 09:28:44</span>
                        </div>
                        <div className="flex justify-between">
                          <span>VEHICLE: TN 58 AX 4821</span>
                          <span>PUMP NO: 04</span>
                        </div>
                        <div className="flex justify-between border-b border-dashed border-slate-300 pb-1">
                          <span>PRODUCT: HIGH SPEED DIESEL</span>
                          <span>NOZ NO: 02</span>
                        </div>

                        <div className="flex justify-between font-bold pt-0.5">
                          <span>VOLUME (LTR):</span>
                          <span>{selectedClaim.fuelQuantity || '13.36 L'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>RATE (₹/LTR):</span>
                          <span>₹89.82</span>
                        </div>
                        <div className="flex justify-between font-extrabold text-sm text-slate-900 border-t border-b border-slate-800 py-1 my-1">
                          <span>TOTAL AMOUNT:</span>
                          <span>₹{selectedClaim.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>

                        <div className="text-center text-[9px] text-slate-400 pt-1 tracking-wider">
                          PAYMENT: PETRO FLEET CARD VERIFIED
                        </div>
                        <div className="flex justify-center pt-1">
                          {/* Simulated Barcode */}
                          <div className="h-4 w-3/4 bg-[repeating-linear-gradient(90deg,#1e293b,#1e293b_2px,transparent_2px,transparent_4px)]"></div>
                        </div>
                      </div>

                      <div className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded">
                        Tap to Expand
                      </div>
                    </div>

                    {/* Receipt Meta Rows */}
                    <div className="mt-4 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="font-medium text-slate-500">Driver:</span>
                        <span className="font-bold text-slate-900">
                          {selectedClaim.partnerName} ({selectedClaim.partnerCode})
                        </span>
                      </div>
                      {selectedClaim.fuelQuantity && (
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="font-medium text-slate-500">Fuel Quantity:</span>
                          <span className="font-bold text-slate-900">{selectedClaim.fuelQuantity}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="font-medium text-slate-500">Terminal Timestamp:</span>
                        <span className="font-bold text-slate-900">{selectedClaim.terminalTimestamp}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      onClick={handleApproveCurrentClaim}
                      className="w-full bg-[#059669] hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Approve Claim (₹{selectedClaim.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowRejectModal(true)}
                      className="w-full border border-red-200 hover:bg-red-50 text-[#BC0118] font-bold text-xs py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject Claim (Reason Required)</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Select a claim from the queue to inspect receipt
                </div>
              )}
            </div>
          </div>

          {/* Bottom Section: Tabs & Expenses Register Table */}
          <div className="space-y-4">
            {/* Sub-tabs and Info Callout */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
              {/* Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveSubTab('delivery')}
                  className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                    activeSubTab === 'delivery'
                      ? 'bg-red-50 text-[#BC0118] border border-red-200 font-black shadow-2xs'
                      : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Delivery Partner Expenses</span>
                  <span className="bg-red-100/80 text-[#BC0118] text-[10px] font-bold px-2 py-0.5 rounded-full ml-0.5">
                    18 Total
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSubTab('agency')}
                  className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                    activeSubTab === 'agency'
                      ? 'bg-red-50 text-[#BC0118] border border-red-200 font-black shadow-2xs'
                      : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Agency Expenses</span>
                  <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full ml-0.5">
                    12 Total
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSubTab('other')}
                  className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                    activeSubTab === 'other'
                      ? 'bg-red-50 text-[#BC0118] border border-red-200 font-black shadow-2xs'
                      : 'bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Other Expenses</span>
                  <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full ml-0.5">
                    5 Total
                  </span>
                </button>
              </div>

              {/* Info Note Banner */}
              <div className="bg-[#F1F5F9]/70 border border-slate-200/80 rounded-xl px-3.5 py-2 flex items-center gap-2 text-xs text-slate-600">
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-[11px]">
                  Refundable cylinder deposits &amp; fleet purchases are tracked as{' '}
                  <strong className="text-slate-800">Capital Assets (CapEx)</strong> and isolated from daily operating expenses.
                </span>
              </div>
            </div>

            {/* Main Table Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
              {/* Filter Bar */}
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
                <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-wrap">
                  {/* Search */}
                  <div className="relative min-w-[240px] flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={tableSearch}
                      onChange={(e) => setTableSearch(e.target.value)}
                      placeholder="Search ID, Partner..."
                      className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl pl-9.5 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    />
                  </div>

                  {/* Partner Dropdown */}
                  <div className="relative">
                    <select
                      value={partnerFilter}
                      onChange={(e) => setPartnerFilter(e.target.value)}
                      className="w-full sm:w-auto bg-[#F8FAFC] border border-slate-200 hover:bg-slate-50 pl-3.5 pr-8 py-2 rounded-xl text-xs font-semibold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer shadow-2xs"
                    >
                      <option value="All Delivery Partners">All Delivery Partners</option>
                      <option value="Rajesh Kumar">Rajesh Kumar (DP-001)</option>
                      <option value="Suresh Babu">Suresh Babu (DP-003)</option>
                      <option value="Mohamed Irfan">Mohamed Irfan (DP-002)</option>
                      <option value="Ravi Shanker">Ravi Shanker (DP-004)</option>
                      <option value="Ramesh Varma">Ramesh Varma (DP-006)</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* Category Dropdown */}
                  <div className="relative">
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full sm:w-auto bg-[#F8FAFC] border border-slate-200 hover:bg-slate-50 pl-3.5 pr-8 py-2 rounded-xl text-xs font-semibold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer shadow-2xs"
                    >
                      <option value="All Categories">All Categories</option>
                      <option value="Fuel">Fuel</option>
                      <option value="Vehicle Repair">Vehicle Repair</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Parking">Parking</option>
                      <option value="Other">Other</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* Approval Status Dropdown */}
                  <div className="relative">
                    <select
                      value={approvalStatusFilter}
                      onChange={(e) => setApprovalStatusFilter(e.target.value)}
                      className="w-full sm:w-auto bg-[#F8FAFC] border border-slate-200 hover:bg-slate-50 pl-3.5 pr-8 py-2 rounded-xl text-xs font-semibold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer shadow-2xs"
                    >
                      <option value="All Approval Status">All Approval Status</option>
                      <option value="Approved">Approved</option>
                      <option value="Pending Approval">Pending Approval</option>
                      <option value="Rejected (Policy)">Rejected (Policy)</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* Payment Status Dropdown */}
                  <div className="relative">
                    <select
                      value={paymentStatusFilter}
                      onChange={(e) => setPaymentStatusFilter(e.target.value)}
                      className="w-full sm:w-auto bg-[#F8FAFC] border border-slate-200 hover:bg-slate-50 pl-3.5 pr-8 py-2 rounded-xl text-xs font-semibold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer shadow-2xs"
                    >
                      <option value="All Payment Status">All Payment Status</option>
                      <option value="Reimbursed (Bank)">Reimbursed (Bank)</option>
                      <option value="Paid (Cash)">Paid (Cash)</option>
                      <option value="Reimbursed (UPI)">Reimbursed (UPI)</option>
                      <option value="Disallowed">Disallowed</option>
                      <option value="Unpaid">Unpaid</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Reset Filters button */}
                <button
                  type="button"
                  onClick={() => {
                    setTableSearch('');
                    setPartnerFilter('All Delivery Partners');
                    setCategoryFilter('All Categories');
                    setApprovalStatusFilter('All Approval Status');
                    setPaymentStatusFilter('All Payment Status');
                    triggerToast('Expense table filters reset');
                  }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition cursor-pointer px-2 py-1 self-end xl:self-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#EDF2F9] text-slate-500 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-200">
                      <th className="py-3.5 px-3 whitespace-nowrap">EXPENSE ID</th>
                      <th className="py-3.5 px-3 whitespace-nowrap">DELIVERY PARTNER</th>
                      <th className="py-3.5 px-3 whitespace-nowrap">CATEGORY</th>
                      <th className="py-3.5 px-3 whitespace-nowrap">DESCRIPTION</th>
                      <th className="py-3.5 px-3 text-right whitespace-nowrap">AMOUNT</th>
                      <th className="py-3.5 px-3 text-center whitespace-nowrap">EXPENSE DATE</th>
                      <th className="py-3.5 px-3 text-center whitespace-nowrap">SOURCE</th>
                      <th className="py-3.5 px-3 text-center whitespace-nowrap">APPROVAL STATUS</th>
                      <th className="py-3.5 px-3 text-center whitespace-nowrap">PAYMENT STATUS</th>
                      <th className="py-3.5 px-3 text-center whitespace-nowrap">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {filteredExpenseRecords.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                        {/* Expense ID */}
                        <td className="py-3.5 px-3 whitespace-nowrap font-bold text-slate-900">
                          {rec.expenseId}
                        </td>

                        {/* Delivery Partner */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div className="font-extrabold text-slate-900 leading-tight">
                            {rec.partnerName}
                          </div>
                          <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                            {rec.partnerCode}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span className="inline-block bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                            {rec.category}
                          </span>
                        </td>

                        {/* Description */}
                        <td className="py-3.5 px-3 text-slate-700 max-w-[260px] truncate">
                          {rec.description}
                        </td>

                        {/* Amount */}
                        <td className="py-3.5 px-3 text-right whitespace-nowrap">
                          <span className={`font-black ${rec.isRedAmount ? 'text-[#BC0118]' : 'text-slate-900'}`}>
                            ₹{rec.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </td>

                        {/* Expense Date */}
                        <td className="py-3.5 px-3 text-center whitespace-nowrap text-slate-600 font-medium text-[11px]">
                          {rec.expenseDate}
                        </td>

                        {/* Source */}
                        <td className="py-3.5 px-3 text-center whitespace-nowrap">
                          {rec.source === 'App Submission' ? (
                            <span className="inline-flex items-center gap-1 text-slate-600 font-semibold text-[11px]">
                              <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                              <span>App Submission</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-slate-600 font-semibold text-[11px]">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              <span>Admin Recorded</span>
                            </span>
                          )}
                        </td>

                        {/* Approval Status */}
                        <td className="py-3.5 px-3 text-center whitespace-nowrap">
                          {rec.approvalStatus === 'Approved' && (
                            <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                              Approved
                            </span>
                          )}
                          {rec.approvalStatus === 'Rejected (Policy)' && (
                            <span className="inline-block bg-red-50 text-[#BC0118] border border-red-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                              Rejected (Policy)
                            </span>
                          )}
                          {rec.approvalStatus === 'Pending Approval' && (
                            <span className="inline-block bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                              Pending Approval
                            </span>
                          )}
                        </td>

                        {/* Payment Status */}
                        <td className="py-3.5 px-3 text-center whitespace-nowrap">
                          {rec.paymentStatus === 'Disallowed' ? (
                            <span className="inline-block bg-slate-100 text-slate-500 text-xs font-bold px-2.5 py-0.5 rounded-full">
                              Disallowed
                            </span>
                          ) : rec.paymentStatus === 'Unpaid' ? (
                            <span className="inline-block bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-0.5 rounded-full">
                              Unpaid
                            </span>
                          ) : (
                            <span className="inline-block bg-blue-50/70 text-blue-700 border border-blue-200/80 text-xs font-bold px-2.5 py-0.5 rounded-full">
                              {rec.paymentStatus}
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => setInspectedExpenseRecord(rec)}
                              title="Inspect Details"
                              className="p-1 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => triggerToast(`Voucher for ${rec.expenseId}`)}
                              title="Receipt Document"
                              className="p-1 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                            >
                              {rec.isRedAmount ? (
                                <ShieldAlert className="w-4 h-4 text-red-500" />
                              ) : (
                                <FileText className="w-4 h-4 text-slate-600" />
                              )}
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
                  <span>Showing 5 of 18 delivery partner entries recorded for this cycle</span>
                </div>

                <div className="flex items-center gap-1 font-bold">
                  <button
                    type="button"
                    onClick={() => triggerToast('Previous page')}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer text-xs"
                  >
                    &lt;
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
                    &gt;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* MODAL 1: Add Expense Modal */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Record Operational Expense</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Direct ledger entry with auto approval &amp; cash/bank disbursement tagging.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddExpenseModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpenseSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 mb-1">Expense Category</label>
                <select
                  value={addExpenseCategory}
                  onChange={(e) => setAddExpenseCategory(e.target.value as 'Fuel' | 'Vehicle Repair' | 'Maintenance' | 'Other')}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                >
                  <option value="Fuel">Fuel (Diesel / Petrol)</option>
                  <option value="Vehicle Repair">Vehicle Repair &amp; Spares</option>
                  <option value="Maintenance">Scheduled Maintenance</option>
                  <option value="Other">Other Operational Overhead</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Payee / Delivery Partner</label>
                <select
                  value={addExpensePartner}
                  onChange={(e) => setAddExpensePartner(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                >
                  <option value="Rajesh Kumar (DP-001)">Rajesh Kumar (DP-001)</option>
                  <option value="Suresh Babu (DP-003)">Suresh Babu (DP-003)</option>
                  <option value="Mohamed Irfan (DP-002)">Mohamed Irfan (DP-002)</option>
                  <option value="Ramesh Varma (DP-006)">Ramesh Varma (DP-006)</option>
                  <option value="Agency Central (HQ-HUB)">Agency Central (HQ-HUB)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Amount (₹)</label>
                <input
                  type="text"
                  placeholder="e.g. 1,250.00"
                  value={addExpenseAmount}
                  onChange={(e) => setAddExpenseAmount(e.target.value)}
                  required
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Narrative / Trip Reference</label>
                <input
                  type="text"
                  placeholder="e.g. Emergency tyre puncture on Bypass Road"
                  value={addExpenseDesc}
                  onChange={(e) => setAddExpenseDesc(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#BC0118] hover:bg-red-800 text-white font-extrabold px-5 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
                >
                  Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Reject Claim Reason Modal */}
      {showRejectModal && selectedClaim && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Reject Claim: {selectedClaim.claimId}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Please specify the audit reason for rejecting ₹{selectedClaim.amount.toLocaleString('en-IN')} claimed by{' '}
              <strong>{selectedClaim.partnerName}</strong>.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Rejection Category</label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                >
                  <option value="Exceeds Daily Route Fuel Allowance">Exceeds Daily Route Fuel Allowance</option>
                  <option value="Illegible or Missing POS Bill Image">Illegible or Missing POS Bill Image</option>
                  <option value="Duplicate Voucher Already Settled">Duplicate Voucher Already Settled</option>
                  <option value="Unauthorized Off-Route Mileage">Unauthorized Off-Route Mileage</option>
                  <option value="Invalid Vehicle Registration on Slip">Invalid Vehicle Registration on Slip</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Supervisor Note to Driver (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Provide clarification note shown in driver terminal..."
                  value={rejectCustomNote}
                  onChange={(e) => setRejectCustomNote(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                ></textarea>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRejectClaim}
                className="flex-1 bg-[#BC0118] hover:bg-red-800 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-xs transition cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Inspect Expense Details */}
      {inspectedExpenseRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Expense Details: {inspectedExpenseRecord.expenseId}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Logged on {inspectedExpenseRecord.expenseDate} · {inspectedExpenseRecord.source}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectedExpenseRecord(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-slate-200/80 space-y-2.5 text-xs">
              <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                <span className="text-slate-500 font-medium">Beneficiary / Driver:</span>
                <span className="font-extrabold text-slate-900">
                  {inspectedExpenseRecord.partnerName} ({inspectedExpenseRecord.partnerCode})
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                <span className="text-slate-500 font-medium">Category:</span>
                <span className="font-bold text-slate-800">{inspectedExpenseRecord.category}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                <span className="text-slate-500 font-medium">Approval Status:</span>
                <span className="font-bold text-emerald-700">{inspectedExpenseRecord.approvalStatus}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                <span className="text-slate-500 font-medium">Payment Settlement:</span>
                <span className="font-bold text-slate-800">{inspectedExpenseRecord.paymentStatus}</span>
              </div>
              <div className="flex justify-between items-center pt-1 text-sm">
                <span className="text-slate-700 font-bold">Total Amount:</span>
                <span className={`font-black text-lg ${inspectedExpenseRecord.isRedAmount ? 'text-[#BC0118]' : 'text-slate-900'}`}>
                  ₹{inspectedExpenseRecord.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setInspectedExpenseRecord(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E293B] text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
