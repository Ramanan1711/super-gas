'use client';

import React, { useState, useMemo } from 'react';
import { Search, Phone, MapPin, ChevronRight, X, Package } from 'lucide-react';
import type { Delivery, DeliveryStats } from './DeliveryScreen';

interface CustomersTabScreenProps {
  deliveries: Delivery[];
  stats: DeliveryStats;
  onStartDelivery: (delivery: Delivery) => void;
  getInitials: (name: string) => string;
}

interface CustomerItem {
  id: string;
  code: string;
  name: string;
  phone: string;
  address: string;
  type: string;
  cylinderType: string;
  quantity: number;
  amount: number;
  matchedDelivery?: Delivery;
}

export default function CustomersTabScreen({
  deliveries,
  stats,
  onStartDelivery,
  getInitials,
}: CustomersTabScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Default mock customers matching Figma design
  const defaultCustomers: CustomerItem[] = useMemo(() => [
    {
      id: 'cus-default-1',
      code: 'CUS-00124',
      name: 'Rajesh Kumar',
      phone: '+91 98765 43210',
      address: '12, Anna Nagar, Madurai, Tamil Nadu',
      type: 'Commercial',
      cylinderType: '19kg Commercial',
      quantity: 2,
      amount: 3600,
    },
    {
      id: 'cus-default-2',
      code: 'CUS-00125',
      name: 'Mohamed Irfan',
      phone: '+91 98765 43211',
      address: '24, South Gate, Madurai, Tamil Nadu',
      type: 'Commercial',
      cylinderType: '19kg Commercial',
      quantity: 3,
      amount: 5400,
    },
    {
      id: 'cus-default-3',
      code: 'CUS-00126',
      name: 'Priya Enterprises',
      phone: '+91 98945 12345',
      address: '45, Bypass Road, Madurai, Tamil Nadu',
      type: 'Commercial',
      cylinderType: '19kg Commercial',
      quantity: 1,
      amount: 2000,
    },
    {
      id: 'cus-default-4',
      code: 'CUS-00127',
      name: 'Suresh Babu',
      phone: '+91 97876 54321',
      address: '8, Tallakulam, Madurai, Tamil Nadu',
      type: 'Commercial',
      cylinderType: '19kg Commercial',
      quantity: 2,
      amount: 4000,
    },
  ], []);

  // Merge default list with any extra customers from actual deliveries
  const allCustomers: CustomerItem[] = useMemo(() => {
    const list: CustomerItem[] = [...defaultCustomers];

    // Connect matching deliveries to default customers
    list.forEach((cust) => {
      const match = deliveries.find(
        (d) => d.customer.name.toLowerCase() === cust.name.toLowerCase()
      );
      if (match) {
        cust.matchedDelivery = match;
      }
    });

    // Add any deliveries whose customer is not in default list
    deliveries.forEach((d, idx) => {
      const alreadyInList = list.some(
        (c) => c.name.toLowerCase() === d.customer.name.toLowerCase()
      );
      if (!alreadyInList) {
        list.push({
          id: d.id,
          code: `CUS-${String(idx + 128).padStart(5, '0')}`,
          name: d.customer.name,
          phone: d.customer.phone,
          address: d.customer.address || 'Madurai, Tamil Nadu',
          type: d.customer.type || 'Commercial',
          cylinderType: d.cylinderType || '19kg Commercial',
          quantity: d.quantity || 1,
          amount: d.amount || 2000,
          matchedDelivery: d,
        });
      }
    });

    return list;
  }, [defaultCustomers, deliveries]);

  // Filter based on search query
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return allCustomers;
    const q = searchQuery.toLowerCase().trim();
    return allCustomers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q)
    );
  }, [allCustomers, searchQuery]);

  // Handle Delivery action
  const handleDeliveryClick = (cust: CustomerItem) => {
    if (cust.matchedDelivery) {
      onStartDelivery(cust.matchedDelivery);
    } else {
      const fallbackDelivery: Delivery = {
        id: cust.id,
        customerId: cust.id,
        customer: {
          id: cust.id,
          name: cust.name,
          phone: cust.phone,
          address: cust.address,
          type: cust.type,
        },
        status: 'PENDING',
        cylinderType: cust.cylinderType,
        quantity: cust.quantity,
        emptyCollected: 0,
        amount: cust.amount,
        paymentMethod: 'CASH',
        paymentStatus: 'PENDING',
        notes: null,
        deliveredAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onStartDelivery(fallbackDelivery);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight leading-tight">
          Customers
        </h1>
        <p className="text-xs sm:text-[13px] text-slate-500 font-normal mt-1">
          Select a customer to make a delivery
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white border border-slate-200/90 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-2xs focus-within:ring-2 focus-within:ring-red-500 focus-within:border-transparent transition">
        <Search className="w-5 h-5 text-slate-400 stroke-[2] shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search customer"
          className="w-full text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* MY CUSTOMERS Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3.5">
        {/* Header Row */}
        <div className="flex items-center justify-between">
          <h2 className="text-[13px] font-bold tracking-wider text-slate-800 uppercase">
            MY CUSTOMERS
          </h2>
          <div className="px-2.5 py-1 text-[11px] font-medium text-slate-500 bg-white border border-slate-200/90 rounded-lg shadow-2xs">
            On Van / Custody
          </div>
        </div>

        {/* 4 KPI Cards in 2x2 Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* TOTAL CUSTOMERS */}
          <div className="bg-white rounded-xl p-3.5 border border-slate-100 shadow-2xs">
            <span className="text-[11px] font-bold tracking-wider text-slate-900 uppercase block">
              TOTAL CUSTOMERS
            </span>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 tracking-tight">
              200
            </p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Assigned to me
            </p>
          </div>

          {/* ACTIVE CUSTOMERS */}
          <div className="bg-white rounded-xl p-3.5 border border-slate-100 shadow-2xs">
            <span className="text-[11px] font-bold tracking-wider text-slate-900 uppercase block">
              ACTIVE CUSTOMERS
            </span>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 tracking-tight">
              178
            </p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Currently active
            </p>
          </div>

          {/* OUTSTANDING */}
          <div className="bg-white rounded-xl p-3.5 border border-slate-100 shadow-2xs">
            <span className="text-[11px] font-bold tracking-wider text-slate-900 uppercase block">
              OUTSTANDING
            </span>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
              ₹ 50,000
            </p>
            <p className="text-xs text-[#DC2626] font-semibold mt-0.5">
              Customer pending dues
            </p>
          </div>

          {/* DELIVERED TODAY */}
          <div className="bg-white rounded-xl p-3.5 border border-slate-100 shadow-2xs">
            <span className="text-[11px] font-bold tracking-wider text-slate-900 uppercase block">
              DELIVERED TODAY
            </span>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 tracking-tight">
              {stats.completedDeliveries > 0 ? stats.completedDeliveries : 15}
            </p>
            <p className="text-xs text-[#16A34A] font-semibold mt-0.5">
              Completed deliveries
            </p>
          </div>
        </div>
      </div>

      {/* CUSTOMERS Section */}
      <div className="space-y-3 pt-1 pb-4">
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
          CUSTOMERS
        </h3>

        {filteredCustomers.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-200 p-6">
            <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No customers found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search query.</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredCustomers.map((cust) => (
              <div
                key={cust.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3 transition hover:border-slate-300"
              >
                {/* Top Row: Customer Name, Code & Red Initials Avatar */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="text-base font-extrabold text-slate-900 tracking-tight leading-tight truncate">
                      {cust.name}
                    </h4>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold text-slate-500 bg-white border border-slate-200/80 mt-1">
                      {cust.code}
                    </span>
                  </div>

                  {/* Red Initials Circle Avatar */}
                  <div className="w-10 h-10 rounded-full bg-[#BC0118] text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
                    {getInitials(cust.name)}
                  </div>
                </div>

                {/* Contact & Address Section */}
                <div className="space-y-1.5 pt-0.5">
                  {/* Phone */}
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0 stroke-[2]" />
                    <span className="text-xs font-medium tracking-wide">
                      {cust.phone}
                    </span>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-2 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5 stroke-[2]" />
                    <p className="text-xs font-normal text-slate-500 leading-snug">
                      {cust.address}
                    </p>
                  </div>
                </div>

                {/* Bottom Row: Red Delivery Button */}
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => handleDeliveryClick(cust)}
                    className="bg-[#E81B24] hover:bg-red-700 active:scale-95 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1 shadow-xs cursor-pointer transition"
                  >
                    <span>Delivery</span>
                    <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
