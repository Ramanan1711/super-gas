'use client';

import React, { useState, useEffect } from 'react';
import BrandLogo from '@/components/BrandLogo';
import {
  ArrowLeft,
  Check,
  Clock,
  Banknote,
  QrCode,
  Truck,
  LogOut,
  LogIn,
  BadgeCheck,
  Info,
} from 'lucide-react';
import type { Delivery } from './DeliveryScreen';

interface ConfirmDeliveryScreenProps {
  selectedDelivery: Delivery;
  deliveries: Delivery[];
  selectedCategories: string[];
  categoryQuantities: Record<string, number>;
  emptyCollectedCounts: Record<string, number>;
  deliveredQuantity: number;
  emptyCount: number;
  currentInvoiceAmount: number;
  amountReceived: number;
  paymentMethod: 'CASH' | 'UPI';
  totalOutstandingBalance: number;
  onBack: () => void;
  onConfirmDelivery: () => void;
  isSubmitting: boolean;
  getInitials: (name: string) => string;
}

export default function ConfirmDeliveryScreen({
  selectedDelivery,
  deliveries,
  selectedCategories,
  categoryQuantities,
  emptyCollectedCounts,
  deliveredQuantity,
  emptyCount,
  currentInvoiceAmount,
  amountReceived,
  paymentMethod,
  totalOutstandingBalance,
  onBack,
  onConfirmDelivery,
  isSubmitting,
  getInitials,
}: ConfirmDeliveryScreenProps) {
  const customerIndex = deliveries.findIndex((d) => d.id === selectedDelivery.id);
  const customerCode = `CUS-${String(customerIndex >= 0 ? customerIndex + 124 : 124).padStart(5, '0')}`;

  // Live ticking date and time matching 'DD MMM YYYY · hh:mm A'
  const [currentDateTime, setCurrentDateTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = monthNames[now.getMonth()];
      const year = now.getFullYear();

      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const formattedHours = String(hours).padStart(2, '0');

      setCurrentDateTime(`${day} ${month} ${year} · ${formattedHours}:${minutes} ${ampm}`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Invoice Number
  const now = new Date();
  const dateCode = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const seq = String(customerIndex >= 0 ? customerIndex + 1 : 1).padStart(3, '0');
  const invoiceNo = `INV-${dateCode}-${seq}`;

  // Formatted Filled Delivered
  const filledDeliveredStr = selectedCategories.length > 0
    ? selectedCategories.map((c) => `${categoryQuantities[c] ?? 1}x${c.replace(/\s+/g, '').toLowerCase()}`).join(', ')
    : `${deliveredQuantity}x${selectedDelivery.cylinderType.replace(/\s+/g, '').toLowerCase()}`;

  // Formatted Empty Collected
  const activeEmpties = Object.entries(emptyCollectedCounts).filter(([, qty]) => qty > 0);
  const emptyCollectedStr = activeEmpties.length > 0
    ? activeEmpties.map(([c, qty]) => `${qty}x${c.replace(/\s+/g, '').toLowerCase()}`).join(', ')
    : emptyCount > 0
    ? `${emptyCount}x empty`
    : 'None';

  // Total counts for van stock adjustment
  const totalFilled = selectedCategories.length > 0
    ? selectedCategories.reduce((sum, c) => sum + (categoryQuantities[c] ?? 1), 0)
    : deliveredQuantity;

  const totalEmpty = activeEmpties.length > 0
    ? activeEmpties.reduce((sum, [, qty]) => sum + qty, 0)
    : emptyCount;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-3.5">
        {/* Header Card */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 hover:bg-slate-200 active:scale-95 transition cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">Confirm Delivery</h1>
              <p className="text-xs text-slate-500 font-medium">Final transaction review &amp; sign-off</p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100/90 border border-slate-200/60 flex items-center justify-center p-1.5 shadow-2xs">
            <BrandLogo className="h-4 w-auto object-contain" />
          </div>
        </div>

        {/* CUSTOMER Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              CUSTOMER
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#E8EDF5] text-slate-800">
              {customerCode}
            </span>
          </div>

          <div className="flex items-center gap-3 min-w-0">
            {/* Red Avatar */}
            <div className="w-11 h-11 rounded-full bg-[#BC0118] text-white font-bold text-sm sm:text-base flex items-center justify-center shrink-0 shadow-2xs">
              {getInitials(selectedDelivery.customer.name)}
            </div>

            <div className="min-w-0">
              <h2 className="text-base font-extrabold text-slate-900 truncate">
                {selectedDelivery.customer.name}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Priority Commercial · Route A-12
              </p>
            </div>
          </div>
        </div>

        {/* CYLINDERS Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                CYLINDERS
              </span>
              <h3 className="text-xs font-semibold text-slate-800 mt-0.5">
                Physical Handover Summary
              </h3>
            </div>

            {/* Cylinder Gas Bottle SVG */}
            <svg
              className="w-5 h-5 text-[#DC2626] shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="8" y="2" width="8" height="3" rx="1" />
              <path d="M7 5h10v2H7z" />
              <rect x="5" y="7" width="14" height="14" rx="4" />
              <line x1="5" y1="14" x2="19" y2="14" />
            </svg>
          </div>

          <div className="space-y-2 pt-0.5">
            {/* Filled Delivered */}
            <div className="bg-[#F0F5FF] rounded-xl p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-red-100 flex items-center justify-center text-[#DC2626]">
                  <LogOut className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span className="font-bold text-slate-800">Filled Delivered</span>
              </div>
              <span className="font-extrabold text-slate-900">{filledDeliveredStr}</span>
            </div>

            {/* Empty Collected */}
            <div className="bg-[#F0F5FF] rounded-xl p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <LogIn className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span className="font-bold text-slate-800">Empty Collected</span>
              </div>
              <span className="font-extrabold text-slate-900">{emptyCollectedStr}</span>
            </div>

            {/* Van Stock Custody Adjustment */}
            <div className="bg-[#EFF5FF] border border-[#DCE8FC] rounded-xl p-3 flex items-center gap-2.5 text-xs">
              <div className="w-6 h-6 rounded-lg bg-red-100 flex items-center justify-center text-[#DC2626] shrink-0">
                <Truck className="w-3.5 h-3.5 stroke-[2.2]" />
              </div>
              <p className="text-slate-600 leading-snug">
                <span>Van Stock Custody Adjustment: </span>
                <span className="font-bold text-slate-900">-{totalFilled} Filled</span>
                <span> | </span>
                <span className="font-bold text-slate-900">+{totalEmpty} Empty</span>
                <span> safely reconciled</span>
              </p>
            </div>
          </div>
        </div>

        {/* INVOICE Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              INVOICE
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#E8EDF5] text-slate-800">
              {invoiceNo}
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-0.5">
            <span className="text-xs font-medium text-slate-600">
              Current Billing Total
            </span>

            <div className="text-right">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 block">
                ₹{currentInvoiceAmount.toLocaleString('en-IN')}
              </span>
              <div className="flex items-center justify-end gap-1 text-[11px] text-slate-400 font-medium mt-0.5">
                <Clock className="w-3 h-3 stroke-[2]" />
                <span>{currentDateTime || '05 Oct 2026 · 03:42 PM'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* PAYMENT Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              PAYMENT
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#E6F4EA] text-slate-800 flex items-center gap-1.5">
              {paymentMethod === 'CASH' ? (
                <>
                  <Banknote className="w-3.5 h-3.5 text-emerald-700 stroke-[2]" />
                  <span>Cash</span>
                </>
              ) : (
                <>
                  <QrCode className="w-3.5 h-3.5 text-emerald-700 stroke-[2]" />
                  <span>UPI / QR</span>
                </>
              )}
            </span>
          </div>

          {/* 2-Column Boxes */}
          <div className="grid grid-cols-2 gap-3 pt-0.5">
            <div className="bg-[#EFF5FF] rounded-xl p-3.5 space-y-1">
              <span className="text-xs text-slate-500 font-medium block">
                Amount Received
              </span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 block">
                ₹{amountReceived.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="bg-[#EFF5FF] rounded-xl p-3.5 space-y-1">
              <span className="text-xs text-slate-500 font-medium block">
                Outstanding Balance
              </span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 block">
                ₹{totalOutstandingBalance.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Payment Recorded Banner */}
          <div className="bg-[#E8F8F0] border border-[#A7F3D0] rounded-xl p-3 flex items-start gap-2.5 text-xs text-[#15803D]">
            <BadgeCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 stroke-[2.2]" />
            <div>
              <p className="font-black text-xs">Payment Recorded</p>
              <p className="font-medium text-xs mt-0.5">Settled &amp; allocated via FIFO rules</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Area */}
      <div className="shrink-0 p-4 pt-2 pb-6 bg-slate-50 border-t border-slate-200/60">
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-normal mb-2.5">
          <Info className="w-3.5 h-3.5 stroke-[2] shrink-0 text-slate-400" />
          <span>Review the details before confirming this delivery.</span>
        </div>

        <button
          type="button"
          onClick={onConfirmDelivery}
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 bg-[#E81B24] hover:bg-red-700 active:scale-[0.99] text-white transition shadow-md cursor-pointer disabled:opacity-50"
        >
          <span>{isSubmitting ? 'Confirming...' : 'Confirm Delivery'}</span>
          <Check className="w-4 h-4 stroke-[3]" />
        </button>

        <p className="text-xs text-slate-400 font-normal text-center mt-2.5">
          Permanently writes to customer ledger, stock custody, and shift settlement.
        </p>
      </div>
    </div>
  );
}
