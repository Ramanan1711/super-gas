'use client';

import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Banknote,
  Building2,
  Info,
  MapPin,
  ChevronRight,
  X,
  FileCheck2,
  Download,
} from 'lucide-react';

export interface SettlementDay {
  id: string;
  date: string;
  status: 'Verified' | 'Pending Verification' | 'Partially Handed Over' | 'Difference Found';
  expectedAmount: number;
  handedOverAmount: number;
  remainingAmount: number;
  shortfall?: number;
  footerStatusText: string;
  isShortfallNotice?: boolean;
}

export interface HandoverRecord {
  id: string;
  handoverCode: string;
  dateStr: string;
  amount: number;
  timeTag: string;
  status: 'Verified' | 'Pending Verification';
  receivedBy: string;
  stampOrReceipt: string;
}

const mockHandovers: HandoverRecord[] = [
  {
    id: 'hnd-1',
    handoverCode: '#HND-20261102-01',
    dateStr: '2 Nov 2026',
    amount: 3000,
    timeTag: 'Today, 01:45 PM (Afternoon Drop)',
    status: 'Verified',
    receivedBy: 'S. Raman (Admin)',
    stampOrReceipt: 'Stamp: #DPT-MDU-882',
  },
  {
    id: 'hnd-2',
    handoverCode: '#HND-20261102-02',
    dateStr: '2 Nov 2026',
    amount: 1500,
    timeTag: 'Today, 05:15 PM (Evening Vault)',
    status: 'Pending Verification',
    receivedBy: 'S. Raman (Admin)',
    stampOrReceipt: 'Receipt in transit',
  },
];

const mockSettlementHistory: SettlementDay[] = [
  {
    id: 'set-1',
    date: '1 November 2026',
    status: 'Verified',
    expectedAmount: 4500,
    handedOverAmount: 4500,
    remainingAmount: 0,
    footerStatusText: 'Fully Cleared',
  },
  {
    id: 'set-2',
    date: '31 October 2026',
    status: 'Pending Verification',
    expectedAmount: 3200,
    handedOverAmount: 3200,
    remainingAmount: 0,
    footerStatusText: 'Drop Verification In Progress',
  },
  {
    id: 'set-3',
    date: '30 October 2026',
    status: 'Partially Handed Over',
    expectedAmount: 5000,
    handedOverAmount: 4000,
    remainingAmount: 1000,
    footerStatusText: 'Pending Vault Submission',
  },
  {
    id: 'set-4',
    date: '29 October 2026',
    status: 'Difference Found',
    expectedAmount: 6000,
    handedOverAmount: 5800,
    remainingAmount: 200,
    shortfall: 200,
    footerStatusText: 'Shortfall flagged by depot',
    isShortfallNotice: true,
  },
];

interface DeliverySettlementsScreenProps {
  onBack: () => void;
}

export default function DeliverySettlementsScreen({ onBack }: DeliverySettlementsScreenProps) {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Verified' | 'Partially Handed Over' | 'Pending Verification'>('All');
  const [selectedSettlement, setSelectedSettlement] = useState<SettlementDay | null>(null);
  const [showAllHandoversModal, setShowAllHandoversModal] = useState(false);

  const filteredHistory = useMemo(() => {
    if (activeFilter === 'All') return mockSettlementHistory;
    return mockSettlementHistory.filter((item) => item.status === activeFilter);
  }, [activeFilter]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC] overflow-hidden">
      {/* Top Header */}
      <div className="shrink-0 px-4 pt-3 pb-3 bg-white border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-1 -ml-1 text-slate-800 hover:text-black transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2]" />
          </button>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">
            My Settlements
          </h1>
        </div>
      </div>

      {/* Scrollable Screen Content */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-4 pb-8">
        {/* Top 2 KPI Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Card 1: Cash Collected */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                Cash Collected
              </span>
              <div className="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
                <Banknote className="w-4 h-4 stroke-[2.2]" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              ₹5,000
            </p>
            <p className="text-[11px] font-medium text-slate-400">
              Customer cash payments
            </p>
          </div>

          {/* Card 2: Cash Handed Over */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                Cash Handed Over
              </span>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Building2 className="w-4 h-4 stroke-[2.2]" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              ₹3,000
            </p>
            <p className="text-[11px] font-medium text-slate-400">
              Admin received cash
            </p>
          </div>
        </div>

        {/* Disclaimer Note */}
        <div className="flex items-center gap-1.5 px-0.5 text-xs text-slate-500 font-medium">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Excludes UPI payments (Direct Bank transfer settlements)</span>
        </div>

        {/* Today's Settlement Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3.5">
          {/* Card Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Today&apos;s Settlement
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Business Date: 2 November 2026
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#E0E7FF]/80 text-[#4338CA] text-[11px] font-bold">
              Partially Handed Over
            </span>
          </div>

          {/* Remaining Cash Highlight Box */}
          <div className="bg-[#EEF2FF] rounded-2xl p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">
                Remaining Cash to Hand Over
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#FFE4E6] text-[#E11D48] text-[10px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48]" />
                Pending Handover
              </span>
            </div>
            <p className="text-3xl font-black text-[#BC0118] tracking-tight">
              ₹2,000
            </p>
          </div>

          {/* Handover Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-slate-500">Handover Progress</span>
              <span className="text-slate-800 font-bold">60% (₹3,000 of ₹5,000)</span>
            </div>
            <div className="h-2 w-full bg-slate-200/80 rounded-full overflow-hidden">
              <div className="h-full bg-slate-900 rounded-full w-[60%]" />
            </div>
          </div>

          {/* 3-Column Stats Row */}
          <div className="bg-[#F0F4FF] rounded-xl p-2.5 grid grid-cols-3 text-center divide-x divide-slate-200/70">
            <div>
              <span className="text-[10px] text-slate-500 font-medium block">Expected</span>
              <span className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 block">
                ₹5,000
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-medium block">Received</span>
              <span className="text-xs sm:text-sm font-black text-emerald-600 mt-0.5 block">
                ₹3,000
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-medium block">Remaining</span>
              <span className="text-xs sm:text-sm font-black text-[#BC0118] mt-0.5 block">
                ₹2,000
              </span>
            </div>
          </div>

          {/* Deposit Location Box */}
          <div className="bg-[#EEF2FF]/80 rounded-xl p-3 flex items-start gap-2 text-xs text-slate-600">
            <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="leading-snug">
              Deposit remaining cash at <span className="font-bold text-slate-900">Madurai Depot Counter #2</span> before shift closing <span className="font-bold text-slate-900">(21:30 IST)</span>.
            </p>
          </div>
        </div>

        {/* Cash Handover History */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between pt-1">
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              Cash Handover History
            </h2>
            <button
              type="button"
              onClick={() => setShowAllHandoversModal(true)}
              className="text-xs font-bold text-[#BC0118] hover:underline cursor-pointer"
            >
              View All (2)
            </button>
          </div>

          <div className="space-y-2.5">
            {mockHandovers.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-2"
              >
                {/* Header row: ID & status */}
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-400 font-medium">
                    <span className="font-bold text-slate-900">{item.handoverCode}</span> · {item.dateStr}
                  </div>
                  {item.status === 'Verified' ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] text-[10px] font-bold">
                      Verified
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#E0E7FF] text-[#4338CA] text-[10px] font-bold">
                      Pending Verification
                    </span>
                  )}
                </div>

                {/* Amount & Time row */}
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-black text-slate-900 tracking-tight">
                    ₹{item.amount.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {item.timeTag}
                  </span>
                </div>

                {/* Bottom row: Admin & Stamp */}
                <div className="flex items-center justify-between text-[11px] font-medium pt-0.5">
                  <span className="text-slate-600">
                    Received by: <span className="font-semibold text-slate-800">{item.receivedBy.replace('Received by: ', '')}</span>
                  </span>
                  <span className="text-slate-500">
                    {item.stampOrReceipt}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Settlement History */}
        <div className="space-y-3 pt-2">
          <h2 className="text-base font-black text-slate-900 tracking-tight">
            Settlement History
          </h2>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {(['All', 'Verified', 'Partially Handed Over', 'Pending Verification'] as const).map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-[#EEF2FF] text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>

          {/* List of Settlement Days */}
          <div className="space-y-3">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3"
              >
                {/* Header: Date & Status Badge */}
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-slate-900">
                    {item.date}
                  </h3>
                  {item.status === 'Verified' && (
                    <span className="px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] text-[10px] font-bold">
                      Verified
                    </span>
                  )}
                  {item.status === 'Pending Verification' && (
                    <span className="px-2 py-0.5 rounded-full bg-[#E0E7FF] text-[#4338CA] text-[10px] font-bold">
                      Pending Verification
                    </span>
                  )}
                  {item.status === 'Partially Handed Over' && (
                    <span className="px-2 py-0.5 rounded-full bg-[#E0E7FF] text-[#4338CA] text-[10px] font-bold">
                      Partially Handed Over
                    </span>
                  )}
                  {item.status === 'Difference Found' && (
                    <span className="px-2 py-0.5 rounded-full bg-[#FFE4E6] text-[#E11D48] text-[10px] font-bold">
                      Difference Found
                    </span>
                  )}
                </div>

                {/* 3-Column Expected / Handed Over / Remaining Box */}
                <div className="bg-[#EEF2FF]/60 rounded-xl p-2.5 grid grid-cols-3 text-center divide-x divide-slate-200/60">
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium block">Expected</span>
                    <span className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 block">
                      ₹{item.expectedAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium block">Handed Over</span>
                    <span
                      className={`text-xs sm:text-sm font-black mt-0.5 block ${
                        item.status === 'Verified' ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      ₹{item.handedOverAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium block">Remaining</span>
                    <span
                      className={`text-xs sm:text-sm font-black mt-0.5 block ${
                        item.shortfall
                          ? 'text-[#BC0118]'
                          : item.remainingAmount > 0
                          ? 'text-[#BC0118]'
                          : 'text-slate-900'
                      }`}
                    >
                      {item.shortfall ? `₹${item.shortfall} Short` : `₹${item.remainingAmount}`}
                    </span>
                  </div>
                </div>

                {/* Footer Row */}
                <div className="flex items-center justify-between pt-0.5 text-xs">
                  <span
                    className={`font-medium ${
                      item.isShortfallNotice ? 'text-[#BC0118] font-semibold' : 'text-slate-400'
                    }`}
                  >
                    {item.footerStatusText}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedSettlement(item)}
                    className="text-[#BC0118] hover:text-red-800 font-bold flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>View Details</span>
                    <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Settlement Detail Modal */}
      {selectedSettlement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4">
          <div className="w-full max-w-[390px] bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  Settlement Details · {selectedSettlement.date}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSettlement(null)}
                className="p-1 text-slate-400 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 rounded-xl p-3 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Settlement Date:</span>
                  <span className="font-bold text-slate-900">{selectedSettlement.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-bold text-slate-900">{selectedSettlement.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Audit Status:</span>
                  <span className="font-medium text-slate-700">{selectedSettlement.footerStatusText}</span>
                </div>
              </div>

              <div className="border border-slate-100 rounded-xl p-3 space-y-2">
                <div className="flex justify-between font-medium text-slate-600">
                  <span>Customer Cash Collections:</span>
                  <span className="font-bold text-slate-900">₹{selectedSettlement.expectedAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-medium text-slate-600">
                  <span>Total Deposited at Depot:</span>
                  <span className="font-bold text-emerald-700">₹{selectedSettlement.handedOverAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-sm">
                  <span>Balance Outstanding:</span>
                  <span className={selectedSettlement.remainingAmount > 0 ? 'text-[#BC0118]' : 'text-slate-900'}>
                    ₹{selectedSettlement.remainingAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSelectedSettlement(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  alert(`Downloading Settlement Voucher for ${selectedSettlement.date} (PDF)...`);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#BC0118] hover:bg-red-800 text-white font-bold text-xs transition shadow-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Voucher PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All Handovers Modal */}
      {showAllHandoversModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4">
          <div className="w-full max-w-[390px] bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                All Cash Handovers
              </h3>
              <button
                type="button"
                onClick={() => setShowAllHandoversModal(false)}
                className="p-1 text-slate-400 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-[350px] overflow-y-auto">
              {mockHandovers.map((h) => (
                <div key={h.id} className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
                  <div className="flex justify-between font-bold">
                    <span>{h.handoverCode}</span>
                    <span className="text-emerald-700">₹{h.amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="text-slate-400 text-[10px]">{h.timeTag}</div>
                  <div className="text-slate-600 text-[11px]">{h.receivedBy} · {h.stampOrReceipt}</div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowAllHandoversModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
