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
  Copy,
  ExternalLink,
  RotateCcw,
  AlertTriangle,
  Package,
  Wallet,
  UserCheck,
  Check,
  X,
  Printer,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from 'lucide-react';

export interface PartnerRecord {
  id: string;
  name: string;
  code: string;
  initials: string;
  avatarBg: string;
  avatarText: string;
  joinedDate: string;
  phone: string;
  area: string;
  isStandbyArea?: boolean;
  customersCount: number;
  filledCylinders: number;
  emptyCylinders: number;
  status: 'Active' | 'Standby' | 'On Leave';
  hasWarning?: boolean;
  todayDeliveries: number;
  activeGatePass?: {
    code: string;
    issuedAt: string;
    loadedUnits: number;
    operator: string;
    status: 'Confirmed' | 'Pending';
  };
  custodyLogs: Array<{
    id: string;
    action: string;
    customer: string;
    time: string;
    changeText: string;
  }>;
}

const initialPartners: PartnerRecord[] = [
  {
    id: 'DP-001',
    name: 'Rajesh Kumar',
    code: 'DP-001',
    initials: 'RK',
    avatarBg: 'bg-red-100',
    avatarText: 'text-[#BC0118]',
    joinedDate: 'Joined 14 Jan 2023',
    phone: '+91 98401 22340',
    area: 'Anna Nagar',
    customersCount: 45,
    filledCylinders: 10,
    emptyCylinders: 8,
    status: 'Active',
    hasWarning: false,
    todayDeliveries: 15,
    activeGatePass: {
      code: '#GP-1094',
      issuedAt: 'Issued today at 08:15 AM',
      loadedUnits: 25,
      operator: 'Gate Operator: S. Raman',
      status: 'Confirmed',
    },
    custodyLogs: [
      {
        id: 'log-1',
        action: 'Delivered 2x Commercial',
        customer: 'Sri Krishna Sweets',
        time: '12:40 PM',
        changeText: '-2 Filled / +2 Empty',
      },
      {
        id: 'log-2',
        action: 'Delivered 1x Commercial',
        customer: 'Priya Bakery',
        time: '11:20 AM',
        changeText: '-1 Filled / +1 Empty',
      },
    ],
  },
  {
    id: 'DP-002',
    name: 'Mohamed Irfan',
    code: 'DP-002',
    initials: 'MI',
    avatarBg: 'bg-blue-100',
    avatarText: 'text-blue-700',
    joinedDate: 'Joined 03 Mar 2023',
    phone: '+91 97890 55412',
    area: 'K.K. Nagar',
    customersCount: 38,
    filledCylinders: 5,
    emptyCylinders: 6,
    status: 'Active',
    hasWarning: false,
    todayDeliveries: 12,
    activeGatePass: {
      code: '#GP-1092',
      issuedAt: 'Issued today at 08:00 AM',
      loadedUnits: 20,
      operator: 'Gate Operator: S. Raman',
      status: 'Confirmed',
    },
    custodyLogs: [
      {
        id: 'log-3',
        action: 'Delivered 1x Domestic',
        customer: 'Kavitha R',
        time: '11:45 AM',
        changeText: '-1 Filled / +1 Empty',
      },
    ],
  },
  {
    id: 'DP-003',
    name: 'Suresh Babu',
    code: 'DP-003',
    initials: 'SB',
    avatarBg: 'bg-amber-100',
    avatarText: 'text-amber-800',
    joinedDate: 'Joined 19 Aug 2022',
    phone: '+91 94432 10987',
    area: 'Simmakkal',
    customersCount: 52,
    filledCylinders: 12,
    emptyCylinders: 9,
    status: 'Active',
    hasWarning: true,
    todayDeliveries: 18,
    activeGatePass: {
      code: '#GP-1090',
      issuedAt: 'Issued today at 07:45 AM',
      loadedUnits: 28,
      operator: 'Gate Operator: M. Pandian',
      status: 'Confirmed',
    },
    custodyLogs: [
      {
        id: 'log-4',
        action: 'Discrepancy Reported',
        customer: 'Depot Yard Audit',
        time: '01:10 PM',
        changeText: '1 Empty Pending Reconciliation',
      },
    ],
  },
  {
    id: 'DP-004',
    name: 'Karthik Raja',
    code: 'DP-004',
    initials: 'KR',
    avatarBg: 'bg-purple-100',
    avatarText: 'text-purple-700',
    joinedDate: 'Joined 02 Nov 2023',
    phone: '+91 98940 33441',
    area: 'Commercial Hub',
    customersCount: 30,
    filledCylinders: 0,
    emptyCylinders: 4,
    status: 'Active',
    hasWarning: false,
    todayDeliveries: 8,
    activeGatePass: {
      code: '#GP-1088',
      issuedAt: 'Issued today at 09:00 AM',
      loadedUnits: 15,
      operator: 'Gate Operator: S. Raman',
      status: 'Confirmed',
    },
    custodyLogs: [
      {
        id: 'log-5',
        action: 'Delivered 3x Industrial',
        customer: 'Apollo Fabrications',
        time: '10:30 AM',
        changeText: '-3 Filled / +3 Empty',
      },
    ],
  },
  {
    id: 'DP-005',
    name: 'Vignesh V',
    code: 'DP-005',
    initials: 'VV',
    avatarBg: 'bg-slate-100',
    avatarText: 'text-slate-700',
    joinedDate: 'Joined 10 Dec 2023',
    phone: '+91 98432 88710',
    area: 'Standby / Buffer',
    isStandbyArea: true,
    customersCount: 0,
    filledCylinders: 0,
    emptyCylinders: 0,
    status: 'Standby',
    hasWarning: false,
    todayDeliveries: 0,
    custodyLogs: [],
  },
];

export default function AdminDeliveryPartnersPage() {
  const [partners, setPartners] = useState<PartnerRecord[]>(initialPartners);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('DP-001');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [areaFilter, setAreaFilter] = useState('All Areas');
  const [assignmentFilter, setAssignmentFilter] = useState('All');
  const [custodyFilter, setCustodyFilter] = useState('All');
  const [settlementFilter, setSettlementFilter] = useState('All');

  // Detail Drawer Active Tab
  const [detailTab, setDetailTab] = useState<'Custody Ledger' | 'Customers' | 'Settlement'>('Custody Ledger');

  // Toast State
  const [actionToast, setActionToast] = useState<string | null>(null);

  // Modals State
  const [showAddPartnerModal, setShowAddPartnerModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);

  // Add Partner Form State
  const [newPartnerName, setNewPartnerName] = useState('');
  const [newPartnerPhone, setNewPartnerPhone] = useState('');
  const [newPartnerArea, setNewPartnerArea] = useState('Anna Nagar');
  const [newPartnerVehicle, setNewPartnerVehicle] = useState('Three-Wheeler Auto Van');
  const [newPartnerCapacity, setNewPartnerCapacity] = useState('30');

  // Issue Cylinders State
  const [issueSize, setIssueSize] = useState('14.2 kg Domestic (Red)');
  const [issueQuantity, setIssueQuantity] = useState(10);

  const triggerToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 3000);
  };

  const selectedPartner = useMemo(() => {
    return partners.find((p) => p.id === selectedPartnerId) || partners[0];
  }, [partners, selectedPartnerId]);

  // Filtering Logic
  const filteredPartners = useMemo(() => {
    return partners.filter((p) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesCode = p.code.toLowerCase().includes(q);
        const matchesPhone = p.phone.toLowerCase().includes(q);
        const matchesArea = p.area.toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesPhone && !matchesArea) return false;
      }

      if (statusFilter !== 'All') {
        if (p.status !== statusFilter) return false;
      }

      if (areaFilter !== 'All Areas') {
        if (p.area !== areaFilter) return false;
      }

      if (assignmentFilter !== 'All') {
        if (assignmentFilter === 'Assigned' && p.customersCount === 0) return false;
        if (assignmentFilter === 'Unassigned' && p.customersCount > 0) return false;
      }

      if (custodyFilter !== 'All') {
        if (custodyFilter === 'Holding Cylinders' && p.filledCylinders === 0 && p.emptyCylinders === 0)
          return false;
        if (custodyFilter === 'No Cylinders' && (p.filledCylinders > 0 || p.emptyCylinders > 0))
          return false;
      }

      if (settlementFilter !== 'All') {
        if (settlementFilter === 'Action Required' && !p.hasWarning) return false;
        if (settlementFilter === 'Settled' && p.hasWarning) return false;
      }

      return true;
    });
  }, [partners, searchQuery, statusFilter, areaFilter, assignmentFilter, custodyFilter, settlementFilter]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setAreaFilter('All Areas');
    setAssignmentFilter('All');
    setCustodyFilter('All');
    setSettlementFilter('All');
    triggerToast('All filters cleared');
  };

  const handleCopyPhone = (phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(phone);
    triggerToast(`Copied phone: ${phone}`);
  };

  const handleExportCSV = () => {
    const headers = ['Partner ID', 'Name', 'Phone', 'Area', 'Customers', 'Filled Custody', 'Empty Custody', 'Status'];
    const rows = filteredPartners.map((p) => [
      p.code,
      p.name,
      p.phone,
      p.area,
      p.customersCount.toString(),
      p.filledCylinders.toString(),
      p.emptyCylinders.toString(),
      p.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'supergas_delivery_partners.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveNewPartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartnerName.trim()) return;

    const nextIdNum = partners.length + 1;
    const newCode = `DP-00${nextIdNum}`;
    const initials = newPartnerName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const created: PartnerRecord = {
      id: newCode,
      name: newPartnerName.trim(),
      code: newCode,
      initials: initials || 'DP',
      avatarBg: 'bg-emerald-100',
      avatarText: 'text-emerald-800',
      joinedDate: 'Joined Just Now',
      phone: newPartnerPhone.trim() || '+91 98400 00000',
      area: newPartnerArea,
      customersCount: 0,
      filledCylinders: 0,
      emptyCylinders: 0,
      status: 'Active',
      hasWarning: false,
      todayDeliveries: 0,
      custodyLogs: [],
    };

    setPartners((prev) => [...prev, created]);
    setSelectedPartnerId(newCode);
    setShowAddPartnerModal(false);
    triggerToast(`Added delivery partner: ${newPartnerName} (${newCode})`);

    setNewPartnerName('');
    setNewPartnerPhone('');
  };

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = issueQuantity || 0;
    if (qty <= 0) return;

    setPartners((prev) =>
      prev.map((p) => {
        if (p.id === selectedPartner.id) {
          return {
            ...p,
            filledCylinders: p.filledCylinders + qty,
            todayDeliveries: p.todayDeliveries + qty,
            custodyLogs: [
              {
                id: `log-${p.custodyLogs.length + 1}`,
                action: `Issued ${qty}x ${issueSize}`,
                customer: 'Depot Yard Central',
                time: 'Just Now',
                changeText: `+${qty} Filled Issued`,
              },
              ...p.custodyLogs,
            ],
          };
        }
        return p;
      })
    );

    setShowIssueModal(false);
    triggerToast(`Gate Pass issued: ${qty} cylinders to ${selectedPartner.name}`);
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
            <Link href="/admin" className="text-slate-500 hover:text-slate-800 transition">
              Dashboard
            </Link>
            <span className="text-slate-300">/</span>
            <span className="font-bold text-slate-800">Delivery Partners</span>
          </div>

          {/* Right Header items: Operational badge, Notifications, Profile */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Agency: Operational
            </div>

            <button
              type="button"
              className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E81B24] rounded-full ring-2 ring-white"></span>
            </button>

            {/* Profile Avatar & Info */}
            <div className="flex items-center gap-2.5 pl-2 sm:border-l sm:border-slate-200">
              <div className="w-8 h-8 rounded-full bg-[#BC0118] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                A
              </div>
              <div className="hidden md:block leading-tight">
                <div className="text-xs font-bold text-slate-800">Agency Admin</div>
                <div className="text-[10px] text-slate-400 font-medium">HQ Branch</div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-6 sm:p-8 space-y-6 max-w-[1600px] w-full mx-auto">
          {/* Title Row & Action Button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Delivery Partners
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Manage partner profiles, customer assignments, cylinder custody, and delivery operations.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddPartnerModal(true)}
              className="bg-[#BC0118] hover:bg-red-800 active:scale-98 text-white font-bold text-xs sm:text-sm px-4.5 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Delivery Partner</span>
            </button>
          </div>

          {/* 4 Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: TOTAL PARTNERS */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Total Partners
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-slate-900">5</span>
                <span className="text-xs font-medium text-slate-400">/ 8 registered</span>
              </div>
              <div className="flex items-center gap-2 pt-1 text-xs">
                <span className="text-slate-500 font-medium">Active partner</span>
                <span className="bg-emerald-100 text-emerald-700 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  +1 this month
                </span>
              </div>
            </div>

            {/* Card 2: ACTIVE PARTNERS */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Active Partners
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <UserCheck className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">5</span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  100% Authorized
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium pt-1">
                Currently verified and on-duty today
              </p>
            </div>

            {/* Card 3: HOLDING CYLINDERS */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Holding Cylinders
                </span>
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                  <Package className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-slate-900">4</span>
                <span className="text-xs font-medium text-slate-500">partners holding</span>
              </div>
              <div className="flex items-center gap-1.5 pt-1 text-xs font-bold">
                <span className="text-[#BC0118]">27 Filled</span>
                <span className="text-slate-300">·</span>
                <span className="text-slate-700">29 Empty</span>
              </div>
            </div>

            {/* Card 4: SETTLEMENTS REVIEW */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Settlements Review
                </span>
                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
                  <Wallet className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">2</span>
                <span className="bg-red-100 text-red-700 text-[11px] font-bold px-2 py-0.5 rounded-md">
                  Action Req.
                </span>
              </div>
              <div className="flex items-center gap-1.5 pt-1 text-xs font-bold">
                <span className="text-[#BC0118]">1 Discrepancy</span>
                <span className="text-slate-300">·</span>
                <span className="text-slate-500 font-medium">1 Pending Closing</span>
              </div>
            </div>
          </div>

          {/* Search, Actions & Filter Controls Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-xl">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by partner name, ID, or phone number..."
                  className="w-full bg-[#F1F4FA] rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              {/* Action Buttons to the right */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 active:scale-98 text-xs font-bold text-slate-700 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Clear Filters</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowIssueModal(true)}
                  className="px-3.5 py-2.5 bg-white border border-red-200 text-[#BC0118] hover:bg-red-50/50 active:scale-98 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>+ Issue Cylinders</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="px-3.5 py-2.5 bg-[#EEF2F8] hover:bg-slate-200 active:scale-98 text-xs font-bold text-slate-800 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-700" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Filter Dropdowns Row */}
            <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
              <span className="font-extrabold text-[11px] text-slate-400 uppercase tracking-wider mr-1">
                Filters:
              </span>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-[#F1F4FA] hover:bg-slate-200 text-slate-800 font-bold px-3.5 py-2 pr-7 rounded-xl text-xs appearance-none focus:outline-none cursor-pointer"
                >
                  <option value="All">Status: All</option>
                  <option value="Active">Status: Active</option>
                  <option value="Standby">Status: Standby</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Area Filter */}
              <div className="relative">
                <select
                  value={areaFilter}
                  onChange={(e) => setAreaFilter(e.target.value)}
                  className="bg-[#F1F4FA] hover:bg-slate-200 text-slate-800 font-bold px-3.5 py-2 pr-7 rounded-xl text-xs appearance-none focus:outline-none cursor-pointer"
                >
                  <option value="All Areas">Area: All Areas</option>
                  <option value="Anna Nagar">Anna Nagar</option>
                  <option value="K.K. Nagar">K.K. Nagar</option>
                  <option value="Simmakkal">Simmakkal</option>
                  <option value="Commercial Hub">Commercial Hub</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Assignment Filter */}
              <div className="relative">
                <select
                  value={assignmentFilter}
                  onChange={(e) => setAssignmentFilter(e.target.value)}
                  className="bg-[#F1F4FA] hover:bg-slate-200 text-slate-800 font-bold px-3.5 py-2 pr-7 rounded-xl text-xs appearance-none focus:outline-none cursor-pointer"
                >
                  <option value="All">Assignment: All</option>
                  <option value="Assigned">Assigned Customers</option>
                  <option value="Unassigned">Zero Customers</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Custody Filter */}
              <div className="relative">
                <select
                  value={custodyFilter}
                  onChange={(e) => setCustodyFilter(e.target.value)}
                  className="bg-[#F1F4FA] hover:bg-slate-200 text-slate-800 font-bold px-3.5 py-2 pr-7 rounded-xl text-xs appearance-none focus:outline-none cursor-pointer"
                >
                  <option value="All">Custody: All</option>
                  <option value="Holding Cylinders">Holding Cylinders</option>
                  <option value="No Cylinders">No Cylinders</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Settlement Filter */}
              <div className="relative">
                <select
                  value={settlementFilter}
                  onChange={(e) => setSettlementFilter(e.target.value)}
                  className="bg-[#F1F4FA] hover:bg-slate-200 text-slate-800 font-bold px-3.5 py-2 pr-7 rounded-xl text-xs appearance-none focus:outline-none cursor-pointer"
                >
                  <option value="All">Settlement: All</option>
                  <option value="Action Required">Action Req.</option>
                  <option value="Settled">Settled</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Main 2-Column Section: Table on Left + Detail Drawer on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Partners Table */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-200/80 text-[10px] font-bold uppercase text-slate-400 tracking-wider bg-slate-50/50">
                      <th className="py-4 pl-6 min-w-[170px]">Partner</th>
                      <th className="py-4 text-center min-w-[90px]">ID</th>
                      <th className="py-4 min-w-[150px]">Phone</th>
                      <th className="py-4 min-w-[130px]">Area</th>
                      <th className="py-4 text-center min-w-[90px]">Customers</th>
                      <th className="py-4 text-center pr-6 min-w-[100px]">Filled</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPartners.map((partner) => {
                      const isSelected = partner.id === selectedPartnerId;
                      return (
                        <tr
                          key={partner.id}
                          onClick={() => setSelectedPartnerId(partner.id)}
                          className={`hover:bg-slate-50/80 transition cursor-pointer select-none ${
                            isSelected ? 'bg-red-50/30 ring-1 ring-inset ring-red-200' : ''
                          }`}
                        >
                          {/* Partner Avatar, Name, Joined Date */}
                          <td className="py-4 pl-6">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-full ${partner.avatarBg} ${partner.avatarText} font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs`}
                              >
                                {partner.initials}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-extrabold text-slate-900 text-sm">
                                    {partner.name}
                                  </span>
                                  {partner.hasWarning && (
                                    <AlertTriangle className="w-4 h-4 text-red-500 fill-red-100 stroke-[2.2]" />
                                  )}
                                </div>
                                <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                                  {partner.joinedDate}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* ID Badge */}
                          <td className="py-4 text-center">
                            <span className="inline-block px-2.5 py-1 rounded-lg bg-[#EEF2F8] text-slate-800 font-extrabold text-xs">
                              {partner.code}
                            </span>
                          </td>

                          {/* Phone + Copy icon */}
                          <td className="py-4">
                            <button
                              type="button"
                              onClick={(e) => handleCopyPhone(partner.phone, e)}
                              className="group flex items-center gap-1.5 text-slate-700 hover:text-slate-950 font-semibold transition"
                              title="Copy phone"
                            >
                              <span>{partner.phone}</span>
                              <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition" />
                            </button>
                          </td>

                          {/* Area */}
                          <td className="py-4 font-bold text-slate-900">
                            {partner.isStandbyArea ? (
                              <span className="inline-block px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-semibold text-xs">
                                {partner.area}
                              </span>
                            ) : (
                              partner.area
                            )}
                          </td>

                          {/* Customers Count */}
                          <td className="py-4 text-center font-black text-sm text-[#BC0118]">
                            {partner.customersCount}
                          </td>

                          {/* Filled Custody Badge */}
                          <td className="py-4 text-center pr-6">
                            {partner.filledCylinders > 0 ? (
                              <span className="inline-block px-2.5 py-1 rounded-lg bg-red-100 text-[#BC0118] font-bold text-xs">
                                {partner.filledCylinders} filled
                              </span>
                            ) : (
                              <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 font-bold text-xs">
                                0 filled
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table Pagination Footer */}
              <div className="p-4 px-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-500">
                <span>
                  Showing <strong className="text-slate-800">1</strong> to{' '}
                  <strong className="text-slate-800">{filteredPartners.length}</strong> of{' '}
                  <strong className="text-slate-800">{filteredPartners.length}</strong> delivery partners
                </span>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span>Rows per page:</span>
                    <select className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-800 font-bold focus:outline-none">
                      <option>10 per page</option>
                      <option>25 per page</option>
                      <option>50 per page</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled
                      className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-300 disabled:opacity-40"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      className="w-8 h-8 rounded-lg bg-[#BC0118] text-white font-bold flex items-center justify-center shadow-xs"
                    >
                      1
                    </button>
                    <button
                      type="button"
                      disabled
                      className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-300 disabled:opacity-40"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Selected Partner Detail Drawer */}
            <div className="lg:col-span-4 bg-white rounded-[24px] p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-5 sticky top-24">
              {/* Partner Card Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-2xl ${selectedPartner.avatarBg} ${selectedPartner.avatarText} font-black text-lg flex items-center justify-center shrink-0 shadow-2xs`}
                  >
                    {selectedPartner.initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-slate-900 tracking-tight">
                        {selectedPartner.name}
                      </h3>
                      <span className="bg-red-50 text-red-700 border border-red-200 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                        {selectedPartner.code}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedPartner.area}</span>
                      <span className="text-slate-300">·</span>
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        {selectedPartner.status}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => triggerToast(`Opening profile for ${selectedPartner.name}`)}
                  className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer transition"
                  title="Open Partner Details"
                >
                  <ExternalLink className="w-5 h-5" />
                </button>
              </div>

              {/* Today's Delivery Stat Banner */}
              <div className="bg-[#EDF4FF] rounded-2xl p-4">
                <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Today&apos;s Delivery
                </span>
                <span className="text-3xl font-black text-slate-900 mt-0.5 block">
                  {selectedPartner.todayDeliveries}
                </span>
              </div>

              {/* 3 Tab Switcher */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDetailTab('Custody Ledger')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer text-center ${
                    detailTab === 'Custody Ledger'
                      ? 'bg-[#101828] text-white shadow-xs'
                      : 'bg-[#F1F4FA] text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Custody Ledger
                </button>
                <button
                  type="button"
                  onClick={() => setDetailTab('Customers')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer text-center ${
                    detailTab === 'Customers'
                      ? 'bg-[#101828] text-white shadow-xs'
                      : 'bg-[#F1F4FA] text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Customers ({selectedPartner.customersCount})
                </button>
                <button
                  type="button"
                  onClick={() => setDetailTab('Settlement')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer text-center ${
                    detailTab === 'Settlement'
                      ? 'bg-[#101828] text-white shadow-xs'
                      : 'bg-[#F1F4FA] text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Settlement
                </button>
              </div>

              {/* 2 Side-by-Side Van Custody Cards */}
              <div className="grid grid-cols-2 gap-3">
                {/* Left Card: Current Filled In Van */}
                <div className="bg-[#FFF5F5] border border-red-100 rounded-2xl p-4 space-y-1">
                  <span className="text-xs font-bold text-red-500 block">Current Filled In Van</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-[#BC0118]">
                      {selectedPartner.filledCylinders}
                    </span>
                    <span className="text-sm font-bold text-slate-900">Cylinders</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium block">
                    19kg Commercial
                  </span>
                </div>

                {/* Right Card: Picked Empty In Van */}
                <div className="bg-[#F4F7FB] border border-slate-100 rounded-2xl p-4 space-y-1">
                  <span className="text-xs font-bold text-slate-500 block">Picked Empty In Van</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-slate-900">
                      {selectedPartner.emptyCylinders}
                    </span>
                    <span className="text-sm font-bold text-slate-900">Cylinders</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium block">
                    Pending Depot Unload
                  </span>
                </div>
              </div>

              {/* Active Gate Pass Card */}
              <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                    Active Gate Pass
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                    Confirmed
                  </span>
                </div>

                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-sm font-black text-slate-900 block">
                      {selectedPartner.activeGatePass?.code || '#GP-1094'}
                    </span>
                    <span className="text-xs text-slate-400 font-medium block mt-0.5">
                      {selectedPartner.activeGatePass?.issuedAt || 'Issued today at 08:15 AM'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-slate-900 block">
                      {selectedPartner.activeGatePass?.loadedUnits || 25} Loaded
                    </span>
                    <span className="text-xs text-slate-400 font-medium block mt-0.5">
                      {selectedPartner.activeGatePass?.operator || 'Gate Operator: S. Raman'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Custody Logs */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                  Recent Custody Logs
                </span>

                {selectedPartner.custodyLogs.length > 0 ? (
                  selectedPartner.custodyLogs.map((log) => (
                    <div
                      key={log.id}
                      className="bg-[#F4F8FA] rounded-xl p-3 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                          <Package className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block text-xs">
                            {log.action}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {log.customer} · {log.time}
                          </span>
                        </div>
                      </div>
                      <span className="text-emerald-700 font-extrabold text-xs text-right shrink-0">
                        {log.changeText}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                    No recent custody transactions recorded for this partner today.
                  </div>
                )}
              </div>

              {/* Bottom Issue New Gate Pass Button */}
              <button
                type="button"
                onClick={() => setShowIssueModal(true)}
                className="w-full bg-[#101828] hover:bg-slate-800 active:scale-98 text-white font-bold text-sm py-3.5 rounded-2xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4 stroke-[2.2]" />
                <span>Issue New Gate Pass</span>
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Modal 1: Add Delivery Partner */}
      {showAddPartnerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-lg w-full shadow-2xl border border-slate-100 p-7 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Add Delivery Partner
                </h3>
                <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-1">
                  Onboard a new authorized delivery driver to the agency fleet
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddPartnerModal(false)}
                className="text-slate-900 hover:text-slate-600 p-1 cursor-pointer transition"
                title="Close"
              >
                <X className="w-6 h-6 stroke-[1.8]" />
              </button>
            </div>

            <div className="border-b border-slate-200/80 my-2" />

            <form onSubmit={handleSaveNewPartner} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newPartnerName}
                  onChange={(e) => setNewPartnerName(e.target.value)}
                  placeholder="eg. Ramesh Kumar"
                  className="w-full bg-[#F1F4FA] rounded-2xl px-5 py-3.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2">
                  Phone Number *
                </label>
                <input
                  type="text"
                  required
                  value={newPartnerPhone}
                  onChange={(e) => setNewPartnerPhone(e.target.value)}
                  placeholder="eg. +91 98401 22340"
                  className="w-full bg-[#F1F4FA] rounded-2xl px-5 py-3.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2">
                    Assigned Route / Area
                  </label>
                  <select
                    value={newPartnerArea}
                    onChange={(e) => setNewPartnerArea(e.target.value)}
                    className="w-full bg-[#F1F4FA] rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none cursor-pointer"
                  >
                    <option value="Anna Nagar">Anna Nagar</option>
                    <option value="K.K. Nagar">K.K. Nagar</option>
                    <option value="Simmakkal">Simmakkal</option>
                    <option value="Commercial Hub">Commercial Hub</option>
                    <option value="Standby / Buffer">Standby / Buffer</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2">
                    Max Cylinder Cap
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newPartnerCapacity}
                    onChange={(e) => setNewPartnerCapacity(e.target.value)}
                    className="w-full bg-[#F1F4FA] rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none"
                    placeholder="30"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2">
                  Vehicle Type
                </label>
                <select
                  value={newPartnerVehicle}
                  onChange={(e) => setNewPartnerVehicle(e.target.value)}
                  className="w-full bg-[#F1F4FA] rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none cursor-pointer"
                >
                  <option value="Three-Wheeler Auto Van">Three-Wheeler Auto Van</option>
                  <option value="Mini Truck / Tata Ace">Mini Truck / Tata Ace</option>
                  <option value="Two-Wheeler Carrier">Two-Wheeler Carrier</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddPartnerModal(false)}
                  className="bg-[#EEF2F8] hover:bg-slate-200 active:scale-98 text-slate-800 font-bold text-sm px-6 py-3 rounded-2xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#BC0118] hover:bg-red-800 active:scale-98 text-white font-bold text-sm px-6 py-3 rounded-2xl shadow-xs transition cursor-pointer"
                >
                  Save Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Quick Issue Cylinders to Partner */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-lg w-full shadow-2xl border border-slate-100 p-7 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Issue Cylinders to Partner
                </h3>
                <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-1">
                  Assign filled stock and generate gate pass for {selectedPartner.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowIssueModal(false)}
                className="text-slate-900 hover:text-slate-600 p-1 cursor-pointer transition"
                title="Close"
              >
                <X className="w-6 h-6 stroke-[1.8]" />
              </button>
            </div>

            <div className="border-b border-slate-200/80 my-2" />

            <form onSubmit={handleIssueSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2">
                  Delivery Partner
                </label>
                <div className="bg-[#F1F4FA] rounded-2xl px-5 py-3.5 text-sm font-bold text-slate-900">
                  {selectedPartner.name} ({selectedPartner.code}) · {selectedPartner.area}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2">
                    Cylinder Type
                  </label>
                  <select
                    value={issueSize}
                    onChange={(e) => setIssueSize(e.target.value)}
                    className="w-full bg-[#F1F4FA] rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none cursor-pointer"
                  >
                    <option value="14.2 kg Domestic (Red)">14.2 kg Domestic (Red)</option>
                    <option value="19.5 kg Commercial (Red)">19.5 kg Commercial (Red)</option>
                    <option value="47.5 kg Industrial (Blue)">47.5 kg Industrial (Blue)</option>
                    <option value="5 kg Domestic (Red)">5 kg Domestic (Red)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={issueQuantity}
                    onChange={(e) => setIssueQuantity(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-[#F1F4FA] rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none"
                    placeholder="10"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="bg-[#EEF2F8] hover:bg-slate-200 active:scale-98 text-slate-800 font-bold text-sm px-6 py-3 rounded-2xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#BC0118] hover:bg-red-800 active:scale-98 text-white font-bold text-sm px-6 py-3 rounded-2xl shadow-xs transition cursor-pointer flex items-center gap-2"
                >
                  <Printer className="w-4 h-4 stroke-[2.2]" />
                  <span>Issue &amp; Print Pass</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Action Toast Feedback */}
      {actionToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
          <span>{actionToast}</span>
        </div>
      )}
    </div>
  );
}
