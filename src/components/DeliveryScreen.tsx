'use client';

import React, { useState, useMemo } from 'react';
import MainDeliveryScreen from './MainDeliveryScreen';
import CustomerDeliveryScreen from './CustomerDeliveryScreen';
import InvoiceScreen from './InvoiceScreen';
import PaymentScreen from './PaymentScreen';
import PaymentAllocationScreen from './PaymentAllocationScreen';
import ConfirmDeliveryScreen from './ConfirmDeliveryScreen';
import DeliveryCompletedModal from './DeliveryCompletedModal';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string | null;
  type: string;
  customerCode?: string;
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
  sequence?: number;
  taskStatus?: string;
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

const defaultStats: DeliveryStats = {
  totalDeliveries: 0,
  completedDeliveries: 0,
  pendingDeliveries: 0,
  cancelledDeliveries: 0,
  emptyCylindersCollected: 0,
  totalCollected: 0,
  cashInHand: 0,
  onlineCollected: 0,
};

interface DeliveryScreenProps {
  initialStats?: DeliveryStats;
  initialDeliveries?: Delivery[];
  initialBottomNav?: 'HOME' | 'CUSTOMERS' | 'STOCKS' | 'EXPENSES' | 'MORE';
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function DeliveryScreen({
  initialStats = defaultStats,
  initialDeliveries = [],
  initialBottomNav = 'HOME',
}: DeliveryScreenProps) {
  const [stats, setStats] = useState<DeliveryStats>(initialStats);
  const [deliveries, setDeliveries] = useState<Delivery[]>(initialDeliveries);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Delivery Flow State
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [step, setStep] = useState<'CATEGORY' | 'EMPTY_COLLECTION' | 'INVOICE' | 'PAYMENT' | 'PAYMENT_ALLOCATION' | 'CONFIRM_DELIVERY' | 'COMPLETED'>('CATEGORY');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoryQuantities, setCategoryQuantities] = useState<Record<string, number>>({
    '5 KG': 1,
    '21 KG': 1,
    '33 KG': 1,
  });
  const [emptyCollectedCounts, setEmptyCollectedCounts] = useState<Record<string, number>>({
    '5 KG': 0,
    '21 KG': 0,
    '33 KG': 0,
  });
  const [deliveredQuantity, setDeliveredQuantity] = useState(1);
  const [emptyCount, setEmptyCount] = useState(0);
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'UPI'>('CASH');
  const [collectedAmount, setCollectedAmount] = useState<number>(0);
  const [outstandingBalance, setOutstandingBalance] = useState<number>(0);
  const [gstRequired, setGstRequired] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeBottomNav, setActiveBottomNav] = useState<'HOME' | 'CUSTOMERS' | 'STOCKS' | 'EXPENSES' | 'MORE'>(initialBottomNav);

  // Cylinder custody stock on van (matching live DB)
  const [filledStock, setFilledStock] = useState(0);
  const [emptyStock, setEmptyStock] = useState(0);
  const [showCylinderDetails, setShowCylinderDetails] = useState(false);

  // Fetch live delivery tasks & stock on mount
  React.useEffect(() => {
    let ignore = false;
    async function loadTasks() {
      try {
        const res = await fetch('/api/deliveries');
        if (res.ok) {
          const data = await res.json();
          if (!ignore && data.deliveries && Array.isArray(data.deliveries)) {
            setDeliveries(data.deliveries);
            if (data.stats) {
              setStats(data.stats);
            }
          }
        }

        const invRes = await fetch('/api/inventory/vehicle?regNumber=TN%2058%20AX%204821');
        if (invRes.ok) {
          const invData = await invRes.json();
          if (!ignore && invData.success && invData.data?.summary) {
            setFilledStock(invData.data.summary.totalFilled);
            setEmptyStock(invData.data.summary.totalEmpty);
          }
        }
      } catch (err) {
        console.warn('Could not load deliveries from DB:', err);
      }
    }
    loadTasks();
    return () => {
      ignore = true;
    };
  }, []);

  // Filtered deliveries based on search query, ordered by stop sequence
  const filteredDeliveries = useMemo(() => {
    return deliveries
      .filter((item) => {
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const nameMatch = item.customer.name.toLowerCase().includes(query);
          const phoneMatch = item.customer.phone.toLowerCase().includes(query);
          const addressMatch = (item.customer.address || '').toLowerCase().includes(query);
          const cylinderMatch = item.cylinderType.toLowerCase().includes(query);
          return nameMatch || phoneMatch || addressMatch || cylinderMatch;
        }
        return true;
      })
      .sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
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
      '5 KG': 0,
      '21 KG': 0,
      '33 KG': 0,
    });
    setDeliveredQuantity(delivery.quantity);
    const isFirstTime =
      delivery.customer.type === 'Domestic' ||
      delivery.notes?.toLowerCase().includes('first') ||
      delivery.customer.name.toLowerCase().includes('priya');
    const initialEmpty = isFirstTime ? 0 : (delivery.emptyCollected || delivery.quantity || 1);
    setEmptyCount(initialEmpty);
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

  // Dynamic current invoice total
  const currentInvoiceTotal = useMemo(() => {
    const CYLINDER_PRICES: Record<string, number> = {
      '5 KG': 400,
      '21 KG': 2000,
      '33 KG': 4500,
    };
    const sub = selectedCategories.length > 0
      ? selectedCategories.reduce(
          (sum, cat) => sum + (categoryQuantities[cat] ?? 1) * (CYLINDER_PRICES[cat] ?? 2000),
          0
        )
      : (CYLINDER_PRICES['21 KG'] ?? 2000);
    return gstRequired ? Math.round(sub * 1.05) : sub;
  }, [selectedCategories, categoryQuantities, gstRequired]);

  // Complete delivery submission
  const handleConfirmDelivery = async (methodOverride?: 'CASH' | 'UPI', amountOverride?: number) => {
    if (!selectedDelivery) return;
    setIsSubmitting(true);
    const chosenMethod = methodOverride || paymentMode;
    const finalAmount = amountOverride !== undefined ? amountOverride : currentInvoiceTotal;
    try {
      const categoryStr = selectedCategories.length > 0
        ? selectedCategories.map((c) => `${categoryQuantities[c] ?? 1}x ${c}`).join(', ')
        : selectedDelivery.cylinderType;
      const totalDelivered = selectedCategories.length > 0
        ? selectedCategories.reduce((sum, c) => sum + (categoryQuantities[c] ?? 1), 0)
        : deliveredQuantity;
      const totalEmptyCollected = Object.values(emptyCollectedCounts).reduce((a, b) => a + b, 0);
      const finalEmptyCount = totalEmptyCollected > 0 ? totalEmptyCollected : emptyCount;

      const itemsPayload = selectedCategories.length > 0
        ? selectedCategories.map((c) => ({
            category: c,
            productCode: c.includes('47') ? '47.5KG_IND' : c.includes('25') ? '25KG_COM' : '19KG_COMM',
            filledDelivered: categoryQuantities[c] ?? 1,
            emptyCollected: emptyCollectedCounts[c] ?? 0,
            unitPrice: Math.round(finalAmount / (totalDelivered || 1)),
          }))
        : [
            {
              productCode: '19KG_COMM',
              filledDelivered: totalDelivered || 1,
              emptyCollected: finalEmptyCount,
              unitPrice: finalAmount,
            },
          ];

      const res = await fetch(`/api/deliveries/${selectedDelivery.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountCollected: finalAmount,
          emptyCollected: finalEmptyCount,
          quantity: totalDelivered,
          paymentMethod: chosenMethod === 'UPI' ? 'UPI_QR' : chosenMethod,
          notes: `Customer delivery - ${categoryStr}`,
          items: itemsPayload,
        }),
      });

      if (res.ok) {
        // Update local state
        setDeliveries((prev) =>
          prev.map((d) =>
            d.id === selectedDelivery.id
              ? {
                  ...d,
                  status: 'DELIVERED',
                  emptyCollected: finalEmptyCount,
                  cylinderType: categoryStr,
                  amount: finalAmount,
                  paymentMethod: chosenMethod,
                  paymentStatus: 'PAID',
                  deliveredAt: new Date().toISOString(),
                }
              : d
          )
        );

        // Update stats
        setStats((prev) => {
          const isCash = chosenMethod === 'CASH';
          return {
            ...prev,
            completedDeliveries: prev.completedDeliveries + 1,
            pendingDeliveries: Math.max(0, prev.pendingDeliveries - 1),
            emptyCylindersCollected: prev.emptyCylindersCollected + finalEmptyCount,
            totalCollected: prev.totalCollected + finalAmount,
            cashInHand: isCash ? prev.cashInHand + finalAmount : prev.cashInHand,
            onlineCollected: !isCash ? prev.onlineCollected + finalAmount : prev.onlineCollected,
          };
        });

        // Update custody stock
        setFilledStock((prev) => Math.max(0, prev - totalDelivered));
        setEmptyStock((prev) => prev + finalEmptyCount);

        setStep('COMPLETED');
      } else {
        const errorData = await res.json().catch(() => null);
        alert(errorData?.error?.message || 'Failed to complete delivery. Please try again.');
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
            selectedCategories={selectedCategories}
            categoryQuantities={categoryQuantities}
            emptyCollectedCounts={emptyCollectedCounts}
            gstRequired={gstRequired}
            onToggleGst={() => setGstRequired((prev) => !prev)}
            onBack={() => setStep('EMPTY_COLLECTION')}
            onContinueToPayment={() => setStep('PAYMENT')}
            isSubmitting={isSubmitting}
            getInitials={getInitials}
          />
        ) : selectedDelivery && step === 'PAYMENT' ? (
          /* 3. Payment Screen */
          <PaymentScreen
            selectedDelivery={selectedDelivery}
            deliveries={deliveries}
            currentInvoiceAmount={currentInvoiceTotal}
            onBack={() => setStep('INVOICE')}
            onContinueToAllocation={(paymentMethod, amountCollected) => {
              setPaymentMode(paymentMethod);
              setCollectedAmount(amountCollected);
              setStep('PAYMENT_ALLOCATION');
            }}
            isSubmitting={isSubmitting}
            getInitials={getInitials}
          />
        ) : selectedDelivery && step === 'PAYMENT_ALLOCATION' ? (
          /* 3.5. Payment Allocation Screen (Automated FIFO settlement) */
          <PaymentAllocationScreen
            selectedDelivery={selectedDelivery}
            deliveries={deliveries}
            currentInvoiceAmount={currentInvoiceTotal}
            amountReceived={collectedAmount}
            paymentMethod={paymentMode}
            onBack={() => setStep('PAYMENT')}
            onContinueToConfirmation={(uncollected) => {
              setOutstandingBalance(uncollected);
              setStep('CONFIRM_DELIVERY');
            }}
            isSubmitting={isSubmitting}
            getInitials={getInitials}
          />
        ) : selectedDelivery && step === 'CONFIRM_DELIVERY' ? (
          /* 3.6. Confirm Delivery Screen (Final transaction review & sign-off) */
          <ConfirmDeliveryScreen
            selectedDelivery={selectedDelivery}
            deliveries={deliveries}
            selectedCategories={selectedCategories}
            categoryQuantities={categoryQuantities}
            emptyCollectedCounts={emptyCollectedCounts}
            deliveredQuantity={deliveredQuantity}
            currentInvoiceAmount={currentInvoiceTotal}
            amountReceived={collectedAmount}
            paymentMethod={paymentMode}
            totalOutstandingBalance={outstandingBalance}
            vanEmptyCollected={stats.emptyCylindersCollected + Object.values(emptyCollectedCounts).reduce((a, b) => a + b, 0)}
            onBack={() => setStep('PAYMENT_ALLOCATION')}
            onConfirmDelivery={() => {
              handleConfirmDelivery(paymentMode, collectedAmount);
            }}
            isSubmitting={isSubmitting}
            getInitials={getInitials}
          />
        ) : (
          /* 4. Main Delivery Screen (Dashboard) */
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
          <DeliveryCompletedModal
            selectedDelivery={selectedDelivery}
            deliveries={deliveries}
            selectedCategories={selectedCategories}
            categoryQuantities={categoryQuantities}
            emptyCollectedCounts={emptyCollectedCounts}
            deliveredQuantity={deliveredQuantity}
            amountReceived={collectedAmount}
            outstandingBalance={outstandingBalance}
            onShareAndReturn={handleCloseModal}
            onViewReceipt={() => setStep('INVOICE')}
          />
        )}

      </div>
    </div>
  );
}
