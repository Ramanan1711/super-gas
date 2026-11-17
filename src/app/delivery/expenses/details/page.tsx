'use client';

import React, { useState } from 'react';
import ExpenseDetailsScreen from '@/components/ExpenseDetailsScreen';
import { Wifi } from 'lucide-react';

export default function ExpenseDetailsRoute() {
  const [statusMode, setStatusMode] = useState<'APPROVED' | 'PENDING'>('APPROVED');

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center py-0 sm:py-6 sm:px-4">
      {/* State Switcher for quick preview */}
      <div className="mb-3 hidden sm:flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-200 text-xs font-bold text-slate-700">
        <span>Preview Mode:</span>
        <button
          type="button"
          onClick={() => setStatusMode('APPROVED')}
          className={`px-3 py-1 rounded-full transition ${
            statusMode === 'APPROVED' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Approved Screen (Left)
        </button>
        <button
          type="button"
          onClick={() => setStatusMode('PENDING')}
          className={`px-3 py-1 rounded-full transition ${
            statusMode === 'PENDING' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Pending Screen (Right)
        </button>
      </div>

      <div className="w-full max-w-[430px] h-[100dvh] sm:h-[880px] sm:max-h-[94vh] bg-white sm:rounded-[36px] shadow-2xl flex flex-col overflow-hidden relative border border-slate-200/80">
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

        <ExpenseDetailsScreen
          claim={{
            status: statusMode,
            code: 'EXP-20261020-006',
            category: 'VEHICLE MAINTENANCE',
            categoryType: 'vehicle',
            amount: 2800,
            dateStr: '20 Oct 2026',
            route: 'Madurai North',
            settlementStatus: 'Paid Full',
            vehicle: 'Van 03 (TN 58 AX 4821)',
            submissionTime: '20 Oct 2026, 04:15 PM',
            description: 'Brake pad replacement & emergency tyre puncture repair during Madurai North commercial delivery run.',
            reviewedBy: 'S. Raman (Depot Logistics Admin)',
            reviewTimestamp: '21 Oct 2026, 10:30 AM',
            disbursedAmount: 2800,
            paymentTimestamp: '22 Oct 2026, 02:45 PM',
            disbursementMode: 'Depot Direct UPI (HDFC Bank)',
            referenceUtr: 'UPI-98421092 / TXN-89201948',
            fileName: 'file name.jpg',
            fileMeta: '2.8 MB • JPG Image',
            fileTime: '20 Oct 2026, 04:14 PM',
          }}
          onBack={() => {
            window.history.back();
          }}
        />
      </div>
    </div>
  );
}
