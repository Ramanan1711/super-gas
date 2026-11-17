'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Wrench,
  Fuel,
  Utensils,
  Smartphone,
  Receipt,
  Truck,
  CheckCircle2,
  Info,
  Paperclip,
  Eye,
  UserCheck,
  CreditCard,
  Download,
  DollarSign,
  AlertCircle,
  X,
} from 'lucide-react';

export interface ExpenseDetailsData {
  id: string;
  code: string;
  category: string;
  categoryType: 'fuel' | 'vehicle' | 'food' | 'parking' | 'mobile' | 'other';
  amount: number;
  dateStr: string;
  route?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  settlementStatus?: string;
  vehicle?: string;
  submissionTime?: string;
  description?: string;
  reviewedBy?: string;
  reviewTimestamp?: string;
  adminRemarks?: string;
  disbursedAmount?: number;
  paymentTimestamp?: string;
  disbursementMode?: string;
  referenceUtr?: string;
  fileName?: string;
  fileMeta?: string;
  fileTime?: string;
}

const defaultApprovedExpense: ExpenseDetailsData = {
  id: 'exp-2',
  code: 'EXP-20261020-006',
  category: 'VEHICLE MAINTENANCE',
  categoryType: 'vehicle',
  amount: 2800,
  dateStr: '20 Oct 2026',
  route: 'Madurai North',
  status: 'APPROVED',
  settlementStatus: 'Paid Full',
  vehicle: 'Van 03 (TN 58 AX 4821)',
  submissionTime: '20 Oct 2026, 04:15 PM',
  description: 'Brake pad replacement & emergency tyre puncture repair during Madurai North commercial delivery run.',
  reviewedBy: 'S. Raman (Depot Logistics Admin)',
  reviewTimestamp: '21 Oct 2026, 10:30 AM',
  adminRemarks: '',
  disbursedAmount: 2800,
  paymentTimestamp: '22 Oct 2026, 02:45 PM',
  disbursementMode: 'Depot Direct UPI (HDFC Bank)',
  referenceUtr: 'UPI-98421092 / TXN-89201948',
  fileName: 'file name.jpg',
  fileMeta: '2.8 MB • JPG Image',
  fileTime: '20 Oct 2026, 04:14 PM',
};

interface ExpenseDetailsScreenProps {
  claim?: Partial<ExpenseDetailsData>;
  onBack: () => void;
}

export default function ExpenseDetailsScreen({
  claim = defaultApprovedExpense,
  onBack,
}: ExpenseDetailsScreenProps) {
  // Merge defaults
  const expense: ExpenseDetailsData = {
    ...defaultApprovedExpense,
    ...claim,
  };

  const [showImageModal, setShowImageModal] = useState(false);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC] overflow-hidden">
      {/* Top Header */}
      <div className="shrink-0 px-4 pt-3 pb-3 bg-white border-b border-slate-100 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="p-1 -ml-1 text-slate-800 hover:text-black transition cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2]" />
        </button>
        <h1 className="text-lg font-black text-slate-900 tracking-tight">
          Expense Details
        </h1>
      </div>

      {/* Scrollable Screen Content */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-4 pb-8">
        {/* 1. Hero Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3.5">
          {/* Top Row: Category Icon, Code & Date Badge */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                {expense.categoryType === 'fuel' ? (
                  <Fuel className="w-5 h-5 stroke-[2]" />
                ) : expense.categoryType === 'vehicle' ? (
                  <Wrench className="w-5 h-5 stroke-[2]" />
                ) : expense.categoryType === 'food' ? (
                  <Utensils className="w-5 h-5 stroke-[2]" />
                ) : expense.categoryType === 'parking' ? (
                  <span className="font-bold text-sm">P</span>
                ) : expense.categoryType === 'mobile' ? (
                  <Smartphone className="w-5 h-5 stroke-[2]" />
                ) : (
                  <Receipt className="w-5 h-5 stroke-[2]" />
                )}
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                  {expense.category}
                </span>
                <span className="text-xs font-bold text-slate-900 block mt-0.5">
                  {expense.code}
                </span>
              </div>
            </div>

            {/* Date Pill */}
            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold">
              {expense.dateStr}
            </span>
          </div>

          {/* Amount & Route Row */}
          <div className="flex items-end justify-between pt-1">
            <div>
              <p className="text-xs text-slate-400 font-medium">Claim Amount</p>
              <p className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                ₹{expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 font-medium">Cylinder Route</p>
              <p className="text-xs font-bold text-slate-900 mt-0.5">
                {expense.route || 'Madurai North'}
              </p>
            </div>
          </div>

          {/* Dual Status Banner */}
          <div className="bg-[#F0F3FF] rounded-xl p-2.5 grid grid-cols-2 divide-x divide-slate-200/70">
            {/* Approval Status */}
            <div className="pr-2">
              <span className="text-[10px] font-medium text-slate-400 block mb-0.5">
                Approval
              </span>
              {expense.status === 'APPROVED' ? (
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.4]" />
                  <span>Approved</span>
                </div>
              ) : expense.status === 'PENDING' ? (
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.4]" />
                  <span>Pending</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs font-bold text-rose-700">
                  <AlertCircle className="w-3.5 h-3.5 stroke-[2.4]" />
                  <span>Rejected</span>
                </div>
              )}
            </div>

            {/* Settlement Status */}
            <div className="pl-3">
              <span className="text-[10px] font-medium text-slate-400 block mb-0.5">
                Settlement
              </span>
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-700">
                <DollarSign className="w-3.5 h-3.5 stroke-[2.4]" />
                <span>Paid</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Expense Information Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-sm font-bold text-slate-900">
              Expense Information
            </h2>
            <Info className="w-4 h-4 text-slate-400 stroke-[2]" />
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Expense ID</span>
              <span className="font-semibold text-slate-900">{expense.code}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Assigned Vehicle</span>
              <div className="flex items-center gap-1 font-semibold text-slate-900">
                <Truck className="w-3.5 h-3.5 text-slate-500" />
                <span>{expense.vehicle || 'Van 03 (TN 58 AX 4821)'}</span>
              </div>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Expense Date</span>
              <span className="font-semibold text-slate-900">{expense.dateStr}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Submission Time</span>
              <span className="font-semibold text-slate-900">
                {expense.submissionTime || '20 Oct 2026, 04:15 PM'}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Claimed Amount</span>
              <span className="font-bold text-slate-900">
                ₹{expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Description Box */}
          {expense.description && (
            <div className="pt-1">
              <span className="text-xs text-slate-400 font-medium block mb-1">
                Description
              </span>
              <div className="bg-[#F0F3FF] rounded-xl p-3 text-xs text-slate-700 font-normal leading-relaxed">
                {expense.description}
              </div>
            </div>
          )}
        </div>

        {/* 3. Receipt & Attachments Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-sm font-bold text-slate-900">
              Receipt & Attachments
            </h2>
            <Paperclip className="w-4 h-4 text-slate-400 stroke-[2]" />
          </div>

          {/* File Card */}
          <div className="bg-[#F0F3FF] rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-slate-500 shadow-2xs">
                <Receipt className="w-4 h-4 stroke-[2]" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {expense.fileName || 'file name.jpg'}
                </p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  {expense.fileMeta || '2.8 MB • JPG Image'}
                </p>
                <p className="text-[10px] text-slate-400 font-medium">
                  {expense.fileTime || '20 Oct 2026, 04:14 PM'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowImageModal(true)}
              className="p-1.5 text-slate-600 hover:text-black cursor-pointer transition"
              title="View receipt"
            >
              <Eye className="w-4 h-4 stroke-[2]" />
            </button>
          </div>

          {/* Note Banner */}
          <div className="bg-[#F0F3FF] rounded-xl p-2.5 flex items-center gap-2 text-[11px] text-slate-600 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0 stroke-[2]" />
            <span>Original physical tax invoices submitted to Depot Admin during shift check-in.</span>
          </div>
        </div>

        {/* 4. Admin Review Card (Displayed for Approved or Reviewed Claims) */}
        {expense.status === 'APPROVED' && (
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-1">
              <h2 className="text-sm font-bold text-slate-900">
                Admin Review
              </h2>
              <UserCheck className="w-4 h-4 text-slate-400 stroke-[2]" />
            </div>

            {/* Approved Badge Banner */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0 stroke-[2.2]" />
              <div>
                <p className="text-xs font-bold text-emerald-900">
                  Approved by Admin
                </p>
                <p className="text-[11px] text-emerald-700 leading-snug mt-0.5 font-normal">
                  Your expense claim has been verified against garage invoice and approved.
                </p>
              </div>
            </div>

            {/* Review Details */}
            <div className="space-y-2 text-xs pt-1">
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Reviewed By</span>
                <span className="font-semibold text-slate-900">
                  {expense.reviewedBy || 'S. Raman (Depot Logistics Admin)'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Review Timestamp</span>
                <span className="font-semibold text-slate-900">
                  {expense.reviewTimestamp || '21 Oct 2026, 10:30 AM'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400 font-medium">Admin Remarks</span>
                <span className="font-semibold text-slate-900">
                  {expense.adminRemarks || '—'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 5. Payment Details Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-sm font-bold text-slate-900">
              Payment Details
            </h2>
            <CreditCard className="w-4 h-4 text-slate-400 stroke-[2]" />
          </div>

          {/* Settlement Status Banner */}
          <div className="bg-[#F0F3FF] rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-medium text-slate-400 block">
                Settlement Status
              </span>
              <span className="text-xs font-bold text-emerald-700 block mt-0.5">
                {expense.settlementStatus || 'Paid Full'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 font-semibold">
                Balance Due <span className="font-bold text-slate-900">₹0.00</span>
              </span>
            </div>
          </div>

          {/* Payment Detail Rows */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Approved Amount</span>
              <span className="font-semibold text-slate-900">
                ₹{expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Disbursed Amount</span>
              <span className="font-bold text-emerald-700">
                ₹{(expense.disbursedAmount || expense.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Payment Timestamp</span>
              <span className="font-semibold text-slate-900">
                {expense.paymentTimestamp || '22 Oct 2026, 02:45 PM'}
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Disbursement Mode</span>
              <span className="font-semibold text-slate-900">
                {expense.disbursementMode || 'Depot Direct UPI (HDFC Bank)'}
              </span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400 font-medium">Reference / UTR</span>
              <span className="font-semibold text-slate-900">
                {expense.referenceUtr || 'UPI-98421092 / TXN-89201948'}
              </span>
            </div>
          </div>
        </div>

        {/* 6. Download Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => alert(`Downloading Expense Voucher for ${expense.code}`)}
            className="w-full bg-[#BC0118] hover:bg-red-800 active:scale-98 text-white font-bold text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
          >
            <Download className="w-4 h-4 stroke-[2.2]" />
            <span>Download Expense Voucher (PDF)</span>
          </button>
        </div>
      </div>

      {/* Image Preview Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-[380px] bg-white rounded-2xl p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800">{expense.fileName || 'file name.jpg'}</span>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="p-1 text-slate-500 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="w-full h-56 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200 overflow-hidden">
              <div className="text-center p-4">
                <Receipt className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">Official Depot Expense Voucher</p>
                <p className="text-[11px] text-slate-400 mt-1">{expense.code} • {expense.category}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowImageModal(false)}
              className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
