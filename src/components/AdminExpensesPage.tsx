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
  Maximize2,
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
  receiptUrl?: string | null;
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
  paymentStatus: 'Reimbursed (Bank)' | 'Paid (Cash)' | 'Reimbursed (UPI)' | 'Disallowed' | 'Unpaid' | 'Paid';
  type: 'delivery' | 'agency' | 'other';
  receiptUrl?: string | null;
}

const initialPendingClaims: PendingClaim[] = [];

const initialExpenseRecords: ExpenseRecord[] = [];

const emptySubscribe = () => () => {};

function useCurrentDateFormatted(): string {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    () => ''
  );
}

export default function AdminExpensesPage() {
  const currentDate = useCurrentDateFormatted();
  const todayDateStr = currentDate || 'Today';
  const [pendingClaims, setPendingClaims] = useState<PendingClaim[]>(initialPendingClaims);
  const [selectedClaimId, setSelectedClaimId] = useState<string>('');
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
  const [expandedReceiptUrl, setExpandedReceiptUrl] = useState<string | null>(null);

  // Add Expense Form State
  const [addExpenseType, setAddExpenseType] = useState<'Delivery Partner' | 'Agency' | 'Others'>('Delivery Partner');
  const [addCustomExpenseName, setAddCustomExpenseName] = useState('Petrol Bunk');
  const [addExpenseAmount, setAddExpenseAmount] = useState('3,500');
  const [addExpensePartner, setAddExpensePartner] = useState('Varun (DP-006)');
  const [customExpenseDate, setCustomExpenseDate] = useState<string>('');
  const addExpenseDate = customExpenseDate || currentDate;
  const [addExpenseVendor, setAddExpenseVendor] = useState('Petrol Bunk');
  const [addExpenseLedgerTag, setAddExpenseLedgerTag] = useState('10');
  const [addExpensePaymentStatus, setAddExpensePaymentStatus] = useState<'Paid' | 'Unpaid'>('Paid');
  const [addExpensePaymentMethod, setAddExpensePaymentMethod] = useState('Bank Transfer');
  const [showPaymentMethodsDropdown, setShowPaymentMethodsDropdown] = useState(false);
  const [addExpensePurpose, setAddExpensePurpose] = useState('');
  const [uploadedReceiptFileName, setUploadedReceiptFileName] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Real-time KPI summaries computed from database records
  const partnerExpensesApprovedToday = useMemo(() => {
    return expenseRecords
      .filter((r) => r.type === 'delivery' && r.approvalStatus === 'Approved')
      .reduce((sum, r) => sum + r.amount, 0);
  }, [expenseRecords]);

  const approvedDriversCount = useMemo(() => {
    const driverCodes = new Set(
      expenseRecords
        .filter((r) => r.type === 'delivery' && r.approvalStatus === 'Approved')
        .map((r) => r.partnerCode)
    );
    return driverCodes.size;
  }, [expenseRecords]);

  const agencyExpensesToday = useMemo(() => {
    return expenseRecords
      .filter((r) => r.type === 'agency')
      .reduce((sum, r) => sum + r.amount, 0);
  }, [expenseRecords]);

  const agencyExpensesCount = useMemo(() => {
    return expenseRecords.filter((r) => r.type === 'agency').length;
  }, [expenseRecords]);

  const totalPendingAmount = useMemo(() => {
    return pendingClaims.reduce((acc, c) => acc + c.amount, 0);
  }, [pendingClaims]);

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

  // Fetch live expenses from database on mount
  React.useEffect(() => {
    let ignore = false;
    async function loadExpenses() {
      try {
        const res = await fetch('/api/expenses');
        if (!res.ok) return;
        const result = await res.json();
        if (!ignore && result.success && Array.isArray(result.data?.claims) && result.data.claims.length > 0) {
          const dbClaims = result.data.claims;

          // Pending claims for the top audit review carousel
          const pending = dbClaims
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter((c: any) => c.status === 'PENDING')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((c: any) => {
              const partnerName = c.partner?.name || 'Suresh Babu';
              const partnerCode = c.partner?.partnerCode || 'DP-003';
              const rawCat = (c.category || '').toLowerCase();
              let cat: PendingClaim['category'] = 'Fuel';
              if (rawCat.includes('repair')) cat = 'Vehicle Repair';
              else if (rawCat.includes('maint')) cat = 'Maintenance';
              else if (rawCat.includes('park')) cat = 'Parking';
              else if (rawCat.includes('toll')) cat = 'Toll';
              else if (rawCat.includes('food') || rawCat.includes('meal')) cat = 'Meals';

              return {
                id: c.id,
                claimId: c.claimNumber,
                partnerName,
                partnerCode,
                initials: partnerName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase(),
                avatarBg: 'bg-red-100 text-[#BC0118]',
                category: cat,
                description: c.description || `${cat} expense`,
                subDescription: c.vehicle?.regNumber ? `Van ${c.vehicle.regNumber}` : 'Trip Delivery Route',
                amount: c.amount,
                time: new Date(c.claimDate || c.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
                status: 'Pending Approval' as const,
                stationName: c.receiptUrl ? 'Bill Photo Uploaded' : 'Cash Expense',
                stationOutlet: c.vehicle?.regNumber ? `Vehicle: ${c.vehicle.regNumber}` : 'Madurai Central Hub',
                terminalTimestamp: new Date(c.createdAt).toLocaleString('en-GB'),
                receiptType: c.receiptUrl ? 'Bill Slip Upload' : 'Driver Self-Claim',
                receiptUrl: c.receiptUrl || null,
              };
            });

          setPendingClaims(pending);
          if (pending.length > 0) {
            setSelectedClaimId(pending[0].id);
          } else {
            setSelectedClaimId('');
          }

          // Full expense table records
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const records: ExpenseRecord[] = dbClaims.map((c: any) => {
            const partnerName = c.partner?.name || 'Suresh Babu';
            const partnerCode = c.partner?.partnerCode || 'DP-003';
            const rawCat = (c.category || '').toLowerCase();
            let cat: ExpenseRecord['category'] = 'Fuel';
            if (rawCat.includes('repair')) cat = 'Vehicle Repair';
            else if (rawCat.includes('maint')) cat = 'Maintenance';
            else if (rawCat.includes('park')) cat = 'Parking';
            else if (rawCat.includes('util')) cat = 'Utilities';
            else if (rawCat.includes('rent')) cat = 'Rent';
            else if (rawCat.includes('supply') || rawCat.includes('supplies')) cat = 'Supplies';
            else if (rawCat.includes('other')) cat = 'Other';

            let approvalStatus: ExpenseRecord['approvalStatus'] = 'Pending Approval';
            if (c.status === 'APPROVED') approvalStatus = 'Approved';
            else if (c.status === 'REJECTED') approvalStatus = 'Rejected (Policy)';

            return {
              id: c.id,
              expenseId: c.claimNumber,
              partnerName,
              partnerCode,
              category: cat,
              description: c.description || `${cat} expense`,
              amount: c.amount,
              isRedAmount: c.status === 'REJECTED',
              expenseDate: new Date(c.claimDate || c.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
              source: 'App Submission',
              approvalStatus,
              paymentStatus: c.paymentStatus === 'Paid' ? 'Paid (Cash)' : 'Unpaid',
              type: 'delivery',
              receiptUrl: c.receiptUrl || null,
            };
          });

          setExpenseRecords(records);
        }
      } catch (err) {
        console.warn('Could not load live expenses:', err);
      }
    }
    loadExpenses();
    return () => {
      ignore = true;
    };
  }, []);

  const handleApproveCurrentClaim = async () => {
    if (!selectedClaim) return;
    const currentId = selectedClaim.id;

    try {
      const res = await fetch(`/api/expenses/${currentId}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'APPROVED',
          adminRemark: 'Approved by Agency Admin for reimbursement',
          disbursedAmount: selectedClaim.amount,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error?.message || 'Failed to approve claim');
      }

      setExpenseRecords((prev) =>
        prev.map((r) =>
          r.id === currentId || r.expenseId === selectedClaim.claimId
            ? { ...r, approvalStatus: 'Approved', paymentStatus: 'Reimbursed (Bank)' }
            : r
        )
      );
      setPendingClaims((prev) => prev.filter((c) => c.id !== currentId));
      triggerToast(`Approved claim ${selectedClaim.claimId} (₹${selectedClaim.amount.toLocaleString('en-IN')}) for ${selectedClaim.partnerName}`);
      if (pendingClaims.length > 1) {
        const next = pendingClaims.find((c) => c.id !== currentId);
        if (next) setSelectedClaimId(next.id);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error approving expense');
    }
  };

  const handleConfirmRejectClaim = async () => {
    if (!selectedClaim) return;
    const currentId = selectedClaim.id;
    const finalRemark = rejectCustomNote.trim() || rejectReason;

    try {
      const res = await fetch(`/api/expenses/${currentId}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'REJECTED',
          adminRemark: finalRemark,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error?.message || 'Failed to reject claim');
      }

      setExpenseRecords((prev) =>
        prev.map((r) =>
          r.id === currentId || r.expenseId === selectedClaim.claimId
            ? {
                ...r,
                approvalStatus: 'Rejected (Policy)',
                paymentStatus: 'Disallowed',
                isRedAmount: true,
                description: `${r.description} · ${finalRemark}`,
              }
            : r
        )
      );
      setPendingClaims((prev) => prev.filter((c) => c.id !== currentId));
      setShowRejectModal(false);
      triggerToast(`Rejected claim ${selectedClaim.claimId}: ${finalRemark}`);
      if (pendingClaims.length > 1) {
        const next = pendingClaims.find((c) => c.id !== currentId);
        if (next) setSelectedClaimId(next.id);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error rejecting expense');
    }
  };

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addExpenseAmount.trim()) return;

    const amt = parseFloat(addExpenseAmount.replace(/,/g, '')) || 0;
    const partnerName =
      addExpenseType === 'Delivery Partner'
        ? addExpensePartner.split(' (')[0]
        : addExpenseType === 'Agency'
        ? 'Agency Central'
        : addCustomExpenseName || 'Other Vendor';

    const partnerCode =
      addExpenseType === 'Delivery Partner' && addExpensePartner.includes('(')
        ? addExpensePartner.split('(')[1].replace(')', '')
        : addExpenseType === 'Agency'
        ? 'HQ-HUB'
        : 'EXT-01';

    const newRecord: ExpenseRecord = {
      id: `exp-${Date.now()}`,
      expenseId: `EXP-REC-${Date.now().toString().slice(-6)}`,
      partnerName,
      partnerCode,
      category: addExpenseType === 'Agency' ? 'Utilities' : 'Fuel',
      description: addExpensePurpose || (addExpenseType === 'Others' ? addCustomExpenseName : `${addExpenseVendor} payment`),
      amount: amt,
      expenseDate: addExpenseDate || todayDateStr,
      source: 'Admin Recorded',
      approvalStatus: 'Approved',
      paymentStatus:
        addExpensePaymentStatus === 'Paid'
          ? addExpensePaymentMethod.includes('Bank')
            ? 'Reimbursed (Bank)'
            : 'Paid (Cash)'
          : 'Unpaid',
      type: addExpenseType === 'Delivery Partner' ? 'delivery' : addExpenseType === 'Agency' ? 'agency' : 'other',
    };

    setExpenseRecords((prev) => [newRecord, ...prev]);
    setShowAddExpenseModal(false);
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
                  onClick={() => triggerToast(`Selected date: Today (${todayDateStr})`)}
                  className="bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-2xs transition flex items-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Today ({todayDateStr})</span>
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
                  ₹{partnerExpensesApprovedToday.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="flex items-center justify-between mt-2 pt-1 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Approved across {approvedDriversCount} active driver{approvedDriversCount === 1 ? '' : 's'} today</span>
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
                  ₹{agencyExpensesToday.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="flex items-center justify-between mt-2 pt-1 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                    <span>{agencyExpensesCount > 0 ? `${agencyExpensesCount} operational costs recorded today` : 'No operational agency costs recorded today'}</span>
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
                    {pendingClaims.length} Claim{pendingClaims.length === 1 ? '' : 's'}
                  </span>
                  <span className="text-sm font-bold text-slate-500">
                    (₹{totalPendingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
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

                    {/* Receipt Image / Bill Photo Card */}
                    {selectedClaim.receiptUrl ? (
                      <div
                        onClick={() => setExpandedReceiptUrl(selectedClaim.receiptUrl!)}
                        className="mt-4 rounded-xl overflow-hidden border border-slate-200 bg-slate-950 shadow-inner relative group cursor-pointer"
                        title="Click to view full receipt"
                      >
                        <div className="relative w-full min-h-[200px] max-h-[280px] bg-slate-900/90 flex items-center justify-center p-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={selectedClaim.receiptUrl}
                            alt={`Receipt photo for claim ${selectedClaim.claimId}`}
                            className="max-h-[260px] w-auto max-w-full object-contain rounded-lg shadow-xs group-hover:scale-[1.02] transition-transform duration-200"
                          />
                        </div>
                        <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                          <span className="bg-slate-900/90 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5 backdrop-blur-xs">
                            <Maximize2 className="w-3.5 h-3.5" />
                            <span>Click to Enlarge</span>
                          </span>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1">
                          <Maximize2 className="w-2.5 h-2.5" />
                          <span>Tap to Expand</span>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/90 p-5 text-center space-y-2.5">
                        <div className="w-10 h-10 rounded-full bg-slate-200/80 text-slate-500 mx-auto flex items-center justify-center">
                          <FileText className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800">No Receipt Photo Attached</div>
                          <div className="text-[11px] text-slate-500 font-medium mt-0.5 max-w-[240px] mx-auto">
                            Driver submitted this claim as a direct cash expense without a bill photo.
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-2.5 border border-slate-200/80 text-left text-[11px] space-y-1">
                          <div className="flex justify-between text-slate-600">
                            <span className="text-slate-400">Expense Type:</span>
                            <span className="font-semibold text-slate-800">{selectedClaim.category}</span>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span className="text-slate-400">Description:</span>
                            <span className="font-semibold text-slate-800 text-right truncate max-w-[170px]" title={selectedClaim.description}>
                              {selectedClaim.description}
                            </span>
                          </div>
                          <div className="flex justify-between text-slate-600 border-t border-slate-100 pt-1 mt-1 font-bold">
                            <span className="text-slate-500">Claim Amount:</span>
                            <span className="text-[#BC0118]">₹{selectedClaim.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Receipt Meta Rows */}
                    <div className="mt-4 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="font-medium text-slate-500">Driver:</span>
                        <span className="font-bold text-slate-900">
                          {selectedClaim.partnerName} ({selectedClaim.partnerCode})
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="font-medium text-slate-500">Category:</span>
                        <span className="font-bold text-slate-900">{selectedClaim.category}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="font-medium text-slate-500">Vehicle / Route:</span>
                        <span className="font-bold text-slate-900">{selectedClaim.stationOutlet}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="font-medium text-slate-500">Receipt Slip:</span>
                        <span className={`font-bold ${selectedClaim.receiptUrl ? 'text-emerald-700' : 'text-slate-600'}`}>
                          {selectedClaim.receiptUrl ? 'Photo Uploaded' : 'Cash Expense (No Slip)'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="font-medium text-slate-500">Logged At:</span>
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
                    {expenseRecords.filter((r) => r.type === 'delivery').length} Total
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
                    {expenseRecords.filter((r) => r.type === 'agency').length} Total
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
                    {expenseRecords.filter((r) => r.type === 'other').length} Total
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
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-7 space-y-4 my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Add Expense</h3>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">
                  Agency General Entry
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddExpenseModal(false)}
                className="p-1 rounded-full text-slate-700 hover:text-black transition cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2.2]" />
              </button>
            </div>

            <form onSubmit={handleAddExpenseSubmit} className="space-y-4">
              {/* Type Segmented Control */}
              <div>
                <label className="block text-[11px] font-bold text-slate-900 tracking-wider uppercase mb-1.5">
                  SELECTED DELIVERY PARTNER
                </label>
                <div className="bg-[#F1F4FA] p-1.5 rounded-2xl flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setAddExpenseType('Delivery Partner')}
                    className={`flex-1 py-2.5 text-xs text-center rounded-xl transition cursor-pointer ${
                      addExpenseType === 'Delivery Partner'
                        ? 'bg-white text-slate-900 font-black shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 font-bold'
                    }`}
                  >
                    Delivery Partner
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddExpenseType('Agency')}
                    className={`flex-1 py-2.5 text-xs text-center rounded-xl transition cursor-pointer ${
                      addExpenseType === 'Agency'
                        ? 'bg-white text-slate-900 font-black shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 font-bold'
                    }`}
                  >
                    Agency
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddExpenseType('Others')}
                    className={`flex-1 py-2.5 text-xs text-center rounded-xl transition cursor-pointer ${
                      addExpenseType === 'Others'
                        ? 'bg-white text-slate-900 font-black shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 font-bold'
                    }`}
                  >
                    Others
                  </button>
                </div>
              </div>

              {/* Conditional Partner input if "Delivery Partner" tab is active */}
              {addExpenseType === 'Delivery Partner' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-900 tracking-wider uppercase mb-1.5">
                    DELIVERY PARTNER (NAME &amp; CODE)*
                  </label>
                  <input
                    type="text"
                    value={addExpensePartner}
                    onChange={(e) => setAddExpensePartner(e.target.value)}
                    className="w-full bg-[#F1F4FA] rounded-xl px-4 py-3 text-xs font-bold text-slate-900 border-none outline-none"
                    placeholder="Varun (DP-006)"
                  />
                </div>
              )}

              {/* Conditional Custom Expense Name if "Others" tab is active */}
              {addExpenseType === 'Others' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-900 tracking-wider uppercase mb-1.5">
                    CUSTOM EXPENSE NAME*
                  </label>
                  <input
                    type="text"
                    value={addCustomExpenseName}
                    onChange={(e) => setAddCustomExpenseName(e.target.value)}
                    className="w-full bg-[#F1F4FA] rounded-xl px-4 py-3 text-xs font-bold text-slate-900 border-none outline-none"
                  />
                </div>
              )}

              {/* Row 1: Amount & Expense Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-900 tracking-wider uppercase mb-1.5">
                    AMOUNT*
                  </label>
                  <div className="bg-[#F1F4FA] rounded-xl px-4 py-2.5 flex items-center">
                    <span className="text-base font-black text-slate-900 mr-1.5">₹</span>
                    <input
                      type="text"
                      value={addExpenseAmount}
                      onChange={(e) => setAddExpenseAmount(e.target.value)}
                      className="bg-transparent border-none outline-none text-base font-black text-slate-900 w-full"
                      placeholder="3,500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-900 tracking-wider uppercase mb-1.5">
                    EXPENSE DATE*
                  </label>
                  <div className="bg-[#F1F4FA] rounded-xl px-4 py-3 flex items-center justify-between">
                    <input
                      type="text"
                      value={addExpenseDate}
                      onChange={(e) => setCustomExpenseDate(e.target.value)}
                      className="bg-transparent border-none outline-none text-xs font-bold text-slate-900 w-full"
                    />
                    <Calendar className="w-4 h-4 text-slate-700 shrink-0" />
                  </div>
                </div>
              </div>

              {/* Row 2: Vendor Name & Ledger Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-900 tracking-wider uppercase mb-1.5">
                    VENDOR/PAYEE NAME
                  </label>
                  <input
                    type="text"
                    value={addExpenseVendor}
                    onChange={(e) => setAddExpenseVendor(e.target.value)}
                    className="w-full bg-[#F1F4FA] rounded-xl px-4 py-3 text-xs font-bold text-slate-900 border-none outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-900 tracking-wider uppercase mb-1.5">
                    LEDGER TAG
                  </label>
                  <input
                    type="text"
                    value={addExpenseLedgerTag}
                    onChange={(e) => setAddExpenseLedgerTag(e.target.value)}
                    className="w-full bg-[#F1F4FA] rounded-xl px-4 py-3 text-xs font-bold text-slate-900 border-none outline-none"
                  />
                </div>
              </div>

              {/* Row 3: Payment Status & Payment Methods */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-900 tracking-wider uppercase mb-1.5">
                    PAYMENT STATUS*
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAddExpensePaymentStatus('Paid')}
                      className="flex-1 bg-[#F1F4FA] rounded-xl px-4 py-3 flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-900 transition hover:bg-slate-200/60"
                    >
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${addExpensePaymentStatus === 'Paid' ? 'border-slate-800' : 'border-slate-400'}`}>
                        {addExpensePaymentStatus === 'Paid' && <span className="w-2 h-2 rounded-full bg-slate-900" />}
                      </span>
                      <span>Paid</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddExpensePaymentStatus('Unpaid')}
                      className="flex-1 bg-[#F1F4FA] rounded-xl px-4 py-3 flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-900 transition hover:bg-slate-200/60"
                    >
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${addExpensePaymentStatus === 'Unpaid' ? 'border-slate-800' : 'border-slate-400'}`}>
                        {addExpensePaymentStatus === 'Unpaid' && <span className="w-2 h-2 rounded-full bg-slate-900" />}
                      </span>
                      <span>Unpaid</span>
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-[11px] font-bold text-slate-900 tracking-wider uppercase mb-1.5">
                    PAYMENT METHODS*
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPaymentMethodsDropdown(!showPaymentMethodsDropdown)}
                    className="w-full bg-[#F1F4FA] rounded-xl px-4 py-3 text-xs font-bold text-slate-900 border-none flex items-center justify-between cursor-pointer hover:bg-slate-200/60 transition"
                  >
                    <span>{addExpensePaymentMethod}</span>
                    <ChevronDown className="w-4 h-4 text-slate-700" />
                  </button>
                  {showPaymentMethodsDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 text-xs font-bold text-slate-800">
                      {['Bank Transfer', 'Cash (Depot Verified)', 'UPI (Online)', 'Fleet Card'].map((method) => (
                        <div
                          key={method}
                          onClick={() => {
                            setAddExpensePaymentMethod(method);
                            setShowPaymentMethodsDropdown(false);
                          }}
                          className="px-4 py-2 hover:bg-[#F1F4FA] cursor-pointer"
                        >
                          {method}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 4: Description / Purpose */}
              <div>
                <label className="block text-[11px] font-bold text-slate-900 tracking-wider uppercase mb-1.5">
                  DESCRIPTION / PURPOSE
                </label>
                <input
                  type="text"
                  value={addExpensePurpose}
                  onChange={(e) => setAddExpensePurpose(e.target.value)}
                  placeholder="Provide operational context for this expense."
                  className="w-full bg-[#F1F4FA] rounded-xl px-4 py-3.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 border-none outline-none"
                />
              </div>

              {/* Row 5: Receipt / Tax Invoice Attachment */}
              <div>
                <label className="block text-[11px] font-bold text-slate-900 tracking-wider uppercase mb-1.5">
                  RECEIPT / TAX INVOICE ATTACHMENT
                </label>
                <label className="w-full bg-[#F1F4FA] hover:bg-slate-200/60 transition rounded-2xl py-8 px-4 flex flex-col items-center justify-center text-center cursor-pointer block border-none">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/png,image/jpeg,application/pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setUploadedReceiptFileName(e.target.files[0].name);
                        triggerToast(`Attached receipt: ${e.target.files[0].name}`);
                      }
                    }}
                  />
                  <svg className="w-7 h-7 text-slate-900 stroke-[2.2] mb-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 12v9" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="m16 16-4-4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-sm font-black text-slate-900">
                    {uploadedReceiptFileName ? uploadedReceiptFileName : 'Click to upload or drag receipt file'}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    PNG, JPG, PDF upto 10 MB
                  </p>
                </label>
              </div>

              {/* Bottom Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="bg-[#F1F4FA] hover:bg-slate-200 text-slate-800 font-bold text-xs px-6 py-3 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#BC0118] hover:bg-red-800 active:scale-98 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-xs transition cursor-pointer"
                >
                  Issue Cylinders &amp; Print Pass
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
                <span className="text-slate-500 font-medium">Description:</span>
                <span className="font-bold text-slate-800 text-right truncate max-w-[240px]" title={inspectedExpenseRecord.description}>
                  {inspectedExpenseRecord.description}
                </span>
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

            {/* Receipt in Inspector */}
            {inspectedExpenseRecord.receiptUrl ? (
              <div className="bg-slate-950 rounded-2xl p-3 border border-slate-200/80 space-y-2">
                <div className="text-[11px] font-bold text-slate-300 flex items-center justify-between px-1">
                  <span>Attached Bill Slip / Photo:</span>
                  <button
                    type="button"
                    onClick={() => setExpandedReceiptUrl(inspectedExpenseRecord.receiptUrl!)}
                    className="text-red-400 hover:text-red-300 hover:underline flex items-center gap-1 font-bold cursor-pointer"
                  >
                    <Maximize2 className="w-3 h-3" />
                    <span>Enlarge Photo</span>
                  </button>
                </div>
                <div
                  onClick={() => setExpandedReceiptUrl(inspectedExpenseRecord.receiptUrl!)}
                  className="flex items-center justify-center max-h-48 cursor-pointer overflow-hidden rounded-xl bg-slate-900"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={inspectedExpenseRecord.receiptUrl}
                    alt="Receipt"
                    className="max-h-48 w-auto max-w-full object-contain rounded-lg shadow-xs hover:scale-105 transition duration-150"
                  />
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-xl p-3 border border-dashed border-slate-200 text-center text-xs text-slate-500 font-medium">
                No receipt photo attached (Cash Self-Claim)
              </div>
            )}

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

      {/* MODAL 4: Full Size Receipt Viewer */}
      {expandedReceiptUrl && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setExpandedReceiptUrl(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#BC0118]" />
                <h3 className="font-extrabold text-sm text-slate-900">
                  Uploaded Receipt / Bill Photo
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setExpandedReceiptUrl(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-slate-950 flex items-center justify-center overflow-auto max-h-[calc(90vh-120px)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={expandedReceiptUrl}
                alt="Enlarged Receipt"
                className="max-h-full max-w-full object-contain rounded shadow"
              />
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Receipt verified from database</span>
              <button
                type="button"
                onClick={() => setExpandedReceiptUrl(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-1.5 rounded-xl transition cursor-pointer"
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
