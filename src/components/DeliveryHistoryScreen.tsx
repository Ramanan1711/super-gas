'use client';

import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Truck,
  CheckCircle2,
  Search,
  Download,
  ChevronRight,
  Flame,
  ArrowLeftRight,
  AlertTriangle,
  X,
  Receipt,
} from 'lucide-react';

export interface HistoryRecord {
  id: string;
  invoiceNumber: string;
  timestamp: string;
  customerName: string;
  customerCode: string;
  customerPhone: string;
  status: 'Completed';
  filledDeliveredCount: number;
  filledBreakdown: string;
  categoriesCount?: number;
  emptyCollectedText: string;
  emptyType: 'zero-balance' | 'shortage' | 'normal';
  billType: 'Settled Bill' | 'Invoice Balance' | 'Counter Receipt' | 'Pending Invoice';
  amount: number;
  paymentStatus: 'Paid' | 'Partially Paid' | 'Unpaid';
  settlementMethod: string;
  dueAmount?: number;
  paidAmount?: number;
  creditPeriod?: string;
  filterPeriod: 'today' | 'yesterday' | 'week' | 'month';
}

const mockHistoryData: HistoryRecord[] = [
  {
    id: 'hist-1',
    invoiceNumber: 'INV-20261024-085',
    timestamp: 'Today, 03:45 PM',
    customerName: 'Sri Krishna Sweets',
    customerCode: 'CUS-00088',
    customerPhone: '+91 98402 33441',
    status: 'Completed',
    filledDeliveredCount: 4,
    filledBreakdown: '2x 19kg, 2x 47.5kg Cylinders',
    categoriesCount: 2,
    emptyCollectedText: '4 Cylinders (Zero balance)',
    emptyType: 'zero-balance',
    billType: 'Settled Bill',
    amount: 3700,
    paymentStatus: 'Paid',
    settlementMethod: 'UPI / QR Settlement',
    filterPeriod: 'today',
  },
  {
    id: 'hist-2',
    invoiceNumber: 'INV-20261024-084',
    timestamp: 'Today, 01:15 PM',
    customerName: 'Hotel Annapoorna',
    customerCode: 'CUS-00042',
    customerPhone: '+91 99432 11223',
    status: 'Completed',
    filledDeliveredCount: 6,
    filledBreakdown: '2x 19kg, 3x 47.5kg Cylinders',
    emptyCollectedText: '5 Collected',
    emptyType: 'shortage',
    billType: 'Invoice Balance',
    amount: 5550,
    paidAmount: 3000,
    dueAmount: 2550,
    paymentStatus: 'Partially Paid',
    settlementMethod: 'Partial Cash Advance',
    filterPeriod: 'today',
  },
  {
    id: 'hist-3',
    invoiceNumber: 'INV-20261024-086',
    timestamp: 'Today, 11:30 AM',
    customerName: 'Rajesh Kumar',
    customerCode: 'CUS-00124',
    customerPhone: '+91 98765 43210',
    status: 'Completed',
    filledDeliveredCount: 2,
    filledBreakdown: '2x 19kg Cylinders',
    emptyCollectedText: '2 Cylinders',
    emptyType: 'normal',
    billType: 'Counter Receipt',
    amount: 1200,
    paymentStatus: 'Paid',
    settlementMethod: 'Cash on Counter',
    filterPeriod: 'today',
  },
  {
    id: 'hist-4',
    invoiceNumber: 'INV-20261024-079',
    timestamp: 'Today, 09:50 AM',
    customerName: 'Priya Stores',
    customerCode: 'CUS-00126',
    customerPhone: '+91 98945 12345',
    status: 'Completed',
    filledDeliveredCount: 3,
    filledBreakdown: '2x 19kg, 1x 25kg Cylinders',
    emptyCollectedText: '3 Cylinders',
    emptyType: 'normal',
    billType: 'Pending Invoice',
    amount: 2250,
    paymentStatus: 'Unpaid',
    settlementMethod: 'Credit Terms',
    creditPeriod: '15-Day Net Period',
    filterPeriod: 'today',
  },
];

interface DeliveryHistoryScreenProps {
  onBack: () => void;
}

export default function DeliveryHistoryScreen({ onBack }: DeliveryHistoryScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Today' | 'Yesterday' | 'Last 7 Days' | 'Last 30 Days' | 'This Month'>('Today');
  const [selectedInvoice, setSelectedInvoice] = useState<HistoryRecord | null>(null);
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>(mockHistoryData);
  const [totalDeliveriesCount, setTotalDeliveriesCount] = useState<number>(14);
  const [cylindersGivenCount, setCylindersGivenCount] = useState<number>(22);
  const [emptyReturnedCount, setEmptyReturnedCount] = useState<number>(14);

  // Fetch live delivery history on filter/search change
  React.useEffect(() => {
    let ignore = false;
    async function loadHistory() {
      try {
        const queryParams = new URLSearchParams({
          filter: activeFilter,
          search: searchQuery.trim(),
        });
        const res = await fetch(`/api/deliveries/history?${queryParams.toString()}`);
        if (!res.ok) return;
        const result = await res.json();
        if (!ignore && result.success && result.data) {
          if (Array.isArray(result.data.records) && result.data.records.length > 0) {
            setHistoryRecords(result.data.records);
          }
          if (result.data.metrics) {
            setTotalDeliveriesCount(result.data.metrics.totalDeliveries);
            setCylindersGivenCount(result.data.metrics.cylindersGiven);
            setEmptyReturnedCount(result.data.metrics.emptyReturned);
          }
        }
      } catch (err) {
        console.warn('Could not load delivery history from database:', err);
      }
    }
    loadHistory();
    return () => {
      ignore = true;
    };
  }, [activeFilter, searchQuery]);

  // Filtered deliveries fallback for client-side search
  const filteredRecords = useMemo(() => {
    return historyRecords;
  }, [historyRecords]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC] overflow-hidden">
      {/* Screen Top Header */}
      <div className="shrink-0 px-4 pt-3 pb-3 bg-white border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-1 -ml-1 text-slate-800 hover:text-black transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2]" />
          </button>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">
            Delivery History
          </h1>
        </div>
      </div>

      {/* Scrollable Screen Body */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-3.5 pb-8">
        {/* Top KPI Cards (2 Columns) */}
        <div className="grid grid-cols-2 gap-3">
          {/* Card 1: TOTAL DELIVERIES */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                TOTAL DELIVERIES
              </span>
              <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Truck className="w-3.5 h-3.5 stroke-[2.2]" />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900 tracking-tight mt-1">
              {totalDeliveriesCount}
            </p>
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 pt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 stroke-[2.2]" />
              <span>Completed {activeFilter.toLowerCase()}</span>
            </div>
          </div>

          {/* Card 2: CYLINDERS GIVEN */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                CYLINDERS GIVEN
              </span>
              <div className="w-6 h-6 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                <Flame className="w-3.5 h-3.5 stroke-[2.2]" />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900 tracking-tight mt-1">
              {cylindersGivenCount}
            </p>
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 pt-0.5">
              <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-600 stroke-[2.2]" />
              <span>{emptyReturnedCount} Empty returned</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white border border-slate-200/80 rounded-2xl px-3.5 py-2.5 flex items-center gap-2.5 shadow-2xs">
          <Search className="w-4 h-4 text-slate-400 stroke-[2] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customer, invoice ID or phone.."
            className="w-full text-xs font-medium text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {(['All', 'Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'This Month'] as const).map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#BC0118] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>

        {/* Section Header: Recent Deliveries & Export */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              Recent Deliveries
            </h2>
            <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {filteredRecords.length} Shown
            </span>
          </div>

          <button
            type="button"
            onClick={() => alert('Exporting Delivery History (PDF)...')}
            className="text-xs font-bold text-[#BC0118] hover:text-red-800 flex items-center gap-1 cursor-pointer transition"
          >
            <span>Export PDF</span>
            <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>

        {/* Delivery Cards List */}
        <div className="space-y-3">
          {filteredRecords.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/70">
              <p className="text-sm font-semibold text-slate-700">No deliveries found</p>
              <p className="text-xs text-slate-400 mt-1">Try another filter or search keyword</p>
            </div>
          ) : (
            filteredRecords.map((record) => (
              <div
                key={record.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3 hover:shadow-xs transition"
              >
                {/* Header Row: Invoice ID, Timestamp & Completed Badge */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 tracking-tight">
                      {record.invoiceNumber}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-bold">
                      Completed
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                    {record.timestamp}
                  </p>
                </div>

                {/* Customer Info */}
                <div>
                  <h3 className="text-sm font-black text-slate-900 leading-tight">
                    {record.customerName}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {record.customerCode} • {record.customerPhone}
                  </p>
                </div>

                {/* Middle Specifications Box */}
                <div className="bg-[#F0F3FF] rounded-2xl p-3 space-y-2">
                  {/* Filled Delivered */}
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-md bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                          <Flame className="w-3 h-3 stroke-[2.2]" />
                        </div>
                        <span className="text-xs font-bold text-slate-900">
                          Filled Delivered: {record.filledDeliveredCount} Cylinders
                        </span>
                      </div>
                      {record.categoriesCount && (
                        <span className="bg-slate-200/80 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {record.categoriesCount} Categories
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium pl-7 mt-0.5">
                      {record.filledBreakdown}
                    </p>
                  </div>

                  {/* Empty Collected */}
                  <div className="flex items-center gap-2 pl-0.5 pt-1 border-t border-slate-200/50">
                    {record.emptyType === 'shortage' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 stroke-[2.2]" />
                    ) : (
                      <ArrowLeftRight className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.2]" />
                    )}
                    <span
                      className={`text-xs font-bold ${
                        record.emptyType === 'shortage' ? 'text-amber-800' : 'text-emerald-700'
                      }`}
                    >
                      Empty Collected: {record.emptyCollectedText}
                    </span>
                  </div>
                </div>

                {/* Settlement & Action Bottom Row */}
                <div className="flex items-end justify-between pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">
                      {record.billType}
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-base font-black text-slate-900 tracking-tight">
                        ₹{record.amount.toLocaleString('en-IN')}
                      </span>
                      {record.paymentStatus === 'Paid' && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-bold">
                          Paid
                        </span>
                      )}
                      {record.paymentStatus === 'Partially Paid' && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700 text-[10px] font-bold">
                          Partially Paid
                        </span>
                      )}
                      {record.paymentStatus === 'Unpaid' && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 text-[10px] font-bold">
                          Unpaid
                        </span>
                      )}
                    </div>

                    {/* Subtext info */}
                    {record.paymentStatus === 'Partially Paid' && (
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                        Paid: ₹{record.paidAmount?.toLocaleString('en-IN')} |{' '}
                        <span className="text-red-600 font-bold">
                          Due: ₹{record.dueAmount?.toLocaleString('en-IN')}
                        </span>
                      </p>
                    )}
                    {record.paymentStatus === 'Paid' && (
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                        {record.settlementMethod}
                      </p>
                    )}
                    {record.paymentStatus === 'Unpaid' && record.creditPeriod && (
                      <p className="text-[10px] text-rose-600 font-bold mt-0.5">
                        Credit: {record.creditPeriod}
                      </p>
                    )}
                  </div>

                  {/* View Details Button */}
                  <button
                    type="button"
                    onClick={() => setSelectedInvoice(record)}
                    className="bg-[#EEF2FF] hover:bg-[#E4EAFF] text-slate-800 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1 transition cursor-pointer shrink-0"
                  >
                    <span>View Details</span>
                    <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4">
          <div className="w-full max-w-[390px] bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-900">{selectedInvoice.invoiceNumber}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="p-1 text-slate-400 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="bg-slate-50 rounded-xl p-3 space-y-1">
                <p className="font-bold text-slate-900 text-sm">{selectedInvoice.customerName}</p>
                <p className="text-slate-500">{selectedInvoice.customerCode} • {selectedInvoice.customerPhone}</p>
                <p className="text-slate-400 text-[10px]">{selectedInvoice.timestamp}</p>
              </div>

              <div className="border border-slate-100 rounded-xl p-3 space-y-2">
                <div className="flex justify-between font-medium text-slate-600">
                  <span>Delivered:</span>
                  <span className="font-bold text-slate-900">{selectedInvoice.filledDeliveredCount} Cylinders</span>
                </div>
                <div className="flex justify-between font-medium text-slate-600">
                  <span>Specification:</span>
                  <span className="text-slate-700">{selectedInvoice.filledBreakdown}</span>
                </div>
                <div className="flex justify-between font-medium text-slate-600">
                  <span>Empty Collected:</span>
                  <span className="font-bold text-emerald-700">{selectedInvoice.emptyCollectedText}</span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-sm">
                  <span>Invoice Total:</span>
                  <span className="text-slate-900">₹{selectedInvoice.amount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  alert(`Downloading Invoice ${selectedInvoice.invoiceNumber} (PDF)...`);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#BC0118] hover:bg-red-800 text-white font-bold text-xs transition shadow-xs"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
