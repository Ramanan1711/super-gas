'use client';

import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Receipt,
  Hourglass,
  CheckCircle2,
  X,
  Fuel,
  Wrench,
  Utensils,
  Smartphone,
  Truck,
  ChevronRight,
  Paperclip,
  UploadCloud,
  Check,
} from 'lucide-react';

interface ExpenseClaim {
  id: string;
  code: string;
  category: string;
  categoryType: 'fuel' | 'vehicle' | 'food' | 'parking' | 'mobile' | 'other';
  amount: number;
  dateStr: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  paymentStatus: string;
  description?: string;
  referenceOrNote?: string;
  hasReceipt?: boolean;
  vanInfo?: string;
}

const initialClaims: ExpenseClaim[] = [
  {
    id: 'exp-1',
    code: 'EXP-20261024-009',
    category: 'Fuel / Petrol',
    categoryType: 'fuel',
    amount: 1450,
    dateStr: 'Today, 11:30 AM',
    status: 'PENDING',
    paymentStatus: 'Unpaid',
    hasReceipt: true,
    vanInfo: 'Van 03 (TN 58 AX 4821)',
  },
  {
    id: 'exp-2',
    code: 'EXP-20261020-006',
    category: 'Vehicle Maintenance',
    categoryType: 'vehicle',
    amount: 2800,
    dateStr: '20 Oct 2026',
    status: 'APPROVED',
    paymentStatus: 'Paid - Depot UPI',
    description: 'Brake pad replacement & tyre puncture repair - Madurai',
    referenceOrNote: 'Ref: UPI-98421092',
    hasReceipt: true,
  },
  {
    id: 'exp-3',
    code: 'EXP-20261018-004',
    category: 'Food / Allowance',
    categoryType: 'food',
    amount: 1200,
    dateStr: '19 Oct 2026',
    status: 'REJECTED',
    paymentStatus: 'Disallowed',
    description: 'Unauthorized route detour lunch',
    referenceOrNote: 'Audit Disallowed',
    hasReceipt: false,
  },
  {
    id: 'exp-4',
    code: 'EXP-20261016-003',
    category: 'Parking Charges',
    categoryType: 'parking',
    amount: 700,
    dateStr: '16 Oct 2026',
    status: 'APPROVED',
    paymentStatus: 'Unpaid',
    description: 'Commercial loading bay parking tokens at Wholesale..',
    referenceOrNote: 'Next Friday settlement cycle',
    hasReceipt: true,
  },
  {
    id: 'exp-5',
    code: 'EXP-20261022-007',
    category: 'Mobile / Data',
    categoryType: 'mobile',
    amount: 700,
    dateStr: '22 Oct 2026',
    status: 'PENDING',
    paymentStatus: 'Unpaid',
    description: 'Customer GPS navigation & Super Gas dispatch..',
    referenceOrNote: 'Attached e-tax bill',
    hasReceipt: true,
  },
];

export default function DeliveryExpensesScreen() {
  const [claims, setClaims] = useState<ExpenseClaim[]>(initialClaims);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [sortOrder, setSortOrder] = useState<'LATEST' | 'OLDEST'>('LATEST');
  const [showAddModal, setShowAddModal] = useState(false);

  // New expense form state
  const [newCategory, setNewCategory] = useState<'Fuel / Petrol' | 'Vehicle Maintenance' | 'Food / Allowance' | 'Parking Charges' | 'Mobile / Data' | 'Other'>('Fuel / Petrol');
  const [newAmount, setNewAmount] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [hasNewReceipt, setHasNewReceipt] = useState(true);

  // Filter and sort claims
  const filteredClaims = useMemo(() => {
    let list = [...claims];

    // Filter by tab
    if (activeFilter !== 'ALL') {
      list = list.filter((item) => item.status === activeFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.code.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q)) ||
          (item.referenceOrNote && item.referenceOrNote.toLowerCase().includes(q))
      );
    }

    // Sort order
    if (sortOrder === 'OLDEST') {
      list.reverse();
    }

    return list;
  }, [claims, activeFilter, searchQuery, sortOrder]);

  // Dynamic counts and totals
  const totalSubmitted = useMemo(
    () => claims.reduce((acc, curr) => acc + curr.amount, 0),
    [claims]
  );
  const pendingCount = useMemo(
    () => claims.filter((c) => c.status === 'PENDING').length,
    [claims]
  );
  const pendingTotal = useMemo(
    () => claims.filter((c) => c.status === 'PENDING').reduce((acc, curr) => acc + curr.amount, 0),
    [claims]
  );
  const approvedCount = useMemo(
    () => claims.filter((c) => c.status === 'APPROVED').length,
    [claims]
  );
  const approvedTotal = useMemo(
    () => claims.filter((c) => c.status === 'APPROVED').reduce((acc, curr) => acc + curr.amount, 0),
    [claims]
  );
  const rejectedCount = useMemo(
    () => claims.filter((c) => c.status === 'REJECTED').length,
    [claims]
  );
  const rejectedTotal = useMemo(
    () => claims.filter((c) => c.status === 'REJECTED').reduce((acc, curr) => acc + curr.amount, 0),
    [claims]
  );

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAmount || isNaN(Number(newAmount))) return;

    const amountNum = Number(newAmount);
    let catType: ExpenseClaim['categoryType'] = 'fuel';
    if (newCategory === 'Vehicle Maintenance') catType = 'vehicle';
    else if (newCategory === 'Food / Allowance') catType = 'food';
    else if (newCategory === 'Parking Charges') catType = 'parking';
    else if (newCategory === 'Mobile / Data') catType = 'mobile';
    else if (newCategory === 'Other') catType = 'other';

    const newClaim: ExpenseClaim = {
      id: `exp-${Date.now()}`,
      code: `EXP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-0${claims.length + 1}`,
      category: newCategory,
      categoryType: catType,
      amount: amountNum,
      dateStr: 'Today, Just now',
      status: 'PENDING',
      paymentStatus: 'Unpaid',
      description: newDesc || undefined,
      hasReceipt: hasNewReceipt,
      vanInfo: catType === 'fuel' ? 'Van 03 (TN 58 AX 4821)' : undefined,
    };

    setClaims([newClaim, ...claims]);
    setNewAmount('');
    setNewDesc('');
    setShowAddModal(false);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC] overflow-hidden">
      {/* Screen Header */}
      <div className="shrink-0 px-5 pt-3 pb-3 bg-white border-b border-slate-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            My Claims
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Partner settlement claims & allowances
          </p>
        </div>

        {/* Add Expense Button */}
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="bg-[#BC0118] hover:bg-red-800 active:scale-95 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3.5 space-y-3.5 pb-6">
        {/* KPI Summary Cards (2x2 Grid) */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Card 1: Total Submitted */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/70 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Total Submitted</span>
              <div className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                <Receipt className="w-3.5 h-3.5 stroke-[2]" />
              </div>
            </div>
            <p className="text-[22px] font-black text-slate-900 tracking-tight mt-1">
              ₹{totalSubmitted.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              {claims.length} claims lodged
            </p>
          </div>

          {/* Card 2: Pending */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/70 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Pending</span>
              <div className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1 text-[10px] font-bold">
                <Hourglass className="w-2.5 h-2.5 stroke-[2.5]" />
                <span>{pendingCount}</span>
              </div>
            </div>
            <p className="text-[22px] font-black text-slate-900 tracking-tight mt-1">
              ₹{pendingTotal.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-amber-600 font-medium mt-0.5">
              Under review
            </p>
          </div>

          {/* Card 3: Approved */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/70 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Approved</span>
              <div className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1 text-[10px] font-bold">
                <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                <span>{approvedCount}</span>
              </div>
            </div>
            <p className="text-[22px] font-black text-slate-900 tracking-tight mt-1">
              ₹{approvedTotal.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
              Verified claims
            </p>
          </div>

          {/* Card 4: Rejected */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/70 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Rejected</span>
              <div className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 flex items-center gap-1 text-[10px] font-bold">
                <X className="w-2.5 h-2.5 stroke-[2.5]" />
                <span>{rejectedCount}</span>
              </div>
            </div>
            <p className="text-[22px] font-black text-slate-900 tracking-tight mt-1">
              ₹{rejectedTotal.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-rose-600 font-medium mt-0.5">
              Requires action
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white border border-slate-200/80 rounded-2xl px-3.5 py-2.5 flex items-center gap-2.5 shadow-2xs">
          <Search className="w-4 h-4 text-slate-400 stroke-[2] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, category, notes..."
            className="w-full text-xs font-medium text-slate-800 placeholder:text-slate-400 bg-transparent focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {/* All */}
          <button
            type="button"
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>All</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeFilter === 'ALL' ? 'bg-slate-700 text-slate-100' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {claims.length}
            </span>
          </button>

          {/* Pending */}
          <button
            type="button"
            onClick={() => setActiveFilter('PENDING')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeFilter === 'PENDING'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white border border-slate-200/70 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Pending</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-amber-100 text-amber-700">
              {pendingCount}
            </span>
          </button>

          {/* Approved */}
          <button
            type="button"
            onClick={() => setActiveFilter('APPROVED')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeFilter === 'APPROVED'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white border border-slate-200/70 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Approved</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-emerald-100 text-emerald-700">
              {approvedCount}
            </span>
          </button>

          {/* Rejected */}
          <button
            type="button"
            onClick={() => setActiveFilter('REJECTED')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeFilter === 'REJECTED'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white border border-slate-200/70 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Rejected</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-rose-100 text-rose-700">
              {rejectedCount}
            </span>
          </button>
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
            EXPENSE CLAIMS (OCT 2026)
          </span>
          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === 'LATEST' ? 'OLDEST' : 'LATEST')}
            className="text-[11px] text-slate-400 font-medium hover:text-slate-600 cursor-pointer transition"
          >
            Sort: {sortOrder === 'LATEST' ? 'Latest First' : 'Oldest First'}
          </button>
        </div>

        {/* Expense Cards List */}
        <div className="space-y-3">
          {filteredClaims.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/70">
              <p className="text-sm font-semibold text-slate-700">No expense claims found</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            filteredClaims.map((item) => {
              // Accent bar border color by status
              const borderLeftClass =
                item.status === 'PENDING'
                  ? 'border-l-[3.5px] border-l-amber-500'
                  : item.status === 'APPROVED'
                  ? 'border-l-[3.5px] border-l-emerald-500'
                  : 'border-l-[3.5px] border-l-rose-500';

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl p-4 border border-slate-200/70 shadow-2xs ${borderLeftClass} transition-shadow hover:shadow-xs`}
                >
                  {/* Top Row: Category Icon, Name, Amount */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {/* Category Icon */}
                      {item.categoryType === 'fuel' && (
                        <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                          <Fuel className="w-5 h-5 stroke-[2.2]" />
                        </div>
                      )}
                      {item.categoryType === 'vehicle' && (
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <Wrench className="w-5 h-5 stroke-[2.2]" />
                        </div>
                      )}
                      {item.categoryType === 'food' && (
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                          <Utensils className="w-5 h-5 stroke-[2.2]" />
                        </div>
                      )}
                      {item.categoryType === 'parking' && (
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 font-black flex items-center justify-center shrink-0 text-base">
                          P
                        </div>
                      )}
                      {item.categoryType === 'mobile' && (
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <Smartphone className="w-5 h-5 stroke-[2.2]" />
                        </div>
                      )}
                      {item.categoryType === 'other' && (
                        <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center shrink-0">
                          <Receipt className="w-5 h-5 stroke-[2.2]" />
                        </div>
                      )}

                      <div>
                        <h2 className="text-sm font-bold text-slate-900 leading-tight">
                          {item.category}
                        </h2>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                          {item.code}
                        </p>
                      </div>
                    </div>

                    {/* Amount & Date/Receipt */}
                    <div className="text-right">
                      <p
                        className={`text-base font-black tracking-tight ${
                          item.status === 'REJECTED' ? 'text-[#BC0118]' : 'text-slate-900'
                        }`}
                      >
                        ₹{item.amount.toFixed(2)}
                      </p>
                      {item.hasReceipt ? (
                        <p className="text-[11px] text-slate-400 font-medium flex items-center justify-end gap-1 mt-0.5">
                          <Paperclip className="w-3 h-3 text-slate-400" />
                          <span>Receipt</span>
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                          {item.dateStr}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Optional Description */}
                  {item.description && (
                    <p className="text-xs text-slate-500 font-normal mt-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  {/* Badges and Subtext Row */}
                  <div className="flex items-center justify-between mt-3 pt-1 border-t border-slate-50">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Status Badge */}
                      {item.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/70 text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          <span>Pending Approval</span>
                        </span>
                      )}
                      {item.status === 'APPROVED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>Approved</span>
                        </span>
                      )}
                      {item.status === 'REJECTED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/70 text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                          <span>Rejected (Policy)</span>
                        </span>
                      )}

                      {/* Payment Status Badge */}
                      {item.paymentStatus === 'Unpaid' && (
                        <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200/70 text-[10px] font-bold">
                          Unpaid
                        </span>
                      )}
                      {item.paymentStatus.includes('Paid') && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-[10px] font-bold">
                          {item.paymentStatus}
                        </span>
                      )}
                      {item.paymentStatus === 'Disallowed' && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                          Disallowed
                        </span>
                      )}
                    </div>

                    {/* Right detail text or Date */}
                    {item.referenceOrNote ? (
                      <span className="text-[11px] text-slate-400 font-medium">
                        {item.referenceOrNote}
                      </span>
                    ) : item.hasReceipt ? (
                      <span className="text-[11px] text-slate-400 font-medium">
                        {item.dateStr}
                      </span>
                    ) : null}
                  </div>

                  {/* Van Info Bottom Bar (if applicable, e.g. for fuel) */}
                  {item.vanInfo && (
                    <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 flex items-center justify-between mt-2.5">
                      <div className="flex items-center gap-2 text-slate-600 text-xs font-medium">
                        <Truck className="w-4 h-4 text-slate-500 shrink-0 stroke-[2]" />
                        <span>{item.vanInfo}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* You're All Caught Up Footer */}
        <div className="pt-5 pb-4 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 border-2 border-white shadow-2xs flex items-center justify-center text-slate-600 mx-auto mb-2">
            <CheckCircle2 className="w-6 h-6 stroke-[2]" />
          </div>
          <h3 className="font-extrabold text-slate-800 text-sm">
            You&apos;re All Caught Up
          </h3>
          <p className="text-xs text-slate-400 text-center max-w-[280px] mx-auto leading-relaxed mt-1">
            All physical receipts submitted for October delivery shifts are synchronized with Chennai Hub dispatch.
          </p>
        </div>
      </div>

      {/* Add Expense Modal Bottom Sheet */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4">
          <div className="w-full max-w-[430px] bg-white rounded-t-[28px] sm:rounded-3xl p-5 shadow-2xl border border-slate-200/80 animate-in slide-in-from-bottom duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Add Expense</h3>
                <p className="text-xs text-slate-500 font-medium">Partner Settlement Claim</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddExpenseSubmit} className="mt-4 space-y-3.5 text-xs">
              {/* Category Selection */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Expense Category*</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as typeof newCategory)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="Fuel / Petrol">Fuel / Petrol</option>
                  <option value="Vehicle Maintenance">Vehicle Maintenance</option>
                  <option value="Food / Allowance">Food / Allowance</option>
                  <option value="Parking Charges">Parking Charges</option>
                  <option value="Mobile / Data">Mobile / Data</option>
                  <option value="Other">Other Miscellaneous</option>
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Amount (₹)*</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-7 pr-3 py-2.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Description / Purpose</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Provide details (e.g. 10L diesel top-up at HPCL)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Upload Receipt */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Receipt Attachment</label>
                <div
                  onClick={() => setHasNewReceipt(!hasNewReceipt)}
                  className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition ${
                    hasNewReceipt
                      ? 'border-emerald-400 bg-emerald-50/50 text-emerald-700'
                      : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <UploadCloud className="w-5 h-5 text-slate-400" />
                    <p className="font-semibold text-xs">
                      {hasNewReceipt ? 'Receipt Attached (e-slip.jpg)' : 'Click to capture or upload receipt'}
                    </p>
                    <span className="text-[10px] text-slate-400">PNG, JPG, PDF up to 10 MB</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#BC0118] hover:bg-red-800 text-white font-bold transition shadow-sm"
                >
                  Submit Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
