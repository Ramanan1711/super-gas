'use client';

import React, { useState, useMemo } from 'react';
import {
  Truck,
  Check,
  RefreshCw,
  Home,
  Users,
  Box,
  Banknote,
  Menu,
  ChevronDown,
  ChevronUp,
  Building2,
  ArrowUpRight,
  ArrowDownLeft,
  Wifi,
  Flame,
  TableProperties,
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

interface DeliveryStocksScreenProps {
  activeBottomNav?: 'HOME' | 'CUSTOMERS' | 'STOCKS' | 'EXPENSES' | 'MORE';
  setActiveBottomNav?: (nav: 'HOME' | 'CUSTOMERS' | 'STOCKS' | 'EXPENSES' | 'MORE') => void;
}

export default function DeliveryStocksScreen({
  activeBottomNav = 'STOCKS',
  setActiveBottomNav,
}: DeliveryStocksScreenProps) {
  const [filterType, setFilterType] = useState<'all' | 'issued' | 'delivered' | 'empty'>('all');
  const [showAllMovements, setShowAllMovements] = useState(false);

  const filteredMovements = useMemo(() => {
    if (filterType === 'all') return mockMovements;
    if (filterType === 'issued') return mockMovements.filter((m) => m.type === 'stock-issued');
    if (filterType === 'delivered') return mockMovements.filter((m) => m.type === 'delivered');
    if (filterType === 'empty') return mockMovements.filter((m) => m.type === 'empty-collected' || m.type === 'handed-over');
    return mockMovements;
  }, [filterType]);

  const handleNav = (nav: 'HOME' | 'CUSTOMERS' | 'STOCKS' | 'EXPENSES' | 'MORE') => {
    if (setActiveBottomNav) {
      setActiveBottomNav(nav);
    }
  };

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col font-sans antialiased text-slate-800 overflow-hidden relative">
      {/* Device Status Bar */}
      <div className="shrink-0 px-6 pt-3 pb-1 flex items-center justify-between text-xs font-bold text-slate-800 bg-white select-none">
        <span>9:30</span>
        {/* Camera Punch-Hole Notch */}
        <div className="w-4 h-4 rounded-full bg-black -ml-4" />
        {/* System Status Icons */}
        <div className="flex items-center gap-1.5 text-slate-800">
          <Wifi className="w-3.5 h-3.5 stroke-[2.4]" />
          <div className="flex items-end gap-0.5 h-3">
            <span className="w-0.5 h-1.5 bg-slate-800 rounded-2xs" />
            <span className="w-0.5 h-2 bg-slate-800 rounded-2xs" />
            <span className="w-0.5 h-2.5 bg-slate-800 rounded-2xs" />
            <span className="w-0.5 h-3 bg-slate-800 rounded-2xs" />
          </div>
          <div className="w-5 h-2.5 border-1.5 border-slate-800 rounded-2xs p-0.5 flex items-center">
            <div className="h-full w-full bg-slate-800 rounded-3xs" />
          </div>
        </div>
      </div>

      {/* Screen Header */}
      <div className="shrink-0 px-5 pt-3 pb-3 bg-white border-b border-slate-100">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          My Stocks
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          View your filled and empty stock by category.
        </p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3.5 space-y-4 pb-24">
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
              <p className="text-3xl font-black text-slate-900 tracking-tight">10</p>
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
              <p className="text-3xl font-black text-slate-900 tracking-tight">15</p>
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

      {/* Fixed Bottom Navigation Bar */}
      <div className="shrink-0 bg-white border-t border-slate-200/80 px-6 pt-2.5 pb-1 flex flex-col z-20 shadow-lg">
        <div className="flex items-center justify-between">
          {/* Home */}
          <button
            type="button"
            onClick={() => handleNav('HOME')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
              activeBottomNav === 'HOME' ? 'text-[#BC0118]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Home className="w-5 h-5 stroke-[2]" />
            <span className="text-[11px] font-medium">Home</span>
          </button>

          {/* Customers */}
          <button
            type="button"
            onClick={() => handleNav('CUSTOMERS')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
              activeBottomNav === 'CUSTOMERS' ? 'text-[#BC0118]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Users className="w-5 h-5 stroke-[2]" />
            <span className="text-[11px] font-medium">Customers</span>
          </button>

          {/* My stocks */}
          <button
            type="button"
            onClick={() => handleNav('STOCKS')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
              activeBottomNav === 'STOCKS' ? 'text-[#BC0118]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Box className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[11px] font-bold text-[#BC0118]">My stocks</span>
          </button>

          {/* Expenses */}
          <button
            type="button"
            onClick={() => handleNav('EXPENSES')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
              activeBottomNav === 'EXPENSES' ? 'text-[#BC0118]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Banknote className="w-5 h-5 stroke-[2]" />
            <span className="text-[11px] font-medium">Expenses</span>
          </button>

          {/* More */}
          <button
            type="button"
            onClick={() => handleNav('MORE')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
              activeBottomNav === 'MORE' ? 'text-[#BC0118]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Menu className="w-5 h-5 stroke-[2]" />
            <span className="text-[11px] font-medium">More</span>
          </button>
        </div>

        {/* Mobile Home Indicator Bar */}
        <div className="w-32 h-1 bg-black rounded-full mx-auto mt-2 mb-1" />
      </div>
    </div>
  );
}
