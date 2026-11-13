'use client';

import React from 'react';
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
} from 'lucide-react';
import type { Delivery, DeliveryStats } from './DeliveryScreen';

interface MainDeliveryScreenProps {
  deliveries: Delivery[];
  stats: DeliveryStats;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filledStock: number;
  emptyStock: number;
  showCylinderDetails: boolean;
  setShowCylinderDetails: React.Dispatch<React.SetStateAction<boolean>>;
  activeBottomNav: 'HOME' | 'CUSTOMERS' | 'STOCKS' | 'EXPENSES' | 'MORE';
  setActiveBottomNav: (nav: 'HOME' | 'CUSTOMERS' | 'STOCKS' | 'EXPENSES' | 'MORE') => void;
  onStartDelivery: (delivery: Delivery) => void;
  onResetAllToPending: () => void;
  isSubmitting: boolean;
  getInitials: (name: string) => string;
}

export default function MainDeliveryScreen({
  deliveries,
  stats,
  searchQuery,
  setSearchQuery,
  filledStock,
  emptyStock,
  showCylinderDetails,
  setShowCylinderDetails,
  activeBottomNav,
  setActiveBottomNav,
  onStartDelivery,
  onResetAllToPending,
  isSubmitting,
  getInitials,
}: MainDeliveryScreenProps) {
  return (
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
              <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold tracking-wider text-slate-900 uppercase">
                    FILLED
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#17A44B]"></span>
                </div>
                <p className="text-3xl font-extrabold text-slate-900 mt-2.5 tracking-tight">
                  {filledStock}
                </p>
                <p className="text-sm font-semibold text-[#17A44B] mt-1">
                  Available
                </p>
              </div>

              {/* EMPTY Card */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold tracking-wider text-[#5A6474] uppercase">
                    EMPTY
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#5A6474]"></span>
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
                onClick={() => setShowCylinderDetails((prev) => !prev)}
                className="w-full flex items-center justify-between py-2 text-left group cursor-pointer select-none"
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
                <div className="bg-slate-50/90 rounded-xl p-3 border border-slate-200/80 space-y-2 mb-2 text-xs">
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

          {/* Today's Deliveries Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-3.5">
            <h2 className="text-[13px] font-bold tracking-wider text-slate-900 uppercase">
              TODAY&apos;S DELIVERIES
            </h2>
            <div className="border-b border-slate-100"></div>
            <div className="grid grid-cols-2 gap-4 items-center pt-1">
              <div>
                <p className="text-4xl font-black text-[#17A44B] tracking-tight">
                  {stats.completedDeliveries || 8}
                </p>
                <p className="text-[11px] font-bold tracking-wider text-[#17A44B] uppercase mt-1.5">
                  COMPLETED
                </p>
              </div>
              <div>
                <p className="text-4xl font-black text-[#17A44B] tracking-tight whitespace-nowrap">
                  ₹ {(stats.totalCollected || 12000).toLocaleString('en-IN')}
                </p>
                <p className="text-[11px] font-bold tracking-wider text-[#17A44B] uppercase mt-1.5">
                  TOTAL AMOUNT
                </p>
              </div>
            </div>
          </div>

          {/* Today's Collection Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-2xs space-y-3.5">
            <h2 className="text-[13px] font-bold tracking-wider text-slate-900 uppercase">
              TODAY&apos;S COLLECTION
            </h2>
            <div className="border-b border-slate-100"></div>
            <div className="pt-1">
              <p className="text-xs font-semibold text-slate-500">Total Collected</p>
              <p className="text-4xl font-black text-slate-900 tracking-tight mt-1">
                ₹{(stats.totalCollected || 10500).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-900 shrink-0"></span>
                  <span className="text-sm font-bold text-slate-900">Cash</span>
                </div>
                <span className="text-base font-black text-slate-900">
                  ₹{(stats.cashInHand || 8000).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] shrink-0"></span>
                  <span className="text-sm font-bold text-slate-900">UPI</span>
                </div>
                <span className="text-base font-black text-slate-900">
                  ₹{(stats.onlineCollected || 2500).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Customers Section */}
        <div id="customers-list-section" className="space-y-3 pt-2">
          {/* Section Header with Reset Demo Button */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Customers</h2>
              <span className="text-xs text-slate-400 font-medium">
                ({deliveries.length})
              </span>
            </div>
            <button
              type="button"
              onClick={onResetAllToPending}
              disabled={isSubmitting}
              className="text-[11px] font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/80 px-2.5 py-1 rounded-lg border border-red-200/80 flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              title="Reset sample deliveries to Pending so you can test the delivery handover flow again"
            >
              <RefreshCw className={`w-3 h-3 ${isSubmitting ? 'animate-spin' : ''}`} />
              <span>Reset Demo to Pending</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer name, phone or address..."
              className="w-full bg-white pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200/90 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition shadow-2xs"
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
            {deliveries.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-200 p-6">
                <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">No deliveries found</p>
                <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              deliveries.map((delivery, index) => (
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
                  <div className="pt-1 flex items-center justify-between gap-2">
                    {delivery.status === 'DELIVERED' ? (
                      <>
                        <div className="flex-1 flex items-center justify-between py-2 px-3 bg-emerald-50 border border-emerald-200/80 rounded-xl text-xs text-emerald-800 font-semibold">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Delivered</span>
                          </div>
                          <span className="text-[11px] font-normal text-emerald-700">
                            Empty: {delivery.emptyCollected}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onStartDelivery(delivery)}
                          className="bg-[#F3202B] hover:bg-red-700 active:scale-95 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-sm flex items-center gap-1 transition cursor-pointer shrink-0"
                          title="Open delivery handover flow for this customer"
                        >
                          <span>Delivery</span>
                          <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onStartDelivery(delivery)}
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
  );
}
