'use client';

import React from 'react';
import BrandLogo from '@/components/BrandLogo';
import {
  Phone,
  MapPin,
  ArrowLeft,
  Check,
  FileText,
  ArrowLeftRight,
  ArrowUp,
  ArrowDown,
  Info,
  Download,
  Lock,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import type { Delivery } from './DeliveryScreen';

interface InvoiceScreenProps {
  selectedDelivery: Delivery;
  deliveries: Delivery[];
  selectedCategories: string[];
  categoryQuantities: Record<string, number>;
  emptyCollectedCounts: Record<string, number>;
  gstRequired: boolean;
  onToggleGst: () => void;
  onBack: () => void;
  onContinueToPayment: () => void;
  isSubmitting: boolean;
  getInitials: (name: string) => string;
}

export default function InvoiceScreen({
  selectedDelivery,
  deliveries,
  selectedCategories,
  categoryQuantities,
  emptyCollectedCounts,
  gstRequired,
  onToggleGst,
  onBack,
  onContinueToPayment,
  isSubmitting,
  getInitials,
}: InvoiceScreenProps) {
  const customerIndex = deliveries.findIndex((d) => d.id === selectedDelivery.id);
  const customerCode = `CUS-${String(customerIndex >= 0 ? customerIndex + 124 : 124).padStart(5, '0')}`;

  // Dynamic Outgoing (Handed Over) Text from previous page
  const outgoingCategories = selectedCategories.length > 0
    ? selectedCategories.map((c) => `${categoryQuantities[c] ?? 1}x${c.toLowerCase().replace(' ', '')}`).join(', ')
    : '1x21kg';
  const outgoingText = `${outgoingCategories} Cylinders Filled`;

  // Dynamic Incoming (Collected) Empty Cylinders & Total Count from previous page
  const collectedEmptyCategories = ['5 KG', '21 KG', '33 KG']
    .filter((cat) => (emptyCollectedCounts[cat] ?? 0) > 0)
    .map((cat) => `${emptyCollectedCounts[cat]}x${cat.toLowerCase().replace(' ', '')}`);
  
  const totalReturned = Object.values(emptyCollectedCounts).reduce((acc, curr) => acc + curr, 0);

  const incomingText = collectedEmptyCategories.length > 0
    ? `${collectedEmptyCategories.join(', ')} Empty Cylinders`
    : '0 Empty Cylinders Returned';

  // Dynamic pricing according to cylinder:
  // 5 KG: ₹400 / cylinder, 21 KG: ₹2,000 / cylinder, 33 KG: ₹4,500 / cylinder
  const CYLINDER_PRICES: Record<string, number> = {
    '5 KG': 400,
    '21 KG': 2000,
    '33 KG': 4500,
  };

  const subtotal = selectedCategories.length > 0
    ? selectedCategories.reduce((sum, cat) => {
        const qty = categoryQuantities[cat] ?? 1;
        const price = CYLINDER_PRICES[cat] ?? 2000;
        return sum + qty * price;
      }, 0)
    : (CYLINDER_PRICES['21 KG'] ?? 2000);

  const gstAmount = gstRequired ? subtotal * 0.05 : 0;
  const totalPayable = subtotal + gstAmount;

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
              <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">Invoice</h1>
              <p className="text-xs text-slate-500 font-medium">Generated delivery receipt &amp; custody summary</p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100/90 border border-slate-200/60 flex items-center justify-center p-1.5 shadow-2xs">
            <BrandLogo className="h-4 w-auto object-contain" />
          </div>
        </div>

        {/* Document Meta Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-red-600 font-bold text-xs uppercase tracking-wider">
              <FileText className="w-4 h-4 stroke-[2.2]" />
              <span className="text-slate-400">DOCUMENT META</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FFFBEB] border border-[#FDE68A] text-[#D97706] text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#D97706]"></span>
              <span>PENDING PAYMENT</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-[#F8FAFC] border border-slate-100 rounded-xl p-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                INVOICE NO.
              </span>
              <span className="text-xs sm:text-[13px] font-extrabold text-slate-900 mt-0.5 block truncate">
                INV-20261005-001
              </span>
            </div>
            <div className="bg-[#F8FAFC] border border-slate-100 rounded-xl p-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                DATE &amp; TIME
              </span>
              <span className="text-xs sm:text-[13px] font-extrabold text-slate-900 mt-0.5 block truncate">
                05 Oct 2026 • 03:42 PM
              </span>
            </div>
          </div>
        </div>

        {/* Customer Information Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              CUSTOMER INFORMATION
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[11px] font-semibold border border-slate-200/60">
              {customerCode}
            </span>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#EEF2F6] text-slate-700 font-bold flex items-center justify-center text-sm shrink-0 shadow-2xs">
              {getInitials(selectedDelivery.customer.name)}
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 leading-tight">
                {selectedDelivery.customer.name}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{selectedDelivery.customer.phone}</span>
              </div>
              <div className="flex items-start gap-1.5 text-xs text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <p className="leading-snug">
                  {selectedDelivery.customer.address || '12, Anna Nagar, Madurai, Tamil Nadu'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cylinder Transaction Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              CYLINDER TRANSACTION (PHYSICAL HANDOVER)
            </span>
            <ArrowLeftRight className="w-4 h-4 text-slate-400" />
          </div>

          {/* OUTGOING (HANDED OVER) */}
          <div className="bg-[#FFF5F5] border border-red-100 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-[#E81B24] text-white flex items-center justify-center shrink-0">
                <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span className="text-xs font-bold text-[#E81B24] uppercase tracking-wide">
                OUTGOING (HANDED OVER)
              </span>
            </div>
            <div className="border-b border-red-100"></div>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                {outgoingText}
              </span>
              <div className="text-right shrink-0 ml-2">
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                  SUBTOTAL
                </span>
                <span className="text-sm sm:text-base font-extrabold text-slate-900">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* INCOMING (COLLECTED) */}
          <div className="bg-[#F0FDF4] border border-emerald-100 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                  INCOMING (COLLECTED)
                </span>
              </div>
              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-emerald-200 text-emerald-700 text-[11px] font-semibold">
                <Check className="w-3 h-3 stroke-[3]" />
                <span>{totalReturned} Returned</span>
              </div>
            </div>
            <div className="pt-1">
              <p className="text-xs sm:text-sm font-bold text-slate-800">
                {incomingText}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 mt-1.5">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>Physical cylinder return (No monetary deduction)</span>
              </div>
            </div>
          </div>
        </div>

        {/* GST Required Card */}
        <div
          onClick={onToggleGst}
          className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex items-center justify-between cursor-pointer select-none group transition hover:border-slate-300"
        >
          <span className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
            GST REQUIRED
          </span>
          <div
            className={`w-5 h-5 rounded-[4px] border-2 flex items-center justify-center transition-colors ${
              gstRequired ? 'border-[#BC0118] bg-[#BC0118] text-white' : 'border-[#BC0118] bg-white group-hover:border-red-700'
            }`}
          >
            {gstRequired && <Check className="w-3.5 h-3.5 stroke-[3] text-white" />}
          </div>
        </div>

        {/* Billing Summary */}
        <div className="space-y-2.5 px-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              BILLING SUMMARY
            </span>
            <span className="text-xs font-medium text-slate-500">
              Commercial Standard Tariff
            </span>
          </div>
          <div className="space-y-1.5 text-xs sm:text-sm">
            <div className="flex items-center justify-between text-slate-600">
              <span>Subtotal ({outgoingCategories})</span>
              <span className="font-bold text-slate-900">
                ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            {gstRequired && (
              <div className="flex items-center justify-between text-slate-600 animate-in fade-in duration-150">
                <div className="flex items-center gap-1.5">
                  <span>GST / Applicable Taxes (5%)</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200/60">
                    CGST+SGST
                  </span>
                </div>
                <span className="font-bold text-slate-900">
                  ₹{gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-slate-600">
              <span>Delivery &amp; Handling Charges</span>
              <span className="font-bold text-emerald-600">FREE (₹0.00)</span>
            </div>
          </div>
        </div>

        {/* Total Amount Payable Card */}
        <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              TOTAL AMOUNT PAYABLE
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Inclusive of all duties
            </span>
          </div>
          <span className="text-2xl sm:text-3xl font-black text-[#E81B24] tracking-tight">
            ₹{Math.round(totalPayable).toLocaleString('en-IN')}/-
          </span>
        </div>

        {/* Download Invoice PDF */}
        <div className="flex justify-center pt-1 pb-1">
          <button
            type="button"
            onClick={() => alert('Invoice PDF download initiated')}
            className="flex items-center gap-1.5 text-xs font-bold text-[#E81B24] hover:underline cursor-pointer"
          >
            <Download className="w-4 h-4 stroke-[2.2]" />
            <span>Download Invoice PDF</span>
            <span className="text-slate-400 font-normal">| Stamped</span>
          </button>
        </div>
      </div>

      {/* Bottom Action Area */}
      <div className="shrink-0 p-4 pt-2 pb-6 bg-slate-50 border-t border-slate-200/60">
        <button
          type="button"
          onClick={onContinueToPayment}
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition active:scale-[0.99] shadow-md bg-[#E81B24] hover:bg-red-700 text-white cursor-pointer"
        >
          {isSubmitting ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Continue to Payment</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </>
          )}
        </button>
        <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 font-normal text-center mt-2.5">
          <Lock className="w-3 h-3" />
          <span>Invoice finalized • Payment collection in next step</span>
        </div>
      </div>
    </div>
  );
}
