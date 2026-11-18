'use client';

import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  X,
  FileText,
  CheckCircle2,
  Clock,
  Fuel,
  Coins,
  Wrench,
  AlertCircle,
  XCircle,
  Slash,
  Banknote,
  Receipt,
  Download,
} from 'lucide-react';

export interface LedgerExpense {
  id: string;
  code: string;
  dateStr: string;
  category: string;
  categoryType: 'fuel' | 'toll' | 'maintenance' | 'parking' | 'repair';
  amount: number;
  amountStatus: 'Submitted' | 'Disallowed';
  description: string;
  approvalStatus: 'Approved' | 'Pending Review' | 'Rejected';
  paymentStatus: 'Unpaid' | 'N/A' | 'Paid in Full' | 'Partially Paid';
  partiallyPaidAmount?: number;
  adminRemark?: string;
  paidVia?: string;
  referenceNumber?: string;
  settledAmount?: number;
  balanceDue?: number;
  period: 'this-month' | 'last-30' | 'last-7' | 'today';
}

const mockLedgerData: LedgerExpense[] = [
  {
    id: 'exp-001',
    code: 'EXP-001',
    dateStr: '02 Nov 2026',
    category: 'Diesel / Fuel',
    categoryType: 'fuel',
    amount: 1000,
    amountStatus: 'Submitted',
    description: 'Vehicle fuel expense - HPCL Madurai bypass refuel (Van TN-58-BZ-4412)',
    approvalStatus: 'Approved',
    paymentStatus: 'Unpaid',
    period: 'this-month',
  },
  {
    id: 'exp-002',
    code: 'EXP-002',
    dateStr: '01 Nov 2026',
    category: 'Toll Charges',
    categoryType: 'toll',
    amount: 500,
    amountStatus: 'Submitted',
    description: 'Highway toll payment - Kappalur toll plaza commercial entry',
    approvalStatus: 'Pending Review',
    paymentStatus: 'Unpaid',
    period: 'this-month',
  },
  {
    id: 'exp-003',
    code: 'EXP-003',
    dateStr: '30 Oct 2026',
    category: 'Vehicle Maintenance',
    categoryType: 'maintenance',
    amount: 2000,
    amountStatus: 'Disallowed',
    description: 'Vehicle servicing - Rear brake shoe adjustment & oil lubrication',
    adminRemark: 'Unscheduled major service requires prior depot PO approval. Claim not reimbursable under standard field allowance.',
    approvalStatus: 'Rejected',
    paymentStatus: 'N/A',
    period: 'last-30',
  },
  {
    id: 'exp-004',
    code: 'EXP-004',
    dateStr: '26 Oct 2026',
    category: 'Parking Charges',
    categoryType: 'parking',
    amount: 150,
    amountStatus: 'Submitted',
    description: 'Commercial complex entry parking fee - Mattuthavani Wholesale Market',
    approvalStatus: 'Approved',
    paymentStatus: 'Paid in Full',
    paidVia: 'Paid via UPI - 28 Oct 2026',
    referenceNumber: 'Ref: UPI-992104',
    period: 'last-30',
  },
  {
    id: 'exp-005',
    code: 'EXP-005',
    dateStr: '22 Oct 2026',
    category: 'Vehicle Repair',
    categoryType: 'repair',
    amount: 350,
    amountStatus: 'Submitted',
    description: 'Emergency tyre puncture repair & air top-up on delivery route',
    approvalStatus: 'Approved',
    paymentStatus: 'Partially Paid',
    partiallyPaidAmount: 200,
    settledAmount: 200,
    balanceDue: 150,
    period: 'last-30',
  },
];

interface DeliveryMyExpensesScreenProps {
  onBack: () => void;
}

export default function DeliveryMyExpensesScreen({ onBack }: DeliveryMyExpensesScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'This Month' | 'Last 30 Days' | 'Last 7 Days' | 'Today'>('This Month');
  const [selectedExpense, setSelectedExpense] = useState<LedgerExpense | null>(null);

  const filteredExpenses = useMemo(() => {
    let list = [...mockLedgerData];

    // Filter by period
    if (activeFilter === 'This Month') {
      list = list.filter((e) => e.period === 'this-month' || e.period === 'last-30');
    } else if (activeFilter === 'Last 30 Days') {
      list = list.filter((e) => e.period === 'last-30' || e.period === 'this-month');
    } else if (activeFilter === 'Last 7 Days') {
      list = list.filter((e) => e.period === 'this-month');
    } else if (activeFilter === 'Today') {
      list = list.filter((e) => e.code === 'EXP-001');
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (e) =>
          e.code.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q)
      );
    }

    return list;
  }, [activeFilter, searchQuery]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC] overflow-hidden">
      {/* Driver Header Strip */}
      <div className="shrink-0 px-4 pt-3 pb-3 bg-[#EEF2FB] border-b border-slate-200/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-1 -ml-1 text-slate-800 hover:text-black transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2]" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#DDE4F5] text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
              SB
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-tight">
                <span className="font-bold text-sm text-slate-900">Suresh Babu</span>
                <span className="bg-slate-200/80 text-slate-600 text-[10px] font-bold px-1.5 py-0.2 rounded">
                  DP-003
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Madurai Central Fleet · Van TN-58-BZ-4412
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Screen Content */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-4 pb-8">
        {/* Title & Subtitle */}
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Expense Ledger
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Verified operational receipts & settlement tracking
          </p>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* Card 1: SUBMITTED */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                SUBMITTED
              </span>
              <FileText className="w-3.5 h-3.5 text-slate-400 stroke-[2.2]" />
            </div>
            <p className="text-lg font-black text-slate-900 tracking-tight mt-1">
              ₹4,500
            </p>
            <p className="text-[10px] font-medium text-slate-400">
              5 logged entries
            </p>
          </div>

          {/* Card 2: APPROVED */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-600 tracking-wider uppercase">
                APPROVED
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 stroke-[2.2]" />
            </div>
            <p className="text-lg font-black text-emerald-600 tracking-tight mt-1">
              ₹3,000
            </p>
            <p className="text-[10px] font-medium text-slate-400">
              Verified audit
            </p>
          </div>

          {/* Card 3: PENDING */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-700 tracking-wider uppercase">
                PENDING
              </span>
              <div className="w-3.5 h-3.5 rounded-full border-1.5 border-amber-600 flex items-center justify-center">
                <span className="text-[9px] font-black text-amber-600 leading-none">⋯</span>
              </div>
            </div>
            <p className="text-lg font-black text-amber-800 tracking-tight mt-1">
              ₹1,500
            </p>
            <p className="text-[10px] font-medium text-slate-400">
              Admin review
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
            placeholder="Search by ID or description.."
            className="w-full text-xs font-medium text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {(['All', 'This Month', 'Last 30 Days', 'Last 7 Days', 'Today'] as const).map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#BC0118] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>

        {/* Expense Cards List */}
        <div className="space-y-3">
          {filteredExpenses.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/70">
              <p className="text-sm font-semibold text-slate-700">No expenses found</p>
              <p className="text-xs text-slate-400 mt-1">Try another search keyword or filter</p>
            </div>
          ) : (
            filteredExpenses.map((expense) => (
              <div
                key={expense.id}
                onClick={() => setSelectedExpense(expense)}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-2.5 hover:shadow-xs transition cursor-pointer"
              >
                {/* Header Row: Icon, ID, Category, Amount */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {/* Category Icon */}
                    {expense.categoryType === 'fuel' && (
                      <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                        <Fuel className="w-4 h-4 stroke-[2.2]" />
                      </div>
                    )}
                    {expense.categoryType === 'toll' && (
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Coins className="w-4 h-4 stroke-[2.2]" />
                      </div>
                    )}
                    {expense.categoryType === 'maintenance' && (
                      <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                        <Wrench className="w-4 h-4 stroke-[2.2]" />
                      </div>
                    )}
                    {expense.categoryType === 'parking' && (
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 font-black text-sm flex items-center justify-center shrink-0">
                        P
                      </div>
                    )}
                    {expense.categoryType === 'repair' && (
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Wrench className="w-4 h-4 stroke-[2.2]" />
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                        <span className="font-bold text-slate-900">{expense.code}</span>
                        <span>·</span>
                        <span>{expense.dateStr}</span>
                      </div>
                      <p
                        className={`text-xs font-bold mt-0.5 ${
                          expense.categoryType === 'fuel' ? 'text-[#BC0118]' : 'text-slate-600'
                        }`}
                      >
                        {expense.category}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-base font-black tracking-tight ${
                        expense.amountStatus === 'Disallowed' ? 'text-[#BC0118]' : 'text-slate-900'
                      }`}
                    >
                      ₹{expense.amount.toLocaleString('en-IN')}
                    </span>
                    <span
                      className={`block text-[10px] font-medium ${
                        expense.amountStatus === 'Disallowed' ? 'text-[#BC0118] font-bold' : 'text-slate-400'
                      }`}
                    >
                      {expense.amountStatus}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-800 font-medium leading-relaxed">
                  {expense.description}
                </p>

                {/* Optional Admin Remark Box */}
                {expense.adminRemark && (
                  <div className="bg-[#FFF5F5] border border-rose-100 rounded-xl p-2.5 space-y-1">
                    <div className="flex items-center gap-1.5 text-rose-700 font-bold text-xs">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Admin Remark:</span>
                    </div>
                    <p className="text-[11px] text-slate-700 font-medium leading-snug">
                      {expense.adminRemark}
                    </p>
                  </div>
                )}

                {/* Status Badges Row */}
                <div className="flex items-center gap-2 pt-0.5">
                  {/* Approval Badge */}
                  {expense.approvalStatus === 'Approved' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3 stroke-[2.4]" />
                      <span>Approval: Approved</span>
                    </span>
                  )}
                  {expense.approvalStatus === 'Pending Review' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 text-[10px] font-bold">
                      <Clock className="w-3 h-3 stroke-[2.4]" />
                      <span>Approval: Pending Review</span>
                    </span>
                  )}
                  {expense.approvalStatus === 'Rejected' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                      <XCircle className="w-3 h-3 stroke-[2.4]" />
                      <span>Approval: Rejected</span>
                    </span>
                  )}

                  {/* Payment Badge */}
                  {expense.paymentStatus === 'Unpaid' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50/80 text-amber-700 border border-amber-200/80 text-[10px] font-bold">
                      <Clock className="w-3 h-3 stroke-[2.4]" />
                      <span>Payment: Unpaid</span>
                    </span>
                  )}
                  {expense.paymentStatus === 'N/A' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold">
                      <Slash className="w-3 h-3 stroke-[2.4]" />
                      <span>Payment: N/A</span>
                    </span>
                  )}
                  {expense.paymentStatus === 'Paid in Full' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-bold">
                      <Banknote className="w-3 h-3 stroke-[2.4]" />
                      <span>Payment: Paid in Full</span>
                    </span>
                  )}
                  {expense.paymentStatus === 'Partially Paid' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EEF2FF] text-[#4338CA] border border-indigo-200 text-[10px] font-bold">
                      <Clock className="w-3 h-3 stroke-[2.4]" />
                      <span>Payment: Partially Paid (₹{expense.partiallyPaidAmount})</span>
                    </span>
                  )}
                </div>

                {/* Optional Info Strip for Paid in Full */}
                {expense.paidVia && (
                  <div className="bg-[#EEF2FF] rounded-xl px-3 py-1.5 flex items-center justify-between text-[11px] font-medium">
                    <span className="text-slate-600">{expense.paidVia}</span>
                    <span className="text-slate-500">{expense.referenceNumber}</span>
                  </div>
                )}

                {/* Optional Progress & Balance for Partially Paid */}
                {expense.paymentStatus === 'Partially Paid' && (
                  <div className="bg-[#EEF2FF] rounded-xl p-2.5 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-600">
                      <span>Settled: ₹{expense.settledAmount}</span>
                      <span>Balance due: ₹{expense.balanceDue}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-700 rounded-full w-[57%]" />
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Expense Detail Modal */}
      {selectedExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4">
          <div className="w-full max-w-[390px] bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  {selectedExpense.code} · Details
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedExpense(null)}
                className="p-1 text-slate-400 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 rounded-xl p-3 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Date:</span>
                  <span className="font-bold text-slate-900">{selectedExpense.dateStr}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Category:</span>
                  <span className="font-bold text-slate-900">{selectedExpense.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount:</span>
                  <span className="font-black text-slate-900 text-sm">₹{selectedExpense.amount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="border border-slate-100 rounded-xl p-3 space-y-2">
                <div>
                  <span className="text-slate-500 block mb-0.5">Description:</span>
                  <p className="font-medium text-slate-800">{selectedExpense.description}</p>
                </div>
                {selectedExpense.adminRemark && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-rose-600 font-bold block mb-0.5">Admin Remark:</span>
                    <p className="text-slate-700">{selectedExpense.adminRemark}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSelectedExpense(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  alert(`Downloading Expense Receipt for ${selectedExpense.code} (PDF)...`);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#BC0118] hover:bg-red-800 text-white font-bold text-xs transition shadow-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Receipt PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
