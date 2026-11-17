'use client';

import React, { useState } from 'react';
import CustomerInvoiceDetailScreen from '@/components/CustomerInvoiceDetailScreen';
import { Columns3, Smartphone } from 'lucide-react';

export default function DeliveryCustomerInvoicePage() {
  const [viewMode, setViewMode] = useState<'triple' | 'single'>('triple');
  const [singleVariant] = useState<'with-gst-paid' | 'without-gst-unpaid' | 'without-gst-partial'>('with-gst-paid');

  return (
    <div className="min-h-screen bg-slate-200/70 p-3 sm:p-6 flex flex-col items-center">
      {/* Top Bar Switcher */}
      <div className="w-full max-w-7xl flex items-center justify-between pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Delivery Customer Invoice
          </h1>
          <p className="text-xs text-slate-500 font-semibold">
            Super Gas Delivery Partner Customer Page · Separate Invoices (With GST &amp; Without GST)
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl shadow-xs border border-slate-200">
          <button
            type="button"
            onClick={() => setViewMode('triple')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              viewMode === 'triple'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Columns3 className="w-4 h-4" />
            <span>3 Screens Side-by-side</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('single')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              viewMode === 'single'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Single Device View</span>
          </button>
        </div>
      </div>

      {viewMode === 'triple' ? (
        /* 3 Side-by-Side Mobile Screens (Exactly matching attached design) */
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-6 justify-items-center">
          {/* Screen 1: With GST & Paid */}
          <div className="w-full max-w-[400px] h-[860px] max-h-[92vh] bg-white rounded-[32px] shadow-2xl overflow-hidden border border-slate-200/90 flex flex-col">
            <CustomerInvoiceDetailScreen
              status="Paid"
              hasGst={true}
              invoiceNo="INV-20261018-052"
            />
          </div>

          {/* Screen 2: Without GST & Unpaid */}
          <div className="w-full max-w-[400px] h-[860px] max-h-[92vh] bg-white rounded-[32px] shadow-2xl overflow-hidden border border-slate-200/90 flex flex-col">
            <CustomerInvoiceDetailScreen
              status="Unpaid"
              hasGst={false}
              invoiceNo="INV-20261018-052"
            />
          </div>

          {/* Screen 3: Without GST & Partial Payment */}
          <div className="w-full max-w-[400px] h-[860px] max-h-[92vh] bg-white rounded-[32px] shadow-2xl overflow-hidden border border-slate-200/90 flex flex-col">
            <CustomerInvoiceDetailScreen
              status="Partial Payment"
              hasGst={false}
              invoiceNo="INV-20261018-052"
            />
          </div>
        </div>
      ) : (
        /* Single Mobile Device View */
        <div className="w-full max-w-[430px] h-[880px] max-h-[94vh] bg-white rounded-[36px] shadow-2xl overflow-hidden border border-slate-200/90 flex flex-col">
          <CustomerInvoiceDetailScreen
            status={singleVariant === 'without-gst-unpaid' ? 'Unpaid' : singleVariant === 'without-gst-partial' ? 'Partial Payment' : 'Paid'}
            hasGst={singleVariant === 'with-gst-paid'}
            invoiceNo="INV-20261018-052"
          />
        </div>
      )}
    </div>
  );
}
