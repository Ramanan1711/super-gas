'use client';

import React, { useState, useMemo } from 'react';
import BrandLogo from '@/components/BrandLogo';
import {
  Phone,
  MapPin,
  Search,
  CheckCircle2,
  Clock,
  Package,
  ArrowRight,
  TrendingUp,
  X,
  CreditCard,
  IndianRupee,
  Fuel,
  RefreshCw,
  User,
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

export default function DeliveryScreen({
  initialStats,
  initialDeliveries,
}: DeliveryScreenProps) {
  const [stats, setStats] = useState<DeliveryStats>(initialStats);
  const [deliveries, setDeliveries] = useState<Delivery[]>(initialDeliveries);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'DELIVERED' | 'CANCELLED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Delivery Flow Modal State
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [step, setStep] = useState<'DETAILS' | 'CYLINDERS' | 'PAYMENT' | 'COMPLETED'>('DETAILS');
  const [deliveredQuantity, setDeliveredQuantity] = useState(1);
  const [emptyCount, setEmptyCount] = useState(1);
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'UPI'>('CASH');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeBottomNav, setActiveBottomNav] = useState<'DELIVERY' | 'HISTORY' | 'EARNINGS' | 'PROFILE'>('DELIVERY');

  // Filtered deliveries based on active tab and search query
  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((item) => {
      // Tab filter
      if (activeTab === 'PENDING' && item.status !== 'PENDING') return false;
      if (activeTab === 'DELIVERED' && item.status !== 'DELIVERED') return false;
      if (activeTab === 'CANCELLED' && item.status !== 'CANCELLED') return false;

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
  }, [deliveries, activeTab, searchQuery]);

  // Handle open delivery flow
  const handleStartDelivery = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setDeliveredQuantity(delivery.quantity);
    setEmptyCount(delivery.quantity);
    setPaymentMode(delivery.paymentMethod === 'UPI' ? 'UPI' : 'CASH');
    setStep('DETAILS');
  };

  // Close modal
  const handleCloseModal = () => {
    setSelectedDelivery(null);
    setStep('DETAILS');
  };

  // Complete delivery submission
  const handleConfirmDelivery = async () => {
    if (!selectedDelivery) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/deliveries/${selectedDelivery.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'DELIVERED',
          emptyCollected: emptyCount,
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
    <div className="min-h-screen bg-slate-100 flex justify-center py-0 sm:py-6 text-slate-900 font-sans">
      {/* Mobile Frame Container */}
      <div className="w-full sm:max-w-[430px] bg-slate-50 min-h-screen sm:min-h-[880px] sm:rounded-[36px] sm:shadow-2xl flex flex-col relative overflow-hidden border border-slate-200/80">
        
        {/* Mobile Device Status Bar */}
        <div className="px-6 pt-3 pb-2 flex justify-between items-center text-xs font-semibold text-slate-800 bg-white">
          <span>9:41</span>
          <div className="w-20 h-4 bg-slate-900 rounded-full mx-auto hidden sm:block"></div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold">5G</span>
            <div className="w-4 h-2.5 border border-slate-800 rounded-sm p-0.5 flex items-center">
              <div className="h-full w-full bg-slate-800 rounded-[1px]"></div>
            </div>
          </div>
        </div>

        {/* Top Header */}
        <div className="bg-white px-5 pt-2 pb-3.5 border-b border-slate-100">
          {/* Top Brand Bar */}
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center">
              <BrandLogo className="h-8 w-auto object-contain" />
            </div>
            {/* Active / Duty Status Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Active</span>
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Delivery</h1>
            <p className="text-xs text-slate-500 font-medium">Track and Manage Deliveries</p>
          </div>
        </div>

        {/* Scrollable Screen Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-24">
          
          {/* KPI Statistics Section */}
          <div className="space-y-3">
            {/* Counter Row 1 */}
            <div className="grid grid-cols-2 gap-3">
              {/* Completed Card */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black text-slate-900">{stats.completedDeliveries}</span>
                  <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xs font-medium text-slate-500 mt-1">Completed</p>
              </div>

              {/* Total Orders Card */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black text-slate-900">{stats.totalDeliveries}</span>
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                    <Package className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xs font-medium text-slate-500 mt-1">Overall</p>
              </div>
            </div>

            {/* Counter Row 2: Empty Cylinders & Total Collection */}
            <div className="grid grid-cols-2 gap-3">
              {/* Empty Cylinders Card */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-emerald-600">{stats.emptyCylindersCollected}</span>
                  <Fuel className="w-4 h-4 text-emerald-600 ml-auto" />
                </div>
                <p className="text-xs font-medium text-slate-500 mt-1">Empty Collected</p>
              </div>

              {/* Total Revenue Card */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-black text-emerald-600">
                    ₹ {stats.totalCollected.toLocaleString('en-IN')}
                  </span>
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-xs font-medium text-slate-500 mt-1">Total Collected</p>
              </div>
            </div>

            {/* Cash In Hand Card Banner */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/70 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-2xl font-black text-slate-900">
                  ₹ {stats.cashInHand.toLocaleString('en-IN')}
                </p>
                <p className="text-xs font-medium text-slate-500">Cash In Hand</p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                  Online: ₹ {stats.onlineCollected.toLocaleString('en-IN')}
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">UPI / Cards</p>
              </div>
            </div>
          </div>

          {/* Segmented Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`flex-1 py-2 rounded-lg transition text-center ${
                activeTab === 'ALL'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({deliveries.length})
            </button>
            <button
              onClick={() => setActiveTab('PENDING')}
              className={`flex-1 py-2 rounded-lg transition text-center ${
                activeTab === 'PENDING'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending ({stats.pendingDeliveries})
            </button>
            <button
              onClick={() => setActiveTab('DELIVERED')}
              className={`flex-1 py-2 rounded-lg transition text-center ${
                activeTab === 'DELIVERED'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Delivered ({stats.completedDeliveries})
            </button>
          </div>

          {/* Customers Section */}
          <div className="space-y-3">
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
                filteredDeliveries.map((delivery) => (
                  <div
                    key={delivery.id}
                    className="bg-white rounded-2xl p-4 border border-slate-200/70 shadow-sm space-y-3 relative overflow-hidden transition hover:border-slate-300"
                  >
                    {/* Top row: Customer Name & Call Button */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900">{delivery.customer.name}</h3>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            delivery.customer.type === 'Commercial'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}>
                            {delivery.customer.type}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">{delivery.customer.phone}</p>
                      </div>

                      {/* Red Circular Call Button */}
                      <a
                        href={`tel:${delivery.customer.phone}`}
                        className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 active:scale-90 transition flex items-center justify-center text-white shadow-sm flex-shrink-0"
                        title="Call Customer"
                      >
                        <Phone className="w-4 h-4 fill-white" />
                      </a>
                    </div>

                    {/* Address Line with MapPin */}
                    <div className="flex items-start gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                      <p className="line-clamp-2 leading-relaxed">{delivery.customer.address || 'Address not specified'}</p>
                    </div>

                    {/* Order Details & Pricing Pill */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-800">
                          {delivery.quantity}x {delivery.cylinderType}
                        </span>
                      </div>
                      <span className="font-bold text-slate-900">
                        ₹ {delivery.amount.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Action Button */}
                    {delivery.status === 'PENDING' ? (
                      <button
                        onClick={() => handleStartDelivery(delivery)}
                        className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 active:scale-[0.98] transition text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm"
                      >
                        <span>Deliver</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <div className="w-full py-2 px-3 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-center justify-between text-xs text-emerald-800 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Delivered</span>
                        </div>
                        <span className="text-[11px] font-normal text-emerald-700">
                          Empty returned: {delivery.emptyCollected}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Bottom App Navigation Bar */}
        <div className="bg-white border-t border-slate-200/80 px-6 py-2.5 flex justify-between items-center text-xs font-semibold text-slate-500 absolute bottom-0 left-0 right-0 z-20">
          <button
            onClick={() => setActiveBottomNav('DELIVERY')}
            className={`flex flex-col items-center gap-1 ${
              activeBottomNav === 'DELIVERY' ? 'text-red-600' : 'hover:text-slate-900'
            }`}
          >
            <Package className="w-5 h-5" />
            <span className="text-[10px]">Delivery</span>
          </button>
          <button
            onClick={() => setActiveBottomNav('HISTORY')}
            className={`flex flex-col items-center gap-1 ${
              activeBottomNav === 'HISTORY' ? 'text-red-600' : 'hover:text-slate-900'
            }`}
          >
            <Clock className="w-5 h-5" />
            <span className="text-[10px]">History</span>
          </button>
          <button
            onClick={() => setActiveBottomNav('EARNINGS')}
            className={`flex flex-col items-center gap-1 ${
              activeBottomNav === 'EARNINGS' ? 'text-red-600' : 'hover:text-slate-900'
            }`}
          >
            <IndianRupee className="w-5 h-5" />
            <span className="text-[10px]">Earnings</span>
          </button>
          <button
            onClick={() => setActiveBottomNav('PROFILE')}
            className={`flex flex-col items-center gap-1 ${
              activeBottomNav === 'PROFILE' ? 'text-red-600' : 'hover:text-slate-900'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px]">Profile</span>
          </button>
        </div>

        {/* INTERACTIVE DELIVERY MODAL / SHEET */}
        {selectedDelivery && (
          <div className="fixed inset-0 sm:absolute z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end">
            <div className="bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto p-5 space-y-4 animate-in slide-in-from-bottom duration-200">
              
              {/* Modal Drag Handle & Close */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2.5"></div>
                <h3 className="text-base font-black text-slate-900">
                  {step === 'COMPLETED' ? 'Delivery Success' : 'Order Delivery'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {step === 'DETAILS' && (
                <div className="space-y-4">
                  {/* Customer Card Summary */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{selectedDelivery.customer.name}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                        {selectedDelivery.customer.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" />
                      {selectedDelivery.customer.phone}
                    </p>
                    <p className="text-xs text-slate-500 flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                      {selectedDelivery.customer.address}
                    </p>
                  </div>

                  {/* Quantity & Empty Cylinder Stepper */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                      <div>
                        <p className="text-xs font-bold text-slate-900">Delivering {selectedDelivery.cylinderType}</p>
                        <p className="text-[11px] text-slate-500">Cylinders to unload</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setDeliveredQuantity((q) => Math.max(1, q - 1))}
                          className="w-7 h-7 rounded-lg bg-white border border-slate-200 font-bold text-sm shadow-xs active:scale-95"
                        >
                          -
                        </button>
                        <span className="font-bold text-sm text-slate-900">{deliveredQuantity}</span>
                        <button
                          onClick={() => setDeliveredQuantity((q) => q + 1)}
                          className="w-7 h-7 rounded-lg bg-white border border-slate-200 font-bold text-sm shadow-xs active:scale-95"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                      <div>
                        <p className="text-xs font-bold text-slate-900">Empty Cylinders Collected</p>
                        <p className="text-[11px] text-slate-500">Return empties</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setEmptyCount((e) => Math.max(0, e - 1))}
                          className="w-7 h-7 rounded-lg bg-white border border-slate-200 font-bold text-sm shadow-xs active:scale-95"
                        >
                          -
                        </button>
                        <span className="font-bold text-sm text-slate-900">{emptyCount}</span>
                        <button
                          onClick={() => setEmptyCount((e) => e + 1)}
                          className="w-7 h-7 rounded-lg bg-white border border-slate-200 font-bold text-sm shadow-xs active:scale-95"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Payment Mode Selection */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-900">Payment Collection Mode</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setPaymentMode('CASH')}
                        className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                          paymentMode === 'CASH'
                            ? 'border-red-600 bg-red-50 text-red-700'
                            : 'border-slate-200 bg-white text-slate-700'
                        }`}
                      >
                        <IndianRupee className="w-4 h-4" />
                        <span>Cash On Delivery</span>
                      </button>
                      <button
                        onClick={() => setPaymentMode('UPI')}
                        className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                          paymentMode === 'UPI'
                            ? 'border-red-600 bg-red-50 text-red-700'
                            : 'border-slate-200 bg-white text-slate-700'
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>UPI / QR Code</span>
                      </button>
                    </div>
                  </div>

                  {/* Total Payable */}
                  <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Payable</p>
                      <p className="text-xs text-slate-300">Inclusive of GST</p>
                    </div>
                    <span className="text-xl font-black text-white">
                      ₹ {selectedDelivery.amount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleConfirmDelivery}
                    disabled={isSubmitting}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 active:scale-[0.98] transition text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Confirm & Complete Delivery</span>
                        <CheckCircle2 className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* SUCCESS MODAL (Figma Screen 11) */}
              {step === 'COMPLETED' && (
                <div className="py-4 text-center space-y-4 animate-in zoom-in-95 duration-200">
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
                      <span className="text-slate-500">Delivered:</span>
                      <span className="font-bold text-slate-900">{deliveredQuantity}x {selectedDelivery.cylinderType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Empties Collected:</span>
                      <span className="font-bold text-emerald-600">{emptyCount} Cylinders</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-2 font-bold">
                      <span className="text-slate-700">Amount Collected ({paymentMode}):</span>
                      <span className="text-slate-900">₹ {selectedDelivery.amount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCloseModal}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-md transition"
                  >
                    Back to Delivery List
                  </button>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
