'use client';

import React from 'react';
import { Check, Share2, Eye } from 'lucide-react';
import type { Delivery } from './DeliveryScreen';

interface DeliveryCompletedModalProps {
  selectedDelivery: Delivery;
  deliveries: Delivery[];
  selectedCategories: string[];
  categoryQuantities: Record<string, number>;
  emptyCollectedCounts: Record<string, number>;
  deliveredQuantity: number;
  emptyCount: number;
  amountReceived: number;
  outstandingBalance: number;
  onShareAndReturn: () => void;
  onViewReceipt: () => void;
}

export default function DeliveryCompletedModal({
  selectedDelivery,
  deliveries,
  selectedCategories,
  categoryQuantities,
  emptyCollectedCounts,
  deliveredQuantity,
  emptyCount,
  amountReceived,
  outstandingBalance,
  onShareAndReturn,
  onViewReceipt,
}: DeliveryCompletedModalProps) {
  const customerIndex = deliveries.findIndex((d) => d.id === selectedDelivery.id);

  // Dynamic invoice number
  const now = new Date();
  const dateCode = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const seq = String(customerIndex >= 0 ? customerIndex + 1 : 1).padStart(3, '0');
  const invoiceNo = `INV-${dateCode}-${seq}`;

  // Physical stock counts
  const activeEmpties = Object.entries(emptyCollectedCounts).filter(([, qty]) => qty > 0);
  const totalFilled = selectedCategories.length > 0
    ? selectedCategories.reduce((sum, c) => sum + (categoryQuantities[c] ?? 1), 0)
    : deliveredQuantity || 10;

  const totalEmpty = activeEmpties.length > 0
    ? activeEmpties.reduce((sum, [, qty]) => sum + qty, 0)
    : emptyCount || 5;

  const displayPayment = amountReceived > 0 ? amountReceived : 1500;
  const displayOutstanding = outstandingBalance > 0 ? outstandingBalance : 1500;

  return (
    <div className="fixed inset-0 sm:absolute z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] max-w-sm w-full p-6 sm:p-7 text-center space-y-4 sm:space-y-5 animate-in zoom-in-95 duration-200 shadow-2xl border border-slate-100">
        {/* Checkmark Circle Icon */}
        <div className="w-20 h-20 rounded-full bg-[#D1EBD9] flex items-center justify-center mx-auto shadow-inner">
          <div className="w-12 h-12 rounded-full bg-[#01612B] flex items-center justify-center text-white shadow-sm">
            <Check className="w-6 h-6 stroke-[3.2]" />
          </div>
        </div>

        {/* Title & Customer */}
        <div className="space-y-1">
          <h3 className="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight leading-tight">
            Delivery Completed!
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Customer: <span className="text-slate-900 font-black">{selectedDelivery.customer.name}</span>
          </p>
        </div>

        {/* Stats Table Card */}
        <div className="bg-[#EEF4FE] rounded-2xl overflow-hidden divide-y divide-[#E0EBFB] text-xs sm:text-[13px] border border-[#E0EBFB]">
          {/* Row 1: Physical Stock */}
          <div className="flex items-center justify-between px-4 py-3">
            <span className="font-semibold text-slate-500">Physical Stock</span>
            <span className="font-black text-slate-900">
              {totalFilled} Filled • {totalEmpty} Empty
            </span>
          </div>

          {/* Row 2: Invoice No */}
          <div className="flex items-center justify-between px-4 py-3">
            <span className="font-semibold text-slate-500">Invoice No:</span>
            <span className="font-black text-slate-900">{invoiceNo}</span>
          </div>

          {/* Row 3: Payment */}
          <div className="flex items-center justify-between px-4 py-3">
            <span className="font-semibold text-slate-500">Payment</span>
            <span className="font-black text-slate-900">
              ₹ {displayPayment.toLocaleString('en-IN')}/-
            </span>
          </div>

          {/* Row 4: Outstanding */}
          <div className="flex items-center justify-between px-4 py-3">
            <span className="font-semibold text-slate-500">Outstanding</span>
            <span className="font-black text-slate-900">
              ₹{displayOutstanding.toLocaleString('en-IN')}/-
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1">
          <button
            type="button"
            onClick={onShareAndReturn}
            className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 bg-[#F21F2A] hover:bg-red-700 active:scale-[0.99] text-white shadow-md transition cursor-pointer"
          >
            <Share2 className="w-4 h-4 stroke-[2.2]" />
            <span>Share Invoice &amp; Return</span>
          </button>

          <button
            type="button"
            onClick={onViewReceipt}
            className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 bg-[#DFECFE] hover:bg-[#D3E4FD] active:scale-[0.99] text-slate-900 transition cursor-pointer"
          >
            <Eye className="w-4 h-4 stroke-[2.2]" />
            <span>View Invoice Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
}
