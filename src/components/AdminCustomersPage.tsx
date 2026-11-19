'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  Eye,
  Pencil,
  ArrowLeftRight,
  Ban,
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

// Delivery partners dynamic list
const defaultDeliveryPartners: Array<{
  id: string;
  code: string;
  name: string;
  phone: string;
  deliveries: number;
}> = [];

// Helper to convert database customer payload to CustomerRecord format
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbCustomerToRecord(dbCust: any): CustomerRecord {
  const isB2B = dbCust.type === 'B2B' || dbCust.customerType === 'INDUSTRIAL';
  const isCommercial = dbCust.customerType === 'COMMERCIAL' || dbCust.type === 'Commercial';

  let badge: string | undefined = undefined;
  let badgeType: 'B2B' | 'COMMERCIAL' | undefined = undefined;
  if (isB2B) {
    badge = 'B2B';
    badgeType = 'B2B';
  } else if (isCommercial && dbCust.type !== 'Residential') {
    badge = 'COMMERCIAL';
    badgeType = 'COMMERCIAL';
  }

  let partnerName = 'Unassigned - Action Required';
  let partnerCode = '';
  let isUnassigned = true;

  if (dbCust.route && dbCust.route !== 'Unassigned' && !dbCust.route.includes('Action Required')) {
    if (dbCust.route.includes('·')) {
      const parts = dbCust.route.split('·').map((s: string) => s.trim());
      partnerName = parts[0];
      partnerCode = parts[1] || '';
      isUnassigned = false;
    } else {
      partnerName = dbCust.route;
      isUnassigned = false;
    }
  }

  const balance = dbCust.currentBalance || 0;
  const isSettled = balance <= 0;
  const balanceText = isSettled ? 'Settled (₹0)' : `₹${balance.toLocaleString('en-IN')}`;

  return {
    id: dbCust.id,
    name: dbCust.name || dbCust.businessName || 'Customer',
    code: dbCust.customerCode || `CUS-${dbCust.id.slice(-5).toUpperCase()}`,
    badge,
    badgeType,
    phone: dbCust.phone,
    address: dbCust.address || 'Madurai',
    deliveryPartner: {
      name: partnerName,
      code: partnerCode,
      isUnassigned,
    },
    balance,
    balanceText,
    balanceSubtext: isSettled ? 'Settled' : '1 invoice due',
    isSettled,
    isOverdue: balance > 0,
    statusDot: 'green',
  };
}

export default function AdminCustomersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [partnerFilter, setPartnerFilter] = useState('All');
  const [assignmentFilter, setAssignmentFilter] = useState('All');
  const [balanceFilter, setBalanceFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerCategory, setNewCustomerCategory] = useState<'Residential' | 'Commercial' | 'B2B'>('Residential');
  const [newCustomerAddress, setNewCustomerAddress] = useState('');
  const [newCustomerPartner, setNewCustomerPartner] = useState('Leave unassign');
  const [isSubmittingCustomer, setIsSubmittingCustomer] = useState(false);
  const [addCustomerError, setAddCustomerError] = useState<string | null>(null);

  const [assigningCustomer, setAssigningCustomer] = useState<CustomerRecord | null>(null);
  const [partnerSearchQuery, setPartnerSearchQuery] = useState('');
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [authorizedDeliveryPartners, setAuthorizedDeliveryPartners] = useState(defaultDeliveryPartners);
  const [customerList, setCustomerList] = useState<CustomerRecord[]>([]);

  const fetchPartners = useCallback(async () => {
    try {
      const res = await fetch('/api/drivers');
      if (!res.ok) return;
      const result = await res.json();
      if (result.success && Array.isArray(result.data?.partners)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped = result.data.partners.map((p: any) => {
          const code = p.code || p.partnerCode || p.id;
          return {
            id: code,
            code,
            name: p.name,
            phone: p.phone,
            deliveries: p._count?.assignedTrips || p.todayDeliveries || 0,
          };
        });
        setAuthorizedDeliveryPartners(mapped);
      }
    } catch (err) {
      console.warn('Could not load partners for assignment:', err);
    }
  }, []);

  // Fetch live customers & partners from database on mount
  useEffect(() => {
    let ignore = false;
    async function loadCustomers() {
      try {
        const res = await fetch('/api/customers?limit=100');
        if (!res.ok) return;
        const result = await res.json();
        if (!ignore && result.success && Array.isArray(result.data)) {
          const dbRecords = result.data.map(mapDbCustomerToRecord);
          setCustomerList(dbRecords);
        }
      } catch (err) {
        console.warn('Could not load customers from database:', err);
      }
    }

    async function loadPartners() {
      try {
        const res = await fetch('/api/drivers');
        if (!res.ok) return;
        const result = await res.json();
        if (!ignore && result.success && Array.isArray(result.data?.partners)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mapped = result.data.partners.map((p: any) => {
            const code = p.code || p.partnerCode || p.id;
            return {
              id: code,
              code,
              name: p.name,
              phone: p.phone,
              deliveries: p._count?.assignedTrips || p.todayDeliveries || 0,
            };
          });
          setAuthorizedDeliveryPartners(mapped);
        }
      } catch (err) {
        console.warn('Could not load partners for assignment:', err);
      }
    }

    loadCustomers();
    loadPartners();
    return () => {
      ignore = true;
    };
  }, []);

  // Action Popup & Interactive Modals State
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);
  const [actionMenuPos, setActionMenuPos] = useState<{ top: number; left: number } | null>(null);
  const [activeCustomer, setActiveCustomer] = useState<CustomerRecord | null>(null);
  const [viewDetailsCustomer, setViewDetailsCustomer] = useState<CustomerRecord | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<CustomerRecord | null>(null);
  const [viewLedgerCustomer, setViewLedgerCustomer] = useState<CustomerRecord | null>(null);
  const [actionToast, setActionToast] = useState<string | null>(null);

  // Auto-close action menu on window scroll or resize
  useEffect(() => {
    if (!activeActionMenuId) return;
    const handleDismiss = () => {
      setActiveActionMenuId(null);
      setActiveCustomer(null);
      setActionMenuPos(null);
    };
    window.addEventListener('scroll', handleDismiss, true);
    window.addEventListener('resize', handleDismiss);
    return () => {
      window.removeEventListener('scroll', handleDismiss, true);
      window.removeEventListener('resize', handleDismiss);
    };
  }, [activeActionMenuId]);

  // Edit Customer Form State
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCategory, setEditCategory] = useState<'Residential' | 'COMMERCIAL' | 'B2B'>('Residential');
  const [editAddress, setEditAddress] = useState('');
  const [editPartner, setEditPartner] = useState('');

  const handleOpenAssignModal = (cust: CustomerRecord) => {
    fetchPartners();
    setAssigningCustomer(cust);
    setPartnerSearchQuery('');
    const matched = authorizedDeliveryPartners.find((p) =>
      cust.deliveryPartner.name.includes(p.name) || p.name.includes(cust.deliveryPartner.name)
    );
    setSelectedPartnerId(matched ? matched.id : authorizedDeliveryPartners[0]?.id || null);
  };

  const handleOpenEditModal = (cust: CustomerRecord) => {
    fetchPartners();
    setEditingCustomer(cust);
    setEditName(cust.name);
    setEditPhone(cust.phone);
    setEditCategory(cust.badgeType || 'Residential');
    setEditAddress(cust.address);
    setEditPartner(
      cust.deliveryPartner.isUnassigned
        ? 'Leave unassign'
        : `${cust.deliveryPartner.name} · ${cust.deliveryPartner.code}`
    );
  };

  const handleSaveEditCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    const isUnassigned = editPartner === 'Leave unassign';
    const [partnerName, partnerCode] = !isUnassigned
      ? editPartner.split(' · ')
      : ['Unassigned', ''];

    // Sync to database
    try {
      await fetch(`/api/customers/${editingCustomer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          phone: editPhone,
          address: editAddress,
          customerType: editCategory,
          route: !isUnassigned ? editPartner : 'Unassigned',
        }),
      });
    } catch (err) {
      console.warn('Could not sync customer update to backend:', err);
    }

    setCustomerList((prev) =>
      prev.map((c) => {
        if (c.id === editingCustomer.id) {
          return {
            ...c,
            name: editName,
            phone: editPhone,
            address: editAddress,
            badge: editCategory === 'Residential' ? undefined : editCategory,
            badgeType: editCategory === 'Residential' ? undefined : editCategory,
            deliveryPartner: {
              name: partnerName,
              code: partnerCode,
              isUnassigned,
            },
          };
        }
        return c;
      })
    );

    setActionToast(`Customer details for ${editName} updated successfully.`);
    setTimeout(() => setActionToast(null), 3000);
    setEditingCustomer(null);
  };

  // Submit Handler for Add Customer Form (persists directly into Postgres via /api/customers)
  const handleAddCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingCustomer(true);
    setAddCustomerError(null);

    const isUnassigned = newCustomerPartner === 'Leave unassign';
    const [partnerName, partnerCode] = !isUnassigned
      ? newCustomerPartner.split(' · ')
      : ['', ''];

    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCustomerName.trim(),
          phone: newCustomerPhone.trim(),
          address: newCustomerAddress.trim(),
          customerType: newCustomerCategory,
          deliveryPartnerName: !isUnassigned ? partnerName : undefined,
          deliveryPartnerCode: !isUnassigned ? partnerCode : undefined,
          route: !isUnassigned ? newCustomerPartner : 'Unassigned',
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error?.message || 'Failed to add customer');
      }

      const createdDbCustomer = result.data;
      const formattedRecord = mapDbCustomerToRecord(createdDbCustomer);

      setCustomerList((prev) => [
        formattedRecord,
        ...prev.filter((c) => c.id !== formattedRecord.id),
      ]);

      setNewCustomerName('');
      setNewCustomerPhone('');
      setNewCustomerCategory('Residential');
      setNewCustomerAddress('');
      setNewCustomerPartner('Leave unassign');
      setShowAddCustomerModal(false);

      setActionToast(`Customer ${formattedRecord.name} (${formattedRecord.code}) created successfully in database!`);
      setTimeout(() => setActionToast(null), 4000);
    } catch (err) {
      setAddCustomerError(err instanceof Error ? err.message : 'Failed to save customer to database.');
    } finally {
      setIsSubmittingCustomer(false);
    }
  };

  const handleToggleCustomerStatus = (customerId: string) => {
    setCustomerList((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const nextStatus = c.statusDot === 'green' ? 'grey' : 'green';
          setActionToast(
            nextStatus === 'grey'
              ? `${c.name} has been deactivated.`
              : `${c.name} has been activated.`
          );
          setTimeout(() => setActionToast(null), 3000);
          return {
            ...c,
            statusDot: nextStatus,
          };
        }
        return c;
      })
    );
  };

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

  // Filtered Delivery Partners for Assign Modal
  const filteredAuthorizePartners = useMemo(() => {
    if (!partnerSearchQuery.trim()) return authorizedDeliveryPartners;
    const q = partnerSearchQuery.toLowerCase();
    return authorizedDeliveryPartners.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.phone.toLowerCase().includes(q)
    );
  }, [partnerSearchQuery, authorizedDeliveryPartners]);

  const customerStats = useMemo(() => {
    const total = customerList.length;
    const withOutstanding = customerList.filter((c) => (c.balance || 0) > 0);
    const withOutstandingCount = withOutstanding.length;
    const pct = total > 0 ? ((withOutstandingCount / total) * 100).toFixed(1) : '0';
    const totalOutstanding = withOutstanding.reduce(
      (sum, c) => sum + (c.balance || 0),
      0
    );
    return {
      total,
      withOutstandingCount,
      pct,
      totalOutstanding,
    };
  }, [customerList]);

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
                onClick={() => {
                  fetchPartners();
                  setShowAddCustomerModal(true);
                }}
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
              <p className="text-3xl font-black text-slate-900 tracking-tight">{customerStats.total.toLocaleString('en-IN')}</p>
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
                <span className="text-3xl font-black text-slate-900 tracking-tight">{customerStats.withOutstandingCount}</span>
                <span className="bg-[#FEE2E2] text-[#DC2626] font-bold text-[11px] px-2 py-0.5 rounded-md">
                  {customerStats.pct}% of total
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
                ₹{customerStats.totalOutstanding.toLocaleString('en-IN')}
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

                        {/* 7. Actions Column with Exact Action Pop up */}
                        <td className="py-4 text-center pr-6 relative">
                          {cust.deliveryPartner.isUnassigned ? (
                            <button
                              type="button"
                              onClick={() => handleOpenAssignModal(cust)}
                              className="bg-[#A61017] hover:bg-red-800 active:scale-95 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-2xs transition cursor-pointer"
                            >
                              Assign Now
                            </button>
                          ) : (
                            <div className="relative inline-block text-left">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (activeActionMenuId === cust.id) {
                                    setActiveActionMenuId(null);
                                    setActiveCustomer(null);
                                    setActionMenuPos(null);
                                    return;
                                  }
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  const menuWidth = 235;
                                  const menuHeight = 240;

                                  let top = rect.bottom + 6;
                                  if (top + menuHeight > window.innerHeight && rect.top - menuHeight > 10) {
                                    top = rect.top - menuHeight - 6;
                                  }

                                  let left = rect.right - menuWidth;
                                  if (left < 10) left = 10;
                                  if (left + menuWidth > window.innerWidth - 10) {
                                    left = window.innerWidth - menuWidth - 10;
                                  }

                                  setActionMenuPos({ top, left });
                                  setActiveCustomer(cust);
                                  setActiveActionMenuId(cust.id);
                                }}
                                className={`p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer inline-flex items-center justify-center ${
                                  activeActionMenuId === cust.id ? 'bg-slate-100 text-slate-900' : ''
                                }`}
                                title="More options"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </div>
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
                <p>
                  Showing {filteredCustomers.length > 0 ? 1 : 0} to {filteredCustomers.length} of {customerStats.total.toLocaleString('en-IN')} customers
                </p>
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
                  onClick={() => {
                    setShowAddCustomerModal(false);
                    setAddCustomerError(null);
                  }}
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

            {addCustomerError && (
              <div className="bg-[#FEF2F2] border border-red-200 rounded-xl p-3 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                <p className="text-xs font-semibold text-[#DC2626] leading-tight">
                  {addCustomerError}
                </p>
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={handleAddCustomerSubmit}
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
                      onChange={(e) => setNewCustomerCategory(e.target.value as 'Residential' | 'Commercial' | 'B2B')}
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
                    {authorizedDeliveryPartners.map((p) => (
                      <option key={p.id} value={`${p.name} · ${p.code || p.id}`}>
                        {p.name} ({p.code || p.id})
                      </option>
                    ))}
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
                  disabled={isSubmittingCustomer}
                  onClick={() => {
                    setShowAddCustomerModal(false);
                    setAddCustomerError(null);
                  }}
                  className="bg-[#EEF2F8] hover:bg-slate-200 active:scale-98 text-slate-800 font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl transition cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCustomer}
                  className="bg-[#BC0118] hover:bg-red-800 active:scale-98 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-xs transition cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                >
                  {isSubmittingCustomer && (
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  )}
                  <span>{isSubmittingCustomer ? 'Saving to Database...' : 'Save Customer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Assign Delivery Partner Modal matching exact attached design */}
      {assigningCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-lg w-full shadow-2xl border border-slate-100 p-7 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            {/* Header: Title, Subtitle, Close X */}
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    Assign Delivery Partner
                  </h3>
                  <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-1">
                    Link customer for exclusive cylinder dispatch handovers
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAssigningCustomer(null)}
                  className="text-slate-900 hover:text-slate-600 p-1 cursor-pointer transition"
                  title="Close"
                >
                  <X className="w-6 h-6 stroke-[1.8]" />
                </button>
              </div>
              <div className="border-b border-slate-200/80 mt-5" />
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const partner =
                  authorizedDeliveryPartners.find((p) => p.id === selectedPartnerId) ||
                  authorizedDeliveryPartners[0];

                try {
                  await fetch(`/api/customers/${assigningCustomer.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      route: `${partner.name} · ${partner.id}`,
                    }),
                  });
                } catch (err) {
                  console.warn('Could not sync partner assignment to database:', err);
                }

                setCustomerList((prev) =>
                  prev.map((item) => {
                    if (item.id === assigningCustomer.id) {
                      return {
                        ...item,
                        deliveryPartner: {
                          name: partner.name,
                          code: partner.id,
                          isUnassigned: false,
                        },
                      };
                    }
                    return item;
                  })
                );

                setActionToast(
                  `Assigned ${partner.name} to ${assigningCustomer.name} successfully.`
                );
                setTimeout(() => setActionToast(null), 3000);
                setAssigningCustomer(null);
              }}
              className="space-y-6"
            >
              {/* Field 1: Customer Name */}
              <div>
                <label className="text-xs sm:text-sm font-bold text-slate-900 block mb-2">
                  Customer Name
                </label>
                <div className="bg-[#EEF2F8] rounded-2xl px-5 py-3.5 flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm sm:text-base">
                    {assigningCustomer.name}
                  </span>
                  <span className="bg-white text-slate-900 text-xs font-bold px-3.5 py-1 rounded-full shadow-2xs">
                    {assigningCustomer.code}
                  </span>
                </div>
              </div>

              {/* Field 2: Select Authorize Delivery Partner */}
              <div className="space-y-3">
                <label className="text-xs sm:text-sm font-bold text-slate-900 block">
                  Select Authorize Delivery Partner
                </label>

                {/* Search input */}
                <div className="relative">
                  <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2]" />
                  <input
                    type="text"
                    placeholder="Search Delivery Partner"
                    value={partnerSearchQuery}
                    onChange={(e) => setPartnerSearchQuery(e.target.value)}
                    className="w-full bg-[#EEF2F8] rounded-2xl pl-12 pr-4 py-3.5 text-sm font-normal text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                </div>

                {/* List of Delivery Partner Cards */}
                <div className="space-y-3 pt-1">
                  {filteredAuthorizePartners.map((partner) => {
                    const isSelected = selectedPartnerId === partner.id;
                    return (
                      <div
                        key={partner.id}
                        onClick={() => setSelectedPartnerId(partner.id)}
                        className={`bg-white border rounded-2xl p-4 flex items-center justify-between cursor-pointer transition ${
                          isSelected
                            ? 'border-blue-500 ring-1 ring-blue-500/20 shadow-xs'
                            : 'border-slate-200/90 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          {/* Circular radio button matching mockup */}
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                              isSelected
                                ? 'border-[#3B82F6] bg-white'
                                : 'border-[#3B82F6] bg-white'
                            }`}
                          >
                            {isSelected && (
                              <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 text-sm sm:text-base block">
                              {partner.name}
                            </span>
                            <span className="text-slate-500 text-xs font-medium block mt-0.5">
                              ID: {partner.id} · {partner.phone}
                            </span>
                          </div>
                        </div>

                        <span className="bg-[#EAF0F9] text-slate-600 text-xs font-semibold px-3.5 py-1.5 rounded-full shrink-0">
                          {partner.deliveries} Deliveries
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons: Cancel & Save Customer */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setAssigningCustomer(null)}
                  className="bg-[#EEF2F8] hover:bg-slate-200 active:scale-98 text-slate-800 font-bold text-sm px-6 py-3 rounded-2xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#BC0118] hover:bg-red-800 active:scale-98 text-white font-bold text-sm px-6 py-3 rounded-2xl shadow-xs transition cursor-pointer"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Action Pop up Dropdown (Mounted in Body Portal to prevent table clipping) */}
      {activeActionMenuId && activeCustomer && actionMenuPos && typeof document !== 'undefined' &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[9998]"
              onClick={() => {
                setActiveActionMenuId(null);
                setActiveCustomer(null);
                setActionMenuPos(null);
              }}
            />

            <div
              style={{
                position: 'fixed',
                top: `${actionMenuPos.top}px`,
                left: `${actionMenuPos.left}px`,
              }}
              className="z-[9999] w-[235px] bg-white rounded-[24px] shadow-[0_16px_50px_rgba(0,0,0,0.18)] border border-slate-200/90 p-3 space-y-0.5 text-left animate-in fade-in zoom-in-95 duration-100"
            >
              {/* 1. View Details */}
              <button
                type="button"
                onClick={() => {
                  setViewDetailsCustomer(activeCustomer);
                  setActiveActionMenuId(null);
                  setActiveCustomer(null);
                  setActionMenuPos(null);
                }}
                className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition cursor-pointer text-left group"
              >
                <Eye className="w-5 h-5 text-slate-900 stroke-[1.8] shrink-0" />
                <span className="text-[13.5px] font-medium text-slate-900">
                  View Details
                </span>
              </button>

              {/* 2. Edit Customer */}
              <button
                type="button"
                onClick={() => {
                  handleOpenEditModal(activeCustomer);
                  setActiveActionMenuId(null);
                  setActiveCustomer(null);
                  setActionMenuPos(null);
                }}
                className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition cursor-pointer text-left group"
              >
                <Pencil className="w-5 h-5 text-slate-900 stroke-[1.8] shrink-0" />
                <span className="text-[13.5px] font-medium text-slate-900">
                  Edit Customer
                </span>
              </button>

              {/* 3. Reassign Partner */}
              <button
                type="button"
                onClick={() => {
                  handleOpenAssignModal(activeCustomer);
                  setActiveActionMenuId(null);
                  setActiveCustomer(null);
                  setActionMenuPos(null);
                }}
                className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition cursor-pointer text-left group"
              >
                <ArrowLeftRight className="w-5 h-5 text-slate-900 stroke-[1.8] shrink-0" />
                <span className="text-[13.5px] font-medium text-slate-900">
                  Reassign Partner
                </span>
              </button>

              {/* 4. View Customer Ledger */}
              <button
                type="button"
                onClick={() => {
                  setViewLedgerCustomer(activeCustomer);
                  setActiveActionMenuId(null);
                  setActiveCustomer(null);
                  setActionMenuPos(null);
                }}
                className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition cursor-pointer text-left group"
              >
                <FileText className="w-5 h-5 text-slate-900 stroke-[1.8] shrink-0" />
                <span className="text-[13.5px] font-medium text-slate-900">
                  View Customer Ledger
                </span>
              </button>

              {/* Horizontal Divider */}
              <div className="border-b border-slate-100 my-1.5 mx-1" />

              {/* 5. Deactivate Customer */}
              <button
                type="button"
                onClick={() => {
                  handleToggleCustomerStatus(activeCustomer.id);
                  setActiveActionMenuId(null);
                  setActiveCustomer(null);
                  setActionMenuPos(null);
                }}
                className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-red-50/60 transition cursor-pointer text-left group"
              >
                <Ban className="w-5 h-5 text-[#E81B24] stroke-[1.8] shrink-0" />
                <span className="text-[13.5px] font-medium text-[#E81B24]">
                  {activeCustomer.statusDot === 'green'
                    ? 'Deactivate Customer'
                    : 'Activate Customer'}
                </span>
              </button>
            </div>
          </>,
          document.body
        )}

      {/* 1. View Customer Details Modal */}
      {viewDetailsCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 text-[#BC0118] font-black text-sm flex items-center justify-center">
                  {viewDetailsCustomer.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900">
                      {viewDetailsCustomer.name}
                    </h3>
                    {viewDetailsCustomer.badge && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                        {viewDetailsCustomer.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-medium">{viewDetailsCustomer.code}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewDetailsCustomer(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-semibold block text-[11px]">Phone Number</span>
                  <span className="font-bold text-slate-800 text-sm block">{viewDetailsCustomer.phone}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-semibold block text-[11px]">Outstanding Due</span>
                  <span className="font-extrabold text-red-600 text-sm block">
                    {viewDetailsCustomer.balanceText}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 font-semibold block text-[11px]">Delivery Address & Route</span>
                <span className="font-medium text-slate-700 block">{viewDetailsCustomer.address}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 font-semibold block text-[11px]">Assigned Delivery Partner</span>
                <span className="font-bold text-slate-800 block">
                  {viewDetailsCustomer.deliveryPartner.isUnassigned
                    ? 'Unassigned'
                    : `${viewDetailsCustomer.deliveryPartner.name} (${viewDetailsCustomer.deliveryPartner.code})`}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 px-6 bg-slate-50 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  const target = viewDetailsCustomer;
                  setViewDetailsCustomer(null);
                  handleOpenEditModal(target);
                }}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const target = viewDetailsCustomer;
                    setViewDetailsCustomer(null);
                    setViewLedgerCustomer(target);
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition cursor-pointer"
                >
                  View Ledger
                </button>
                <button
                  type="button"
                  onClick={() => setViewDetailsCustomer(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Edit Customer Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Edit Customer</h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Update customer account details and route assignments
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingCustomer(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditCustomer} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#F1F4FA] rounded-xl px-4 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-[#F1F4FA] rounded-xl px-4 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Category *
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) =>
                      setEditCategory(e.target.value as 'Residential' | 'COMMERCIAL' | 'B2B')
                    }
                    className="w-full bg-[#F1F4FA] rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  >
                    <option value="Residential">Residential</option>
                    <option value="COMMERCIAL">Commercial</option>
                    <option value="B2B">B2B</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Delivery Address & Landmark *
                </label>
                <textarea
                  required
                  rows={3}
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full bg-[#F1F4FA] rounded-xl px-4 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Assigned Partner
                </label>
                <select
                  value={editPartner}
                  onChange={(e) => setEditPartner(e.target.value)}
                  className="w-full bg-[#F1F4FA] rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                >
                  <option value="Leave unassign">Leave unassign</option>
                  {authorizedDeliveryPartners.map((p) => (
                    <option key={p.id} value={`${p.name} · ${p.code || p.id}`}>
                      {p.name} ({p.code || p.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#BC0118] hover:bg-red-800 transition cursor-pointer shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. View Customer Ledger Modal */}
      {viewLedgerCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-extrabold text-slate-900">Customer Ledger</h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {viewLedgerCustomer.code}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {viewLedgerCustomer.name} · {viewLedgerCustomer.phone}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewLedgerCustomer(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                  <span className="text-[11px] font-bold text-slate-400 block">Total Invoiced</span>
                  <span className="text-sm font-black text-slate-900 block mt-0.5">₹24,000</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                  <span className="text-[11px] font-bold text-slate-400 block">Total Paid</span>
                  <span className="text-sm font-black text-emerald-600 block mt-0.5">₹18,450</span>
                </div>
                <div className="bg-red-50/50 border border-red-100 rounded-xl p-3">
                  <span className="text-[11px] font-bold text-red-500 block">Outstanding</span>
                  <span className="text-sm font-black text-red-600 block mt-0.5">
                    {viewLedgerCustomer.balanceText}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-2">Recent Invoices & Transactions</h4>
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden text-xs">
                  <div className="p-3 bg-slate-50 font-bold text-slate-500 grid grid-cols-4 text-[11px]">
                    <span>Invoice #</span>
                    <span>Date</span>
                    <span className="text-right">Amount</span>
                    <span className="text-right">Status</span>
                  </div>
                  <div className="p-3 grid grid-cols-4 items-center">
                    <span className="font-bold text-slate-800">#INV-20261024</span>
                    <span className="text-slate-500">24 Oct 2026</span>
                    <span className="font-extrabold text-slate-900 text-right">
                      {viewLedgerCustomer.balanceText}
                    </span>
                    <span className="text-right">
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                        {viewLedgerCustomer.balance > 0 ? 'Unpaid' : 'Settled'}
                      </span>
                    </span>
                  </div>
                  <div className="p-3 grid grid-cols-4 items-center">
                    <span className="font-bold text-slate-800">#INV-20261018</span>
                    <span className="text-slate-500">18 Oct 2026</span>
                    <span className="font-extrabold text-slate-900 text-right">₹7,200</span>
                    <span className="text-right">
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        Paid
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 px-6 bg-slate-50 border-t border-slate-100">
              <span className="text-[11px] text-slate-400 font-medium">
                Showing last 30 days transactions
              </span>
              <button
                type="button"
                onClick={() => setViewLedgerCustomer(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Toast Notification */}
      {actionToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
          <span>{actionToast}</span>
        </div>
      )}
    </div>
  );
}
