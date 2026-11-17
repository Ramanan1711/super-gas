'use client';

import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, Wifi } from 'lucide-react';

export interface DeliveryHistoryItem {
  id: string;
  invoiceNo: string;
  dateTime: string;
  timestamp: number;
  specs: {
    cylinderType: string;
    details: string;
  }[];
  totalAmount: number;
  totalDisplay: string;
  status: 'Paid' | 'Unpaid' | 'Partial Payment';
}

const mockDeliveriesData: DeliveryHistoryItem[] = [
  {
    id: 'del-1',
    invoiceNo: '#INV-20261018-052',
    dateTime: '18 Oct 2026, 03:45 PM',
    timestamp: 1792328700000,
    specs: [
      {
        cylinderType: '19.5 KG',
        details: '8x Delivered · 8x Collected',
      },
    ],
    totalAmount: 7200,
    totalDisplay: '₹7,200.00',
    status: 'Paid',
  },
  {
    id: 'del-2',
    invoiceNo: '#INV-20261018-052',
    dateTime: '18 Oct 2026, 03:45 PM',
    timestamp: 1792328699000,
    specs: [
      {
        cylinderType: '19.5 KG',
        details: '8x Delivered · 8x Collected',
      },
      {
        cylinderType: '33 KG',
        details: '6x Delivered · 2x Collected',
      },
    ],
    totalAmount: 7200,
    totalDisplay: '₹7,200.00',
    status: 'Paid',
  },
  {
    id: 'del-3',
    invoiceNo: '#INV-20261018-052',
    dateTime: '18 Oct 2026, 03:45 PM',
    timestamp: 1792328698000,
    specs: [
      {
        cylinderType: '19.5 KG',
        details: '8x Delivered · 8x Collected',
      },
    ],
    totalAmount: 7200,
    totalDisplay: '₹7,200.00',
    status: 'Unpaid',
  },
  {
    id: 'del-4',
    invoiceNo: '#INV-20261018-052',
    dateTime: '18 Oct 2026, 03:45 PM',
    timestamp: 1792328697000,
    specs: [
      {
        cylinderType: '19.5 KG',
        details: '8x Delivered · 8x Collected',
      },
    ],
    totalAmount: 7200,
    totalDisplay: '₹7,200.00',
    status: 'Partial Payment',
  },
  {
    id: 'del-5',
    invoiceNo: '#INV-20261018-052',
    dateTime: '18 Oct 2026, 03:45 PM',
    timestamp: 1792328696000,
    specs: [
      {
        cylinderType: '19.5 KG',
        details: '8x Delivered · 8x Collected',
      },
    ],
    totalAmount: 7200,
    totalDisplay: '₹7,200.00',
    status: 'Paid',
  },
  {
    id: 'del-6',
    invoiceNo: '#INV-20261018-052',
    dateTime: '18 Oct 2026, 03:45 PM',
    timestamp: 1792328695000,
    specs: [
      {
        cylinderType: '19.5 KG',
        details: '8x Delivered · 8x Collected',
      },
    ],
    totalAmount: 7200,
    totalDisplay: '₹7,200.00',
    status: 'Paid',
  },
];

interface CustomerAllDeliveriesScreenProps {
  onBack?: () => void;
  customerName?: string;
}

export default function CustomerAllDeliveriesScreen({
  onBack,
}: CustomerAllDeliveriesScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  const filteredAndSorted = useMemo(() => {
    let list = mockDeliveriesData.filter((item) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.invoiceNo.toLowerCase().includes(q) ||
        item.dateTime.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q)
      );
    });

    if (sortBy === 'newest') {
      list = [...list].sort((a, b) => b.timestamp - a.timestamp);
    } else if (sortBy === 'oldest') {
      list = [...list].sort((a, b) => a.timestamp - b.timestamp);
    } else if (sortBy === 'highest') {
      list = [...list].sort((a, b) => b.totalAmount - a.totalAmount);
    } else if (sortBy === 'lowest') {
      list = [...list].sort((a, b) => a.totalAmount - b.totalAmount);
    }

    return list;
  }, [searchQuery, sortBy]);

  return (
    <div className="w-full h-full bg-white flex flex-col font-sans antialiased text-slate-800 overflow-hidden">
      {/* Device Status Bar */}
      <div className="shrink-0 px-6 pt-3 pb-1 flex items-center justify-between text-xs font-bold text-slate-800 bg-white select-none">
        <span>9:30</span>
        {/* Camera Punch-Hole Notch */}
        <div className="w-4 h-4 rounded-full bg-black -ml-4" />
        {/* Status Icons */}
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

      {/* Screen Header Bar */}
      <div className="shrink-0 px-4 py-3 flex items-center gap-3 bg-white">
        <button
          type="button"
          onClick={onBack ? onBack : () => window.history.back()}
          className="p-1 -ml-1 text-slate-900 hover:text-slate-600 transition cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
        </button>
        <h1 className="text-lg font-black text-slate-900 tracking-tight">
          All Deliveries
        </h1>
      </div>

      {/* Search Input Bar */}
      <div className="shrink-0 px-5 pt-1 pb-3 bg-white">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by invoice"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200/90 rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none shadow-2xs focus:border-slate-400 transition"
          />
        </div>
      </div>

      {/* Sort By Filter Chips */}
      <div className="shrink-0 px-5 pb-3.5 flex items-center gap-2 overflow-x-auto scrollbar-none bg-white">
        <span className="text-xs text-slate-700 font-semibold mr-0.5 shrink-0">
          Sort by:
        </span>
        {[
          { id: 'newest', label: 'Newest first' },
          { id: 'oldest', label: 'Oldest first' },
          { id: 'highest', label: 'Highest invoice' },
          { id: 'lowest', label: 'Lowest invoice' },
        ].map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => setSortBy(chip.id as 'newest' | 'oldest' | 'highest' | 'lowest')}
            className={`rounded-xl border px-3 py-1.5 text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
              sortBy === chip.id
                ? 'bg-white border-slate-300 text-slate-900 shadow-2xs'
                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Deliveries List */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-6 space-y-3.5">
        {filteredAndSorted.map((item) => (
          <div
            key={item.id}
            className="bg-[#F8FAFC] rounded-2xl p-4 space-y-2.5 transition"
          >
            {/* Card Header: Invoice & DateTime */}
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs text-slate-900 tracking-tight">
                {item.invoiceNo}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                {item.dateTime}
              </span>
            </div>

            {/* Cylinder Specs Card (White Pill Box) */}
            <div className="bg-white rounded-xl p-3 border border-slate-100 space-y-2">
              {item.specs.map((spec, sIdx) => (
                <div key={sIdx} className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-slate-900">
                    {spec.cylinderType}:
                  </span>
                  <span className="text-slate-500 font-medium">
                    {spec.details}
                  </span>
                </div>
              ))}
            </div>

            {/* Card Footer: Total Amount & Status Badge */}
            <div className="flex items-center justify-between pt-0.5">
              <div className="text-xs">
                <span className="text-slate-500 font-medium">Total: </span>
                <span className="font-black text-slate-900">{item.totalDisplay}</span>
              </div>
              <div>
                {item.status === 'Paid' && (
                  <span className="bg-[#E8F8EE] text-[#16A34A] font-bold text-[10px] px-2.5 py-0.5 rounded-full inline-block">
                    Paid
                  </span>
                )}
                {item.status === 'Unpaid' && (
                  <span className="bg-[#FEECEC] text-[#DC2626] font-bold text-[10px] px-2.5 py-0.5 rounded-full inline-block">
                    Unpaid
                  </span>
                )}
                {item.status === 'Partial Payment' && (
                  <span className="bg-[#FEF3E7] text-[#D97706] font-bold text-[10px] px-2.5 py-0.5 rounded-full inline-block">
                    Partial Payment
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
