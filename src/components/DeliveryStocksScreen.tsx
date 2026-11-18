'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Truck,
  Check,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Building2,
  ArrowUpRight,
  ArrowDownLeft,
  Flame,
  TableProperties,
  Plus,
  X,
  CheckCircle2,
} from 'lucide-react';

interface MovementRecord {
  id: string;
  type: 'delivered' | 'empty-collected' | 'stock-issued' | 'handed-over';
  title: string;
  subtitle: string;
  subDetail?: string;
  time: string;
  badgeText: string;
  badgeStyle: string;
  footerText: string;
  footerStyle?: string;
}

const mockMovements: MovementRecord[] = [
  {
    id: 'mov-1',
    type: 'delivered',
    title: '6x 19.5 KG Commercial LPG',
    subtitle: 'Hotel Annapoorna • #INV-20261024-08',
    time: 'Today, 12:10 PM',
    badgeText: '-6 Filled',
    badgeStyle: 'bg-rose-100 text-rose-700',
    footerText: 'Bal: 2 cyl',
    footerStyle: 'text-slate-400',
  },
  {
    id: 'mov-2',
    type: 'empty-collected',
    title: '5x 19.5 KG Commercial LPG',
    subtitle: 'Hotel Annapoorna • #COL-20261024',
    time: 'Today, 12:10 PM',
    badgeText: '+5 Empty',
    badgeStyle: 'bg-blue-100 text-blue-700',
    footerText: 'Bal: 8 cyl',
    footerStyle: 'text-slate-400',
  },
  {
    id: 'mov-3',
    type: 'stock-issued',
    title: '15x Cylinders Multi-Spec',
    subtitle: 'Gate Pass #GP-1094 (Depot Admin)',
    time: 'Today, 08:15 AM',
    badgeText: '+15 Filled',
    badgeStyle: 'bg-emerald-100 text-emerald-700',
    footerText: 'Depot Dispatch',
    footerStyle: 'text-emerald-600',
  },
  {
    id: 'mov-4',
    type: 'handed-over',
    title: '8x Empty Handed Over',
    subtitle: 'Receipt #RET-20261023-018',
    subDetail: '(Depot S. Raman)',
    time: '23 Oct 2026, 06:30 PM',
    badgeText: '-8 Empty',
    badgeStyle: 'bg-blue-100 text-blue-700',
    footerText: 'Handed Over',
    footerStyle: 'text-slate-400',
  },
];

export default function DeliveryStocksScreen() {
  const [filterType, setFilterType] = useState<'all' | 'issued' | 'delivered' | 'empty'>('all');
  const [showAllMovements, setShowAllMovements] = useState(false);
  const [totalFilled, setTotalFilled] = useState(10);
  const [totalEmpty, setTotalEmpty] = useState(15);
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [transferType, setTransferType] = useState<'LOAD_VEHICLE' | 'UNLOAD_VEHICLE'>('LOAD_VEHICLE');
  const [selectedProductCode, setSelectedProductCode] = useState('19KG_COMM');
  const [filledQty, setFilledQty] = useState('5');
  const [emptyQty, setEmptyQty] = useState('0');
  const [transferNotes, setTransferNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Fetch live vehicle inventory on mount & reload
  const fetchInventory = async () => {
    try {
      const res = await fetch('/api/inventory/vehicle?regNumber=TN%2058%20AX%204821');
      if (!res.ok) return;
      const result = await res.json();
      if (result.success && result.data?.summary) {
        setTotalFilled(result.data.summary.totalFilled);
        setTotalEmpty(result.data.summary.totalEmpty);
      }
    } catch (err) {
      console.warn('Could not load live inventory from database:', err);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function loadData() {
      try {
        const res = await fetch('/api/inventory/vehicle?regNumber=TN%2058%20AX%204821');
        if (!res.ok) return;
        const result = await res.json();
        if (!ignore && result.success && result.data?.summary) {
          setTotalFilled(result.data.summary.totalFilled);
          setTotalEmpty(result.data.summary.totalEmpty);
        }
      } catch (err) {
        console.warn('Could not load live inventory from database:', err);
      }
    }
    loadData();
    return () => {
      ignore = true;
    };
  }, []);

  // Handle reload / shift return handover submit
  const handleHandoverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/inventory/handover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerCode: 'DP-003',
          vehicleReg: 'TN 58 AX 4821',
          transferType,
          notes: transferNotes || (transferType === 'LOAD_VEHICLE' ? 'Depot truck reload' : 'End of shift empty return'),
          items: [
            {
              productCode: selectedProductCode,
              filledQuantity: parseInt(filledQty || '0', 10),
              emptyQuantity: parseInt(emptyQty || '0', 10),
              damagedQuantity: 0,
            },
          ],
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error?.message || 'Failed to submit stock handover');
      }

      await fetchInventory();
      setShowHandoverModal(false);
      setTransferNotes('');
      setToastMsg(
        transferType === 'LOAD_VEHICLE'
          ? `Successfully loaded ${filledQty} filled cylinders from depot!`
          : `Successfully returned ${emptyQty} empty cylinders to depot!`
      );
      setTimeout(() => setToastMsg(null), 3500);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error syncing stock handover');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMovements = useMemo(() => {
    if (filterType === 'all') return mockMovements;
    if (filterType === 'issued') return mockMovements.filter((m) => m.type === 'stock-issued');
    if (filterType === 'delivered') return mockMovements.filter((m) => m.type === 'delivered');
    if (filterType === 'empty') return mockMovements.filter((m) => m.type === 'empty-collected' || m.type === 'handed-over');
    return mockMovements;
  }, [filterType]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC] overflow-hidden">
      {/* Screen Header */}
      <div className="shrink-0 px-5 pt-3 pb-3 bg-white border-b border-slate-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            My Stocks
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            View your filled and empty stock by category.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowHandoverModal(true)}
          className="bg-[#BC0118] hover:bg-red-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Reload / Handover</span>
        </button>
      </div>

      {toastMsg && (
        <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 text-center flex items-center justify-center gap-1.5 shadow-md animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3.5 space-y-4 pb-6">
        {/* Driver & Vehicle Info Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 leading-tight">
                Suresh Babu
              </h2>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                DP-003 • Van 03 (TN 58 AX 4821)
              </p>
            </div>
          </div>
          <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-full">
            On Route
          </span>
        </div>

        {/* Stock Summary Row (Filled & Empty) */}
        <div className="grid grid-cols-2 gap-3.5">
          {/* Card 1: Filled Stock */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Flame className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                Ready
              </span>
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900 tracking-tight">{totalFilled}</p>
              <p className="text-xs font-black text-slate-900 leading-tight mt-0.5">
                Filled Stock
              </p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                In Your Custody
              </p>
            </div>
          </div>

          {/* Card 2: Empty Stock */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <RefreshCw className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                Returns
              </span>
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900 tracking-tight">{totalEmpty}</p>
              <p className="text-xs font-black text-slate-900 leading-tight mt-0.5">
                Empty Stock
              </p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                From Customers
              </p>
            </div>
          </div>
        </div>

        {/* Category-wise Stock Details Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TableProperties className="w-4 h-4 text-[#BC0118]" />
              <h3 className="text-sm font-black text-slate-900 leading-tight">
                Category-wise Stock<br className="hidden sm:inline" /> Details
              </h3>
            </div>
            <span className="bg-blue-50/70 text-blue-700 text-[10px] font-bold px-2.5 py-1 rounded-full">
              Admin Master Catalog
            </span>
          </div>

          {/* Category Cards */}
          <div className="space-y-2.5">
            {/* Card 1: 19.5 KG Commercial LPG */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#BC0118] shrink-0" />
                  <span className="text-xs font-black text-slate-900">
                    19.5 KG Commercial LPG
                  </span>
                </div>
                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
                  Standard
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-[#F1F4FA] rounded-xl p-2.5 flex items-center justify-between">
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase">
                      Filled Stock
                    </span>
                    <span className="text-xs font-black text-slate-900">2 cyl</span>
                  </div>
                  <span className="bg-rose-100 text-rose-700 text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                    Low
                  </span>
                </div>
                <div className="bg-[#F1F4FA] rounded-xl p-2.5 flex items-center justify-between">
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase">
                      Empty Stock
                    </span>
                    <span className="text-xs font-black text-slate-900">8 cyl</span>
                  </div>
                  <span className="bg-blue-100/70 text-blue-700 text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                    Custody
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: 21.5 KG Industrial LPG */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-600 shrink-0" />
                  <span className="text-xs font-black text-slate-900">
                    21.5 KG Industrial LPG
                  </span>
                </div>
                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
                  Industrial
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-[#F1F4FA] rounded-xl p-2.5 flex items-center justify-between">
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase">
                      Filled Stock
                    </span>
                    <span className="text-xs font-black text-slate-900">4 cyl</span>
                  </div>
                  <span className="bg-emerald-100 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                    Optimal
                  </span>
                </div>
                <div className="bg-[#F1F4FA] rounded-xl p-2.5 flex items-center justify-between">
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase">
                      Empty Stock
                    </span>
                    <span className="text-xs font-black text-slate-900">4 cyl</span>
                  </div>
                  <span className="bg-blue-100/70 text-blue-700 text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                    Custody
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: 32.5 KG Heavy Commercial LPG */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-600 shrink-0" />
                  <span className="text-xs font-black text-slate-900">
                    32.5 KG Heavy Commercial LPG
                  </span>
                </div>
                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
                  High Vol
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-[#F1F4FA] rounded-xl p-2.5 flex items-center justify-between">
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase">
                      Filled Stock
                    </span>
                    <span className="text-xs font-black text-slate-900">3 cyl</span>
                  </div>
                  <span className="bg-emerald-100 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                    Optimal
                  </span>
                </div>
                <div className="bg-[#F1F4FA] rounded-xl p-2.5 flex items-center justify-between">
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase">
                      Empty Stock
                    </span>
                    <span className="text-xs font-black text-slate-900">2 cyl</span>
                  </div>
                  <span className="bg-blue-100/70 text-blue-700 text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                    Custody
                  </span>
                </div>
              </div>
            </div>

            {/* Card 4: 47.5 KG Bulk Cylinder */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-600 shrink-0" />
                  <span className="text-xs font-black text-slate-900">
                    47.5 KG Bulk Cylinder
                  </span>
                </div>
                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
                  Special Order
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-[#F1F4FA] rounded-xl p-2.5 flex items-center justify-between">
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase">
                      Filled Stock
                    </span>
                    <span className="text-xs font-black text-slate-900">1 cyl</span>
                  </div>
                  <span className="bg-emerald-100 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                    Optimal
                  </span>
                </div>
                <div className="bg-[#F1F4FA] rounded-xl p-2.5 flex items-center justify-between">
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase">
                      Empty Stock
                    </span>
                    <span className="text-xs font-black text-slate-900">1 cyl</span>
                  </div>
                  <span className="bg-blue-100/70 text-blue-700 text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                    Custody
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Chips Strip for Movements */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-2">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`text-xs px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition cursor-pointer ${
              filterType === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-blue-50/80 text-slate-700 hover:bg-blue-100/70'
            }`}
          >
            All (18)
          </button>
          <button
            type="button"
            onClick={() => setFilterType('issued')}
            className={`text-xs px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition cursor-pointer ${
              filterType === 'issued'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-blue-50/80 text-slate-700 hover:bg-blue-100/70'
            }`}
          >
            Stock Issued
          </button>
          <button
            type="button"
            onClick={() => setFilterType('delivered')}
            className={`text-xs px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition cursor-pointer ${
              filterType === 'delivered'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-blue-50/80 text-slate-700 hover:bg-blue-100/70'
            }`}
          >
            Delivered
          </button>
          <button
            type="button"
            onClick={() => setFilterType('empty')}
            className={`text-xs px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition cursor-pointer ${
              filterType === 'empty'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-blue-50/80 text-slate-700 hover:bg-blue-100/70'
            }`}
          >
            Empty Collected
          </button>
        </div>

        {/* Movements Activity List */}
        <div className="space-y-2.5">
          {filteredMovements.map((mov) => (
            <div
              key={mov.id}
              className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-2xs flex items-center justify-between transition hover:shadow-xs"
            >
              <div className="flex items-center gap-3">
                {mov.type === 'delivered' && (
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <ArrowUpRight className="w-4 h-4 stroke-[2.4]" />
                  </div>
                )}
                {mov.type === 'empty-collected' && (
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <ArrowDownLeft className="w-4 h-4 stroke-[2.4]" />
                  </div>
                )}
                {mov.type === 'stock-issued' && (
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 stroke-[2.8]" />
                  </div>
                )}
                {mov.type === 'handed-over' && (
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4 stroke-[2.2]" />
                  </div>
                )}

                <div>
                  <h4 className="text-xs font-black text-slate-900">{mov.title}</h4>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                    {mov.subtitle}
                  </p>
                  {mov.subDetail && (
                    <p className="text-[10px] text-slate-400 font-medium">
                      {mov.subDetail}
                    </p>
                  )}
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                    {mov.time}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-md ${mov.badgeStyle}`}>
                  {mov.badgeText}
                </span>
                <p className={`text-[10px] font-medium mt-1 ${mov.footerStyle || 'text-slate-400'}`}>
                  {mov.footerText}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* View All Movements Link */}
        <div className="pt-1 pb-4 text-center">
          <button
            type="button"
            onClick={() => setShowAllMovements(!showAllMovements)}
            className="text-xs font-bold text-[#BC0118] hover:text-red-800 transition inline-flex items-center gap-1 cursor-pointer"
          >
            <span>View All Movements (18)</span>
            {showAllMovements ? (
              <ChevronUp className="w-3.5 h-3.5 stroke-[2.5]" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
            )}
          </button>
        </div>
      </div>

      {/* Stock Handover / Reload Modal */}
      {showHandoverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4">
          <div className="w-full max-w-[400px] bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Depot Stock Transfer
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Van TN 58 AX 4821 ↔ Madurai Central Depot
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowHandoverModal(false)}
                className="p-1 text-slate-400 hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleHandoverSubmit} className="space-y-3.5 text-xs">
              {/* Transfer Type */}
              <div>
                <label className="text-slate-800 font-bold block mb-1">
                  Transfer Direction
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTransferType('LOAD_VEHICLE')}
                    className={`py-2 px-3 rounded-xl font-bold border transition cursor-pointer text-center ${
                      transferType === 'LOAD_VEHICLE'
                        ? 'bg-[#BC0118] text-white border-[#BC0118]'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    + Reload (Load Van)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransferType('UNLOAD_VEHICLE')}
                    className={`py-2 px-3 rounded-xl font-bold border transition cursor-pointer text-center ${
                      transferType === 'UNLOAD_VEHICLE'
                        ? 'bg-[#BC0118] text-white border-[#BC0118]'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    - Return (Unload Van)
                  </button>
                </div>
              </div>

              {/* Cylinder Type */}
              <div>
                <label className="text-slate-800 font-bold block mb-1">
                  Cylinder Specification
                </label>
                <select
                  value={selectedProductCode}
                  onChange={(e) => setSelectedProductCode(e.target.value)}
                  className="w-full bg-[#F1F4FA] border-0 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="19KG_COMM">19.5 KG Commercial LPG (Red)</option>
                  <option value="47.5KG_COMM">47.5 KG Bulk Jumbo Cylinder</option>
                  <option value="25KG_IND">25.0 KG Industrial LPG</option>
                  <option value="14.2KG_DOM">14.2 KG Domestic LPG</option>
                </select>
              </div>

              {/* Quantities */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-800 font-bold block mb-1">
                    Filled Cylinders
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={filledQty}
                    onChange={(e) => setFilledQty(e.target.value)}
                    className="w-full bg-[#F1F4FA] border-0 rounded-xl px-3.5 py-2 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="text-slate-800 font-bold block mb-1">
                    Empty Cylinders
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={emptyQty}
                    onChange={(e) => setEmptyQty(e.target.value)}
                    className="w-full bg-[#F1F4FA] border-0 rounded-xl px-3.5 py-2 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-slate-800 font-bold block mb-1">
                  Transfer Note / Gate Pass #
                </label>
                <input
                  type="text"
                  placeholder="e.g. Gate Pass #GP-20261102"
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  className="w-full bg-[#F1F4FA] border-0 rounded-xl px-3.5 py-2 text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowHandoverModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-[#BC0118] hover:bg-red-800 text-white font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting && (
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  )}
                  <span>{isSubmitting ? 'Syncing...' : 'Confirm Transfer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
