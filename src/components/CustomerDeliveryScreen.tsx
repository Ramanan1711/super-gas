'use client';

import React from 'react';
import BrandLogo from '@/components/BrandLogo';
import {
  Phone,
  MapPin,
  ChevronRight,
  ArrowLeft,
  AlertTriangle,
  Check,
  Minus,
  Plus,
} from 'lucide-react';
import type { Delivery } from './DeliveryScreen';

interface CustomerDeliveryScreenProps {
  selectedDelivery: Delivery;
  step: 'CATEGORY' | 'EMPTY_COLLECTION';
  deliveries: Delivery[];
  selectedCategories: string[];
  onToggleCategory: (category: string) => void;
  categoryQuantities: Record<string, number>;
  onUpdateCategoryQuantity: (category: string, delta: number) => void;
  emptyCollectedCounts: Record<string, number>;
  onUpdateEmptyCount: (category: string, delta: number) => void;
  onBack: () => void;
  onContinue: () => void;
  getInitials: (name: string) => string;
}

export default function CustomerDeliveryScreen({
  selectedDelivery,
  step,
  deliveries,
  selectedCategories,
  onToggleCategory,
  categoryQuantities,
  onUpdateCategoryQuantity,
  emptyCollectedCounts,
  onUpdateEmptyCount,
  onBack,
  onContinue,
  getInitials,
}: CustomerDeliveryScreenProps) {
  const customerIndex = deliveries.findIndex((d) => d.id === selectedDelivery.id);
  const customerCode = `CUS-${String(customerIndex >= 0 ? customerIndex + 124 : 124).padStart(5, '0')}`;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-3.5">
        {/* Header Card */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
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
                {customerCode}
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

        {/* STEP 1: SELECT CATEGORY */}
        {step === 'CATEGORY' && (
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
                      onClick={() => onToggleCategory(category)}
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
                            onUpdateCategoryQuantity(category, -1);
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
                            onUpdateCategoryQuantity(category, 1);
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
        )}

        {/* STEP 2: EMPTY COLLECTION & SUMMARY */}
        {step === 'EMPTY_COLLECTION' && (
          <>
            {/* Cylinder Breakdown Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-2.5">
              <h3 className="text-xs sm:text-[13px] font-black tracking-wider text-slate-900 uppercase">
                Cylinder Breakdown
              </h3>
              <div className="space-y-1.5 pt-1">
                {selectedCategories.length > 0 ? (
                  selectedCategories.map((cat) => (
                    <p key={cat} className="text-sm font-bold text-slate-900 tracking-wide">
                      {cat} X {categoryQuantities[cat] ?? 1}
                    </p>
                  ))
                ) : (
                  <>
                    <p className="text-sm font-bold text-slate-900 tracking-wide">19.5 KG X 5</p>
                    <p className="text-sm font-bold text-slate-900 tracking-wide">21.5 KG X 2</p>
                  </>
                )}
              </div>
            </div>

            {/* Empty Cylinders Collection Cards */}
            {[
              { category: '19.5 KG', defaultCount: 5 },
              { category: '21.5 KG', defaultCount: 2 },
              { category: '32.5 KG', defaultCount: 0 },
            ].map((item) => (
              <div
                key={item.category}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-[13px] font-black tracking-wider text-slate-900 uppercase">
                    Empty Cylinders
                  </h3>
                  <span className="text-xs font-bold text-slate-900">
                    {item.category}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-normal">
                  Enter the quantity collected from the customer
                </p>

                {/* Inner Card */}
                <div className="bg-[#F8FAFC] border border-slate-100 rounded-2xl p-3.5 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Collected
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                      <span>Returns</span>
                    </div>
                  </div>

                  {/* Stepper */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onUpdateEmptyCount(item.category, -1)}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200/90 shadow-2xs hover:bg-slate-50 active:scale-95 flex items-center justify-center text-slate-900 transition cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>

                    <span className="font-extrabold text-slate-900 text-lg sm:text-xl min-w-[24px] text-center">
                      {emptyCollectedCounts[item.category] ?? item.defaultCount}
                    </span>

                    <button
                      type="button"
                      onClick={() => onUpdateEmptyCount(item.category, 1)}
                      className="w-8 h-8 rounded-lg bg-[#E81B24] hover:bg-red-700 active:scale-95 shadow-xs flex items-center justify-center text-white transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 font-normal">
                  Enter the number of empty cylinders collected.
                </p>
              </div>
            ))}

            {/* Delivery Summary Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
              <h3 className="text-xs sm:text-[13px] font-black tracking-wider text-slate-600 uppercase">
                Delivery Summary
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-slate-600 font-medium">Filled Delivered</span>
                  <span className="font-bold text-slate-900 text-right">
                    10x19.5kg, 2x21.5kg,100x31.5kg
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-slate-600 font-medium">Empty Collected</span>
                  <span className="font-bold text-slate-900 text-right">
                    67x19.5kg, 2x21.5kg,0x31.5kg
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Action Area */}
      <div className="shrink-0 p-4 pt-2 pb-6 bg-slate-50 border-t border-slate-200/60">
        <button
          type="button"
          onClick={onContinue}
          disabled={step === 'CATEGORY' && selectedCategories.length === 0}
          className={`w-full py-3.5 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition active:scale-[0.99] shadow-md cursor-pointer ${
            step === 'CATEGORY' && selectedCategories.length === 0
              ? 'bg-[#D9D9D9] text-slate-600 hover:bg-[#D0D0D0]'
              : 'bg-[#E81B24] hover:bg-red-700 text-white'
          }`}
        >
          <span>Continue</span>
          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
        </button>
        <p className="text-xs text-slate-400 font-normal text-center mt-2.5">
          Invoice will be generated automatically in next step
        </p>
      </div>
    </div>
  );
}
