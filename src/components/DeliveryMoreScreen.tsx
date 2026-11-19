'use client';

import React, { useState } from 'react';
import DeliveryProfileScreen from './DeliveryProfileScreen';
import DeliveryDocumentsScreen from './DeliveryDocumentsScreen';
import DeliveryHistoryScreen from './DeliveryHistoryScreen';
import DeliverySettlementsScreen from './DeliverySettlementsScreen';
import DeliveryMyExpensesScreen from './DeliveryMyExpensesScreen';
import {
  User,
  FileText,
  Truck,
  CreditCard,
  ReceiptText,
  Languages,
  ChevronRight,
  LogOut,
  X,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface DeliveryMoreScreenProps {
  onNavigateTab?: (tab: 'HOME' | 'CUSTOMERS' | 'STOCKS' | 'EXPENSES' | 'MORE') => void;
}

export default function DeliveryMoreScreen({ onNavigateTab }: DeliveryMoreScreenProps) {
  void onNavigateTab;
  const [showProfilePage, setShowProfilePage] = useState(false);
  const [showDocumentsPage, setShowDocumentsPage] = useState(false);
  const [showHistoryPage, setShowHistoryPage] = useState(false);
  const [showSettlementsPage, setShowSettlementsPage] = useState(false);
  const [showExpensesPage, setShowExpensesPage] = useState(false);
  const [activeModal, setActiveModal] = useState<'LANGUAGE' | 'END_SHIFT' | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'ta'>('ta');
  const [shiftSummary, setShiftSummary] = useState({
    completedDeliveries: 0,
    totalDeliveries: 0,
    emptyCylinders: 0,
    cashOnHand: 0,
  });

  React.useEffect(() => {
    fetch('/api/deliveries')
      .then((res) => res.json())
      .then((data) => {
        if (data?.stats) {
          setShiftSummary({
            completedDeliveries: data.stats.completedDeliveries ?? 0,
            totalDeliveries: data.stats.totalDeliveries ?? 0,
            emptyCylinders: data.stats.emptyCylindersCollected ?? 0,
            cashOnHand: data.stats.cashInHand ?? 0,
          });
        }
      })
      .catch(() => {});
  }, []);

  if (showProfilePage) {
    return <DeliveryProfileScreen onBack={() => setShowProfilePage(false)} />;
  }

  if (showDocumentsPage) {
    return <DeliveryDocumentsScreen onBack={() => setShowDocumentsPage(false)} />;
  }

  if (showHistoryPage) {
    return <DeliveryHistoryScreen onBack={() => setShowHistoryPage(false)} />;
  }

  if (showSettlementsPage) {
    return <DeliverySettlementsScreen onBack={() => setShowSettlementsPage(false)} />;
  }

  if (showExpensesPage) {
    return <DeliveryMyExpensesScreen onBack={() => setShowExpensesPage(false)} />;
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC] overflow-hidden">
      {/* Screen Header */}
      <div className="shrink-0 px-5 pt-3 pb-3 bg-white border-b border-slate-100">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          More
        </h1>
      </div>

      {/* Scrollable Screen Content */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-4 pb-8">
        {/* 1. Driver Profile Card */}
        <div
          onClick={() => setShowProfilePage(true)}
          className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center gap-3.5 cursor-pointer hover:border-slate-300 transition"
        >
          {/* Avatar with Online/Active indicator */}
          <div className="relative shrink-0">
            <div className="w-13 h-13 rounded-full bg-[#3F4D67] text-white font-black text-base flex items-center justify-center shadow-inner tracking-wide">
              SB
            </div>
            <span className="w-3.5 h-3.5 rounded-full bg-[#17A44B] border-2 border-white absolute bottom-0 right-0 shadow-2xs" />
          </div>

          {/* Driver Information */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-900 tracking-tight truncate">
                Suresh Babu
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-bold shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Active</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5 leading-snug">
              ID: DP-003 • Van 03 (TN 58 AX 4821)
            </p>
          </div>
        </div>

        {/* 2. ACCOUNT & IDENTIFICATION Section */}
        <div>
          <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-2 block px-1">
            ACCOUNT & IDENTIFICATION
          </span>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs divide-y divide-slate-100 overflow-hidden">
            {/* My Profile */}
            <button
              type="button"
              onClick={() => setShowProfilePage(true)}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50/70 transition cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F0F3FF] text-blue-600 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    My Profile
                  </h3>
                  <p className="text-xs text-slate-400 font-normal mt-0.5">
                    Personal records & driver license
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 stroke-[2] shrink-0" />
            </button>

            {/* My Documents */}
            <button
              type="button"
              onClick={() => setShowDocumentsPage(true)}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50/70 transition cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F0F3FF] text-blue-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    My Documents
                  </h3>
                  <p className="text-xs text-slate-400 font-normal mt-0.5">
                    Aadhaar, Badging
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 stroke-[2] shrink-0" />
            </button>
          </div>
        </div>

        {/* 3. WORK & RECORDS Section */}
        <div>
          <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-2 block px-1">
            WORK & RECORDS
          </span>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs divide-y divide-slate-100 overflow-hidden">
            {/* Delivery History */}
            <button
              type="button"
              onClick={() => setShowHistoryPage(true)}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50/70 transition cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F0F3FF] text-blue-600 flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    Delivery History
                  </h3>
                  <p className="text-xs text-slate-400 font-normal mt-0.5">
                    Completed handovers & digital signatures
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 stroke-[2] shrink-0" />
            </button>

            {/* My Settlements */}
            <button
              type="button"
              onClick={() => setShowSettlementsPage(true)}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50/70 transition cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F0F3FF] text-blue-600 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    My Settlements
                  </h3>
                  <p className="text-xs text-slate-400 font-normal mt-0.5">
                    Daily cash ledger & depot drop reconciliations
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 stroke-[2] shrink-0" />
            </button>

            {/* My Expenses */}
            <button
              type="button"
              onClick={() => setShowExpensesPage(true)}
              className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50/70 transition cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F0F3FF] text-blue-600 flex items-center justify-center shrink-0">
                  <ReceiptText className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    My Expenses
                  </h3>
                  <p className="text-xs text-slate-400 font-normal mt-0.5">
                    Diesel slips, toll passes & vehicle maintenance
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 stroke-[2] shrink-0" />
            </button>
          </div>
        </div>

        {/* 4. SETTINGS & PREFERENCES Section */}
        <div>
          <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-2 block px-1">
            SETTINGS & PREFERENCES
          </span>
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F0F3FF] text-blue-600 flex items-center justify-center shrink-0">
                <Languages className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-tight">
                  App Language
                </h3>
                <p className="text-xs text-slate-400 font-normal mt-0.5">
                  English (UK) • தமிழ் (Tamil)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveModal('LANGUAGE')}
              className="bg-[#EEF2FF] hover:bg-[#E4EAFF] text-slate-800 font-bold text-xs px-3.5 py-1.5 rounded-xl border border-slate-200/70 transition cursor-pointer"
            >
              {selectedLanguage === 'ta' ? 'தமிழ்' : 'English'}
            </button>
          </div>
        </div>

        {/* 5. End Shift & Depot Handover Button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setActiveModal('END_SHIFT')}
            className="w-full bg-white hover:bg-red-50/50 active:scale-98 border border-slate-200/90 rounded-2xl py-3.5 px-4 flex items-center justify-center gap-2 shadow-2xs transition cursor-pointer text-[#BC0118]"
          >
            <LogOut className="w-4 h-4 text-[#BC0118] stroke-[2.4]" />
            <span className="font-bold text-sm tracking-tight">
              End Shift & Depot Handover
            </span>
          </button>
        </div>
      </div>

      {/* Modal 1: App Language */}
      {activeModal === 'LANGUAGE' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4">
          <div className="w-full max-w-[360px] bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Select App Language</h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 text-slate-400 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setSelectedLanguage('en');
                  setActiveModal(null);
                }}
                className={`w-full p-3 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                  selectedLanguage === 'en'
                    ? 'border-red-500 bg-red-50/40 text-red-700 font-bold'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>English (UK)</span>
                {selectedLanguage === 'en' && <CheckCircle2 className="w-4 h-4 text-red-600" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedLanguage('ta');
                  setActiveModal(null);
                }}
                className={`w-full p-3 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                  selectedLanguage === 'ta'
                    ? 'border-red-500 bg-red-50/40 text-red-700 font-bold'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>தமிழ் (Tamil)</span>
                {selectedLanguage === 'ta' && <CheckCircle2 className="w-4 h-4 text-red-600" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: End Shift Confirmation */}
      {activeModal === 'END_SHIFT' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4">
          <div className="w-full max-w-[390px] bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  End Shift & Depot Handover?
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Please proceed to the physical depot reception to complete cylinder custody and cash settlement handover with Depot Admin.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Completed Deliveries:</span>
                <span className="font-bold text-slate-900">
                  {shiftSummary.completedDeliveries} / {shiftSummary.totalDeliveries} Deliveries
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Empty Cylinders in Custody:</span>
                <span className="font-bold text-slate-900">{shiftSummary.emptyCylinders} Units</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Cash to be Handed Over:</span>
                <span className="font-bold text-emerald-700">₹{shiftSummary.cashOnHand.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
              >
                Continue Shift
              </button>
              <button
                type="button"
                onClick={() => {
                  alert('Shift ended. Depot reconciliation report generated for Admin.');
                  setActiveModal(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#BC0118] hover:bg-red-800 text-white font-bold text-xs transition shadow-xs"
              >
                Confirm Handover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
