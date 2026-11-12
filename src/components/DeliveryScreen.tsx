'use client';

import React, { useState, useMemo } from 'react';
import BrandLogo from '@/components/BrandLogo';
import {
  Phone,
  MapPin,
  Search,
  CheckCircle2,
  Package,
  X,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Home,
  Users,
  Box,
  Banknote,
  Menu,
  ArrowLeft,
  AlertTriangle,
  Check,
  Minus,
  Plus,
} from 'lucide-react';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string | null;
  type: string;
}

export interface Delivery {
  id: string;
  customerId: string;
  customer: Customer;
  status: 'PENDING' | 'DELIVERED' | 'CANCELLED';
  cylinderType: string;
  quantity: number;
  emptyCollected: number;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  notes: string | null;
  deliveredAt: string | null;
}

export interface DeliveryStats {
  totalDeliveries: number;
  completedDeliveries: number;
  pendingDeliveries: number;
  cancelledDeliveries: number;
  emptyCylindersCollected: number;
  totalCollected: number;
  cashInHand: number;
  onlineCollected: number;
}

interface DeliveryScreenProps {
  initialStats: DeliveryStats;
  initialDeliveries: Delivery[];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function DeliveryScreen({
  initialStats,
  initialDeliveries,
}: DeliveryScreenProps) {
  const [stats, setStats] = useState<DeliveryStats>(initialStats);
  const [deliveries, setDeliveries] = useState<Delivery[]>(initialDeliveries);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Delivery Flow State
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [step, setStep] = useState<'CATEGORY' | 'COMPLETED'>('CATEGORY');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoryQuantities, setCategoryQuantities] = useState<Record<string, number>>({
    '5 KG': 10,
    '21 KG': 1,
    '33 KG': 1,
  });
  const [deliveredQuantity, setDeliveredQuantity] = useState(1);
  const [emptyCount, setEmptyCount] = useState(8);
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'UPI'>('CASH');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeBottomNav, setActiveBottomNav] = useState<'HOME' | 'CUSTOMERS' | 'STOCKS' | 'EXPENSES' | 'MORE'>('HOME');

  // Cylinder custody stock on van (matching Figma design)
  const [filledStock, setFilledStock] = useState(10);
  const [emptyStock, setEmptyStock] = useState(15);
  const [showCylinderDetails, setShowCylinderDetails] = useState(false);

  // Filtered deliveries based on search query
  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((item) => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const nameMatch = item.customer.name.toLowerCase().includes(query);
        const phoneMatch = item.customer.phone.toLowerCase().includes(query);
        const addressMatch = (item.customer.address || '').toLowerCase().includes(query);
        const cylinderMatch = item.cylinderType.toLowerCase().includes(query);
        return nameMatch || phoneMatch || addressMatch || cylinderMatch;
      }
      return true;
    });
  }, [deliveries, searchQuery]);

  // Toggle category checkbox
  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
    setCategoryQuantities((prev) => ({
      ...prev,
      [category]: prev[category] ?? (category === '5 KG' ? 10 : 1),
    }));
  };

  // Handle open delivery flow
  const handleStartDelivery = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setSelectedCategories([]);
    setCategoryQuantities({
      '5 KG': 10,
      '21 KG': 1,
      '33 KG': 1,
    });
    setDeliveredQuantity(delivery.quantity);
    setEmptyCount(delivery.emptyCollected || 8);
    setPaymentMode(delivery.paymentMethod === 'UPI' ? 'UPI' : 'CASH');
    setStep('CATEGORY');
  };

  // Close modal
  const handleCloseModal = () => {
    setSelectedDelivery(null);
    setSelectedCategories([]);
    setStep('CATEGORY');
  };

  // Complete delivery submission
  const handleConfirmDelivery = async () => {
    if (!selectedDelivery) return;
    setIsSubmitting(true);
    try {
      const categoryStr = selectedCategories.length > 0
        ? selectedCategories.map((c) => `${categoryQuantities[c] ?? (c === '5 KG' ? 10 : 1)}x ${c}`).join(', ')
        : selectedDelivery.cylinderType;
      const totalDelivered = selectedCategories.length > 0
        ? selectedCategories.reduce((sum, c) => sum + (categoryQuantities[c] ?? (c === '5 KG' ? 10 : 1)), 0)
        : deliveredQuantity;
      const res = await fetch(`/api/deliveries/${selectedDelivery.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'DELIVERED',
          emptyCollected: emptyCount,
          cylinderType: categoryStr,
          paymentMethod: paymentMode,
          paymentStatus: 'PAID',
        }),
      });

      if (res.ok) {
        const updatedItem = await res.json();
        
        // Update local state
        setDeliveries((prev) =>
          prev.map((d) => (d.id === updatedItem.id ? updatedItem : d))
        );

        // Update stats
        setStats((prev) => {
          const isCash = paymentMode === 'CASH';
          return {
            ...prev,
            completedDeliveries: prev.completedDeliveries + 1,
            pendingDeliveries: Math.max(0, prev.pendingDeliveries - 1),
            emptyCylindersCollected: prev.emptyCylindersCollected + emptyCount,
            totalCollected: prev.totalCollected + selectedDelivery.amount,
            cashInHand: isCash ? prev.cashInHand + selectedDelivery.amount : prev.cashInHand,
            onlineCollected: !isCash ? prev.onlineCollected + selectedDelivery.amount : prev.onlineCollected,
          };
        });

        // Update custody stock
        setFilledStock((prev) => Math.max(0, prev - totalDelivered));
        setEmptyStock((prev) => prev + emptyCount);

        setStep('COMPLETED');
      } else {
        alert('Failed to complete delivery. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen max-h-screen bg-slate-100 flex justify-center items-center py-0 sm:py-4 text-slate-900 font-sans overflow-hidden">
      {/* Mobile Frame Container */}
      <div className="w-full sm:max-w-[430px] bg-slate-50 h-[100dvh] sm:h-[880px] sm:max-h-[94vh] sm:rounded-[36px] sm:shadow-2xl flex flex-col relative overflow-hidden border border-slate-200/80">
        
        {/* Mobile Device Status Bar */}
        <div className="shrink-0 px-6 pt-3 pb-2 flex justify-between items-center text-xs font-semibold text-slate-800 bg-white z-10">
          <span>9:41</span>
          <div className="w-20 h-4 bg-slate-900 rounded-full mx-auto hidden sm:block"></div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold">5G</span>
            <div className="w-4 h-2.5 border border-slate-800 rounded-sm p-0.5 flex items-center">
              <div className="h-full w-full bg-slate-800 rounded-[1px]"></div>
            </div>
          </div>
        </div>

        {selectedDelivery && step !== 'COMPLETED' ? (
          /* Screen 2: Record Cylinder Handover (Matched exactly to Figma design) */
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-3.5">
              {/* Header Card */}
              <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-2xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 hover:bg-slate-200 active:scale-95 transition cursor-pointer"
                  >
                    <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
                  </button>
                  <div>
                    <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">Delivery</h1>
                    <p className="text-xs text-slate-500 font-medium">Record cylinder handover</p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-100/90 border border-slate-200/60 flex items-center justify-center p-1.5 shadow-2xs">
                  <BrandLogo className="h-4 w-auto object-contain" />
                </div>
              </div>

              {/* Customer Details Card */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3.5">
                {/* Header Row: Name, Code & Red Initials Avatar */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
                      {selectedDelivery.customer.name}
                    </h2>
                    <div className="inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200/90 mt-1">
                      CUS-{String(deliveries.findIndex((d) => d.id === selectedDelivery.id) >= 0 ? deliveries.findIndex((d) => d.id === selectedDelivery.id) + 124 : 124).padStart(5, '0')}
                    </div>
                  </div>

                  {/* Red Initials Circle Avatar */}
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#BC0118] text-white font-bold text-base flex items-center justify-center shrink-0 shadow-2xs">
                    {getInitials(selectedDelivery.customer.name)}
                  </div>
                </div>

                {/* Horizontal Divider */}
                <div className="border-b border-slate-100"></div>

                {/* Contact & Address */}
                <div className="space-y-2">
                  <a
                    href={`tel:${selectedDelivery.customer.phone}`}
                    className="flex items-center gap-2.5 text-slate-800 hover:text-red-600 transition-colors w-fit"
                  >
                    <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="text-sm font-semibold tracking-wide">
                      {selectedDelivery.customer.phone}
                    </span>
                  </a>
                  <div className="flex items-start gap-2.5 text-slate-500">
                    <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    <p className="text-sm font-normal text-slate-600 leading-snug">
                      {selectedDelivery.customer.address || '12, Anna Nagar, Madurai, Tamil Nadu'}
                    </p>
                  </div>
                </div>

                {/* Amber Warning Banner: Pending Empty Return */}
                <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl px-3.5 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#92400E]">
                    <AlertTriangle className="w-4 h-4 text-[#D97706] stroke-[2.2] shrink-0" />
                    <span className="text-xs font-semibold">Pending Empty Return</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-md bg-[#FEF3C7] text-[#92400E] text-[11px] font-bold border border-[#FDE68A]/60">
                    8 Cylinders
                  </span>
                </div>
              </div>

              {/* Select Category Card */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
                <h3 className="text-xs sm:text-[13px] font-black tracking-wider text-slate-900 uppercase mb-4">
                  Select Category
                </h3>
                <div className="space-y-4">
                  {['5 KG', '21 KG', '33 KG'].map((category) => {
                    const isChecked = selectedCategories.includes(category);
                    return (
                      <div
                        key={category}
                        className="flex items-center justify-between min-h-[36px]"
                      >
                        {/* Checkbox & Category Label */}
                        <button
                          type="button"
                          onClick={() => toggleCategory(category)}
                          className="flex items-center gap-3.5 text-left cursor-pointer group select-none"
                        >
                          <div
                            className={`w-5 h-5 rounded-[4px] border-2 flex items-center justify-center transition-colors ${
                              isChecked
                                ? 'border-[#BC0118] bg-[#BC0118] text-white'
                                : 'border-[#BC0118] bg-white group-hover:border-red-700'
                            }`}
                          >
                            {isChecked && <Check className="w-3.5 h-3.5 stroke-[3] text-white" />}
                          </div>
                          <span className="text-sm sm:text-[15px] font-bold text-slate-900 tracking-wide">
                            {category}
                          </span>
                        </button>

                        {/* Quantity Counter (Displayed when checkbox is selected) */}
                        {isChecked && (
                          <div className="flex items-center gap-3 animate-in fade-in zoom-in-95 duration-150">
                            {/* Decrement (-) Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCategoryQuantities((prev) => ({
                                  ...prev,
                                  [category]: Math.max(1, (prev[category] ?? (category === '5 KG' ? 10 : 1)) - 1),
                                }));
                              }}
                              className="w-7 h-7 rounded-lg bg-white border border-rose-200/90 shadow-2xs hover:bg-rose-50/40 active:scale-95 flex items-center justify-center text-slate-900 transition cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                            </button>

                            {/* Quantity Number */}
                            <span className="font-extrabold text-slate-900 text-sm sm:text-base min-w-[22px] text-center">
                              {categoryQuantities[category] ?? (category === '5 KG' ? 10 : 1)}
                            </span>

                            {/* Increment (+) Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCategoryQuantities((prev) => ({
                                  ...prev,
                                  [category]: (prev[category] ?? (category === '5 KG' ? 10 : 1)) + 1,
                                }));
                              }}
                              className="w-7 h-7 rounded-lg bg-[#E81B24] hover:bg-red-700 active:scale-95 shadow-xs flex items-center justify-center text-white transition cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5 stroke-[3]" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Action Area */}
            <div className="shrink-0 p-4 pt-2 pb-6 bg-slate-50 border-t border-slate-200/60">
              <button
                type="button"
                onClick={handleConfirmDelivery}
                disabled={isSubmitting || selectedCategories.length === 0}
                className={`w-full py-3.5 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition active:scale-[0.99] shadow-xs cursor-pointer ${
                  selectedCategories.length > 0
                    ? 'bg-[#E81B24] hover:bg-red-700 text-white shadow-md'
                    : 'bg-[#D9D9D9] text-slate-600 hover:bg-[#D0D0D0]'
                }`}
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Continue</span>
                    <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
              <p className="text-xs text-slate-400 font-normal text-center mt-2.5">
                Invoice will be generated automatically in next step
              </p>
            </div>
          </div>
        ) : (
          /* Screen 1: Dashboard */
          <>
            {/* Top Header */}
            <div className="shrink-0 bg-white px-5 pt-2 pb-3.5 border-b border-slate-100 z-10">
          {/* Top Brand Bar */}
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center">
              <BrandLogo className="h-8 w-auto object-contain" />
            </div>
            {/* Active Shift Status Badge */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200/90 text-slate-800 text-xs sm:text-[13px] font-bold shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-[#17A44B] shrink-0"></span>
              <span>Active Shift</span>
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Delivery</h1>
            <p className="text-xs text-slate-500 font-medium">Track and Manage Deliveries</p>
          </div>
        </div>

        {/* Scrollable Screen Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-4 pb-6">
          
          {/* KPI Statistics Section */}
          <div className="space-y-3">
            {/* My Cylinder Status Section (Matched exactly to Figma design) */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3.5">
              {/* Header Row */}
              <div className="flex items-center justify-between">
                <h2 className="text-[13px] font-bold tracking-wider text-slate-800 uppercase">
                  My Cylinder Status
                </h2>
                <div className="px-3 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-200/90 rounded-lg shadow-2xs">
                  On Van / Custody
                </div>
              </div>

              {/* Top Divider */}
              <div className="border-b border-slate-100"></div>

              {/* 2 Status Cards */}
              <div className="grid grid-cols-2 gap-3.5">
                {/* FILLED Card */}
                <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold tracking-wider text-slate-900 uppercase">
                      Filled
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  </div>
                  <p className="text-3xl font-extrabold text-slate-900 mt-2.5 tracking-tight">
                    {filledStock}
                  </p>
                  <p className="text-sm font-semibold text-emerald-600 mt-1">
                    Available
                  </p>
                </div>

                {/* EMPTY Card */}
                <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                      Empty
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
                  </div>
                  <p className="text-3xl font-extrabold text-slate-900 mt-2.5 tracking-tight">
                    {emptyStock}
                  </p>
                  <p className="text-sm font-medium text-slate-500 mt-1">
                    Collected
                  </p>
                </div>
              </div>

              {/* View Cylinder Details Accordion */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowCylinderDetails(!showCylinderDetails)}
                  className="w-full flex items-center justify-between py-1 text-left group cursor-pointer select-none"
                >
                  <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors">
                    View Cylinder Details
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-red-600 stroke-[2.5] transition-transform duration-200 ${
                      showCylinderDetails ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {showCylinderDetails && (
                  <div className="bg-slate-50/90 rounded-xl p-3 border border-slate-200/80 space-y-2 mt-2 mb-1 text-xs">
                    <div className="flex justify-between items-center text-slate-600">
                      <span className="font-medium">19kg Commercial (Filled / Empty)</span>
                      <span className="font-bold text-slate-900">
                        {Math.max(0, filledStock - 4)} / {Math.max(0, emptyStock - 6)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600">
                      <span className="font-medium">14.2kg Domestic (Filled / Empty)</span>
                      <span className="font-bold text-slate-900">4 / 6</span>
                    </div>
                    <div className="pt-1.5 border-t border-slate-200 flex justify-between items-center font-bold text-slate-800">
                      <span>Total Custody Count</span>
                      <span>{filledStock + emptyStock} Units</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Today's Deliveries Card (Matched exactly to Figma design) */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
              <h3 className="text-[13px] font-bold tracking-wider text-slate-900 uppercase">
                Today&apos;s Deliveries
              </h3>
              <div className="border-b border-slate-100 my-3.5"></div>
              
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl sm:text-4xl font-extrabold text-[#17a44b] tracking-tight">
                    {stats.completedDeliveries}
                  </p>
                  <p className="text-xs font-bold tracking-wider text-[#17a44b] uppercase mt-1">
                    Completed
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-3xl sm:text-4xl font-extrabold text-[#17a44b] tracking-tight">
                    ₹ {stats.totalCollected.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs font-bold tracking-wider text-[#17a44b] uppercase mt-1">
                    Total Amount
                  </p>
                </div>
              </div>
            </div>

            {/* Today's Collection Card (Matched exactly to Figma design) */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
              <h3 className="text-[13px] font-bold tracking-wider text-slate-900 uppercase">
                Today&apos;s Collection
              </h3>
              <div className="border-b border-slate-100 my-3.5"></div>

              <div>
                <p className="text-sm font-medium text-slate-500">Total Collected</p>
                <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1 mb-4">
                  ₹{(stats.cashInHand + stats.onlineCollected).toLocaleString('en-IN')}
                </p>
              </div>

              <div className="space-y-2.5">
                {/* Cash Row */}
                <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl px-4 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-900"></span>
                    <span className="text-sm font-semibold text-slate-900">Cash</span>
                  </div>
                  <span className="text-base font-bold text-slate-900">
                    ₹{stats.cashInHand.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* UPI Row */}
                <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl px-4 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    <span className="text-sm font-semibold text-slate-900">UPI</span>
                  </div>
                  <span className="text-base font-bold text-slate-900">
                    ₹{stats.onlineCollected.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Customers Section */}
          <div id="customers-list-section" className="space-y-3">
            <div className="flex items-center justify-between pt-1">
              <h2 className="text-base font-bold text-slate-900">Customers</h2>
              <span className="text-xs text-slate-400 font-medium">
                {filteredDeliveries.length} result{filteredDeliveries.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Search Input Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customer..."
                className="w-full bg-white border border-slate-200/80 rounded-xl pl-10 pr-9 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Customer Delivery Cards List */}
            <div className="space-y-3">
              {filteredDeliveries.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-200 p-6">
                  <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">No deliveries found</p>
                  <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search terms.</p>
                </div>
              ) : (
                filteredDeliveries.map((delivery, index) => (
                  <div
                    key={delivery.id}
                    className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-3.5 transition hover:border-slate-300"
                  >
                    {/* Top Row: Customer Name, Code & Red Initials Avatar */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
                          {delivery.customer.name}
                        </h3>
                        <div className="inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200/90 mt-1">
                          CUS-{String(index + 124).padStart(5, '0')}
                        </div>
                      </div>

                      {/* Red Initials Circle Avatar */}
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#BC0118] text-white font-bold text-base flex items-center justify-center shrink-0 shadow-2xs">
                        {getInitials(delivery.customer.name)}
                      </div>
                    </div>

                    {/* Subtle Horizontal Divider */}
                    <div className="border-b border-slate-100"></div>

                    {/* Contact & Address Section */}
                    <div className="space-y-2">
                      {/* Phone */}
                      <a
                        href={`tel:${delivery.customer.phone}`}
                        className="flex items-center gap-2.5 text-slate-800 hover:text-red-600 transition-colors w-fit group"
                      >
                        <Phone className="w-4 h-4 text-slate-500 group-hover:text-red-600 transition-colors shrink-0" />
                        <span className="text-sm font-semibold tracking-wide">
                          {delivery.customer.phone}
                        </span>
                      </a>

                      {/* Address */}
                      {delivery.customer.address && (
                        <div className="flex items-start gap-2.5 text-slate-500">
                          <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                          <p className="text-sm font-normal text-slate-600 leading-snug">
                            {delivery.customer.address}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action: Delivery Button */}
                    <div className="pt-1 flex items-center justify-between">
                      {delivery.status === 'DELIVERED' ? (
                        <div className="w-full flex items-center justify-between py-2 px-3 bg-emerald-50 border border-emerald-200/80 rounded-xl text-xs text-emerald-800 font-semibold">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Delivered</span>
                          </div>
                          <span className="text-[11px] font-normal text-emerald-700">
                            Empty returned: {delivery.emptyCollected}
                          </span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleStartDelivery(delivery)}
                          className="ml-auto bg-[#F3202B] hover:bg-red-700 active:scale-95 text-white font-bold text-sm px-5 py-2.5 rounded-2xl shadow-sm flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <span>Delivery</span>
                          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Bottom App Navigation Bar (Matched exactly to Figma design) */}
        <div className="shrink-0 bg-white border-t border-slate-200/80 px-2 pt-2 pb-3 sm:pb-2 grid grid-cols-5 items-center text-xs z-20 shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
          {/* Home */}
          <button
            type="button"
            onClick={() => setActiveBottomNav('HOME')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
              activeBottomNav === 'HOME' ? 'text-[#ED222C]' : 'text-[#AFAFAF] hover:text-slate-600'
            }`}
          >
            <Home className="w-5 h-5 stroke-[2]" />
            <span className={`text-[11px] ${activeBottomNav === 'HOME' ? 'font-bold' : 'font-medium'}`}>
              Home
            </span>
          </button>

          {/* Customers */}
          <button
            type="button"
            onClick={() => {
              setActiveBottomNav('CUSTOMERS');
              const el = document.getElementById('customers-list-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
              activeBottomNav === 'CUSTOMERS' ? 'text-[#ED222C]' : 'text-[#AFAFAF] hover:text-slate-600'
            }`}
          >
            <Users className="w-5 h-5 stroke-[2]" />
            <span className={`text-[11px] ${activeBottomNav === 'CUSTOMERS' ? 'font-bold' : 'font-medium'}`}>
              Customers
            </span>
          </button>

          {/* My stocks */}
          <button
            type="button"
            onClick={() => setActiveBottomNav('STOCKS')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
              activeBottomNav === 'STOCKS' ? 'text-[#ED222C]' : 'text-[#AFAFAF] hover:text-slate-600'
            }`}
          >
            <Box className="w-5 h-5 stroke-[2]" />
            <span className={`text-[11px] ${activeBottomNav === 'STOCKS' ? 'font-bold' : 'font-medium'}`}>
              My stocks
            </span>
          </button>

          {/* Expenses */}
          <button
            type="button"
            onClick={() => setActiveBottomNav('EXPENSES')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
              activeBottomNav === 'EXPENSES' ? 'text-[#ED222C]' : 'text-[#AFAFAF] hover:text-slate-600'
            }`}
          >
            <Banknote className="w-5 h-5 stroke-[2]" />
            <span className={`text-[11px] ${activeBottomNav === 'EXPENSES' ? 'font-bold' : 'font-medium'}`}>
              Expenses
            </span>
          </button>

          {/* More */}
          <button
            type="button"
            onClick={() => setActiveBottomNav('MORE')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${
              activeBottomNav === 'MORE' ? 'text-[#ED222C]' : 'text-[#AFAFAF] hover:text-slate-600'
            }`}
          >
            <Menu className="w-5 h-5 stroke-[2]" />
            <span className={`text-[11px] ${activeBottomNav === 'MORE' ? 'font-bold' : 'font-medium'}`}>
              More
            </span>
          </button>
        </div>
      </>
    )}

    {/* Delivery Completed Success Modal */}
    {step === 'COMPLETED' && selectedDelivery && (
      <div className="fixed inset-0 sm:absolute z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 animate-in zoom-in-95 duration-200 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <h4 className="text-xl font-black text-slate-900">Delivery Completed!</h4>
            <p className="text-xs text-slate-500 mt-1">Invoice and receipt generated successfully</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 text-xs space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-slate-500">Customer:</span>
              <span className="font-bold text-slate-900">{selectedDelivery.customer.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Categories Handed:</span>
              <span className="font-bold text-slate-900">
                {selectedCategories.length > 0 ? selectedCategories.join(', ') : selectedDelivery.cylinderType}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Empties Pending / Handled:</span>
              <span className="font-bold text-emerald-600">8 Cylinders</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCloseModal}
            className="w-full py-3 bg-[#E81B24] hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-md transition cursor-pointer"
          >
            Back to Delivery List
          </button>
        </div>
      </div>
    )}

      </div>
    </div>
  );
}
