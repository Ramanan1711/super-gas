'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import ExpenseDetailsScreen from './ExpenseDetailsScreen';
import {
  Plus,
  Search,
  Receipt,
  Hourglass,
  CheckCircle2,
  X,
  Fuel,
  Wrench,
  Utensils,
  Smartphone,
  Truck,
  ChevronRight,
  ChevronDown,
  Paperclip,
  Check,
  Camera,
  Calendar,
} from 'lucide-react';

interface ExpenseClaim {
  id: string;
  code: string;
  category: string;
  categoryType: 'fuel' | 'vehicle' | 'food' | 'parking' | 'mobile' | 'other';
  amount: number;
  dateStr: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  paymentStatus: string;
  description?: string;
  referenceOrNote?: string;
  hasReceipt?: boolean;
  vanInfo?: string;
}

const initialClaims: ExpenseClaim[] = [];

export default function DeliveryExpensesScreen() {
  const [claims, setClaims] = useState<ExpenseClaim[]>(initialClaims);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [sortOrder, setSortOrder] = useState<'LATEST' | 'OLDEST'>('LATEST');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClaimForDetail, setSelectedClaimForDetail] = useState<ExpenseClaim | null>(null);

  // New expense form state matching Figma design
  const [newCategory, setNewCategory] = useState<'Fuel / Petrol' | 'Vehicle Maintenance' | 'Food / Allowance' | 'Parking Charges' | 'Mobile / Data' | 'Other'>('Fuel / Petrol');
  const [newExpenseDate, setNewExpenseDate] = useState('24/ 10/ 2026');
  const [assignedVehicle, setAssignedVehicle] = useState('TN 58 AX 4821');
  const [newAmount, setNewAmount] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch live expense claims from database
  const fetchClaims = async () => {
    try {
      const res = await fetch('/api/expenses?partnerCode=DP-003');
      if (!res.ok) return;
      const result = await res.json();
      if (result.success && Array.isArray(result.data?.claims)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped: ExpenseClaim[] = result.data.claims.map((c: any) => {
          const rawCat = (c.category || '').toLowerCase();
          let catType: ExpenseClaim['categoryType'] = 'fuel';
          if (rawCat.includes('maint')) catType = 'vehicle';
          else if (rawCat.includes('food')) catType = 'food';
          else if (rawCat.includes('park')) catType = 'parking';
          else if (rawCat.includes('mobile')) catType = 'mobile';
          else if (rawCat.includes('toll') || rawCat.includes('repair') || rawCat.includes('other')) catType = 'other';

          const date = new Date(c.claimDate || c.createdAt);
          const dateStr = date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          });

          return {
            id: c.id,
            code: c.claimNumber,
            category: c.categoryLabel || c.category?.replace(/_/g, ' ') || 'Expense',
            categoryType: catType,
            amount: c.amount,
            dateStr,
            status: c.status as ExpenseClaim['status'],
            paymentStatus: c.paymentStatus || 'Unpaid',
            description: c.description,
            hasReceipt: Boolean(c.receiptUrl),
            vanInfo: c.vehicle?.regNumber ? `Van (${c.vehicle.regNumber})` : undefined,
          };
        });
        setClaims(mapped);
      }
    } catch (err) {
      console.warn('Could not load live claims, keeping initial claims:', err);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function loadClaims() {
      try {
        const res = await fetch('/api/expenses?partnerCode=DP-003');
        if (!res.ok) return;
        const result = await res.json();
        if (!ignore && result.success && Array.isArray(result.data?.claims)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mapped: ExpenseClaim[] = result.data.claims.map((c: any) => {
            const rawCat = (c.category || '').toLowerCase();
            let catType: ExpenseClaim['categoryType'] = 'fuel';
            if (rawCat.includes('maint')) catType = 'vehicle';
            else if (rawCat.includes('food')) catType = 'food';
            else if (rawCat.includes('park')) catType = 'parking';
            else if (rawCat.includes('mobile')) catType = 'mobile';
            else if (rawCat.includes('toll') || rawCat.includes('repair') || rawCat.includes('other')) catType = 'other';

            const date = new Date(c.claimDate || c.createdAt);
            const dateStr = date.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            });

            return {
              id: c.id,
              code: c.claimNumber,
              category: c.categoryLabel || c.category?.replace(/_/g, ' ') || 'Expense',
              categoryType: catType,
              amount: c.amount,
              dateStr,
              status: c.status as ExpenseClaim['status'],
              paymentStatus: c.paymentStatus || 'Unpaid',
              description: c.description,
              hasReceipt: Boolean(c.receiptUrl),
              vanInfo: c.vehicle?.regNumber ? `Van (${c.vehicle.regNumber})` : undefined,
            };
          });
          setClaims(mapped);
        }
      } catch (err) {
        console.warn('Could not load live claims, keeping initial claims:', err);
      }
    }
    loadClaims();
    return () => {
      ignore = true;
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setReceiptPreview(URL.createObjectURL(file));
    }
  };

  // Submit expense claim with receipt upload
  const handleSubmitExpenseClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingClaim(true);
    try {
      let receiptUrl: string | null = null;

      // 1. Upload receipt file if provided
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const uploadJson = await uploadRes.json();
        if (uploadRes.ok && uploadJson.success && uploadJson.data?.fileUrl) {
          receiptUrl = uploadJson.data.fileUrl;
        }
      }

      // 2. Map category enum
      let categoryEnum: 'FUEL_PETROL' | 'VEHICLE_MAINTENANCE' | 'FOOD_ALLOWANCE' | 'PARKING_CHARGES' | 'MOBILE_DATA' | 'OTHER' = 'FUEL_PETROL';
      if (newCategory === 'Vehicle Maintenance') categoryEnum = 'VEHICLE_MAINTENANCE';
      else if (newCategory === 'Food / Allowance') categoryEnum = 'FOOD_ALLOWANCE';
      else if (newCategory === 'Parking Charges') categoryEnum = 'PARKING_CHARGES';
      else if (newCategory === 'Mobile / Data') categoryEnum = 'MOBILE_DATA';
      else if (newCategory === 'Other') categoryEnum = 'OTHER';

      const numericAmount = parseFloat(newAmount.replace(/[^0-9.]/g, ''));
      if (isNaN(numericAmount) || numericAmount <= 0) {
        throw new Error('Please enter a valid expense amount');
      }

      // 3. Post to /api/expenses
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerCode: 'DP-003',
          vehicleReg: assignedVehicle,
          category: categoryEnum,
          categoryLabel: newCategory,
          amount: numericAmount,
          description: newDesc.trim() || `${newCategory} expense claim submitted by driver`,
          receiptUrl,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error?.message || 'Failed to submit expense claim');
      }

      // Refresh claims from database
      await fetchClaims();

      // Reset form
      setNewAmount('');
      setNewDesc('');
      setReceiptPreview(null);
      setSelectedFile(null);
      setShowAddModal(false);
      setToastMessage(`Expense claim ${result.data?.claim?.claimNumber || ''} submitted successfully for admin review!`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error submitting expense');
    } finally {
      setIsSubmittingClaim(false);
    }
  };

  // Filter and sort claims
  const filteredClaims = useMemo(() => {
    let list = [...claims];

    // Filter by tab
    if (activeFilter !== 'ALL') {
      list = list.filter((item) => item.status === activeFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.code.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q)) ||
          (item.referenceOrNote && item.referenceOrNote.toLowerCase().includes(q))
      );
    }

    // Sort order
    if (sortOrder === 'OLDEST') {
      list.reverse();
    }

    return list;
  }, [claims, activeFilter, searchQuery, sortOrder]);

  // Dynamic counts and totals
  const totalSubmitted = useMemo(
    () => claims.reduce((acc, curr) => acc + curr.amount, 0),
    [claims]
  );
  const pendingCount = useMemo(
    () => claims.filter((c) => c.status === 'PENDING').length,
    [claims]
  );
  const pendingTotal = useMemo(
    () => claims.filter((c) => c.status === 'PENDING').reduce((acc, curr) => acc + curr.amount, 0),
    [claims]
  );
  const approvedCount = useMemo(
    () => claims.filter((c) => c.status === 'APPROVED').length,
    [claims]
  );
  const approvedTotal = useMemo(
    () => claims.filter((c) => c.status === 'APPROVED').reduce((acc, curr) => acc + curr.amount, 0),
    [claims]
  );
  const rejectedCount = useMemo(
    () => claims.filter((c) => c.status === 'REJECTED').length,
    [claims]
  );
  const rejectedTotal = useMemo(
    () => claims.filter((c) => c.status === 'REJECTED').reduce((acc, curr) => acc + curr.amount, 0),
    [claims]
  );

  if (selectedClaimForDetail) {
    return (
      <ExpenseDetailsScreen
        claim={{
          id: selectedClaimForDetail.id,
          code: selectedClaimForDetail.code,
          category: selectedClaimForDetail.category.toUpperCase(),
          categoryType: selectedClaimForDetail.categoryType,
          amount: selectedClaimForDetail.amount,
          dateStr: selectedClaimForDetail.dateStr,
          status: selectedClaimForDetail.status,
          settlementStatus: selectedClaimForDetail.paymentStatus === 'Paid - Depot UPI' ? 'Paid Full' : selectedClaimForDetail.paymentStatus,
          vehicle: selectedClaimForDetail.vanInfo || 'Van 03 (TN 58 AX 4821)',
          description: selectedClaimForDetail.description || 'Brake pad replacement & emergency tyre puncture repair during Madurai North commercial delivery run.',
        }}
        onBack={() => setSelectedClaimForDetail(null)}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC] overflow-hidden">
      {/* Screen Header */}
      <div className="shrink-0 px-5 pt-3 pb-3 bg-white border-b border-slate-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            My Claims
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Partner settlement claims & allowances
          </p>
        </div>

        {/* Add Expense Button */}
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="bg-[#BC0118] hover:bg-red-800 active:scale-95 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Expense</span>
        </button>
      </div>

      {toastMessage && (
        <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 text-center flex items-center justify-center gap-1.5 shadow-md animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3.5 space-y-3.5 pb-6">
        {/* KPI Summary Cards (2x2 Grid) */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Card 1: Total Submitted */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/70 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Total Submitted</span>
              <div className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                <Receipt className="w-3.5 h-3.5 stroke-[2]" />
              </div>
            </div>
            <p className="text-[22px] font-black text-slate-900 tracking-tight mt-1">
              ₹{totalSubmitted.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              {claims.length} claims lodged
            </p>
          </div>

          {/* Card 2: Pending */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/70 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Pending</span>
              <div className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1 text-[10px] font-bold">
                <Hourglass className="w-2.5 h-2.5 stroke-[2.5]" />
                <span>{pendingCount}</span>
              </div>
            </div>
            <p className="text-[22px] font-black text-slate-900 tracking-tight mt-1">
              ₹{pendingTotal.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-amber-600 font-medium mt-0.5">
              Under review
            </p>
          </div>

          {/* Card 3: Approved */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/70 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Approved</span>
              <div className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1 text-[10px] font-bold">
                <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                <span>{approvedCount}</span>
              </div>
            </div>
            <p className="text-[22px] font-black text-slate-900 tracking-tight mt-1">
              ₹{approvedTotal.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
              Verified claims
            </p>
          </div>

          {/* Card 4: Rejected */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/70 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Rejected</span>
              <div className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 flex items-center gap-1 text-[10px] font-bold">
                <X className="w-2.5 h-2.5 stroke-[2.5]" />
                <span>{rejectedCount}</span>
              </div>
            </div>
            <p className="text-[22px] font-black text-slate-900 tracking-tight mt-1">
              ₹{rejectedTotal.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-rose-600 font-medium mt-0.5">
              Requires action
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white border border-slate-200/80 rounded-2xl px-3.5 py-2.5 flex items-center gap-2.5 shadow-2xs">
          <Search className="w-4 h-4 text-slate-400 stroke-[2] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, category, notes..."
            className="w-full text-xs font-medium text-slate-800 placeholder:text-slate-400 bg-transparent focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {/* All */}
          <button
            type="button"
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>All</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeFilter === 'ALL' ? 'bg-slate-700 text-slate-100' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {claims.length}
            </span>
          </button>

          {/* Pending */}
          <button
            type="button"
            onClick={() => setActiveFilter('PENDING')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeFilter === 'PENDING'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white border border-slate-200/70 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Pending</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-amber-100 text-amber-700">
              {pendingCount}
            </span>
          </button>

          {/* Approved */}
          <button
            type="button"
            onClick={() => setActiveFilter('APPROVED')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeFilter === 'APPROVED'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white border border-slate-200/70 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Approved</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-emerald-100 text-emerald-700">
              {approvedCount}
            </span>
          </button>

          {/* Rejected */}
          <button
            type="button"
            onClick={() => setActiveFilter('REJECTED')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeFilter === 'REJECTED'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white border border-slate-200/70 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Rejected</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-rose-100 text-rose-700">
              {rejectedCount}
            </span>
          </button>
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
            EXPENSE CLAIMS (OCT 2026)
          </span>
          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === 'LATEST' ? 'OLDEST' : 'LATEST')}
            className="text-[11px] text-slate-400 font-medium hover:text-slate-600 cursor-pointer transition"
          >
            Sort: {sortOrder === 'LATEST' ? 'Latest First' : 'Oldest First'}
          </button>
        </div>

        {/* Expense Cards List */}
        <div className="space-y-3">
          {filteredClaims.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/70">
              <p className="text-sm font-semibold text-slate-700">No expense claims found</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            filteredClaims.map((item) => {
              // Accent bar border color by status
              const borderLeftClass =
                item.status === 'PENDING'
                  ? 'border-l-[3.5px] border-l-amber-500'
                  : item.status === 'APPROVED'
                  ? 'border-l-[3.5px] border-l-emerald-500'
                  : 'border-l-[3.5px] border-l-rose-500';

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedClaimForDetail(item)}
                  className={`bg-white rounded-2xl p-4 border border-slate-200/70 shadow-2xs ${borderLeftClass} transition-all hover:shadow-xs hover:border-slate-300 cursor-pointer`}
                >
                  {/* Top Row: Category Icon, Name, Amount */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {/* Category Icon */}
                      {item.categoryType === 'fuel' && (
                        <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                          <Fuel className="w-5 h-5 stroke-[2.2]" />
                        </div>
                      )}
                      {item.categoryType === 'vehicle' && (
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <Wrench className="w-5 h-5 stroke-[2.2]" />
                        </div>
                      )}
                      {item.categoryType === 'food' && (
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                          <Utensils className="w-5 h-5 stroke-[2.2]" />
                        </div>
                      )}
                      {item.categoryType === 'parking' && (
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 font-black flex items-center justify-center shrink-0 text-base">
                          P
                        </div>
                      )}
                      {item.categoryType === 'mobile' && (
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <Smartphone className="w-5 h-5 stroke-[2.2]" />
                        </div>
                      )}
                      {item.categoryType === 'other' && (
                        <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center shrink-0">
                          <Receipt className="w-5 h-5 stroke-[2.2]" />
                        </div>
                      )}

                      <div>
                        <h2 className="text-sm font-bold text-slate-900 leading-tight">
                          {item.category}
                        </h2>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                          {item.code}
                        </p>
                      </div>
                    </div>

                    {/* Amount & Date/Receipt */}
                    <div className="text-right">
                      <p
                        className={`text-base font-black tracking-tight ${
                          item.status === 'REJECTED' ? 'text-[#BC0118]' : 'text-slate-900'
                        }`}
                      >
                        ₹{item.amount.toFixed(2)}
                      </p>
                      {item.hasReceipt ? (
                        <p className="text-[11px] text-slate-400 font-medium flex items-center justify-end gap-1 mt-0.5">
                          <Paperclip className="w-3 h-3 text-slate-400" />
                          <span>Receipt</span>
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                          {item.dateStr}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Optional Description */}
                  {item.description && (
                    <p className="text-xs text-slate-500 font-normal mt-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  {/* Badges and Subtext Row */}
                  <div className="flex items-center justify-between mt-3 pt-1 border-t border-slate-50">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Status Badge */}
                      {item.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/70 text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          <span>Pending Approval</span>
                        </span>
                      )}
                      {item.status === 'APPROVED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>Approved</span>
                        </span>
                      )}
                      {item.status === 'REJECTED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/70 text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                          <span>Rejected (Policy)</span>
                        </span>
                      )}

                      {/* Payment Status Badge */}
                      {item.paymentStatus === 'Unpaid' && (
                        <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200/70 text-[10px] font-bold">
                          Unpaid
                        </span>
                      )}
                      {item.paymentStatus.includes('Paid') && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 text-[10px] font-bold">
                          {item.paymentStatus}
                        </span>
                      )}
                      {item.paymentStatus === 'Disallowed' && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                          Disallowed
                        </span>
                      )}
                    </div>

                    {/* Right detail text or Date */}
                    {item.referenceOrNote ? (
                      <span className="text-[11px] text-slate-400 font-medium">
                        {item.referenceOrNote}
                      </span>
                    ) : item.hasReceipt ? (
                      <span className="text-[11px] text-slate-400 font-medium">
                        {item.dateStr}
                      </span>
                    ) : null}
                  </div>

                  {/* Van Info Bottom Bar (if applicable, e.g. for fuel) */}
                  {item.vanInfo && (
                    <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 flex items-center justify-between mt-2.5">
                      <div className="flex items-center gap-2 text-slate-600 text-xs font-medium">
                        <Truck className="w-4 h-4 text-slate-500 shrink-0 stroke-[2]" />
                        <span>{item.vanInfo}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* You're All Caught Up Footer */}
        <div className="pt-5 pb-4 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 border-2 border-white shadow-2xs flex items-center justify-center text-slate-600 mx-auto mb-2">
            <CheckCircle2 className="w-6 h-6 stroke-[2]" />
          </div>
          <h3 className="font-extrabold text-slate-800 text-sm">
            You&apos;re All Caught Up
          </h3>
          <p className="text-xs text-slate-400 text-center max-w-[280px] mx-auto leading-relaxed mt-1">
            All physical receipts submitted for October delivery shifts are synchronized with Chennai Hub dispatch.
          </p>
        </div>
      </div>

      {/* Add Expense Popup / Modal matching exact image design */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-2xs p-4">
          <div className="w-full max-w-[400px] bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 max-h-[94vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between pb-1">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
                  My Claims
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Partner settlement claims & allowances
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-800 hover:text-black cursor-pointer -mr-1"
              >
                <X className="w-5 h-5 stroke-[2]" />
              </button>
            </div>

            <form onSubmit={handleSubmitExpenseClaim} className="mt-4 space-y-3.5">
              {/* Expense Category* */}
              <div>
                <label className="text-xs font-bold text-slate-900 mb-1.5 block">
                  Expense Category*
                </label>
                <div className="relative">
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as typeof newCategory)}
                    className="w-full bg-[#EEF2FF] hover:bg-[#E6ECFF] text-slate-900 text-xs font-semibold rounded-xl px-4 py-3 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500 transition cursor-pointer"
                  >
                    <option value="Fuel / Petrol">Fuel / Petrol</option>
                    <option value="Vehicle Maintenance">Vehicle Maintenance</option>
                    <option value="Food / Allowance">Food / Allowance</option>
                    <option value="Parking Charges">Parking Charges</option>
                    <option value="Mobile / Data">Mobile / Data</option>
                    <option value="Other">Other</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-600 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.2]" />
                </div>
              </div>

              {/* Expense Date* & Assigned Vechcle */}
              <div className="grid grid-cols-2 gap-3">
                {/* Expense Date* */}
                <div>
                  <label className="text-xs font-bold text-slate-900 mb-1.5 block">
                    Expense Date*
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={newExpenseDate}
                      onChange={(e) => setNewExpenseDate(e.target.value)}
                      placeholder="24/ 10/ 2026"
                      className="w-full bg-[#EEF2FF] text-slate-900 text-xs font-semibold rounded-xl px-4 py-3 pr-9 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <Calendar className="w-4 h-4 text-slate-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2]" />
                  </div>
                </div>

                {/* Assigned Vechcle */}
                <div>
                  <label className="text-xs font-bold text-slate-900 mb-1.5 block">
                    Assigned Vechcle
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={assignedVehicle}
                    onChange={(e) => setAssignedVehicle(e.target.value)}
                    className="w-full bg-[#EEF2FF] text-slate-900 text-xs font-semibold rounded-xl px-4 py-3 focus:outline-none cursor-default"
                  />
                </div>
              </div>

              {/* Amount (INR)* */}
              <div>
                <label className="text-xs font-bold text-slate-900 mb-1.5 block">
                  Amount (INR)*
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    placeholder="₹ 0.00"
                    className="w-full bg-[#EEF2FF] text-slate-900 text-xs font-semibold rounded-xl px-4 py-3 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Receipt or Bill Photo* */}
              <div>
                <label className="text-xs font-bold text-slate-900 mb-1.5 block">
                  Receipt or Bill Photo*
                </label>
                {receiptPreview ? (
                  /* Uploaded State (State 2 in design): Square thumbnail with remove x button */
                  <div className="relative inline-block mt-0.5">
                    <div className="w-16 h-16 rounded-md bg-slate-300 overflow-hidden flex items-center justify-center border border-slate-300 shadow-2xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={receiptPreview}
                        alt="Receipt preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setReceiptPreview(null)}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-slate-800 text-white rounded-full flex items-center justify-center text-[11px] font-bold shadow-xs hover:bg-black cursor-pointer leading-none"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  /* Empty State (State 1 in design): Take Photo or Upload Slip */
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-[#EEF2FF] hover:bg-[#E6ECFF] rounded-2xl py-6 px-4 flex flex-col items-center justify-center cursor-pointer transition text-center"
                  >
                    <Camera className="w-7 h-7 text-slate-800 stroke-[1.8] mb-1.5" />
                    <p className="text-xs font-bold text-slate-900">
                      Take Photo or Upload Slip
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                      PNG, JPG, PDF upto 10 MB
                    </p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*,.pdf"
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              {/* Description / Purpose */}
              <div>
                <label className="text-xs font-bold text-slate-900 mb-1.5 block">
                  Description / Purpose
                </label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="eg. tank full at Indian Oil"
                  className="w-full bg-[#EEF2FF] text-slate-900 text-xs font-medium rounded-xl px-4 py-3 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Buttons: Cancel & Submit claim */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-[#EEF2FF] hover:bg-[#E4EAFF] text-slate-800 font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingClaim}
                  className="bg-[#BC0118] hover:bg-red-800 disabled:opacity-50 active:scale-95 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer transition shadow-xs flex items-center gap-1.5"
                >
                  {isSubmittingClaim && (
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  )}
                  <span>{isSubmittingClaim ? 'Uploading & Submitting...' : 'Submit claim'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
