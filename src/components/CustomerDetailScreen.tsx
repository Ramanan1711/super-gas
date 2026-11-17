'use client';

import React, { useState } from 'react';
import CustomerAllDeliveriesScreen from './CustomerAllDeliveriesScreen';
import {
  ArrowLeft,
  Phone,
  MapPin,
  Copy,
  Check,
  BookOpen,
  Info,
  Truck,
  RotateCcw,
  ChevronRight,
} from 'lucide-react';
import type { Delivery } from './DeliveryScreen';

interface CustomerDetailScreenProps {
  customer?: {
    id?: string;
    code?: string;
    name?: string;
    phone?: string;
    address?: string;
    type?: string;
    cylinderType?: string;
    matchedDelivery?: Delivery;
  };
  onBack: () => void;
  onStartDelivery: (delivery: Delivery) => void;
}

export default function CustomerDetailScreen({
  customer,
  onBack,
  onStartDelivery,
}: CustomerDetailScreenProps) {
  const [copied, setCopied] = useState(false);
  const [showAllDeliveries, setShowAllDeliveries] = useState(false);

  // Fallback / default data matching exact Figma design
  const customerName = 'Hotel Annapoorna';
  const customerCode = customer?.code === 'CUS-00042' ? customer.code : 'CUS-00042';
  const customerType = 'Commercial';
  const customerPhone = '+91 99432 11223';
  const customerAddress =
    '14/2 Bypass Road, Near Mattuthavani Junction, Madurai - 625007';

  const handleCopyPhone = () => {
    navigator.clipboard?.writeText(customerPhone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelivery = () => {
    if (customer?.matchedDelivery) {
      onStartDelivery(customer.matchedDelivery);
    } else {
      const fallbackDelivery: Delivery = {
        id: customer?.id || 'cus-00042',
        customerId: customer?.id || 'cus-00042',
        customer: {
          id: customer?.id || 'cus-00042',
          name: customerName,
          phone: customerPhone,
          address: customerAddress,
          type: customerType,
        },
        status: 'PENDING',
        cylinderType: '19.5kg Commercial',
        quantity: 6,
        emptyCollected: 0,
        amount: 5550,
        paymentMethod: 'CASH',
        paymentStatus: 'PENDING',
        notes: null,
        deliveredAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onStartDelivery(fallbackDelivery);
    }
  };

  if (showAllDeliveries) {
    return (
      <div className="absolute inset-0 z-40 bg-white flex flex-col overflow-hidden animate-in fade-in slide-in-from-right duration-200">
        <CustomerAllDeliveriesScreen
          customerName={customerName}
          onBack={() => setShowAllDeliveries(false)}
        />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-30 bg-[#F8FAFC] flex flex-col overflow-hidden">
      {/* Top Header */}
      <div className="shrink-0 bg-white/95 backdrop-blur-xs px-5 py-3.5 border-b border-slate-100 flex items-center gap-3.5 z-20">
        <button
          type="button"
          onClick={onBack}
          className="p-1 -ml-1 text-slate-700 hover:text-slate-900 active:scale-95 cursor-pointer transition"
          aria-label="Back to customers"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.4]" />
        </button>
        <h1 className="text-lg font-black text-slate-900 tracking-tight">
          Customer Details
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-4 pb-28">
        {/* 1. Customer Info Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3.5">
          {/* Title & Badges */}
          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-[22px] font-black text-slate-900 tracking-tight leading-tight">
              {customerName}
            </h2>

            {/* Badges Row: Code & Category */}
            <div className="flex items-center gap-2 pt-0.5">
              <span className="bg-[#EEF2F6] text-[#475569] text-xs font-semibold px-2.5 py-0.5 rounded-md">
                {customerCode}
              </span>
              <span className="bg-[#EEF2F6] text-[#475569] text-xs font-semibold px-2.5 py-0.5 rounded-md">
                {customerType}
              </span>
            </div>

            {/* Active Status Badge */}
            <div className="pt-0.5">
              <span className="inline-flex items-center gap-1.5 bg-[#DCFCE7] text-[#16A34A] text-[11px] font-bold px-2 py-0.5 rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
                <span>Active</span>
              </span>
            </div>
          </div>

          {/* Contact: Phone with Copy Action */}
          <div className="bg-[#F8FAFC] rounded-xl px-3.5 py-2.5 flex items-center justify-between border border-slate-100">
            <div className="flex items-center gap-2.5 text-slate-800">
              <Phone className="w-4 h-4 text-slate-700 stroke-[2] shrink-0" />
              <span className="text-xs sm:text-sm font-semibold tracking-wide">
                {customerPhone}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyPhone}
              className="text-slate-400 hover:text-slate-600 active:scale-90 transition p-1 cursor-pointer"
              title="Copy phone"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Delivery Address */}
          <div className="bg-[#F8FAFC] rounded-xl p-3.5 border border-slate-100 space-y-1">
            <div className="flex items-center gap-1.5 text-[#E81B24]">
              <MapPin className="w-4 h-4 text-[#E81B24] stroke-[2.2] shrink-0" />
              <span className="text-[11px] font-extrabold tracking-wider text-slate-400 uppercase">
                DELIVERY ADDRESS
              </span>
            </div>
            <p className="text-xs sm:text-[13px] font-medium text-slate-700 pl-5.5 leading-relaxed">
              {customerAddress}
            </p>
          </div>

          {/* Call Customer Button */}
          <a
            href={`tel:${customerPhone.replace(/\s+/g, '')}`}
            className="w-full bg-[#F1F5F9] hover:bg-slate-200 active:scale-98 border border-slate-200/90 rounded-xl py-2.5 text-xs sm:text-[13px] font-bold text-slate-800 flex items-center justify-center gap-2 cursor-pointer transition shadow-2xs"
          >
            <Phone className="w-4 h-4 text-[#E81B24] stroke-[2.2]" />
            <span>Call Customer</span>
          </a>
        </div>

        {/* 2. Account Summary Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3.5">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-[17px] font-extrabold text-slate-900 tracking-tight">
              Account Summary
            </h3>
            <div className="flex items-center gap-1.5 bg-[#EEF2F6] text-[#475569] text-[11px] font-semibold px-2.5 py-1 rounded-md">
              <BookOpen className="w-3.5 h-3.5 text-slate-500 stroke-[2]" />
              <span>Ledger Realtime</span>
            </div>
          </div>

          {/* Outstanding Balance Row */}
          <div className="bg-[#F8FAFC] rounded-xl p-3.5 flex items-center justify-between border border-slate-100">
            <div>
              <span className="text-xs font-semibold text-slate-500 block">
                Outstanding Balance
              </span>
              <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                Due across 1 invoice
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-[#DC2626] tracking-tight">
              ₹5,550.00
            </div>
          </div>

          {/* Total Paid Amount Row */}
          <div className="bg-[#F8FAFC] rounded-xl p-3.5 flex items-center justify-between border border-slate-100">
            <span className="text-xs font-semibold text-slate-500">
              Total Paid Amount
            </span>
            <span className="text-sm sm:text-base font-extrabold text-slate-900">
              ₹18,450.00
            </span>
          </div>

          {/* 2 Columns: Unpaid Invoices & Partially Paid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#F8FAFC] rounded-xl p-3 border border-slate-100">
              <span className="text-[11px] font-medium text-slate-500 block">
                Unpaid Invoices
              </span>
              <span className="text-sm font-black text-[#DC2626] block mt-0.5">
                1 Invoice
              </span>
            </div>
            <div className="bg-[#F8FAFC] rounded-xl p-3 border border-slate-100">
              <span className="text-[11px] font-medium text-slate-500 block">
                Partially Paid
              </span>
              <span className="text-sm font-black text-slate-900 block mt-0.5">
                0 Invoices
              </span>
            </div>
          </div>
        </div>

        {/* 3. Cylinder Purchase & Return History Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-4">
          {/* Header */}
          <div>
            <h3 className="text-base sm:text-[17px] font-extrabold text-slate-900 tracking-tight">
              Cylinder Purchase & Return History
            </h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Dynamic Admin Master Categories (Catalog Sync)
            </p>
          </div>

          {/* Categories List */}
          <div className="space-y-3">
            {/* 19.5 KG Commercial LPG */}
            <div className="bg-[#F8FAFC] rounded-xl p-3.5 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-bold text-slate-900">
                  19.5 KG Commercial LPG
                </span>
                <span className="bg-[#EEF2F6] text-[#475569] text-[10px] font-bold px-2 py-0.5 rounded">
                  Standard
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                    TOTAL DELIVERED
                  </span>
                  <div className="flex items-baseline mt-0.5">
                    <span className="text-lg font-black text-slate-900">42</span>
                    <span className="text-xs font-medium text-slate-500 ml-1">cyl</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                    EMPTY RETURNED
                  </span>
                  <div className="flex items-baseline mt-0.5">
                    <span className="text-lg font-black text-[#16A34A]">35</span>
                    <span className="text-xs font-medium text-slate-500 ml-1">cyl</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 21 KG Commercial LPG */}
            <div className="bg-[#F8FAFC] rounded-xl p-3.5 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-bold text-slate-900">
                  21 KG Commercial LPG
                </span>
                <span className="bg-[#EEF2F6] text-[#475569] text-[10px] font-bold px-2 py-0.5 rounded">
                  Commercial
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                    TOTAL DELIVERED
                  </span>
                  <div className="flex items-baseline mt-0.5">
                    <span className="text-lg font-black text-slate-900">14</span>
                    <span className="text-xs font-medium text-slate-500 ml-1">cyl</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                    EMPTY RETURNED
                  </span>
                  <div className="flex items-baseline mt-0.5">
                    <span className="text-lg font-black text-[#16A34A]">10</span>
                    <span className="text-xs font-medium text-slate-500 ml-1">cyl</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 32.5 KG Heavy Commercial LPG */}
            <div className="bg-[#F8FAFC] rounded-xl p-3.5 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-bold text-slate-900">
                  32.5 KG Heavy Commercial LPG
                </span>
                <span className="bg-[#EEF2F6] text-[#475569] text-[10px] font-bold px-2 py-0.5 rounded">
                  High Vol
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                    TOTAL DELIVERED
                  </span>
                  <div className="flex items-baseline mt-0.5">
                    <span className="text-lg font-black text-slate-900">8</span>
                    <span className="text-xs font-medium text-slate-500 ml-1">cyl</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                    EMPTY RETURNED
                  </span>
                  <div className="flex items-baseline mt-0.5">
                    <span className="text-lg font-black text-[#16A34A]">6</span>
                    <span className="text-xs font-medium text-slate-500 ml-1">cyl</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 47.5 KG Bulk Cylinder */}
            <div className="bg-[#F8FAFC] rounded-xl p-3.5 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-bold text-slate-900">
                  47.5 KG Bulk Cylinder
                </span>
                <span className="bg-[#EEF2F6] text-[#475569] text-[10px] font-bold px-2 py-0.5 rounded">
                  Special Order
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                    TOTAL DELIVERED
                  </span>
                  <div className="flex items-baseline mt-0.5">
                    <span className="text-lg font-black text-slate-900">0</span>
                    <span className="text-xs font-medium text-slate-500 ml-1">cyl</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                    EMPTY RETURNED
                  </span>
                  <div className="flex items-baseline mt-0.5">
                    <span className="text-lg font-black text-[#16A34A]">0</span>
                    <span className="text-xs font-medium text-slate-500 ml-1">cyl</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Historical Note */}
          <div className="flex items-start gap-2 pt-1">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-500 leading-snug">
              Historical transaction totals only. Does not represent current physical stock holding.
            </p>
          </div>

          {/* 2 History Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              className="bg-[#F8FAFC] hover:bg-slate-100 active:scale-98 border border-slate-200/80 rounded-xl py-2.5 px-3 flex items-center justify-center gap-2 text-xs font-bold text-slate-800 transition cursor-pointer shadow-2xs"
            >
              <Truck className="w-4 h-4 text-[#E81B24]" />
              <span>Delivery History</span>
            </button>
            <button
              type="button"
              className="bg-[#F8FAFC] hover:bg-slate-100 active:scale-98 border border-slate-200/80 rounded-xl py-2.5 px-3 flex items-center justify-center gap-2 text-xs font-bold text-slate-800 transition cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-4 h-4 text-[#16A34A]" />
              <span>Return History</span>
            </button>
          </div>
        </div>

        {/* 4. Recent Delivery History Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3.5">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-[17px] font-extrabold text-slate-900 tracking-tight">
              Recent Delivery History
            </h3>
            <span className="bg-[#EEF2F6] text-[#475569] text-[10px] font-bold px-2 py-0.5 rounded">
              Last 2 Dispatches
            </span>
          </div>

          {/* Invoice 1: #INV-20261024-064 */}
          <div className="bg-[#F8FAFC] rounded-xl p-3.5 border border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">
                #INV-20261024-064
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Today, 12:10 PM
              </span>
            </div>
            <div className="space-y-1 text-xs text-slate-600 font-medium">
              <div className="flex items-center justify-between">
                <span>19.5 KG:</span>
                <span className="text-slate-700">6x Delivered · 5x Collected</span>
              </div>
              <div className="flex items-center justify-between">
                <span>32.5 KG:</span>
                <span className="text-slate-700">2x Delivered · 1x Collected</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
              <span className="text-xs font-extrabold text-slate-900">
                Total: ₹5,550.00
              </span>
              <span className="bg-[#FEE2E2] text-[#DC2626] font-bold text-[10px] px-2 py-0.5 rounded">
                Unpaid
              </span>
            </div>
          </div>

          {/* Invoice 2: #INV-20261018-052 */}
          <div className="bg-[#F8FAFC] rounded-xl p-3.5 border border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">
                #INV-20261018-052
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                18 Oct 2026, 03:45 PM
              </span>
            </div>
            <div className="space-y-1 text-xs text-slate-600 font-medium">
              <div className="flex items-center justify-between">
                <span>19.5 KG:</span>
                <span className="text-slate-700">8x Delivered · 8x Collected</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
              <span className="text-xs font-extrabold text-slate-900">
                Total: ₹7,200.00
              </span>
              <span className="bg-[#DCFCE7] text-[#16A34A] font-bold text-[10px] px-2 py-0.5 rounded">
                Paid
              </span>
            </div>
          </div>

          {/* View All Deliveries Link */}
          <button
            type="button"
            onClick={() => setShowAllDeliveries(true)}
            className="w-full pt-1 flex items-center justify-between text-xs font-bold text-slate-900 hover:text-[#E81B24] transition cursor-pointer"
          >
            <span>View All Deliveries (14)</span>
            <ChevronRight className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>
      </div>

      {/* Sticky Bottom Delivery Action Button */}
      <div className="absolute bottom-4 left-4 right-4 z-30">
        <button
          type="button"
          onClick={handleDelivery}
          className="w-full bg-[#E81B24] hover:bg-red-700 active:scale-98 text-white font-bold text-sm sm:text-base py-3.5 px-6 rounded-2xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2.5 transition cursor-pointer"
        >
          <Truck className="w-5 h-5 stroke-[2.2]" />
          <span>Delivery</span>
        </button>
      </div>
    </div>
  );
}
