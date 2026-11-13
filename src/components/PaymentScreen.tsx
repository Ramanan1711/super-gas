'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import BrandLogo from '@/components/BrandLogo';
import {
  ArrowLeft,
  Receipt,
  X,
  Info,
  Banknote,
  QrCode,
  ArrowRight,
  ChevronRight,
  Check,
} from 'lucide-react';
import type { Delivery } from './DeliveryScreen';

interface PaymentScreenProps {
  selectedDelivery: Delivery;
  deliveries: Delivery[];
  currentInvoiceAmount: number;
  onBack: () => void;
  onConfirmPayment: (paymentMethod: 'CASH' | 'UPI', amountCollected: number) => void;
  isSubmitting: boolean;
  getInitials: (name: string) => string;
}

export default function PaymentScreen({
  selectedDelivery,
  deliveries,
  currentInvoiceAmount,
  onBack,
  onConfirmPayment,
  isSubmitting,
  getInitials,
}: PaymentScreenProps) {
  const customerIndex = deliveries.findIndex((d) => d.id === selectedDelivery.id);
  const customerCode = `CUS-${String(customerIndex >= 0 ? customerIndex + 124 : 124).padStart(5, '0')}`;

  // Current invoice number
  const now = new Date();
  const dateCode = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const seq = String(customerIndex >= 0 ? customerIndex + 1 : 1).padStart(3, '0');
  const currentInvoiceNo = `INV-${dateCode}-${seq}`;

  // Check if first-time buyer
  const isFirstTimeBuyer =
    selectedDelivery.customer.type === 'Domestic' ||
    selectedDelivery.notes?.toLowerCase().includes('first') ||
    selectedDelivery.customer.name.toLowerCase().includes('priya');

  // Customer's past deliveries in system
  const customerPastDeliveries = deliveries.filter(
    (d) => d.customerId === selectedDelivery.customerId && d.id !== selectedDelivery.id
  );

  // Derive recent billing history records
  const pastInvoices = useMemo(() => {
    if (isFirstTimeBuyer) {
      return [];
    }

    if (customerPastDeliveries.length > 0) {
      return customerPastDeliveries.map((d, i) => {
        const isPaid = d.paymentStatus === 'PAID';
        const dDate = d.deliveredAt ? new Date(d.deliveredAt) : new Date(d.createdAt);
        const formatted = new Intl.DateTimeFormat('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }).format(dDate);

        return {
          id: d.id,
          invoiceNo: `INV-${d.createdAt.slice(0, 10).replace(/-/g, '')}-${String(i + 18).padStart(3, '0')}`,
          dateStr: `${formatted} · ${isPaid ? 'Delivered' : `₹${d.amount.toLocaleString('en-IN')} Total`}`,
          amount: d.amount,
          isPaid,
          statusText: isPaid
            ? `₹${d.amount.toLocaleString('en-IN')} · Paid`
            : `₹${d.amount.toLocaleString('en-IN')} Pending`,
        };
      });
    }

    // Default ledger history for returning commercial customers
    // Displays previous paid invoice and previous pending invoice (e.g. ₹800)
    const pendingAmount = selectedDelivery.customer.name.toLowerCase().includes('saravana')
      ? 2400
      : selectedDelivery.customer.name.toLowerCase().includes('muthu')
      ? 1200
      : 800;

    return [
      {
        id: 'hist-1',
        invoiceNo: 'INV-20261001-018',
        dateStr: '01 Oct 2026 · Delivered',
        amount: 1000,
        isPaid: true,
        statusText: '₹1,000 · Paid',
      },
      {
        id: 'hist-2',
        invoiceNo: 'INV-20261003-021',
        dateStr: `03 Oct 2026 · ₹${pendingAmount.toLocaleString('en-IN')} Total`,
        amount: pendingAmount,
        isPaid: false,
        statusText: `₹${pendingAmount.toLocaleString('en-IN')} Pending`,
      },
    ];
  }, [isFirstTimeBuyer, customerPastDeliveries, selectedDelivery.customer.name]);

  // Calculate previous pending amount from unpaid past invoices
  const previousOutstanding = useMemo(() => {
    return pastInvoices
      .filter((inv) => !inv.isPaid)
      .reduce((sum, inv) => sum + inv.amount, 0);
  }, [pastInvoices]);

  const currentInvoice = currentInvoiceAmount > 0 ? currentInvoiceAmount : 1200;
  const totalBalanceDue = previousOutstanding + currentInvoice;

  // Amount received state (defaults to total balance due)
  const [amountReceived, setAmountReceived] = useState<string>(() => String(totalBalanceDue));
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI'>('CASH');

  const parsedAmount = parseFloat(amountReceived) || 0;

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
              <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">Payment</h1>
              <p className="text-xs text-slate-500 font-medium">Collect &amp; record customer payment</p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100/90 border border-slate-200/60 flex items-center justify-center p-1.5 shadow-2xs">
            <BrandLogo className="h-4 w-auto object-contain" />
          </div>
        </div>

        {/* Customer Bar Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Red Initials Circle */}
            <div className="w-11 h-11 rounded-full bg-[#BC0118] text-white font-bold text-sm sm:text-base flex items-center justify-center shrink-0 shadow-2xs">
              {getInitials(selectedDelivery.customer.name)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  CUSTOMER
                </span>
                <span className="text-xs sm:text-sm font-black text-slate-900">
                  {customerCode}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                {selectedDelivery.customer.name}
              </h2>
            </div>
          </div>

          <span className="text-xs font-bold text-slate-700 whitespace-nowrap shrink-0">
            {selectedDelivery.customer.type ? `${selectedDelivery.customer.type} LPG` : 'Commercial LPG'}
          </span>
        </div>

        {/* INVOICE PAYMENT STATUS Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              INVOICE PAYMENT STATUS
            </h3>
            <span className="text-xs font-semibold text-slate-600">
              {pastInvoices.length + 1} Record{pastInvoices.length + 1 === 1 ? '' : 's'}
            </span>
          </div>

          <p className="text-xs font-semibold text-slate-800 -mt-1.5">
            Recent customer billing history
          </p>

          {/* Records List */}
          <div className="space-y-3 pt-1">
            {/* Past Invoices */}
            {pastInvoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2.5">
                  {inv.isPaid ? (
                    <Image
                      src="/images/icons/invoice-paid.png"
                      alt="Paid Invoice"
                      width={16}
                      height={16}
                      className="w-4 h-4 shrink-0 object-contain"
                    />
                  ) : (
                    <Image
                      src="/images/icons/invoice-pending.png"
                      alt="Pending Invoice"
                      width={16}
                      height={16}
                      className="w-4 h-4 shrink-0 object-contain"
                    />
                  )}
                  <div>
                    <p className="font-bold text-slate-800 text-xs sm:text-[13px]">{inv.invoiceNo}</p>
                    <p className="text-[11px] text-slate-400">{inv.dateStr}</p>
                  </div>
                </div>
                <span className="font-bold text-slate-900 text-xs sm:text-sm">{inv.statusText}</span>
              </div>
            ))}

            {/* Current Invoice Unpaid */}
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-2.5">
                <Image
                  src="/images/icons/invoice-current-unpaid.png"
                  alt="Current Invoice Unpaid"
                  width={16}
                  height={16}
                  className="w-4 h-4 shrink-0 object-contain"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-slate-800 text-xs sm:text-[13px]">{currentInvoiceNo}</p>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black tracking-wider uppercase bg-slate-900 text-white">
                      CURRENT
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Today&apos;s Cylinders Dispatch</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900 text-xs sm:text-sm">
                  ₹{currentInvoice.toLocaleString('en-IN')}
                </p>
                <p className="text-[11px] font-bold text-slate-900">Unpaid</p>
              </div>
            </div>
          </div>

          {/* View Complete Billing Ledger */}
          <div className="pt-2 flex justify-center">
            <button
              type="button"
              onClick={() => alert('Billing ledger modal')}
              className="text-xs font-semibold text-[#0D894F] hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <span>View Complete Billing Ledger</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.2]" />
            </button>
          </div>
        </div>

        {/* BILLING BREAKDOWN Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              BILLING BREAKDOWN
            </h3>
            <Receipt className="w-4 h-4 text-slate-700 stroke-[2]" />
          </div>

          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex items-center justify-between text-slate-600">
              <span className="font-medium">Previous Outstanding</span>
              <span className="font-bold text-slate-900">₹{previousOutstanding.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span className="font-medium">Current Delivery Invoice</span>
              <span className="font-bold text-slate-900">₹{currentInvoice.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* TOTAL BALANCE DUE Card */}
          <div className="bg-[#F8FAFC] border border-slate-100 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider block">
                TOTAL BALANCE DUE
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Prev. (₹{previousOutstanding.toLocaleString('en-IN')}) + Curr. (₹{currentInvoice.toLocaleString('en-IN')})
              </span>
            </div>
            <span className="text-base sm:text-lg font-black text-slate-900">
              ₹{totalBalanceDue.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* AMOUNT RECEIVED Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              AMOUNT RECEIVED
            </h3>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Enter actual cash or digital amount collected
            </p>
          </div>

          {/* Amount Input Box */}
          <div className="bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 flex items-center justify-between shadow-2xs focus-within:ring-2 focus-within:ring-red-500 transition">
            <div className="flex items-center gap-1.5 flex-1">
              <span className="text-base font-black text-slate-900">₹</span>
              <input
                type="number"
                value={amountReceived}
                onChange={(e) => setAmountReceived(e.target.value)}
                placeholder="0"
                className="w-full text-base sm:text-lg font-extrabold text-slate-900 bg-transparent focus:outline-none"
              />
            </div>
            {amountReceived && (
              <button
                type="button"
                onClick={() => setAmountReceived('')}
                className="w-5 h-5 rounded-full text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Preset Chips */}
          <div className="grid grid-cols-3 gap-2 pt-0.5">
            {[
              { label: `₹${totalBalanceDue.toLocaleString('en-IN')} (Full)`, value: totalBalanceDue },
              { label: `₹1,500`, value: 1500 },
              { label: `₹${currentInvoice.toLocaleString('en-IN')}`, value: currentInvoice },
            ].map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => setAmountReceived(String(chip.value))}
                className={`py-2 px-1 rounded-xl text-xs font-bold border transition text-center truncate cursor-pointer active:scale-95 ${
                  parsedAmount === chip.value
                    ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                    : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Info Notice */}
          <div className="flex items-start gap-2 pt-1 text-[11px] text-slate-500 leading-snug">
            <Info className="w-3.5 h-3.5 stroke-[2] shrink-0 mt-0.5 text-slate-500" />
            <p>
              System automatically applies collected funds to oldest pending invoices first upon allocation.
            </p>
          </div>
        </div>

        {/* PAYMENT METHOD Card */}
        <div className="space-y-2 px-0.5">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            PAYMENT METHOD
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {/* Cash Option */}
            <div
              onClick={() => setPaymentMethod('CASH')}
              className={`rounded-2xl p-3.5 sm:p-4 border transition cursor-pointer select-none space-y-2 shadow-2xs ${
                paymentMethod === 'CASH'
                  ? 'border-slate-900 bg-white ring-1 ring-slate-900'
                  : 'border-slate-200/90 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <Banknote className="w-5 h-5 text-slate-900 stroke-[1.8]" />
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    paymentMethod === 'CASH'
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-300'
                  }`}
                >
                  {paymentMethod === 'CASH' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-900">Cash</p>
                <p className="text-[11px] text-slate-500 font-normal">Physical delivery notes</p>
              </div>
            </div>

            {/* UPI / QR Option */}
            <div
              onClick={() => setPaymentMethod('UPI')}
              className={`rounded-2xl p-3.5 sm:p-4 border transition cursor-pointer select-none space-y-2 shadow-2xs ${
                paymentMethod === 'UPI'
                  ? 'border-slate-900 bg-white ring-1 ring-slate-900'
                  : 'border-slate-200/90 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <QrCode className="w-5 h-5 text-slate-900 stroke-[1.8]" />
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    paymentMethod === 'UPI'
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-300'
                  }`}
                >
                  {paymentMethod === 'UPI' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-900">UPI / QR</p>
                <p className="text-[11px] text-slate-500 font-normal">Instant bank transfer</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Area */}
      <div className="shrink-0 p-4 pt-2 pb-6 bg-slate-50 border-t border-slate-200/60">
        <button
          type="button"
          onClick={() => onConfirmPayment(paymentMethod, parsedAmount)}
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 bg-[#E81B24] hover:bg-red-700 active:scale-[0.99] text-white transition shadow-md cursor-pointer disabled:opacity-50"
        >
          <span>{isSubmitting ? 'Confirming...' : 'Continue to Payment Allocation'}</span>
          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
        </button>
        <p className="text-xs text-slate-400 font-normal text-center mt-2.5">
          Payment allocation breakdown confirmed on next step
        </p>
      </div>
    </div>
  );
}
