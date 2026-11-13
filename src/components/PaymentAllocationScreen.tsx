'use client';

import React, { useMemo } from 'react';
import BrandLogo from '@/components/BrandLogo';
import {
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Receipt,
  CircleDot,
} from 'lucide-react';
import type { Delivery } from './DeliveryScreen';

interface PaymentAllocationScreenProps {
  selectedDelivery: Delivery;
  deliveries: Delivery[];
  currentInvoiceAmount: number;
  amountReceived: number;
  paymentMethod: 'CASH' | 'UPI';
  onBack: () => void;
  onContinueToConfirmation: () => void;
  isSubmitting: boolean;
  getInitials: (name: string) => string;
}

export default function PaymentAllocationScreen({
  selectedDelivery,
  deliveries,
  currentInvoiceAmount,
  amountReceived,
  paymentMethod,
  onBack,
  onContinueToConfirmation,
  isSubmitting,
}: PaymentAllocationScreenProps) {
  const customerIndex = deliveries.findIndex((d) => d.id === selectedDelivery.id);

  // Check if first-time buyer
  const isFirstTimeBuyer =
    selectedDelivery.customer.type === 'Domestic' ||
    selectedDelivery.notes?.toLowerCase().includes('first') ||
    selectedDelivery.customer.name.toLowerCase().includes('priya');

  // Customer's past deliveries in system
  const customerPastDeliveries = deliveries.filter(
    (d) => d.customerId === selectedDelivery.customerId && d.id !== selectedDelivery.id
  );

  // Current invoice number
  const now = new Date();
  const dateCode = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const seq = String(customerIndex >= 0 ? customerIndex + 1 : 1).padStart(3, '0');
  const currentInvoiceNo = `INV-${dateCode}-${seq}`;
  const currentInvoiceShort = `INV-${seq}`;

  // Current invoice payable
  const currentInvoice = currentInvoiceAmount > 0 ? currentInvoiceAmount : 1200;

  // Invoices list in chronological order (Oldest -> Intermediate -> Today)
  const invoiceList = useMemo(() => {
    if (isFirstTimeBuyer) {
      return [
        {
          id: 'current',
          invoiceNo: currentInvoiceNo,
          invoiceShort: currentInvoiceShort,
          shortLabel: 'Inv 1',
          dateStr: 'Today',
          role: 'Today',
          amount: currentInvoice,
          isToday: true,
        },
      ];
    }

    if (customerPastDeliveries.length > 0) {
      const past = customerPastDeliveries.map((d, i) => {
        const dDate = d.deliveredAt ? new Date(d.deliveredAt) : new Date(d.createdAt);
        const formatted = new Intl.DateTimeFormat('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }).format(dDate);

        const seqStr = String(i + 18).padStart(3, '0');
        return {
          id: d.id,
          invoiceNo: `INV-${d.createdAt.slice(0, 10).replace(/-/g, '')}-${seqStr}`,
          invoiceShort: `INV-${seqStr}`,
          shortLabel: `Inv ${i + 1}`,
          dateStr: formatted,
          role: i === 0 ? 'Oldest Pending' : 'Intermediate',
          amount: d.amount,
          isToday: false,
        };
      });

      return [
        ...past,
        {
          id: 'current',
          invoiceNo: currentInvoiceNo,
          invoiceShort: currentInvoiceShort,
          shortLabel: `Inv ${past.length + 1}`,
          dateStr: 'Today',
          role: 'Today',
          amount: currentInvoice,
          isToday: true,
        },
      ];
    }

    // Default chronological ledger matching Figma specification
    return [
      {
        id: 'hist-1',
        invoiceNo: 'INV-20261001-018',
        invoiceShort: 'INV-018',
        shortLabel: 'Inv 1',
        dateStr: '01 Oct 2026',
        role: 'Oldest Pending',
        amount: 1000,
        isToday: false,
      },
      {
        id: 'hist-2',
        invoiceNo: 'INV-20261003-021',
        invoiceShort: 'INV-021',
        shortLabel: 'Inv 2',
        dateStr: '03 Oct 2026',
        role: 'Intermediate',
        amount: 800,
        isToday: false,
      },
      {
        id: 'current',
        invoiceNo: currentInvoiceNo || 'INV-20261005-024',
        invoiceShort: currentInvoiceShort || 'INV-024',
        shortLabel: 'Inv 3',
        dateStr: 'Today',
        role: 'Today',
        amount: currentInvoice,
        isToday: true,
      },
    ];
  }, [isFirstTimeBuyer, customerPastDeliveries, currentInvoiceNo, currentInvoiceShort, currentInvoice]);

  // Execute Automated FIFO Allocation Algorithm
  const allocation = useMemo(() => {
    let remainingCash = amountReceived;
    let totalAllocated = 0;

    const items = invoiceList.map((inv, index) => {
      const due = inv.amount;

      if (remainingCash <= 0) {
        return {
          ...inv,
          index,
          due,
          allocated: 0,
          remaining: due,
          status: 'NOT_REACHED' as const,
          forwardedToNext: 0,
        };
      } else if (remainingCash >= due) {
        const allocated = due;
        remainingCash -= due;
        totalAllocated += allocated;
        return {
          ...inv,
          index,
          due,
          allocated,
          remaining: 0,
          status: 'CLOSED' as const,
          forwardedToNext: remainingCash,
        };
      } else {
        const allocated = remainingCash;
        const remaining = due - allocated;
        totalAllocated += allocated;
        remainingCash = 0;
        return {
          ...inv,
          index,
          due,
          allocated,
          remaining,
          status: 'PARTIALLY_PAID' as const,
          forwardedToNext: 0,
        };
      }
    });

    const totalUncollected = items.reduce((sum, item) => sum + item.remaining, 0);
    const unpaidItems = items.filter((item) => item.remaining > 0);
    const satisfactionPercent = amountReceived > 0
      ? Math.min(100, Math.round((totalAllocated / amountReceived) * 100))
      : 0;

    return {
      items,
      totalAllocated,
      remainingCash,
      totalUncollected,
      unpaidItems,
      satisfactionPercent,
    };
  }, [amountReceived, invoiceList]);

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
              <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">Payment Allocation</h1>
              <p className="text-xs text-slate-500 font-medium">Automated FIFO settlement</p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100/90 border border-slate-200/60 flex items-center justify-center p-1.5 shadow-2xs">
            <BrandLogo className="h-4 w-auto object-contain" />
          </div>
        </div>

        {/* AMOUNT RECEIVED Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              AMOUNT RECEIVED
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#E8EDF5] text-slate-800">
              {paymentMethod}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              ₹{amountReceived.toLocaleString('en-IN')}
            </span>
            <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs sm:text-[13px]">
              <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
              <span>Ready for allocation</span>
            </div>
          </div>

          {/* Red Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#E81B24] h-full rounded-full transition-all duration-500"
              style={{ width: `${allocation.satisfactionPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs pt-0.5">
            <span className="text-slate-500 font-medium">
              ₹{allocation.totalAllocated.toLocaleString('en-IN')} of ₹{amountReceived.toLocaleString('en-IN')} allocated
            </span>
            <span className="text-[#0D894F] font-black">
              {allocation.satisfactionPercent}% Satisfied
            </span>
          </div>
        </div>

        {/* FIFO PAYMENT ALLOCATION Info Banner */}
        <div className="bg-[#EFF5FF] border border-[#DCE8FC] rounded-2xl p-3.5 flex items-start gap-3">
          <div className="w-5 h-5 rounded-full border border-[#E81B24] text-[#E81B24] flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-xs font-black italic">i</span>
          </div>
          <div className="space-y-1">
            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-wider">
              FIFO PAYMENT ALLOCATION
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              Payment applies strictly to the oldest pending invoice first. System enforces chronological settlement sequence.
            </p>
          </div>
        </div>

        {/* FIFO Invoices Allocation Cards */}
        <div className="space-y-3">
          {allocation.items.map((item, idx) => {
            const isClosed = item.status === 'CLOSED';
            const isPartiallyPaid = item.status === 'PARTIALLY_PAID';
            const isNotReached = item.status === 'NOT_REACHED';

            const previousInvoice = idx > 0 ? allocation.items[idx - 1] : null;

            return (
              <React.Fragment key={item.id}>
                {/* Connecting forward pill if prior invoice forwarded cash */}
                {idx > 0 && previousInvoice && previousInvoice.forwardedToNext > 0 && (
                  <div className="flex justify-center -my-1">
                    <div className="bg-[#EDF2F7] text-slate-800 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs border border-slate-200/60">
                      <ArrowDown className="w-3.5 h-3.5 stroke-[2.5] text-slate-600" />
                      <span>₹{previousInvoice.forwardedToNext.toLocaleString('en-IN')} forwarded to next invoice</span>
                    </div>
                  </div>
                )}

                {/* Invoice Card */}
                {isNotReached ? (
                  /* NOT REACHED Card */
                  <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-800 text-sm">{item.invoiceNo}</span>
                        {item.isToday && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E2E8F0] text-slate-600">
                            Today
                          </span>
                        )}
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#E2E8F0] text-slate-500 flex items-center gap-1">
                        <Lock className="w-3 h-3 stroke-[2.5]" />
                        <span>NOT REACHED</span>
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-500">
                      ₹{item.due.toLocaleString('en-IN')} Total Payable
                    </p>

                    <div className="bg-white border border-slate-200/60 rounded-xl p-2.5 flex items-start gap-2 text-[11px] text-slate-500">
                      <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5 stroke-[2]" />
                      <p className="leading-snug">
                        Previous invoice ({previousInvoice?.invoiceNo || 'INV-20261003-021'}) must be completely settled before cash can reach this invoice.
                      </p>
                    </div>
                  </div>
                ) : (
                  /* ACTIVE (CLOSED OR PARTIALLY PAID) Card */
                  <div
                    className={`bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3 overflow-hidden ${
                      isClosed
                        ? 'border-l-[5px] border-l-[#0D894F]'
                        : 'border-l-[5px] border-l-[#F59E0B]'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                          {item.invoiceNo}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          {item.dateStr} · {item.role}
                        </p>
                      </div>

                      {isClosed ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0] flex items-center gap-1">
                          <span>✓</span>
                          <span>INVOICE CLOSED</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 stroke-[2.5]" />
                          <span>PARTIALLY PAID</span>
                        </span>
                      )}
                    </div>

                    {/* 3-Column Stats Grid */}
                    <div className="bg-[#F8FAFC] border border-slate-100 rounded-xl p-3 grid grid-cols-3 gap-2">
                      <div>
                        <span className="text-[11px] text-slate-400 font-medium block">
                          {idx === 0 ? 'Previous Due' : 'Invoice Due'}
                        </span>
                        <span className="text-xs sm:text-[13px] font-black text-slate-900 block mt-0.5">
                          ₹{item.due.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div>
                        <span
                          className={`text-[11px] font-bold block ${
                            isClosed ? 'text-[#0D894F]' : 'text-slate-700'
                          }`}
                        >
                          Allocated
                        </span>
                        <span
                          className={`text-xs sm:text-[13px] font-black block mt-0.5 ${
                            isClosed ? 'text-[#0D894F]' : 'text-slate-900'
                          }`}
                        >
                          +₹{item.allocated.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div>
                        <span
                          className={`text-[11px] font-medium block ${
                            isPartiallyPaid ? 'text-[#D97706] font-bold' : 'text-slate-400'
                          }`}
                        >
                          {isPartiallyPaid ? 'Remaining Due' : 'Remaining'}
                        </span>
                        <span
                          className={`text-xs sm:text-[13px] font-black block mt-0.5 ${
                            isPartiallyPaid ? 'text-[#D97706]' : 'text-slate-900'
                          }`}
                        >
                          ₹{item.remaining.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Status / Warning */}
                    {isClosed ? (
                      <div className="flex items-center gap-1.5 text-xs text-[#0D894F] font-bold pt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.2]" />
                        <span>Fully settled · 100% satisfied</span>
                      </div>
                    ) : (
                      <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-2.5 flex items-center gap-2 text-[11px] text-[#92400E] font-medium">
                        <CircleDot className="w-3.5 h-3.5 text-[#D97706] shrink-0 stroke-[2.5]" />
                        <p>
                          Allocation stopped here. ₹{item.remaining.toLocaleString('en-IN')} unpaid balance remains on this invoice.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* CUSTOMER OUTSTANDING SUMMARY Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              CUSTOMER OUTSTANDING SUMMARY
            </span>
            <span className="text-xs font-bold text-[#0D894F] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0D894F]" />
              <span>Logged</span>
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-2xl sm:text-3xl font-black text-slate-900">
                ₹{allocation.totalUncollected.toLocaleString('en-IN')}
              </span>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Total uncollected balance
              </p>
            </div>

            <div className="text-right text-xs">
              {allocation.unpaidItems.length > 0 ? (
                allocation.unpaidItems.map((u, i) => (
                  <p
                    key={u.id}
                    className={i === 0 && u.status === 'PARTIALLY_PAID' ? 'font-bold text-[#D97706]' : 'font-medium text-slate-600'}
                  >
                    {i > 0 ? '+ ' : ''}₹{u.remaining.toLocaleString('en-IN')} on {u.invoiceShort}
                  </p>
                ))
              ) : (
                <p className="font-bold text-[#0D894F]">All Invoices Cleared</p>
              )}
            </div>
          </div>

          {/* Summary Breakdown Bar */}
          <div className="bg-[#F1F5F9]/80 border border-slate-200/60 rounded-xl px-3 py-2 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Summary breakdown:</span>
            <span className="font-bold text-slate-800">
              {allocation.unpaidItems.length > 0
                ? allocation.unpaidItems
                    .map((u) => `₹${u.remaining.toLocaleString('en-IN')} (${u.shortLabel})`)
                    .join(' + ')
                : '₹0 (Fully Paid)'}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Area */}
      <div className="shrink-0 p-4 pt-2 pb-6 bg-slate-50 border-t border-slate-200/60">
        <button
          type="button"
          onClick={onContinueToConfirmation}
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 bg-[#E81B24] hover:bg-red-700 active:scale-[0.99] text-white transition shadow-md cursor-pointer disabled:opacity-50"
        >
          <span>{isSubmitting ? 'Confirming...' : 'Continue to Confirmation'}</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>
        <p className="text-xs text-slate-400 font-normal text-center mt-2.5 flex items-center justify-center gap-1.5">
          <Receipt className="w-3.5 h-3.5 text-slate-400 stroke-[1.8]" />
          <span>Proceeds to delivery completion &amp; digital receipt</span>
        </p>
      </div>
    </div>
  );
}
