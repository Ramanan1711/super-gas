'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import AdminSidebar from './AdminSidebar';
import {
  Search,
  Bell,
  ChevronDown,
  Download,
  Calendar,
  RotateCcw,
  Receipt,
  Building2,
  BookOpen,
  TrendingUp,
  FileText,
  ExternalLink,
  Paperclip,
  CheckCircle2,
  Clock,
  Info,
  Check,
  X,
} from 'lucide-react';

export interface SettlementLedgerRecord {
  id: string;
  recordId: string;
  dateTime: string;
  classification: 'Expense' | 'Investment';
  category:
    | 'Cylinder Deposits'
    | 'Fuel & Transport'
    | 'Vehicle Purchases'
    | 'Repairs & Maint.'
    | 'Depot Utilities'
    | 'Agency Infra'
    | 'Salaries & Wages'
    | 'Office & Admin';
  assetPayee: string;
  narrative: string;
  depotHub: string;
  amount: number;
  amountNote: string;
  amountNoteType?: 'success' | 'danger' | 'muted';
  paymentStatus:
    | 'Paid (Bank)'
    | 'Paid (Fleet Card)'
    | 'Partially Paid'
    | 'Paid (UPI)'
    | 'Unpaid'
    | 'Paid (RTGS)';
  auditStatus: 'Approved' | 'Pending Audit' | 'Rejected';
  hasActionReview?: boolean;
}



export default function AdminSettlementsPage() {
  const [ledgerRecords, setLedgerRecords] = useState<SettlementLedgerRecord[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter States
  const [headerSearch, setHeaderSearch] = useState('');
  const [tableSearch, setTableSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [branchFilter, setBranchFilter] = useState('All Branches');
  const [statusFilter, setStatusFilter] = useState('Status: All');

  // Chart Controls
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '3M' | '6M'>('30D');
  const [categoryAllocationTab, setCategoryAllocationTab] = useState<'OpEx' | 'CapEx'>('OpEx');
  const [showTooltip, setShowTooltip] = useState(true);

  // Review & Approve Modal State
  const [reviewModalRecord, setReviewModalRecord] = useState<SettlementLedgerRecord | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered records
  const filteredRecords = useMemo(() => {
    return ledgerRecords.filter((rec) => {
      // Header Search filter
      if (headerSearch.trim()) {
        const q = headerSearch.toLowerCase();
        const matchesHeader =
          rec.recordId.toLowerCase().includes(q) ||
          rec.assetPayee.toLowerCase().includes(q) ||
          rec.narrative.toLowerCase().includes(q) ||
          rec.depotHub.toLowerCase().includes(q);
        if (!matchesHeader) return false;
      }

      // Table Search filter
      if (tableSearch.trim()) {
        const q = tableSearch.toLowerCase();
        const matchesTable =
          rec.recordId.toLowerCase().includes(q) ||
          rec.assetPayee.toLowerCase().includes(q) ||
          rec.narrative.toLowerCase().includes(q) ||
          rec.category.toLowerCase().includes(q);
        if (!matchesTable) return false;
      }

      // Type filter
      if (typeFilter !== 'All Types') {
        if (rec.classification !== typeFilter) return false;
      }

      // Category filter
      if (categoryFilter !== 'All Categories') {
        if (rec.category !== categoryFilter) return false;
      }

      // Branch filter
      if (branchFilter !== 'All Branches') {
        if (rec.depotHub !== branchFilter) return false;
      }

      // Status filter
      if (statusFilter !== 'Status: All' && statusFilter !== 'All Statuses') {
        if (statusFilter === 'Approved' && rec.auditStatus !== 'Approved') return false;
        if (statusFilter === 'Pending Audit' && rec.auditStatus !== 'Pending Audit') return false;
        if (statusFilter === 'Paid' && !rec.paymentStatus.startsWith('Paid')) return false;
        if (statusFilter === 'Unpaid' && rec.paymentStatus !== 'Unpaid') return false;
      }

      return true;
    });
  }, [ledgerRecords, headerSearch, tableSearch, typeFilter, categoryFilter, branchFilter, statusFilter]);

  const handleResetFilters = () => {
    setHeaderSearch('');
    setTableSearch('');
    setTypeFilter('All Types');
    setCategoryFilter('All Categories');
    setBranchFilter('All Branches');
    setStatusFilter('Status: All');
    triggerToast('All filters reset to default');
  };

  const handleExportCSV = () => {
    const headers = [
      'Record ID',
      'Date & Time',
      'Classification',
      'Category',
      'Asset/Payee',
      'Narrative',
      'Depot Hub',
      'Amount',
      'Payment Status',
      'Audit Status',
    ];
    const rows = filteredRecords.map((r) => [
      r.recordId,
      r.dateTime,
      r.classification,
      r.category,
      `"${r.assetPayee}"`,
      `"${r.narrative}"`,
      r.depotHub,
      r.amount.toString(),
      r.paymentStatus,
      r.auditStatus,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `super_gas_settlements_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Settlements CSV exported successfully');
  };

  // Dynamic KPI Metrics calculated from live ledger records
  const kpiMetrics = useMemo(() => {
    let opexTotal = 0;
    let opexCount = 0;
    let capexTotal = 0;
    let capexCount = 0;
    let pendingCount = 0;
    let pendingAmount = 0;
    let pendingOpexCount = 0;
    let pendingCapexCount = 0;

    ledgerRecords.forEach((rec) => {
      if (rec.classification === 'Expense') {
        if (rec.auditStatus === 'Approved') {
          opexTotal += rec.amount;
          opexCount++;
        }
      } else if (rec.classification === 'Investment') {
        capexTotal += rec.amount;
        capexCount++;
      }

      if (rec.auditStatus === 'Pending Audit') {
        pendingCount++;
        pendingAmount += rec.amount;
        if (rec.classification === 'Expense') pendingOpexCount++;
        else pendingCapexCount++;
      }
    });

    const totalActivity = opexTotal + capexTotal + pendingAmount;

    return {
      opexTotal,
      opexCount,
      capexTotal,
      capexCount,
      pendingCount,
      pendingAmount,
      pendingOpexCount,
      pendingCapexCount,
      totalActivity,
    };
  }, [ledgerRecords]);

  // Fetch live settlements and cash vault drops on mount
  React.useEffect(() => {
    let ignore = false;
    async function loadSettlements() {
      try {
        const [settlementsRes, expensesRes] = await Promise.all([
          fetch('/api/settlements/history?partnerCode=ALL'),
          fetch('/api/expenses'),
        ]);

        const liveRecords: SettlementLedgerRecord[] = [];

        // 1. Registered Capital Assets (CapEx)
        liveRecords.push(
          {
            id: 'asset-cyl-pool',
            recordId: 'AST-CYL-8820',
            dateTime: '01 Oct 2026, 09:00 AM',
            classification: 'Investment',
            category: 'Cylinder Deposits',
            assetPayee: 'Depot Cylinder Pool (80 Units)',
            narrative: 'Depot stock security & capital cylinder float (60x 14.2kg + 20x 19kg)',
            depotHub: 'HQ Central',
            amount: 150000,
            amountNote: 'Capital Asset Registered',
            amountNoteType: 'success',
            paymentStatus: 'Paid (Bank)',
            auditStatus: 'Approved',
            hasActionReview: false,
          },
          {
            id: 'asset-fleet-van',
            recordId: 'AST-VEH-4821',
            dateTime: '05 Oct 2026, 11:30 AM',
            classification: 'Investment',
            category: 'Vehicle Purchases',
            assetPayee: 'Tata Ace Fleet Van (TN 58 AX 4821)',
            narrative: 'Primary route delivery vehicle capital acquisition',
            depotHub: 'HQ Central',
            amount: 190000,
            amountNote: 'Capital Asset Registered',
            amountNoteType: 'success',
            paymentStatus: 'Paid (Bank)',
            auditStatus: 'Approved',
            hasActionReview: false,
          }
        );

        // 2. Load Settlements & Handovers
        if (settlementsRes.ok) {
          const result = await settlementsRes.json();
          const rawSettlements = Array.isArray(result.data?.settlements)
            ? result.data.settlements
            : Array.isArray(result.data)
            ? result.data
            : [];

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          rawSettlements.forEach((s: any) => {
            const isVerified = s.status === 'Verified' || s.rawStatus === 'VERIFIED';
            liveRecords.push({
              id: s.id,
              recordId: `SET-${s.id.slice(-6).toUpperCase()}`,
              dateTime: `${s.date}, 06:00 PM`,
              classification: 'Expense',
              category: 'Cylinder Deposits',
              assetPayee: `Daily Cash Drop - ${s.partnerName} (${s.partnerCode})`,
              narrative: s.footerStatusText || `Reconciliation for ${s.partnerName}`,
              depotHub: 'HQ Central',
              amount: s.expectedAmount,
              amountNote: isVerified ? 'Reconciled & Verified' : `Pending ₹${s.remainingAmount?.toLocaleString('en-IN')}`,
              amountNoteType: isVerified ? 'success' : 'danger',
              paymentStatus: isVerified ? 'Paid (Bank)' : 'Unpaid',
              auditStatus: isVerified ? 'Approved' : 'Pending Audit',
              hasActionReview: !isVerified,
            });

            if (Array.isArray(s.handovers)) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              s.handovers.forEach((h: any) => {
                const eventVerified = h.status === 'Verified';
                liveRecords.push({
                  id: h.id,
                  recordId: h.handoverCode,
                  dateTime: new Date(h.handoverTime).toLocaleString('en-GB'),
                  classification: 'Expense',
                  category: 'Office & Admin',
                  assetPayee: `Vault Handover: ${h.dropType?.replace(/_/g, ' ') || 'Drop'}`,
                  narrative: `Received by ${h.receivedByName || 'Depot Admin'}${h.stampNumber ? ` · Stamp: ${h.stampNumber}` : ''}`,
                  depotHub: 'HQ Central',
                  amount: h.amount,
                  amountNote: eventVerified ? 'Verified Vault Drop' : 'Pending Verification',
                  amountNoteType: eventVerified ? 'success' : 'danger',
                  paymentStatus: eventVerified ? 'Paid (Bank)' : 'Unpaid',
                  auditStatus: eventVerified ? 'Approved' : 'Pending Audit',
                  hasActionReview: !eventVerified,
                });
              });
            }
          });
        }

        // 3. Load Real Expense Claims (OpEx)
        if (expensesRes.ok) {
          const expResult = await expensesRes.json();
          if (expResult.success && Array.isArray(expResult.data?.claims)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expResult.data.claims.forEach((c: any) => {
              const partnerName = c.partner?.name || 'Varun';
              const partnerCode = c.partner?.partnerCode || 'DP-006';
              const rawCat = (c.category || '').toLowerCase();
              let cat: SettlementLedgerRecord['category'] = 'Fuel & Transport';
              if (rawCat.includes('repair') || rawCat.includes('maint')) cat = 'Repairs & Maint.';
              else if (rawCat.includes('util')) cat = 'Depot Utilities';
              else if (rawCat.includes('wage') || rawCat.includes('salary')) cat = 'Salaries & Wages';
              else if (rawCat.includes('park') || rawCat.includes('toll') || rawCat.includes('food') || rawCat.includes('meal') || rawCat.includes('other')) cat = 'Office & Admin';

              const isApproved = c.status === 'APPROVED';
              const isRejected = c.status === 'REJECTED';

              liveRecords.push({
                id: c.id,
                recordId: c.claimNumber,
                dateTime: new Date(c.claimDate || c.createdAt).toLocaleString('en-GB'),
                classification: 'Expense',
                category: cat,
                assetPayee: `${partnerName} (${partnerCode})`,
                narrative: c.description || `${cat} operational claim`,
                depotHub: 'HQ Central',
                amount: c.amount,
                amountNote: isApproved ? 'Approved Claim' : (isRejected ? 'Rejected Claim' : 'Pending Audit'),
                amountNoteType: isApproved ? 'success' : (isRejected ? 'danger' : 'muted'),
                paymentStatus: c.paymentStatus === 'Paid' ? 'Paid (Bank)' : 'Unpaid',
                auditStatus: isApproved ? 'Approved' : (isRejected ? 'Rejected' : 'Pending Audit'),
                hasActionReview: !isApproved && !isRejected,
              });
            });
          }
        }

        if (!ignore && liveRecords.length > 0) {
          setLedgerRecords(liveRecords);
        }
      } catch (err) {
        console.warn('Could not load live settlements from database:', err);
      }
    }
    loadSettlements();
    return () => {
      ignore = true;
    };
  }, []);

  const handleApproveRecord = async (id: string) => {
    const target = ledgerRecords.find((r) => r.id === id);

    try {
      if (target?.recordId?.startsWith('EXP-')) {
        const res = await fetch(`/api/expenses/${id}/review`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'APPROVED',
            adminRemark: 'Verified by Agency Admin in Settlements Ledger',
            disbursedAmount: target.amount,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => null);
          console.warn('Backend expense verification notice:', err);
        }
      } else {
        const res = await fetch('/api/settlements/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            settlementId: id.startsWith('rec') ? undefined : id,
            handoverCode: target?.recordId?.startsWith('#HND') ? target.recordId : undefined,
            auditRemarks: 'Verified by Agency Admin',
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => null);
          console.warn('Backend verification notice:', err);
        }
      }

      setLedgerRecords((prev) =>
        prev.map((rec) =>
          rec.id === id
            ? {
                ...rec,
                auditStatus: 'Approved',
                hasActionReview: false,
                paymentStatus: 'Paid (Bank)',
                amountNote: 'Verified & Reconciled',
                amountNoteType: 'success',
              }
            : rec
        )
      );
      setReviewModalRecord(null);
      triggerToast(`Verified record ${target?.recordId || id} successfully`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error verifying record');
    }
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
            <span className="font-bold text-slate-800">Settlements</span>
          </div>

          {/* Right Header: Operational Badge, Bell, Profile */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Agency: Operational
            </div>

            <button
              type="button"
              onClick={() => triggerToast('No unread settlement notifications')}
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

        {/* Page Body */}
        <main className="p-6 sm:p-8 space-y-6 max-w-[1600px] w-full mx-auto pb-16">
          {/* Top Title & Header Actions Row */}
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Settlements
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Review and reconcile daily cash collected by delivery partners against digital run sheets.
              </p>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Partner Search Input */}
              <div className="relative min-w-[200px] sm:min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search partner, ID..."
                  value={headerSearch}
                  onChange={(e) => setHeaderSearch(e.target.value)}
                  className="w-full bg-white border border-slate-200/90 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 shadow-2xs focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              {/* Date Button */}
              <button
                type="button"
                onClick={() => triggerToast('Statement Period: Today (24 Oct 2026)')}
                className="bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-xl shadow-2xs transition flex items-center gap-2 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Today (24 Oct 2026)</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Status Select */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 font-semibold text-xs pl-3.5 pr-8 py-2 rounded-xl shadow-2xs appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer"
                >
                  <option value="Status: All">All Statuses</option>
                  <option value="Approved">Approved</option>
                  <option value="Pending Audit">Pending Audit</option>
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Export CSV Button */}
              <button
                type="button"
                onClick={handleExportCSV}
                className="bg-[#BC0118] hover:bg-red-800 active:scale-98 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Top 4 Financial KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Card 1: OPERATING EXPENSES (OPEX) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  OPERATING EXPENSES (OPEX)
                </span>
                <div className="w-8 h-8 rounded-xl bg-red-50 text-[#BC0118] flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  ₹{kpiMetrics.opexTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="flex items-center justify-between mt-2 pt-1 text-xs">
                  <span className="text-slate-500 font-medium">{kpiMetrics.opexCount} approved operational claims</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-0.5 text-xs">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Live</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: CAPITAL INVESTMENTS (CAPEX) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  CAPITAL INVESTMENTS (CAPEX)
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  ₹{kpiMetrics.capexTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="flex items-center justify-between mt-2 pt-1 text-xs">
                  <span className="text-slate-500 font-medium">{kpiMetrics.capexCount} active assets &amp; cylinder stock</span>
                  <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200/80">
                    Super Admin Only
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: AWAITING VERIFICATION */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  AWAITING VERIFICATION
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {kpiMetrics.pendingCount} Claims
                  </span>
                  <span className="text-sm font-bold text-slate-500">
                    (₹{kpiMetrics.pendingAmount.toLocaleString('en-IN')})
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2 pt-1 text-xs">
                  <span className="text-slate-500 font-medium">
                    {kpiMetrics.pendingCount === 0
                      ? 'All claims & drops verified'
                      : `${kpiMetrics.pendingOpexCount} OpEx + ${kpiMetrics.pendingCapexCount} Drop/CapEx`}
                  </span>
                  <span className={`${kpiMetrics.pendingCount > 0 ? 'bg-red-50 text-[#BC0118] border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'} text-[10px] font-bold px-2 py-0.5 rounded-full`}>
                    {kpiMetrics.pendingCount > 0 ? 'Audit Required' : 'Cleared'}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 4: TOTAL LEDGER ACTIVITY */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  TOTAL LEDGER ACTIVITY
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  ₹{kpiMetrics.totalActivity.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="flex items-center justify-between mt-2 pt-1 text-xs">
                  <span className="text-slate-500 font-medium">OpEx + CapEx recorded</span>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Reconciled
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Charts Section (2 Columns) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Card: OpEx vs Capital Growth Curve (8 cols) */}
            <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 flex flex-col justify-between">
              <div>
                {/* Title & Segmented Control */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                      OpEx vs Capital Growth Curve
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Isolated agency operating burn against long-term asset accumulation
                    </p>
                  </div>

                  {/* 7D, 30D, 3M, 6M Segmented Control */}
                  <div className="bg-slate-100 p-0.5 rounded-lg flex items-center text-xs font-bold text-slate-600 self-start sm:self-auto">
                    {(['7D', '30D', '3M', '6M'] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setTimeRange(r)}
                        className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                          timeRange === r
                            ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                            : 'hover:text-slate-900'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Legend Row */}
                <div className="flex items-center gap-5 mt-4 text-xs font-semibold">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#BC0118]"></span>
                    <span>Operating Expenses</span>
                    <strong className="text-slate-900 font-bold ml-1">
                      ₹{kpiMetrics.opexTotal.toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1E293B]"></span>
                    <span>Investments &amp; Assets</span>
                    <strong className="text-slate-900 font-bold ml-1">
                      ₹{kpiMetrics.capexTotal.toLocaleString('en-IN')}
                    </strong>
                  </div>
                </div>

                {/* SVG Curve Canvas with Floating Tooltip */}
                <div className="relative mt-5 w-full h-[230px] select-none">
                  {/* Floating Tooltip matching attached reference */}
                  {showTooltip && (
                    <div
                      className="absolute left-[34%] top-[12%] z-10 bg-[#1E293B] text-white rounded-xl p-3 shadow-2xl border border-slate-700/60 text-xs space-y-1.5 min-w-[220px] pointer-events-none transition-all duration-300"
                    >
                      <div className="text-[11px] font-bold text-slate-300 border-b border-slate-700/80 pb-1">
                        15 Oct 2026 Batch
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-100">
                        <span className="w-2 h-2 rounded-full bg-[#BC0118] shrink-0"></span>
                        <span>OpEx:</span>
                        <strong className="text-white font-bold">₹8,400.00</strong>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-100">
                        <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0"></span>
                        <span>CapEx:</span>
                        <strong className="text-white font-bold">₹1,20,000.00</strong>
                        <span className="text-slate-400 font-normal text-[10px]">(Tata Ace EV)</span>
                      </div>
                    </div>
                  )}

                  {/* SVG Chart */}
                  <svg
                    viewBox="0 0 600 200"
                    className="w-full h-full overflow-visible"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="opexGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#BC0118" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#BC0118" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="capexGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1E293B" stopOpacity="0.12" />
                        <stop offset="100%" stopColor="#1E293B" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Grid lines */}
                    <line x1="45" y1="20" x2="600" y2="20" stroke="#E2E8F0" strokeDasharray="3 3" />
                    <line x1="45" y1="65" x2="600" y2="65" stroke="#E2E8F0" strokeDasharray="3 3" />
                    <line x1="45" y1="115" x2="600" y2="115" stroke="#E2E8F0" strokeDasharray="3 3" />
                    <line x1="45" y1="165" x2="600" y2="165" stroke="#E2E8F0" />

                    {/* Y Axis Labels */}
                    <text x="35" y="24" textAnchor="end" className="text-[10px] font-semibold fill-slate-400">₹2.0 L</text>
                    <text x="35" y="69" textAnchor="end" className="text-[10px] font-semibold fill-slate-400">₹1.5 L</text>
                    <text x="35" y="119" textAnchor="end" className="text-[10px] font-semibold fill-slate-400">₹50 K</text>
                    <text x="35" y="169" textAnchor="end" className="text-[10px] font-semibold fill-slate-400">₹0</text>

                    {/* Vertical guideline for active tooltip */}
                    <line
                      x1="240"
                      y1="20"
                      x2="240"
                      y2="165"
                      stroke="#CBD5E1"
                      strokeDasharray="2 2"
                      strokeWidth="1.5"
                    />

                    {/* CapEx (Investments) Curve: Starts high, dips in middle, rises back up */}
                    <path
                      d="M 50 45 C 100 48, 150 75, 200 95 C 240 108, 300 120, 360 115 C 420 110, 480 80, 530 60 C 570 45, 590 35, 600 30"
                      fill="none"
                      stroke="#1E293B"
                      strokeWidth="2.5"
                    />
                    <path
                      d="M 50 45 C 100 48, 150 75, 200 95 C 240 108, 300 120, 360 115 C 420 110, 480 80, 530 60 C 570 45, 590 35, 600 30 L 600 165 L 50 165 Z"
                      fill="url(#capexGrad)"
                    />

                    {/* OpEx Curve (Red): Stays lower with gentle variation */}
                    <path
                      d="M 50 142 C 100 140, 150 148, 200 135 C 240 125, 290 122, 340 128 C 400 135, 460 130, 510 122 C 550 118, 580 114, 600 112"
                      fill="none"
                      stroke="#BC0118"
                      strokeWidth="2.5"
                    />
                    <path
                      d="M 50 142 C 100 140, 150 148, 200 135 C 240 125, 290 122, 340 128 C 400 135, 460 130, 510 122 C 550 118, 580 114, 600 112 L 600 165 L 50 165 Z"
                      fill="url(#opexGrad)"
                    />

                    {/* Tooltip Target Dots */}
                    <g className="cursor-pointer" onClick={() => setShowTooltip(!showTooltip)}>
                      <circle cx="240" cy="125" r="4" fill="#BC0118" />
                      <circle cx="240" cy="125" r="7" fill="none" stroke="#BC0118" strokeWidth="1.5" opacity="0.6" />

                      <circle cx="240" cy="108" r="4" fill="#1E293B" />
                      <circle cx="240" cy="108" r="7" fill="none" stroke="#1E293B" strokeWidth="1.5" opacity="0.6" />
                    </g>

                    {/* X Axis Labels */}
                    <text x="65" y="185" textAnchor="middle" className="text-[10px] font-semibold fill-slate-400">01 Oct</text>
                    <text x="160" y="185" textAnchor="middle" className="text-[10px] font-semibold fill-slate-400">05 Oct</text>
                    <text x="240" y="185" textAnchor="middle" className="text-[10px] font-semibold fill-slate-400">10 Oct</text>
                    <text x="340" y="185" textAnchor="middle" className="text-[10px] font-semibold fill-slate-400">15 Oct</text>
                    <text x="440" y="185" textAnchor="middle" className="text-[10px] font-semibold fill-slate-400">20 Oct</text>
                    <text x="560" y="185" textAnchor="middle" className="text-[10px] font-semibold fill-slate-400">24 Oct</text>
                  </svg>
                </div>
              </div>

              {/* Curve Footer Note */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs mt-3">
                <span className="text-[11px] text-slate-400 font-medium italic">
                  Branch Admin view isolates authorized branch; Super Admin displays consolidated curve.
                </span>
                <span className="text-xs font-bold text-[#BC0118] flex items-center gap-1.5 self-end sm:self-auto">
                  <span className="w-2 h-2 rounded-full bg-[#BC0118] animate-pulse"></span>
                  <span>Live Sync Active</span>
                </span>
              </div>
            </div>

            {/* Right Card: Category Allocation (4 cols) */}
            <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 flex flex-col justify-between">
              <div>
                {/* Header with OpEx / CapEx Toggle */}
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                      Category Allocation
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Operational distribution review
                    </p>
                  </div>

                  <div className="bg-slate-100 p-0.5 rounded-lg flex items-center text-xs font-bold text-slate-600">
                    <button
                      type="button"
                      onClick={() => setCategoryAllocationTab('OpEx')}
                      className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                        categoryAllocationTab === 'OpEx'
                          ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                          : 'hover:text-slate-900'
                      }`}
                    >
                      OpEx
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategoryAllocationTab('CapEx')}
                      className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                        categoryAllocationTab === 'CapEx'
                          ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                          : 'hover:text-slate-900'
                      }`}
                    >
                      CapEx
                    </button>
                  </div>
                </div>

                {/* Donut Chart and Categories List */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-5 mt-6">
                  {/* Donut Chart SVG */}
                  <div className="relative w-32 h-32 shrink-0">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      {categoryAllocationTab === 'OpEx' ? (
                        <>
                          {/* Segment 1: Salaries & Wages 42% (Red) */}
                          <circle
                            cx="50"
                            cy="50"
                            r="38"
                            fill="transparent"
                            stroke="#BC0118"
                            strokeWidth="14"
                            strokeDasharray="100.3 238.76"
                            strokeDashoffset="0"
                          />
                          {/* Segment 2: Fuel & Transport 26% (Dark Slate) */}
                          <circle
                            cx="50"
                            cy="50"
                            r="38"
                            fill="transparent"
                            stroke="#1E293B"
                            strokeWidth="14"
                            strokeDasharray="62.1 238.76"
                            strokeDashoffset="-100.3"
                          />
                          {/* Segment 3: Depot Repairs 14% (Cyan/Teal) */}
                          <circle
                            cx="50"
                            cy="50"
                            r="38"
                            fill="transparent"
                            stroke="#0EA5E9"
                            strokeWidth="14"
                            strokeDasharray="33.4 238.76"
                            strokeDashoffset="-162.4"
                          />
                          {/* Segment 4: Depot Utilities 12% (Orange) */}
                          <circle
                            cx="50"
                            cy="50"
                            r="38"
                            fill="transparent"
                            stroke="#F97316"
                            strokeWidth="14"
                            strokeDasharray="28.6 238.76"
                            strokeDashoffset="-195.8"
                          />
                          {/* Segment 5: Office & Admin 6% (Light Slate) */}
                          <circle
                            cx="50"
                            cy="50"
                            r="38"
                            fill="transparent"
                            stroke="#CBD5E1"
                            strokeWidth="14"
                            strokeDasharray="14.3 238.76"
                            strokeDashoffset="-224.4"
                          />
                        </>
                      ) : (
                        <>
                          {/* CapEx Donut */}
                          <circle
                            cx="50"
                            cy="50"
                            r="38"
                            fill="transparent"
                            stroke="#2563EB"
                            strokeWidth="14"
                            strokeDasharray="126.5 238.76"
                            strokeDashoffset="0"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="38"
                            fill="transparent"
                            stroke="#1E293B"
                            strokeWidth="14"
                            strokeDasharray="76.4 238.76"
                            strokeDashoffset="-126.5"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="38"
                            fill="transparent"
                            stroke="#0EA5E9"
                            strokeWidth="14"
                            strokeDasharray="35.8 238.76"
                            strokeDashoffset="-202.9"
                          />
                        </>
                      )}
                    </svg>

                    {/* Donut Center Label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        Total
                      </span>
                      <span className="text-base font-black text-slate-900 leading-tight">
                        {categoryAllocationTab === 'OpEx'
                          ? `₹${kpiMetrics.opexTotal >= 1000 ? `${(kpiMetrics.opexTotal / 1000).toFixed(1)}K` : kpiMetrics.opexTotal}`
                          : `₹${kpiMetrics.capexTotal >= 1000 ? `${(kpiMetrics.capexTotal / 1000).toFixed(0)}K` : kpiMetrics.capexTotal}`}
                      </span>
                    </div>
                  </div>

                  {/* Category Breakdown Rows */}
                  <div className="flex-1 w-full space-y-2 text-xs">
                    {categoryAllocationTab === 'OpEx' ? (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#BC0118]"></span>
                            <span className="font-semibold text-slate-700">Salaries &amp; Wages</span>
                          </div>
                          <div className="font-extrabold text-slate-900">
                            ₹20,265 <span className="text-slate-400 font-normal text-[11px] ml-1">42%</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#1E293B]"></span>
                            <span className="font-semibold text-slate-700">Fuel &amp; Transport</span>
                          </div>
                          <div className="font-extrabold text-slate-900">
                            ₹12,545 <span className="text-slate-400 font-normal text-[11px] ml-1">26%</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#0EA5E9]"></span>
                            <span className="font-semibold text-slate-700">Depot Repairs</span>
                          </div>
                          <div className="font-extrabold text-slate-900">
                            ₹6,750 <span className="text-slate-400 font-normal text-[11px] ml-1">14%</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#F97316]"></span>
                            <span className="font-semibold text-slate-700">Depot Utilities</span>
                          </div>
                          <div className="font-extrabold text-slate-900">
                            ₹5,790 <span className="text-slate-400 font-normal text-[11px] ml-1">12%</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#CBD5E1]"></span>
                            <span className="font-semibold text-slate-700">Office &amp; Admin</span>
                          </div>
                          <div className="font-extrabold text-slate-900">
                            ₹2,900 <span className="text-slate-400 font-normal text-[11px] ml-1">6%</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#2563EB]"></span>
                            <span className="font-semibold text-slate-700">Cylinder Deposits</span>
                          </div>
                          <div className="font-extrabold text-slate-900">
                            ₹1,80,000 <span className="text-slate-400 font-normal text-[11px] ml-1">53%</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#1E293B]"></span>
                            <span className="font-semibold text-slate-700">Fleet &amp; Vehicles</span>
                          </div>
                          <div className="font-extrabold text-slate-900">
                            ₹1,10,000 <span className="text-slate-400 font-normal text-[11px] ml-1">32%</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#0EA5E9]"></span>
                            <span className="font-semibold text-slate-700">Depot Racks &amp; Infra</span>
                          </div>
                          <div className="font-extrabold text-slate-900">
                            ₹50,000 <span className="text-slate-400 font-normal text-[11px] ml-1">15%</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Quick View Banner */}
              <div className="mt-5 bg-[#F1F5F9]/60 border border-slate-200/80 rounded-xl p-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-[11px]">
                    Switch to CapEx for Cylinder Deposits &amp; Fleet purchases
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCategoryAllocationTab(categoryAllocationTab === 'OpEx' ? 'CapEx' : 'OpEx');
                    triggerToast(`Switched view to ${categoryAllocationTab === 'OpEx' ? 'CapEx' : 'OpEx'}`);
                  }}
                  className="text-slate-900 font-bold text-xs hover:underline cursor-pointer shrink-0 ml-2"
                >
                  Quick View
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Table: Ledger Transactions */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
            {/* Table Header */}
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Ledger Transactions
              </h2>
              <span className="bg-[#EEF2FF] text-[#3730A3] font-bold text-xs px-2.5 py-0.5 rounded-full border border-indigo-100">
                33 Entries
              </span>
            </div>

            {/* Filter Bar */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-3 sm:p-3.5 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
              <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-wrap">
                {/* Search */}
                <div className="relative min-w-[260px] flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    placeholder="Search by Record ID, payee, asset details..."
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                </div>

                {/* Dropdown 1: All Types */}
                <div className="relative">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full sm:w-auto bg-[#F8FAFC] border border-slate-200 hover:bg-slate-50 pl-3 pr-8 py-2 rounded-xl text-xs font-semibold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer shadow-2xs"
                  >
                    <option value="All Types">All Types</option>
                    <option value="Expense">Expense</option>
                    <option value="Investment">Investment</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Dropdown 2: All Categories */}
                <div className="relative">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full sm:w-auto bg-[#F8FAFC] border border-slate-200 hover:bg-slate-50 pl-3 pr-8 py-2 rounded-xl text-xs font-semibold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer shadow-2xs"
                  >
                    <option value="All Categories">All Categories</option>
                    <option value="Cylinder Deposits">Cylinder Deposits</option>
                    <option value="Fuel & Transport">Fuel &amp; Transport</option>
                    <option value="Vehicle Purchases">Vehicle Purchases</option>
                    <option value="Repairs & Maint.">Repairs &amp; Maint.</option>
                    <option value="Depot Utilities">Depot Utilities</option>
                    <option value="Agency Infra">Agency Infra</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Dropdown 3: All Branches */}
                <div className="relative">
                  <select
                    value={branchFilter}
                    onChange={(e) => setBranchFilter(e.target.value)}
                    className="w-full sm:w-auto bg-[#F8FAFC] border border-slate-200 hover:bg-slate-50 pl-3 pr-8 py-2 rounded-xl text-xs font-semibold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer shadow-2xs"
                  >
                    <option value="All Branches">All Branches</option>
                    <option value="HQ Central">HQ Central</option>
                    <option value="North Hub">North Hub</option>
                    <option value="Bypass Depot">Bypass Depot</option>
                    <option value="Coimbatore Hub">Coimbatore Hub</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Dropdown 4: Status */}
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full sm:w-auto bg-[#F8FAFC] border border-slate-200 hover:bg-slate-50 pl-3 pr-8 py-2 rounded-xl text-xs font-semibold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer shadow-2xs"
                  >
                    <option value="Status: All">Status: All</option>
                    <option value="Approved">Approved</option>
                    <option value="Pending Audit">Pending Audit</option>
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Reset Filters */}
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition cursor-pointer px-2 py-1 self-end xl:self-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto rounded-xl border border-slate-200/80">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#EDF2F9] text-slate-500 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <th className="py-3.5 px-3.5 whitespace-nowrap">RECORD ID &amp; DATE</th>
                    <th className="py-3.5 px-3 whitespace-nowrap">CLASSIFICATION</th>
                    <th className="py-3.5 px-3 whitespace-nowrap">CATEGORY</th>
                    <th className="py-3.5 px-3.5 whitespace-nowrap">ASSET / PAYEE &amp; NARRATIVE</th>
                    <th className="py-3.5 px-3 whitespace-nowrap">DEPOT HUB</th>
                    <th className="py-3.5 px-3.5 text-right whitespace-nowrap">LEDGER AMOUNT</th>
                    <th className="py-3.5 px-3 text-center whitespace-nowrap">PAYMENT STATUS</th>
                    <th className="py-3.5 px-3 text-center whitespace-nowrap">AUDIT STATUS</th>
                    <th className="py-3.5 px-3.5 text-center whitespace-nowrap">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {filteredRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                      {/* Record ID & Date */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <div className="font-extrabold text-slate-900 leading-tight">
                          {rec.recordId}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                          {rec.dateTime}
                        </div>
                      </td>

                      {/* Classification Badge */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {rec.classification === 'Investment' ? (
                          <span className="inline-block bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                            Investment
                          </span>
                        ) : (
                          <span className="inline-block bg-red-50 text-[#BC0118] border border-red-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                            Expense
                          </span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3 whitespace-nowrap font-bold text-slate-800">
                        {rec.category}
                      </td>

                      {/* Asset / Payee & Narrative */}
                      <td className="py-3.5 px-3.5 min-w-[260px] max-w-[340px]">
                        <div className="font-extrabold text-slate-900 leading-snug">
                          {rec.assetPayee}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium leading-tight mt-0.5">
                          {rec.narrative}
                        </div>
                      </td>

                      {/* Depot Hub */}
                      <td className="py-3.5 px-3 whitespace-nowrap font-medium text-slate-600">
                        {rec.depotHub}
                      </td>

                      {/* Ledger Amount */}
                      <td className="py-3.5 px-3.5 text-right whitespace-nowrap">
                        <div className="font-black text-slate-900 text-sm">
                          ₹{rec.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                        <div
                          className={`text-[10px] font-bold mt-0.5 ${
                            rec.amountNoteType === 'success'
                              ? 'text-emerald-600'
                              : rec.amountNoteType === 'danger'
                              ? 'text-red-600 font-black'
                              : 'text-slate-400 font-semibold'
                          }`}
                        >
                          {rec.amountNote}
                        </div>
                      </td>

                      {/* Payment Status */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        {rec.paymentStatus === 'Unpaid' ? (
                          <span className="inline-block bg-red-50 text-red-700 border border-red-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                            Unpaid
                          </span>
                        ) : rec.paymentStatus === 'Partially Paid' ? (
                          <span className="inline-block bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                            Partially Paid
                          </span>
                        ) : (
                          <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                            • {rec.paymentStatus}
                          </span>
                        )}
                      </td>

                      {/* Audit Status */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        {rec.auditStatus === 'Approved' ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                            <Check className="w-3 h-3 stroke-[3]" />
                            <span>Approved</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                            <Clock className="w-3 h-3" />
                            <span>Pending Audit</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-3.5 text-center whitespace-nowrap">
                        {rec.hasActionReview ? (
                          <button
                            type="button"
                            onClick={() => setReviewModalRecord(rec)}
                            className="bg-[#BC0118] hover:bg-red-800 active:scale-98 text-white font-black text-xs px-3 py-1.5 rounded-lg shadow-xs transition cursor-pointer"
                          >
                            Review &amp; Approve
                          </button>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => triggerToast(`Viewing invoice/voucher for ${rec.recordId}`)}
                              title="View Document"
                              className="p-1 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                            >
                              {rec.category === 'Vehicle Purchases' ? (
                                <Paperclip className="w-4 h-4 text-slate-600" />
                              ) : (
                                <FileText className="w-4 h-4 text-slate-600" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => triggerToast(`External transaction details for ${rec.recordId}`)}
                              title="External Link"
                              className="p-1 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                            >
                              <ExternalLink className="w-4 h-4 text-slate-600" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span>Showing 1 to 6 of 33 recorded entries</span>
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
        </main>
      </div>

      {/* Review & Approve Modal */}
      {reviewModalRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    Review Operational Claim
                  </h3>
                  <span className="bg-red-50 text-[#BC0118] border border-red-200 text-xs font-bold px-2 py-0.5 rounded-full">
                    Audit Required
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Reference: {reviewModalRecord.recordId} · {reviewModalRecord.dateTime}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReviewModalRecord(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Details Box */}
            <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-slate-200/80 space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-slate-200/70 pb-2">
                <span className="text-slate-500 font-medium">Category:</span>
                <span className="font-extrabold text-slate-900">{reviewModalRecord.category}</span>
              </div>
              <div className="flex justify-between items-start border-b border-slate-200/70 pb-2">
                <span className="text-slate-500 font-medium">Asset / Payee:</span>
                <span className="font-extrabold text-slate-900 text-right max-w-[240px]">
                  {reviewModalRecord.assetPayee}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200/70 pb-2">
                <span className="text-slate-500 font-medium">Meter Reference:</span>
                <span className="font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {reviewModalRecord.narrative}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200/70 pb-2">
                <span className="text-slate-500 font-medium">Depot Hub:</span>
                <span className="font-bold text-slate-800">{reviewModalRecord.depotHub}</span>
              </div>
              <div className="flex justify-between items-center pt-1 text-sm">
                <span className="text-slate-700 font-bold">Claimed Amount:</span>
                <span className="font-black text-xl text-[#BC0118]">
                  ₹{reviewModalRecord.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={async () => {
                  const targetRecord = reviewModalRecord;
                  if (targetRecord.recordId?.startsWith('EXP-')) {
                    await fetch(`/api/expenses/${targetRecord.id}/review`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        status: 'REJECTED',
                        adminRemark: 'Flagged for supervisor discrepancy inquiry',
                      }),
                    }).catch(() => null);
                  }
                  setLedgerRecords((prev) =>
                    prev.map((rec) =>
                      rec.id === targetRecord.id
                        ? {
                            ...rec,
                            auditStatus: 'Rejected',
                            hasActionReview: false,
                            amountNote: 'Discrepancy Flagged',
                            amountNoteType: 'danger',
                          }
                        : rec
                    )
                  );
                  setReviewModalRecord(null);
                  triggerToast(`Flagged ${targetRecord.recordId} for supervisor discrepancy inquiry`);
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition cursor-pointer text-center"
              >
                Flag Discrepancy
              </button>
              <button
                type="button"
                onClick={() => handleApproveRecord(reviewModalRecord.id)}
                className="flex-1 bg-[#BC0118] hover:bg-red-800 active:scale-98 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-xs transition cursor-pointer text-center"
              >
                Approve &amp; Reconcile
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
