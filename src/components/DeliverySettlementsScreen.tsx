'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  Plus,
  CheckCircle2,
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

  // Live today settlement state
  const [currentPartnerCode, setCurrentPartnerCode] = useState('DP-006');
  const [cashExpected, setCashExpected] = useState(5000);
  const [cashHandedOver, setCashHandedOver] = useState(3000);
  const [remainingBalance, setRemainingBalance] = useState(2000);
  const [todayStatus, setTodayStatus] = useState('Partially Handed Over');
  const [progressPercent, setProgressPercent] = useState(60);
  const [depotInstruction, setDepotInstruction] = useState('Deposit remaining cash at Madurai Depot Counter #2 before shift closing (21:30 IST).');
  const [handoversList, setHandoversList] = useState<HandoverRecord[]>(mockHandovers);
  const [settlementHistory, setSettlementHistory] = useState<SettlementDay[]>(mockSettlementHistory);

  // Cash drop handover modal state
  const [showDropModal, setShowDropModal] = useState(false);
  const [dropAmount, setDropAmount] = useState('2000');
  const [dropType, setDropType] = useState<'AFTERNOON_DROP' | 'EVENING_VAULT' | 'END_OF_SHIFT'>('EVENING_VAULT');
  const [receivedByAdmin, setReceivedByAdmin] = useState('S. Raman (Admin)');
  const [stampNumber, setStampNumber] = useState('');
  const [isSubmittingDrop, setIsSubmittingDrop] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch today's financial summary
  const fetchTodaySettlement = async () => {
    try {
      const res = await fetch(`/api/settlements/today?partnerCode=${currentPartnerCode}`);
      if (!res.ok) return;
      const result = await res.json();
      if (result.success && result.data) {
        const d = result.data;
        if (d.partnerCode) setCurrentPartnerCode(d.partnerCode);
        setCashExpected(d.cashExpected ?? 5000);
        setCashHandedOver(d.cashHandedOver ?? 3000);
        setRemainingBalance(d.remainingBalance ?? 2000);
        setProgressPercent(d.progressPercent ?? 60);
        if (d.status === 'VERIFIED') setTodayStatus('Verified');
        else if (d.status === 'PARTIALLY_HANDED_OVER') setTodayStatus('Partially Handed Over');
        else if (d.status === 'DIFFERENCE_FOUND') setTodayStatus('Difference Found');
        else setTodayStatus('Pending Verification');

        if (d.depotCounterInstruction) setDepotInstruction(d.depotCounterInstruction);
        if (Array.isArray(d.handovers) && d.handovers.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mappedHandovers: HandoverRecord[] = d.handovers.map((h: any) => ({
            id: h.id,
            handoverCode: h.handoverCode,
            dateStr: new Date(h.handoverTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            amount: h.amount,
            timeTag: `${h.dropType.replace(/_/g, ' ')}`,
            status: h.status === 'VERIFIED' ? 'Verified' : 'Pending Verification',
            receivedBy: h.receivedByName || 'S. Raman (Admin)',
            stampOrReceipt: h.stampNumber ? `Stamp: ${h.stampNumber}` : 'Depot vault receipt',
          }));
          setHandoversList(mappedHandovers);
        }
      }
    } catch (err) {
      console.warn('Could not load today settlement from DB:', err);
    }
  };

  // Fetch historical settlement records
  const fetchSettlementHistory = async (partnerToFetch?: string) => {
    try {
      const pCode = partnerToFetch || currentPartnerCode;
      const res = await fetch(`/api/settlements/history?partnerCode=${pCode}&filter=${activeFilter}`);
      if (!res.ok) return;
      const result = await res.json();
      const rawList = Array.isArray(result.data?.settlements)
        ? result.data.settlements
        : Array.isArray(result.data)
        ? result.data
        : [];
      if (result.success && rawList.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mappedHistory: SettlementDay[] = rawList.map((s: any) => ({
          id: s.id,
          date: s.date,
          status: s.status as SettlementDay['status'],
          expectedAmount: s.expectedAmount,
          handedOverAmount: s.handedOverAmount,
          remainingAmount: s.remainingAmount,
          shortfall: s.shortfallAmount > 0 ? s.shortfallAmount : undefined,
          footerStatusText: s.status === 'Verified' ? 'Fully Cleared' : (s.auditRemarks || 'Reconciliation active'),
          isShortfallNotice: s.shortfallAmount > 0,
        }));
        setSettlementHistory(mappedHistory);
      }
    } catch (err) {
      console.warn('Could not load settlement history from DB:', err);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function loadToday() {
      try {
        const res = await fetch('/api/settlements/today');
        if (!res.ok) return;
        const result = await res.json();
        if (!ignore && result.success && result.data) {
          const d = result.data;
          const resolvedCode = d.partnerCode || 'DP-006';
          setCurrentPartnerCode(resolvedCode);
          setCashExpected(d.cashExpected ?? 5000);
          setCashHandedOver(d.cashHandedOver ?? 3000);
          setRemainingBalance(d.remainingBalance ?? 2000);
          setProgressPercent(d.progressPercent ?? 60);
          if (d.status === 'VERIFIED') setTodayStatus('Verified');
          else if (d.status === 'PARTIALLY_HANDED_OVER') setTodayStatus('Partially Handed Over');
          else if (d.status === 'DIFFERENCE_FOUND') setTodayStatus('Difference Found');
          else setTodayStatus('Pending Verification');

          if (d.depotCounterInstruction) setDepotInstruction(d.depotCounterInstruction);
          if (Array.isArray(d.handovers) && d.handovers.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mappedHandovers: HandoverRecord[] = d.handovers.map((h: any) => ({
              id: h.id,
              handoverCode: h.handoverCode,
              dateStr: new Date(h.handoverTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
              amount: h.amount,
              timeTag: `${h.dropType.replace(/_/g, ' ')}`,
              status: h.status === 'VERIFIED' ? 'Verified' : 'Pending Verification',
              receivedBy: h.receivedByName || 'S. Raman (Admin)',
              stampOrReceipt: h.stampNumber ? `Stamp: ${h.stampNumber}` : 'Depot vault receipt',
            }));
            setHandoversList(mappedHandovers);
          }
        }
      } catch (err) {
        console.warn('Could not load today settlement from DB:', err);
      }
    }
    loadToday();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    async function loadHistory() {
      try {
        const res = await fetch(`/api/settlements/history?partnerCode=${currentPartnerCode}&filter=${activeFilter}`);
        if (!res.ok) return;
        const result = await res.json();
        const rawList = Array.isArray(result.data?.settlements)
          ? result.data.settlements
          : Array.isArray(result.data)
          ? result.data
          : [];
        if (!ignore && result.success && rawList.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mappedHistory: SettlementDay[] = rawList.map((s: any) => ({
            id: s.id,
            date: s.date,
            status: s.status as SettlementDay['status'],
            expectedAmount: s.expectedAmount,
            handedOverAmount: s.handedOverAmount,
            remainingAmount: s.remainingAmount,
            shortfall: s.shortfallAmount > 0 ? s.shortfallAmount : undefined,
            footerStatusText: s.status === 'Verified' ? 'Fully Cleared' : (s.auditRemarks || 'Reconciliation active'),
            isShortfallNotice: s.shortfallAmount > 0,
          }));
          setSettlementHistory(mappedHistory);
        }
      } catch (err) {
        console.warn('Could not load settlement history from DB:', err);
      }
    }
    loadHistory();
    return () => {
      ignore = true;
    };
  }, [activeFilter, currentPartnerCode]);

  // Submit cash handover drop (#HND)
  const handleHandoverDropSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingDrop(true);
    try {
      const amountNum = parseFloat(dropAmount.replace(/[^0-9.]/g, ''));
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error('Please enter a valid cash drop amount');
      }

      const res = await fetch('/api/settlements/handover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerCode: currentPartnerCode,
          amount: amountNum,
          dropType,
          receivedByName: receivedByAdmin.trim() || 'S. Raman (Admin)',
          stampNumber: stampNumber.trim() || undefined,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error?.message || 'Failed to submit handover drop');
      }

      await Promise.all([fetchTodaySettlement(), fetchSettlementHistory()]);
      setShowDropModal(false);
      setToastMessage(`Cash drop ${result.data?.handoverEvent?.handoverCode || ''} submitted successfully!`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error submitting cash drop');
    } finally {
      setIsSubmittingDrop(false);
    }
  };

  const filteredHistory = useMemo(() => {
    if (activeFilter === 'All') return settlementHistory;
    return settlementHistory.filter((item) => item.status === activeFilter);
  }, [activeFilter, settlementHistory]);

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
        <button
          type="button"
          onClick={() => {
            setDropAmount(String(remainingBalance || 2000));
            setShowDropModal(true);
          }}
          className="bg-[#BC0118] hover:bg-red-800 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Cash Drop</span>
        </button>
      </div>

      {toastMessage && (
        <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 text-center flex items-center justify-center gap-1.5 shadow-md animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

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
              ₹{cashExpected.toLocaleString('en-IN')}
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
              ₹{cashHandedOver.toLocaleString('en-IN')}
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
              {todayStatus}
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
              ₹{remainingBalance.toLocaleString('en-IN')}
            </p>
          </div>

          {/* Handover Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-slate-500">Handover Progress</span>
              <span className="text-slate-800 font-bold">
                {progressPercent}% (₹{cashHandedOver.toLocaleString('en-IN')} of ₹{cashExpected.toLocaleString('en-IN')})
              </span>
            </div>
            <div className="h-2 w-full bg-slate-200/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-900 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* 3-Column Stats Row */}
          <div className="bg-[#F0F4FF] rounded-xl p-2.5 grid grid-cols-3 text-center divide-x divide-slate-200/70">
            <div>
              <span className="text-[10px] text-slate-500 font-medium block">Expected</span>
              <span className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 block">
                ₹{cashExpected.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-medium block">Received</span>
              <span className="text-xs sm:text-sm font-black text-emerald-600 mt-0.5 block">
                ₹{cashHandedOver.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-medium block">Remaining</span>
              <span className="text-xs sm:text-sm font-black text-[#BC0118] mt-0.5 block">
                ₹{remainingBalance.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Deposit Location Box */}
          <div className="bg-[#EEF2FF]/80 rounded-xl p-3 flex items-start gap-2 text-xs text-slate-600">
            <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p className="leading-snug">
              {depotInstruction}
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
              View All ({handoversList.length})
            </button>
          </div>

          <div className="space-y-2.5">
            {handoversList.map((item) => (
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
              {handoversList.map((h) => (
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

      {/* Cash Drop / Handover Modal */}
      {showDropModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4">
          <div className="w-full max-w-[390px] bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Submit Cash Drop Handover
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Deposit customer cash collections at depot counter
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDropModal(false)}
                className="p-1 text-slate-400 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleHandoverDropSubmit} className="space-y-3.5 text-xs">
              {/* Handover Amount */}
              <div>
                <label className="text-slate-800 font-bold block mb-1">
                  Cash Amount (INR) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-600 text-sm">₹</span>
                  <input
                    type="text"
                    required
                    value={dropAmount}
                    onChange={(e) => setDropAmount(e.target.value)}
                    placeholder="2000"
                    className="w-full bg-[#F1F4FA] border-0 rounded-xl pl-8 pr-4 py-2.5 font-black text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-medium mt-1 block">
                  Remaining in hand: ₹{remainingBalance.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Drop Type */}
              <div>
                <label className="text-slate-800 font-bold block mb-1">
                  Drop Window / Type
                </label>
                <select
                  value={dropType}
                  onChange={(e) => setDropType(e.target.value as typeof dropType)}
                  className="w-full bg-[#F1F4FA] border-0 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="AFTERNOON_DROP">Afternoon Drop (Mid-day run)</option>
                  <option value="EVENING_VAULT">Evening Vault (Shift Closing)</option>
                  <option value="END_OF_SHIFT">End of Shift (Final Deposit)</option>
                </select>
              </div>

              {/* Received By Admin */}
              <div>
                <label className="text-slate-800 font-bold block mb-1">
                  Received by Depot Admin *
                </label>
                <input
                  type="text"
                  required
                  value={receivedByAdmin}
                  onChange={(e) => setReceivedByAdmin(e.target.value)}
                  placeholder="S. Raman (Admin)"
                  className="w-full bg-[#F1F4FA] border-0 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Stamp Number */}
              <div>
                <label className="text-slate-800 font-bold block mb-1">
                  Depot Stamp or Receipt # (Optional)
                </label>
                <input
                  type="text"
                  value={stampNumber}
                  onChange={(e) => setStampNumber(e.target.value)}
                  placeholder="e.g. #DPT-MDU-883"
                  className="w-full bg-[#F1F4FA] border-0 rounded-xl px-3.5 py-2.5 font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  disabled={isSubmittingDrop}
                  onClick={() => setShowDropModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDrop}
                  className="flex-1 py-2.5 rounded-xl bg-[#BC0118] hover:bg-red-800 text-white font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingDrop && (
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  )}
                  <span>{isSubmittingDrop ? 'Verifying...' : 'Submit Cash Drop'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
