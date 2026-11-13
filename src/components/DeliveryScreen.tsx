'use client';

import React, { useState, useMemo } from 'react';
import { CheckCircle2 } from 'lucide-react';
import MainDeliveryScreen from './MainDeliveryScreen';
import CustomerDeliveryScreen from './CustomerDeliveryScreen';
import InvoiceScreen from './InvoiceScreen';

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
  createdAt: string;
  updatedAt: string;
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

export function getInitials(name: string): string {
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
  const [step, setStep] = useState<'CATEGORY' | 'EMPTY_COLLECTION' | 'INVOICE' | 'COMPLETED'>('CATEGORY');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoryQuantities, setCategoryQuantities] = useState<Record<string, number>>({
    '5 KG': 1,
    '21 KG': 1,
    '33 KG': 1,
  });
  const [emptyCollectedCounts, setEmptyCollectedCounts] = useState<Record<string, number>>({
    '19.5 KG': 0,
    '21.5 KG': 0,
    '32.5 KG': 0,
  });
  const [deliveredQuantity, setDeliveredQuantity] = useState(1);
  const [emptyCount, setEmptyCount] = useState(8);
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'UPI'>('CASH');
  const [gstRequired, setGstRequired] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeBottomNav, setActiveBottomNav] = useState<'HOME' | 'CUSTOMERS' | 'STOCKS' | 'EXPENSES' | 'MORE'>('HOME');

  // Cylinder custody stock on van (matching Figma design)
  const [filledStock, setFilledStock] = useState(10);
  const [emptyStock, setEmptyStock] = useState(15);
  const [showCylinderDetails, setShowCylinderDetails] = useState(false);

  // Filtered deliveries based on search query
  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((item) => {
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
      [category]: prev[category] ?? 1,
    }));
  };

  // Update category quantity
  const updateCategoryQuantity = (category: string, delta: number) => {
    setCategoryQuantities((prev) => ({
      ...prev,
      [category]: Math.max(1, (prev[category] ?? 1) + delta),
    }));
  };

  // Update empty cylinder count
  const updateEmptyCount = (category: string, delta: number) => {
    setEmptyCollectedCounts((prev) => ({
      ...prev,
      [category]: Math.max(0, (prev[category] ?? 0) + delta),
    }));
  };

  // Handle open delivery flow
  const handleStartDelivery = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setSelectedCategories([]);
    setCategoryQuantities({
      '5 KG': 1,
      '21 KG': 1,
      '33 KG': 1,
    });
    setEmptyCollectedCounts({
      '19.5 KG': 0,
      '21.5 KG': 0,
      '32.5 KG': 0,
    });
    setDeliveredQuantity(delivery.quantity);
    setEmptyCount(delivery.emptyCollected || 8);
    setPaymentMode(delivery.paymentMethod === 'UPI' ? 'UPI' : 'CASH');
    setGstRequired(false);
    setStep('CATEGORY');
  };

  // Close modal
  const handleCloseModal = () => {
    setSelectedDelivery(null);
    setSelectedCategories([]);
    setStep('CATEGORY');
  };

  // Reset deliveries for testing demo
  const handleResetAllToPending = async () => {
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/deliveries/reset', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setDeliveries(data.deliveries);
        setStats(data.stats);
        setFilledStock(10);
        setEmptyStock(15);
      } else {
        setDeliveries((prev) =>
          prev.map((d, i) => ({
            ...d,
            status: i < 5 ? 'PENDING' : 'DELIVERED',
            emptyCollected: i < 5 ? 0 : (d.emptyCollected || 1),
            paymentStatus: i < 5 ? 'PENDING' : 'PAID',
          }))
        );
      }
    } catch {
      setDeliveries((prev) =>
        prev.map((d, i) => ({
          ...d,
          status: i < 5 ? 'PENDING' : 'DELIVERED',
          emptyCollected: i < 5 ? 0 : (d.emptyCollected || 1),
          paymentStatus: i < 5 ? 'PENDING' : 'PAID',
        }))
      );
    } finally {
      setIsSubmitting(false);
    }
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
      const totalEmptyCollected = Object.values(emptyCollectedCounts).reduce((a, b) => a + b, 0);
      const finalEmptyCount = totalEmptyCollected > 0 ? totalEmptyCollected : emptyCount;

      const res = await fetch(`/api/deliveries/${selectedDelivery.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'DELIVERED',
          emptyCollected: finalEmptyCount,
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
            emptyCylindersCollected: prev.emptyCylindersCollected + finalEmptyCount,
            totalCollected: prev.totalCollected + selectedDelivery.amount,
            cashInHand: isCash ? prev.cashInHand + selectedDelivery.amount : prev.cashInHand,
            onlineCollected: !isCash ? prev.onlineCollected + selectedDelivery.amount : prev.onlineCollected,
          };
        });

        // Update custody stock
        setFilledStock((prev) => Math.max(0, prev - totalDelivered));
        setEmptyStock((prev) => prev + finalEmptyCount);

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

        {/* 1. Customer Delivery Screen (Category & Empty Collection Handover) */}
        {selectedDelivery && (step === 'CATEGORY' || step === 'EMPTY_COLLECTION') ? (
          <CustomerDeliveryScreen
            selectedDelivery={selectedDelivery}
            step={step}
            deliveries={deliveries}
            selectedCategories={selectedCategories}
            onToggleCategory={toggleCategory}
            categoryQuantities={categoryQuantities}
            onUpdateCategoryQuantity={updateCategoryQuantity}
            emptyCollectedCounts={emptyCollectedCounts}
            onUpdateEmptyCount={updateEmptyCount}
            onBack={() => {
              if (step === 'EMPTY_COLLECTION') {
                setStep('CATEGORY');
              } else {
                handleCloseModal();
              }
            }}
            onContinue={() => {
              if (step === 'CATEGORY') {
                setStep('EMPTY_COLLECTION');
              } else {
                setStep('INVOICE');
              }
            }}
            getInitials={getInitials}
          />
        ) : selectedDelivery && step === 'INVOICE' ? (
          /* 2. Invoice Screen */
          <InvoiceScreen
            selectedDelivery={selectedDelivery}
            deliveries={deliveries}
            gstRequired={gstRequired}
            onToggleGst={() => setGstRequired((prev) => !prev)}
            onBack={() => setStep('EMPTY_COLLECTION')}
            onContinueToPayment={handleConfirmDelivery}
            isSubmitting={isSubmitting}
            getInitials={getInitials}
          />
        ) : (
          /* 3. Main Delivery Screen (Dashboard) */
          <MainDeliveryScreen
            deliveries={filteredDeliveries}
            stats={stats}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filledStock={filledStock}
            emptyStock={emptyStock}
            showCylinderDetails={showCylinderDetails}
            setShowCylinderDetails={setShowCylinderDetails}
            activeBottomNav={activeBottomNav}
            setActiveBottomNav={setActiveBottomNav}
            onStartDelivery={handleStartDelivery}
            onResetAllToPending={handleResetAllToPending}
            isSubmitting={isSubmitting}
            getInitials={getInitials}
          />
        )}

        {/* 4. Delivery Completed Success Modal */}
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
                    {selectedCategories.length > 0
                      ? selectedCategories.map((c) => `${categoryQuantities[c] ?? (c === '5 KG' ? 10 : 1)}x ${c}`).join(', ')
                      : selectedDelivery.cylinderType}
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
