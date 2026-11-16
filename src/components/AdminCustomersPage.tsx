'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import AdminSidebar from './AdminSidebar';
import {
  Users,
  Search,
  Bell,
  ChevronDown,
  Download,
  Plus,
  Phone,
  MapPin,
  AlertTriangle,
  RotateCcw,
  FileText,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  X,
  Check,
} from 'lucide-react';

interface CustomerRecord {
  id: string;
  name: string;
  code: string;
  badge?: string;
  badgeType?: 'B2B' | 'COMMERCIAL';
  phone: string;
  address: string;
  deliveryPartner: {
    name: string;
    code: string;
    isUnassigned?: boolean;
  };
  balance: number;
  balanceText: string;
  balanceSubtext?: string;
  isSettled?: boolean;
  isOverdue?: boolean;
  statusDot: 'green' | 'grey';
}

// Exact mock dataset from the attached design
const initialCustomers: CustomerRecord[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    code: 'CUS-00124',
    phone: '+91 98765 43210',
    address: 'Anna Nagar, Madurai',
    deliveryPartner: {
      name: 'Rajesh',
      code: 'DP- 001',
    },
    balance: 700,
    balanceText: '₹700',
    balanceSubtext: '1 invoice due',
    isSettled: false,
    statusDot: 'green',
  },
  {
    id: '2',
    name: 'Mohamed Irfan',
    code: 'CUS-00125',
    phone: '+91 98421 56789',
    address: 'KK Nagar, Madurai',
    deliveryPartner: {
      name: 'Mohamed Irfan',
      code: 'DP-002',
    },
    balance: 0,
    balanceText: 'Settled (₹0)',
    isSettled: true,
    statusDot: 'green',
  },
  {
    id: '3',
    name: 'Priya Enterprises',
    code: 'CUS-00126',
    badge: 'B2B',
    badgeType: 'B2B',
    phone: '+91 98945 12345',
    address: 'Bypass Road, Madurai',
    deliveryPartner: {
      name: 'Unassigned - Action Required',
      code: '',
      isUnassigned: true,
    },
    balance: 1500,
    balanceText: '₹1,500',
    balanceSubtext: 'Overdue 4 days',
    isOverdue: true,
    statusDot: 'green',
  },
  {
    id: '4',
    name: 'Suresh Babu',
    code: 'CUS-00127',
    phone: '+91 97876 54321',
    address: 'Tallakulam, Madurai',
    deliveryPartner: {
      name: 'Suresh',
      code: 'DP- 003',
    },
    balance: 0,
    balanceText: '₹0',
    balanceSubtext: 'Settled',
    isSettled: true,
    statusDot: 'grey',
  },
  {
    id: '5',
    name: 'Sri Krishna Sweets',
    code: 'CUS-00128',
    badge: 'COMMERCIAL',
    badgeType: 'COMMERCIAL',
    phone: '+91 98402 33441',
    address: 'West Veli Street, Madurai',
    deliveryPartner: {
      name: 'Rajesh',
      code: 'DP- 001',
    },
    balance: 3700,
    balanceText: '₹3,700',
    balanceSubtext: '2 invoices pending',
    isSettled: false,
    statusDot: 'green',
  },
  {
    id: '6',
    name: 'Hotel Annapoorna',
    code: 'CUS-00129',
    badge: 'COMMERCIAL',
    badgeType: 'COMMERCIAL',
    phone: '+91 99432 11223',
    address: 'Mattuthavani, Madurai',
    deliveryPartner: {
      name: 'Mohamed Irfan',
      code: 'DP-002',
    },
    balance: 5550,
    balanceText: '₹5,550',
    balanceSubtext: 'Overdue 12 days',
    isOverdue: true,
    statusDot: 'green',
  },
];

export default function AdminCustomersPage() {
  const [activeNav, setActiveNav] = useState('Customers');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [partnerFilter, setPartnerFilter] = useState('All');
  const [assignmentFilter, setAssignmentFilter] = useState('All');
  const [balanceFilter, setBalanceFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerCategory, setNewCustomerCategory] = useState('Residential');
  const [newCustomerAddress, setNewCustomerAddress] = useState('');
  const [newCustomerPartner, setNewCustomerPartner] = useState('Leave unassign');
  const [assigningCustomer, setAssigningCustomer] = useState<CustomerRecord | null>(null);
  const [selectedPartnerForAssign, setSelectedPartnerForAssign] = useState('Rajesh · DP- 001');
  const [customerList, setCustomerList] = useState<CustomerRecord[]>(initialCustomers);

  // Filtering logic
  const filteredCustomers = useMemo(() => {
    return customerList.filter((c) => {
      // Search text
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesCode = c.code.toLowerCase().includes(q);
        const matchesPhone = c.phone.toLowerCase().includes(q);
        const matchesAddress = c.address.toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesPhone && !matchesAddress) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'All') {
        if (statusFilter === 'Active' && c.statusDot !== 'green') return false;
        if (statusFilter === 'Inactive' && c.statusDot !== 'grey') return false;
      }

      // Partner filter
      if (partnerFilter !== 'All') {
        if (partnerFilter === 'Rajesh' && !c.deliveryPartner.name.includes('Rajesh')) return false;
        if (partnerFilter === 'Mohamed Irfan' && !c.deliveryPartner.name.includes('Mohamed Irfan')) return false;
        if (partnerFilter === 'Suresh' && !c.deliveryPartner.name.includes('Suresh')) return false;
      }

      // Assignment filter
      if (assignmentFilter !== 'All') {
        if (assignmentFilter === 'Assigned' && c.deliveryPartner.isUnassigned) return false;
        if (assignmentFilter === 'Unassigned' && !c.deliveryPartner.isUnassigned) return false;
      }

      // Balance filter
      if (balanceFilter !== 'All') {
        if (balanceFilter === 'Outstanding' && c.balance === 0) return false;
        if (balanceFilter === 'Settled' && c.balance > 0) return false;
      }

      return true;
    });
  }, [customerList, searchQuery, statusFilter, partnerFilter, assignmentFilter, balanceFilter]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setPartnerFilter('All');
    setAssignmentFilter('All');
    setBalanceFilter('All');
  };

  const handleExportCSV = () => {
    const headers = ['Customer Name', 'Code', 'Phone', 'Address', 'Assigned Partner', 'Outstanding Balance'];
    const rows = filteredCustomers.map((c) => [
      c.name,
      c.code,
      c.phone,
      c.address,
      c.deliveryPartner.isUnassigned ? 'Unassigned' : `${c.deliveryPartner.name} (${c.deliveryPartner.code})`,
      c.balance.toString(),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'supergas_customers.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-800 font-sans antialiased">
      {/* 1. Left Sidebar Navigation */}
      <AdminSidebar
        activeItem={activeNav}
        onNavigate={setActiveNav}
        className="sticky top-0 h-screen z-30 border-r border-slate-200/90 rounded-none shrink-0"
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200/90 px-6 flex items-center justify-between sticky top-0 z-20">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs">
            <span className="w-4 h-4 rounded-full bg-[#E81B24] inline-block shrink-0"></span>
            <Link
              href="/admin"
              className="text-slate-500 hover:text-slate-800 font-medium transition"
            >
              Dashboard
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-slate-900 font-extrabold">Customers</span>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3.5">
            {/* Operational Pill */}
            <span className="inline-flex items-center gap-1.5 bg-[#DCFCE7] text-[#16A34A] text-xs font-bold px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
              <span>Agency: Operational</span>
            </span>

            {/* Notification Bell */}
            <button
              type="button"
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E81B24]"></span>
            </button>

            {/* Admin User Profile */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200/90">
              <div className="w-8 h-8 rounded-full bg-[#BC0118] text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                A
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-tight">Agency Admin</p>
                <p className="text-[10px] text-slate-400 font-medium">HQ Branch</p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Customers Body */}
        <main className="flex-1 p-6 space-y-6 max-w-[1440px] mx-auto w-full">
          {/* Page Title & Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                Customers
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Manage customer profiles, delivery partner assignments, and outstanding balances.
              </p>
            </div>

            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              {/* Export CSV Button */}
              <button
                type="button"
                onClick={handleExportCSV}
                className="bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-2xs cursor-pointer transition"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>Export CSV</span>
              </button>

              {/* Add Customer Button */}
              <button
                type="button"
                onClick={() => setShowAddCustomerModal(true)}
                className="bg-[#E81B24] hover:bg-red-700 active:scale-95 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm shadow-red-600/30 cursor-pointer transition"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add Customer</span>
              </button>
            </div>
          </div>

          {/* 3 KPI Summary Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: TOTAL CUSTOMERS */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-2 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  TOTAL CUSTOMERS
                </span>
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Users className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900 tracking-tight">1,250</p>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium pt-1">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                <span>Registered accounts</span>
              </div>
            </div>

            {/* Card 2: WITH OUTSTANDING */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-2 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  WITH OUTSTANDING
                </span>
                <div className="p-2 rounded-xl bg-red-50 text-red-600">
                  <FileText className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 tracking-tight">342</span>
                <span className="bg-[#FEE2E2] text-[#DC2626] font-bold text-[11px] px-2 py-0.5 rounded-md">
                  27.3% of total
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium pt-1">
                <span className="w-2 h-2 rounded-full bg-[#E81B24]"></span>
                <span>Accounts with unpaid dues</span>
              </div>
            </div>

            {/* Card 3: TOTAL OUTSTANDING */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs border-l-4 border-l-[#DC2626] space-y-2 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  TOTAL OUTSTANDING
                </span>
                <div className="p-2 rounded-xl bg-red-50 text-red-600">
                  <CreditCard className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <p className="text-3xl font-black text-[#DC2626] tracking-tight">
                ₹1,42,800
              </p>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium pt-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 stroke-[2.2]" />
                <span>Uncollected customer ledger</span>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-wrap items-center gap-3">
            {/* Search Input Box */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by customer name, phone, or cust"
                className="w-full bg-slate-50 border border-slate-200/90 rounded-xl pl-9.5 pr-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition"
              />
            </div>

            {/* Filter 1: Status */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 pr-8 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer focus:outline-none"
              >
                <option value="All">Status: All</option>
                <option value="Active">Status: Active</option>
                <option value="Inactive">Status: Inactive</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Filter 2: Partner */}
            <div className="relative">
              <select
                value={partnerFilter}
                onChange={(e) => setPartnerFilter(e.target.value)}
                className="appearance-none bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 pr-8 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer focus:outline-none"
              >
                <option value="All">Partner: All</option>
                <option value="Rajesh">Partner: Rajesh</option>
                <option value="Mohamed Irfan">Partner: Mohamed Irfan</option>
                <option value="Suresh">Partner: Suresh</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Filter 3: Assignment */}
            <div className="relative">
              <select
                value={assignmentFilter}
                onChange={(e) => setAssignmentFilter(e.target.value)}
                className="appearance-none bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 pr-8 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer focus:outline-none"
              >
                <option value="All">Assignment: All</option>
                <option value="Assigned">Assignment: Assigned</option>
                <option value="Unassigned">Assignment: Unassigned</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Filter 4: Balance */}
            <div className="relative">
              <select
                value={balanceFilter}
                onChange={(e) => setBalanceFilter(e.target.value)}
                className="appearance-none bg-slate-50 border border-slate-200/90 rounded-xl px-3.5 py-2.5 pr-8 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer focus:outline-none"
              >
                <option value="All">Balance: All</option>
                <option value="Outstanding">Balance: Outstanding</option>
                <option value="Settled">Balance: Settled</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Reset Filters Button */}
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 px-2.5 py-2 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Reset</span>
            </button>
          </div>

          {/* Customers Table Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[1050px]">
                <thead>
                  <tr className="border-b border-slate-200/80 text-[10px] font-bold uppercase text-slate-400 tracking-wider bg-slate-50/50">
                    <th className="py-3.5 pl-6 min-w-[160px]">Customer</th>
                    <th className="py-3.5 min-w-[140px]">Phone</th>
                    <th className="py-3.5 min-w-[160px]">Address</th>
                    <th className="py-3.5 min-w-[210px]">Assigned Delivery Partner</th>
                    <th className="py-3.5 text-right min-w-[140px]">
                      <span className="block leading-tight">Outstanding</span>
                      <span className="block leading-tight">Balance</span>
                    </th>
                    <th className="py-3.5 text-center min-w-[110px]">Status</th>
                    <th className="py-3.5 text-center pr-6 min-w-[110px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                        No customers match the current filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((cust) => (
                      <tr key={cust.id} className="hover:bg-slate-50/80 transition group">
                        {/* 1. Customer Name & Code */}
                        <td className="py-4 pl-6">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-slate-900 text-[13px]">
                                {cust.name}
                              </span>
                              {cust.badge && (
                                <span
                                  className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                                    cust.badgeType === 'B2B'
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-indigo-100 text-indigo-700'
                                  }`}
                                >
                                  {cust.badge}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 font-medium block">
                              {cust.code}
                            </span>
                          </div>
                        </td>

                        {/* 2. Phone */}
                        <td className="py-4">
                          <div className="flex items-center gap-2 text-slate-700">
                            <Phone className="w-3.5 h-3.5 text-slate-400 stroke-[2] shrink-0" />
                            <span className="font-medium tracking-tight text-xs">
                              {cust.phone}
                            </span>
                          </div>
                        </td>

                        {/* 3. Address */}
                        <td className="py-4">
                          <div className="flex items-center gap-2 text-slate-600">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 stroke-[2] shrink-0" />
                            <span className="font-medium text-xs">
                              {cust.address}
                            </span>
                          </div>
                        </td>

                        {/* 4. Assigned Delivery Partner */}
                        <td className="py-4">
                          {cust.deliveryPartner.isUnassigned ? (
                            <span className="inline-flex items-center gap-1.5 bg-[#FEF2F2] border border-red-200 text-[#DC2626] text-xs font-semibold px-3 py-1 rounded-full">
                              <AlertTriangle className="w-3.5 h-3.5 stroke-[2.2]" />
                              <span>Unassigned - Action Required</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                              <span>
                                {cust.deliveryPartner.name} · {cust.deliveryPartner.code}
                              </span>
                            </span>
                          )}
                        </td>

                        {/* 5. Outstanding Balance */}
                        <td className="py-4 text-right">
                          {cust.isSettled ? (
                            <div className="space-y-0.5">
                              {cust.balanceText.includes('Settled') ? (
                                <span className="inline-block bg-[#DCFCE7] text-[#16A34A] text-xs font-bold px-2.5 py-0.5 rounded-full">
                                  {cust.balanceText}
                                </span>
                              ) : (
                                <>
                                  <span className="font-extrabold text-slate-900 text-xs block">
                                    {cust.balanceText}
                                  </span>
                                  {cust.balanceSubtext && (
                                    <span className="text-[11px] text-slate-400 block font-medium">
                                      {cust.balanceSubtext}
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-0.5">
                              <span
                                className={`text-xs font-black block ${
                                  cust.isOverdue ? 'text-[#DC2626]' : 'text-[#DC2626]'
                                }`}
                              >
                                {cust.balanceText}
                              </span>
                              {cust.balanceSubtext && (
                                <span
                                  className={`text-[11px] block font-medium ${
                                    cust.isOverdue ? 'text-[#DC2626]' : 'text-slate-400'
                                  }`}
                                >
                                  {cust.balanceSubtext}
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* 6. Status Column (Active / Inactive badge) */}
                        <td className="py-4 text-center">
                          {cust.statusDot === 'green' ? (
                            <span className="inline-flex items-center gap-1.5 bg-[#DCFCE7] text-[#16A34A] text-xs font-bold px-3 py-1 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
                              <span>Active</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 bg-[#EEF2F6] text-[#64748B] text-xs font-bold px-3 py-1 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#94A3B8]"></span>
                              <span>Inactive</span>
                            </span>
                          )}
                        </td>

                        {/* 7. Actions Column */}
                        <td className="py-4 text-center pr-6">
                          {cust.deliveryPartner.isUnassigned ? (
                            <button
                              type="button"
                              onClick={() => setAssigningCustomer(cust)}
                              className="bg-[#A61017] hover:bg-red-800 active:scale-95 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-2xs transition cursor-pointer"
                            >
                              Assign Now
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer inline-flex items-center justify-center"
                              title="More options"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-3">
                <p>Showing 1 to 6 of 1,250 customers</p>
                <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
                  <span>Rows per page:</span>
                  <span className="bg-slate-50 border border-slate-200 rounded-md px-2 py-0.5 font-bold text-slate-800">
                    10
                  </span>
                </div>
              </div>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 text-slate-400 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 font-semibold"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  className="w-7 h-7 rounded-md bg-[#BC0118] text-white font-bold text-xs flex items-center justify-center shadow-2xs"
                >
                  1
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(2)}
                  className="w-7 h-7 rounded-md hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center transition cursor-pointer"
                >
                  2
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(3)}
                  className="w-7 h-7 rounded-md hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center transition cursor-pointer"
                >
                  3
                </button>
                <span className="px-1 text-slate-400">...</span>
                <button
                  type="button"
                  onClick={() => setCurrentPage(125)}
                  className="w-7 h-7 rounded-md hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center transition cursor-pointer"
                >
                  125
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-2.5 py-1 text-slate-700 hover:text-slate-900 cursor-pointer flex items-center gap-1 font-semibold"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Add New Customer Modal (Matched exactly to attached design) */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-[490px] w-full shadow-2xl space-y-4 border border-slate-100">
            {/* Header: Title, Subtitle & Close */}
            <div className="space-y-1">
              <div className="flex items-start justify-between">
                <h3 className="text-xl sm:text-[22px] font-extrabold text-slate-900 tracking-tight leading-tight">
                  Add New Customer
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="text-slate-700 hover:text-slate-950 p-1 -mr-1 -mt-1 cursor-pointer transition"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5 stroke-[1.8]" />
                </button>
              </div>
              <p className="text-xs sm:text-[13px] text-slate-500 font-normal">
                Register customer account for regular gas cylinder supply
              </p>
              <div className="border-b border-slate-200/70 pt-2"></div>
            </div>

            {/* Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const newCode = `CUS-${String(customerList.length + 124).padStart(5, '0')}`;
                const isUnassigned = newCustomerPartner === 'Leave unassign';
                const [partnerName, partnerCode] = isUnassigned
                  ? ['Unassigned - Action Required', '']
                  : newCustomerPartner.split(' · ');

                const newCust: CustomerRecord = {
                  id: String(Date.now()),
                  name: newCustomerName,
                  code: newCode,
                  badge: newCustomerCategory !== 'Residential' ? newCustomerCategory : undefined,
                  badgeType: newCustomerCategory === 'B2B' ? 'B2B' : 'COMMERCIAL',
                  phone: newCustomerPhone,
                  address: newCustomerAddress,
                  deliveryPartner: {
                    name: partnerName,
                    code: partnerCode || '',
                    isUnassigned,
                  },
                  balance: 0,
                  balanceText: 'Settled (₹0)',
                  isSettled: true,
                  statusDot: 'green',
                };

                setCustomerList((prev) => [newCust, ...prev]);
                setNewCustomerName('');
                setNewCustomerPhone('');
                setNewCustomerCategory('Residential');
                setNewCustomerAddress('');
                setNewCustomerPartner('Leave unassign');
                setShowAddCustomerModal(false);
              }}
              className="space-y-4 pt-1"
            >
              {/* Field 1: Customer Name * */}
              <div>
                <label className="text-xs sm:text-[13px] font-bold text-slate-900 mb-1.5 block">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder="eg. Ramesh"
                  required
                  className="w-full bg-[#F1F4FA] border-0 rounded-xl px-4 py-3 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-[#9AA2B1] focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              {/* 2-Column Row: Phone Number * & Category * */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Field 2: Phone Number * */}
                <div>
                  <label className="text-xs sm:text-[13px] font-bold text-slate-900 mb-1.5 block">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={newCustomerPhone}
                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                    placeholder="eg. 1234567890"
                    required
                    className="w-full bg-[#F1F4FA] border-0 rounded-xl px-4 py-3 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-[#9AA2B1] focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                </div>

                {/* Field 3: Category * */}
                <div>
                  <label className="text-xs sm:text-[13px] font-bold text-slate-900 mb-1.5 block">
                    Category *
                  </label>
                  <div className="relative">
                    <select
                      value={newCustomerCategory}
                      onChange={(e) => setNewCustomerCategory(e.target.value)}
                      className="appearance-none w-full bg-[#F1F4FA] border-0 rounded-xl px-4 py-3 pr-9 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer"
                    >
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                      <option value="B2B">B2B</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-600 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.2]" />
                  </div>
                </div>
              </div>

              {/* Field 4: Delivery Address & Landmark * */}
              <div>
                <label className="text-xs sm:text-[13px] font-bold text-slate-900 mb-1.5 block">
                  Delivery Address & Landmark *
                </label>
                <textarea
                  value={newCustomerAddress}
                  onChange={(e) => setNewCustomerAddress(e.target.value)}
                  placeholder="Full address with street name and pincode"
                  rows={4}
                  required
                  className="w-full bg-[#F1F4FA] border-0 rounded-xl p-4 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-[#9AA2B1] focus:outline-none focus:ring-2 focus:ring-red-500/20 resize-none leading-relaxed"
                />
              </div>

              {/* Field 5: Assign Partner (Optional) */}
              <div>
                <label className="text-xs sm:text-[13px] font-bold text-slate-900 mb-1.5 block">
                  Assign Partner (Optional)
                </label>
                <div className="relative">
                  <select
                    value={newCustomerPartner}
                    onChange={(e) => setNewCustomerPartner(e.target.value)}
                    className="appearance-none w-full bg-[#F1F4FA] border-0 rounded-xl px-4 py-3 pr-9 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer"
                  >
                    <option value="Leave unassign">Leave unassign</option>
                    <option value="Rajesh · DP- 001">Rajesh · DP- 001</option>
                    <option value="Mohamed Irfan · DP-002">Mohamed Irfan · DP-002</option>
                    <option value="Suresh · DP- 003">Suresh · DP- 003</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-600 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.2]" />
                </div>
              </div>

              {/* Bottom Divider */}
              <div className="border-b border-slate-200/70 pt-1"></div>

              {/* Footer Buttons: Cancel & Save Customer */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="bg-[#EEF2F8] hover:bg-slate-200 active:scale-98 text-slate-800 font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#BC0118] hover:bg-red-800 active:scale-98 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Assign Delivery Partner Modal */}
      {assigningCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Assign Delivery Partner</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {assigningCustomer.name} ({assigningCustomer.code})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAssigningCustomer(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setCustomerList((prev) =>
                  prev.map((item) => {
                    if (item.id === assigningCustomer.id) {
                      const [name, code] = selectedPartnerForAssign.split(' · ');
                      return {
                        ...item,
                        deliveryPartner: {
                          name,
                          code,
                          isUnassigned: false,
                        },
                      };
                    }
                    return item;
                  })
                );
                setAssigningCustomer(null);
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Customer Address
                </label>
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  {assigningCustomer.address}
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Select Delivery Partner
                </label>
                <select
                  value={selectedPartnerForAssign}
                  onChange={(e) => setSelectedPartnerForAssign(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                >
                  <option value="Rajesh · DP- 001">Rajesh (DP- 001) — Anna Nagar route</option>
                  <option value="Mohamed Irfan · DP-002">Mohamed Irfan (DP-002) — KK Nagar / Mattuthavani</option>
                  <option value="Suresh · DP- 003">Suresh (DP- 003) — Tallakulam route</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssigningCustomer(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#A61017] hover:bg-red-800 transition cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Confirm Assignment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
