'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Phone,
  MapPin,
  Truck,
  Building2,
  FileText,
  CreditCard,
  Download,
  Share2,
  CheckCircle2,
  Info,
  Tag,
  Wifi,
  Flame,
} from 'lucide-react';

export interface CustomerInvoiceDetailScreenProps {
  initialVariant?: 'with-gst-paid' | 'without-gst-unpaid' | 'without-gst-partial';
  invoiceNo?: string;
  onBack?: () => void;
  showVariantToggle?: boolean;
}

export default function CustomerInvoiceDetailScreen({
  initialVariant = 'with-gst-paid',
  invoiceNo = 'INV-20261018-052',
  onBack,
  showVariantToggle = true,
}: CustomerInvoiceDetailScreenProps) {
  const [variant, setVariant] = useState<'with-gst-paid' | 'without-gst-unpaid' | 'without-gst-partial'>(initialVariant);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const isWithGst = variant === 'with-gst-paid';
  const status =
    variant === 'with-gst-paid'
      ? 'Paid'
      : variant === 'without-gst-unpaid'
      ? 'Unpaid'
      : 'Partial Payment';

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col font-sans antialiased text-slate-800 overflow-hidden relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-12 left-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

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

      {/* Screen Header Bar */}
      <div className="shrink-0 px-4 py-3 flex items-center justify-between bg-white border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack ? onBack : () => window.history.back()}
            className="p-1 -ml-1 text-slate-900 hover:text-slate-600 transition cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">
            Invoice
          </h1>
        </div>

        {/* GST & Status Mode Switcher */}
        {showVariantToggle && (
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[10px] font-bold">
            <button
              type="button"
              onClick={() => setVariant('with-gst-paid')}
              className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                variant === 'with-gst-paid'
                  ? 'bg-white text-emerald-700 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              With GST (Paid)
            </button>
            <button
              type="button"
              onClick={() => setVariant('without-gst-unpaid')}
              className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                variant === 'without-gst-unpaid'
                  ? 'bg-white text-rose-700 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              No GST (Unpaid)
            </button>
            <button
              type="button"
              onClick={() => setVariant('without-gst-partial')}
              className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                variant === 'without-gst-partial'
                  ? 'bg-white text-amber-700 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              No GST (Partial)
            </button>
          </div>
        )}
      </div>

      {/* Scrollable Screen Content */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-3.5 pb-24">
        {/* 1. Tax Invoice Header Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs space-y-3">
          <span className="block text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
            TAX INVOICE
          </span>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {invoiceNo}
            </h2>
            {status === 'Paid' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F8EE] text-[#16A34A]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                Paid
              </span>
            )}
            {status === 'Unpaid' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FEECEC] text-[#DC2626]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
                Unpaid
              </span>
            )}
            {status === 'Partial Payment' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF3E7] text-[#D97706]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                Partial Payment
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Invoice Date &amp; Time
              </span>
              <p className="text-xs font-bold text-slate-800 mt-0.5">
                18 Oct 2026, 03:45 PM
              </p>
            </div>
            <div>
              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Delivery Date
              </span>
              <p className="text-xs font-bold text-slate-800 mt-0.5">
                18 Oct 2026
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <span>Customer Ref:</span>
            <span className="font-extrabold text-slate-900">CUS-00042</span>
          </div>
        </div>

        {/* 2. Customer Details Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#BC0118]" />
              <h3 className="text-sm font-black text-slate-900">Customer Details</h3>
            </div>
            <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
              Commercial
            </span>
          </div>

          <div>
            <h4 className="text-base font-black text-slate-900">Hotel Annapoorna</h4>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              EA CUS-00042 · Food &amp; Hospitality
            </p>
          </div>

          {/* Address Box */}
          <div className="bg-[#F8FAFC] rounded-xl p-3 flex items-start gap-2.5 border border-slate-100/80">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-700 font-medium leading-relaxed">
              14/2 Bypass Road, Near Mattuthavani Junction, Madurai - 625007, Tamil Nadu
            </p>
          </div>

          {/* Contact Row */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              <span>+91 99432 11223</span>
            </div>
            <button
              type="button"
              onClick={() => triggerToast('Dialing +91 99432 11223...')}
              className="bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-800 font-bold text-xs px-3 py-1.5 rounded-xl shadow-2xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-slate-600" />
              <span>Call Customer</span>
            </button>
          </div>
        </div>

        {/* 3. Delivery Details Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#BC0118]" />
              <h3 className="text-sm font-black text-slate-900">Delivery Details</h3>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#E8F8EE] text-[#16A34A]">
              <CheckCircle2 className="w-3 h-3" />
              Completed
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Delivery Reference</span>
              <span className="font-bold text-slate-900 font-mono">DEL-20261018-94</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Delivery Partner</span>
              <span className="font-bold text-slate-900">Suresh Babu (DP-003)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Timestamp</span>
              <span className="font-bold text-slate-900">18 Oct 2026, 03:45 PM</span>
            </div>
          </div>
        </div>

        {/* 4. Cylinder Details Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#BC0118]" />
              <h3 className="text-sm font-black text-slate-900">Cylinder Details</h3>
            </div>
            <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-md">
              Master Catalog Sync
            </span>
          </div>

          {/* Item 1: 19.5 KG Commercial LPG */}
          <div className="space-y-1.5 pt-1 border-b border-slate-100 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-slate-900">19.5 KG Commercial LPG</span>
                <span className="bg-slate-100 text-slate-600 text-[9px] font-bold px-1.5 py-0.5 rounded">
                  Standard
                </span>
              </div>
              <span className="text-xs font-black text-slate-900">₹5,400.00</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Rate: ₹1,800.00 / cyl · Grade 4
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="bg-[#E8F8EE] text-[#16A34A] text-[10px] font-bold px-2 py-0.5 rounded">
                Filled Delivered: 3 cyl
              </span>
              <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded">
                Empty Collected: 3 cyl
              </span>
            </div>
          </div>

          {/* Item 2: 47.5 KG Industrial LPG */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-slate-900">47.5 KG Industrial LPG</span>
                <span className="bg-slate-100 text-slate-600 text-[9px] font-bold px-1.5 py-0.5 rounded">
                  Heavy Duty
                </span>
              </div>
              <span className="text-xs font-black text-slate-900">₹1,800.00</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Rate: ₹1,800.00 / cyl · Grade 4
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="bg-[#E8F8EE] text-[#16A34A] text-[10px] font-bold px-2 py-0.5 rounded">
                Filled Delivered: 1 cyl
              </span>
              <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded">
                Empty Collected: 1 cyl
              </span>
            </div>
          </div>

          {/* Info Note */}
          <div className="bg-[#F8FAFC] border border-slate-100 rounded-xl p-2.5 flex items-start gap-1.5 text-[10px] text-slate-500 font-medium leading-relaxed">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span>
              Filled delivered and empty collected represent confirmed physical handover. Customer cylinder holdings are not calculated or altered.
            </span>
          </div>
        </div>

        {/* 5. Invoice Summary Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#BC0118]" />
            <h3 className="text-sm font-black text-slate-900">Invoice Summary</h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Cylinder Amount (7 Cylinders)</span>
              <span className="font-extrabold text-slate-900">₹7,200.00</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Delivery / Freight Charges</span>
              <span className="font-extrabold text-slate-900">
                ₹0.00 <span className="text-emerald-600 font-bold">(Exempt)</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Applicable Discounts</span>
              <span className="font-extrabold text-slate-900">- ₹0.00</span>
            </div>

            {/* Taxes / GST row: Only displayed when in "with GST" mode */}
            {isWithGst && (
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Taxes / GST</span>
                <span className="font-extrabold text-slate-900">Included (₹0.00)</span>
              </div>
            )}
          </div>

          {/* Total Breakdown Inner Box */}
          <div className="bg-[#F8FAFC] rounded-xl p-3 border border-slate-100/90 space-y-2 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900">Total Invoice Amount</span>
              <span className="text-base font-black text-slate-900">₹7,200.00</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Total Received</span>
              <span className="font-black text-emerald-600">
                {status === 'Unpaid' ? '₹0.00' : status === 'Partial Payment' ? '₹5,000.00' : '₹7,200.00'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
              <span className="text-slate-500 font-medium">Balance Due</span>
              <div className="flex items-center gap-1.5">
                {status === 'Paid' ? (
                  <>
                    <span className="bg-[#E8F8EE] text-[#16A34A] text-[9px] font-bold px-1.5 py-0.5 rounded">
                      Zero Balance
                    </span>
                    <span className="font-black text-slate-900">₹0.00</span>
                  </>
                ) : status === 'Unpaid' ? (
                  <span className="font-black text-rose-600">₹7,200.00</span>
                ) : (
                  <span className="font-black text-amber-600">₹2,200.00</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 6. Payment History Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#BC0118]" />
              <h3 className="text-sm font-black text-slate-900">Payment History</h3>
            </div>
            <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
              2 Records
            </span>
          </div>

          {/* Record 1 */}
          <div className="p-3 bg-[#F8FAFC] rounded-xl border border-slate-100/90 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900">₹5,000.00</span>
              <span className="bg-[#E8F8EE] text-[#16A34A] text-[9px] font-bold px-1.5 py-0.5 rounded">
                ✓ Successful
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Instant UPI / BharatQR</p>
            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
              <span>Ref: App-20261018-052-1</span>
              <span>18 Oct 2026, 03:48 PM</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              UPI Ref: UPI-SBIN-99214
            </p>
          </div>

          {/* Record 2 */}
          <div className="p-3 bg-[#F8FAFC] rounded-xl border border-slate-100/90 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-900">₹2,200.00</span>
              <span className="bg-[#E8F8EE] text-[#16A34A] text-[9px] font-bold px-1.5 py-0.5 rounded">
                ✓ Received
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Cash Handover</p>
            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
              <span>Ref: App-20261018-052-2</span>
              <span>18 Oct 2026, 03:50 PM</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              Receipt: SET-CASH-1018-03
            </p>
          </div>

          {/* Info Note */}
          <div className="bg-[#F8FAFC] border border-slate-100 rounded-xl p-2.5 flex items-start gap-1.5 text-[10px] text-slate-500 font-medium leading-relaxed">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span>
              Payments recorded in real-time. End-of-day driver cash settlement with depot admin does not alter customer invoice balances.
            </span>
          </div>
        </div>

        {/* 7. Settlement Summary Card */}
        <div className="bg-[#E8F8EE] rounded-2xl p-4 border border-emerald-100 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">
              SETTLEMENT SUMMARY
            </span>
            <span className="bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
              Fully Settled
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div>
              <span className="block text-[10px] text-slate-500 font-medium">Total Settled</span>
              <span className="text-base font-black text-slate-900">₹7,200.00</span>
            </div>
            <div className="text-right">
              <span className="block text-[10px] text-slate-500 font-medium">Remaining Balance</span>
              <span className="text-base font-black text-emerald-600">₹0.00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Buttons */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-slate-100 flex items-center gap-3 z-30">
        <button
          type="button"
          onClick={() => triggerToast(`Downloading PDF for ${invoiceNo}...`)}
          className="flex-1 bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-700 font-bold text-xs py-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <Download className="w-4 h-4 text-slate-600" />
          <span>Download PDF</span>
        </button>

        <button
          type="button"
          onClick={() => triggerToast(`Sharing invoice link for ${invoiceNo}...`)}
          className="flex-1 bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-700 font-bold text-xs py-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <Share2 className="w-4 h-4 text-slate-600" />
          <span>Share Invoice</span>
        </button>
      </div>
    </div>
  );
}
