'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  ArrowLeft,
  ShieldAlert,
  Building2,
  QrCode,
  Smartphone,
  FileText,
  Calendar,
  Truck,
  User,
  Shield,
  Camera,
  Layers,
  CreditCard,
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

const initialPartners: PartnerRecord[] = [];

interface AdminDeliveryPartnersPageProps {
  initialViewMode?: 'list' | 'add';
}

export default function AdminDeliveryPartnersPage({
  initialViewMode = 'list',
}: AdminDeliveryPartnersPageProps) {
  const [viewMode, setViewMode] = useState<'list' | 'add'>(initialViewMode);
  const [partners, setPartners] = useState<PartnerRecord[]>(initialPartners);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');

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

  // Quick Issue Modal State
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueSize, setIssueSize] = useState('14.2 kg Domestic (Red)');
  const [issueQuantity, setIssueQuantity] = useState(10);

  // Full Onboard Partner Form State (Prefilled matching exact attached design)
  const [onboardFullName, setOnboardFullName] = useState('Ramsen Varma');
  const [onboardPrimaryPhone, setOnboardPrimaryPhone] = useState('98401 54321');
  const [onboardEmergencyPhone, setOnboardEmergencyPhone] = useState('94432 98765');
  const [onboardDob, setOnboardDob] = useState('06/14/1989');
  const [onboardAadhaar, setOnboardAadhaar] = useState('5421-8902-7314');
  const [onboardLicense, setOnboardLicense] = useState('TN-59-2019-003819');
  const [onboardAddress, setOnboardAddress] = useState(
    '14/23 West Veli Street, Near Old Bus Stand, Simmakkal, Madurai - 625001'
  );
  const [onboardBeat, setOnboardBeat] = useState('Simmakkal Route (Old City Commercial)');
  const [onboardEffectiveDate, setOnboardEffectiveDate] = useState('08/16/2026');
  const [onboardVehicleType, setOnboardVehicleType] = useState('Commercial Van (30 cyl capacity)');
  const [onboardPlateNumber, setOnboardPlateNumber] = useState('TN 58 AX 4821');
  const [onboardCustodyLimit, setOnboardCustodyLimit] = useState('30');
  const [onboardHandoverDock, setOnboardHandoverDock] = useState(
    'Madurai Central Depot - Bay A (Three-wheeler)'
  );
  const [onboardGrantAppAccess, setOnboardGrantAppAccess] = useState(true);
  const [onboardSendOtpSms, setOnboardSendOtpSms] = useState(true);
  const [onboardIndemnityBond, setOnboardIndemnityBond] = useState(true);
  const [onboardCashLimit, setOnboardCashLimit] = useState('50,000');

  useEffect(() => {
    let isMounted = true;
    interface DriverApiRecord {
      id: string;
      code: string;
      name: string;
      phone: string;
      altPhone?: string | null;
      address?: string | null;
      bloodGroup?: string | null;
      status: string;
      joiningDate?: string | null;
      filledCylinders?: number;
      emptyCylinders?: number;
      todayDeliveries?: number;
    }

    fetch('/api/drivers')
      .then((res) => res.json())
      .then((json) => {
        if (!isMounted) return;
        if (json?.success && json?.data?.partners?.length) {
          const apiPartners: PartnerRecord[] = json.data.partners.map((p: DriverApiRecord) => {
            const initials = p.name
              ? p.name
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase()
              : 'DP';

            return {
              id: p.code || p.id,
              name: p.name,
              code: p.code,
              initials,
              avatarBg: 'bg-red-100',
              avatarText: 'text-[#BC0118]',
              joinedDate: p.joiningDate
                ? `Joined ${new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(p.joiningDate))}`
                : 'Joined 2024',
              phone: p.phone,
              area: p.address?.split(',')?.[0] || 'Central Madurai',
              customersCount: 30,
              filledCylinders: p.filledCylinders || 0,
              emptyCylinders: p.emptyCylinders || 0,
              status: p.status === 'SUSPENDED' ? 'On Leave' : (p.status === 'OFF_DUTY' ? 'Standby' : 'Active'),
              hasWarning: false,
              todayDeliveries: p.todayDeliveries || 0,
              activeGatePass: {
                code: `#GP-${p.code.replace('DP-', '')}01`,
                issuedAt: 'Gate Pass Active',
                loadedUnits: p.filledCylinders || 0,
                operator: 'Gate Operator: S. Raman',
                status: 'Confirmed',
              },
              custodyLogs: [],
            };
          });

          setPartners(apiPartners);
          if (apiPartners.length > 0) {
            setSelectedPartnerId((prevId) => {
              if (prevId && apiPartners.some((p) => p.id === prevId || p.code === prevId)) {
                return prevId;
              }
              return apiPartners[0].id;
            });
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load drivers from API:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const triggerToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 3000);
  };

  const selectedPartner = useMemo(() => {
    return partners.find((p) => p.id === selectedPartnerId || p.code === selectedPartnerId) || partners[0] || null;
  }, [partners, selectedPartnerId]);

  // Filtering Logic
  const filteredPartners = useMemo(() => {
    const list = partners.filter((p) => {
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

    const seen = new Set<string>();
    return list.filter((p) => {
      const key = (p.id || p.code).toUpperCase();
      if (seen.has(key)) return false;
      seen.add(key);
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

  // Submit the Full Onboarding form
  const handleCompleteOnboardPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardFullName.trim()) return;

    try {
      const res = await fetch('/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: onboardFullName.trim(),
          phone: `+91 ${onboardPrimaryPhone.trim().replace(/^\+91\s*/, '')}`,
          altPhone: onboardEmergencyPhone ? `+91 ${onboardEmergencyPhone.trim().replace(/^\+91\s*/, '')}` : null,
          address: onboardAddress,
          bloodGroup: 'O+ (Rh Pos)',
        }),
      });

      const json = await res.json();
      if (json.success && json.data?.partner) {
        const p = json.data.partner;
        const initials = onboardFullName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase();

        const created: PartnerRecord = {
          id: p.partnerCode || p.id,
          name: p.name,
          code: p.partnerCode,
          initials: initials || 'DP',
          avatarBg: 'bg-red-100',
          avatarText: 'text-[#BC0118]',
          joinedDate: 'Joined Just Now',
          phone: p.phone,
          area: 'Simmakkal',
          customersCount: 24,
          filledCylinders: 0,
          emptyCylinders: 0,
          status: 'Active',
          hasWarning: false,
          todayDeliveries: 0,
          activeGatePass: {
            code: '#GP-1096',
            issuedAt: 'Pending Shift First Issue',
            loadedUnits: 0,
            operator: 'Gate Operator: S. Raman',
            status: 'Pending',
          },
          custodyLogs: [
            {
              id: 'log-onboard',
              action: 'Driver Onboarded & Verified',
              customer: 'Madurai Central Depot',
              time: 'Just Now',
              changeText: 'Credentials Activated in Database',
            },
          ],
        };

        setPartners((prev) => {
          const uniqueKey = (p.partnerCode || p.id).toUpperCase();
          const cleanPrev = prev.filter((item) => (item.code || item.id).toUpperCase() !== uniqueKey);
          return [created, ...cleanPrev];
        });
        setSelectedPartnerId(created.id);
        setViewMode('list');
        triggerToast(`Partner ${p.name} (${p.partnerCode}) successfully onboarded and saved to database!`);
        return;
      } else if (json.error) {
        alert(json.error);
        return;
      }
    } catch (err) {
      console.error('Failed to save partner to database:', err);
    }

    const newCode = `DP-${String(partners.length + 6).padStart(3, '0')}`;
    const initials = onboardFullName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const created: PartnerRecord = {
      id: newCode,
      name: onboardFullName.trim(),
      code: newCode,
      initials: initials || 'RV',
      avatarBg: 'bg-red-100',
      avatarText: 'text-[#BC0118]',
      joinedDate: 'Joined Just Now',
      phone: `+91 ${onboardPrimaryPhone.trim()}`,
      area: 'Simmakkal',
      customersCount: 24,
      filledCylinders: 0,
      emptyCylinders: 0,
      status: 'Active',
      hasWarning: false,
      todayDeliveries: 0,
      activeGatePass: {
        code: '#GP-1096',
        issuedAt: 'Pending Shift First Issue',
        loadedUnits: 0,
        operator: 'Gate Operator: S. Raman',
        status: 'Pending',
      },
      custodyLogs: [
        {
          id: 'log-onboard',
          action: 'Driver Onboarded & Verified',
          customer: 'Madurai Central Depot',
          time: 'Just Now',
          changeText: 'Credentials Activated',
        },
      ],
    };

    setPartners((prev) => {
      const cleanPrev = prev.filter((item) => (item.code || item.id).toUpperCase() !== newCode.toUpperCase());
      return [created, ...cleanPrev];
    });
    setSelectedPartnerId(newCode);
    setViewMode('list');
    triggerToast(`Partner ${onboardFullName} (${newCode}) successfully onboarded!`);
  };

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartner) return;
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
            <span
              onClick={() => setViewMode('list')}
              className="font-bold text-slate-800 cursor-pointer hover:underline"
            >
              Delivery Partners
            </span>
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

        {/* VIEW 1: Full Onboard New Delivery Partner View (Matching exact attached Figma design) */}
        {viewMode === 'add' ? (
          <form onSubmit={handleCompleteOnboardPartner} className="flex-1 flex flex-col justify-between min-h-0">
            <main className="p-6 sm:p-8 space-y-6 max-w-[1600px] w-full mx-auto pb-8">
              {/* Top Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className="flex items-center gap-1.5 text-sm font-bold text-slate-800 hover:text-slate-950 transition cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                    <span>Back to Delivery Partners</span>
                  </button>

                  <span className="text-slate-300">·</span>

                  <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold text-xs">
                    <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                    <span>ID: DP-006 (Auto-assigned)</span>
                  </div>

                  <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                    <span>Draft / Pending Verification</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCompleteOnboardPartner}
                    className="px-5 py-2.5 bg-[#BC0118] hover:bg-red-800 active:scale-98 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4 stroke-[2.2]" />
                    <span>Onboard &amp; Authorize Partner</span>
                  </button>
                </div>
              </div>

              {/* Banner Section */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-red-700 tracking-wider uppercase">
                  <Truck className="w-4 h-4 text-red-600 stroke-[2.2]" />
                  <span>FLEET LOGISTICS / DRIVER AUTHORIZATION MODULE</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Onboard New Delivery Partner
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-4xl">
                  Register a new field delivery executive, configure vehicle &amp; route beat, assign cylinder custody limits, and grant driver app terminal access for live dispatch cycles.
                </p>
              </div>

              {/* Main Form 2-Column Split */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Side Cards (~30% width: cols 4) */}
                <div className="lg:col-span-4 space-y-5">
                  {/* Card 1: Partner Identity Photo */}
                  <div className="bg-white rounded-[24px] p-6 border border-slate-200/90 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-extrabold text-slate-900">Partner Identity Photo</h3>
                      <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[10px] px-2 py-0.5 rounded-md">
                        Required
                      </span>
                    </div>

                    <div className="bg-[#EDF4FF] rounded-2xl p-6 text-center space-y-3 border border-blue-100/60">
                      <div className="w-24 h-24 rounded-full mx-auto overflow-hidden bg-slate-200 border-3 border-white shadow-sm flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80"
                          alt="Delivery Partner Driver"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          Click or drag partner photo here
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                          Clear frontal photo for mobile terminal badge &amp; customer SMS notification
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => triggerToast('Opening camera/file upload dialog')}
                        className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs px-4 py-2 rounded-xl shadow-2xs transition inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5 text-slate-600" />
                        <span>Replace Photo (JPG, PNG max 5MB)</span>
                      </button>
                    </div>

                    {/* Terminal Badge Preview */}
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#BC0118] text-white font-black text-[10px] flex items-center justify-center shrink-0">
                          SG
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">
                            Terminal Badge Preview
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium block">
                            Madurai Central Division
                          </span>
                        </div>
                      </div>
                      <QrCode className="w-6 h-6 text-slate-600" />
                    </div>
                  </div>

                  {/* Card 2: Onboarding Clearance */}
                  <div className="bg-white rounded-[24px] p-6 border border-slate-200/90 shadow-2xs space-y-3.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-extrabold text-slate-900">Onboarding Clearance</h3>
                      <span className="text-xs text-slate-400 font-bold">2 of 4 Steps Ready</span>
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">
                            1. Demographic &amp; Contact KYC
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium block">
                            Name, phone, and Aadhaar national identity check
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">
                            2. Commercial Driving License (LMV)
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium block">
                            Valid LMV/HMV permit for hazardous material transit
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 text-transparent flex items-center justify-center shrink-0 mt-0.5"></div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">
                            3. Vehicle &amp; Safe Cylinder Cap
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium block">
                            Route allocation and custody capacity thresholding
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Cylinder Custody Regulation */}
                  <div className="bg-[#EEF3FB] rounded-[24px] p-5 border border-blue-100 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-red-600 font-bold">
                      <ShieldAlert className="w-4 h-4 stroke-[2.2]" />
                      <span className="text-slate-900 font-extrabold">Cylinder Custody Regulation</span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                      Every authorized driver requires verified commercial driving license and signed physical indemnity bond before cylinder custody can be transferred. Terminal seat caps are bound to terminal credentials.
                    </p>
                  </div>

                  {/* Card 4: DEFAULT TRANSIT GATE */}
                  <div className="bg-white rounded-[24px] p-5 border border-slate-200/90 shadow-2xs space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      DEFAULT TRANSIT GATE
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-100 text-[#BC0118] flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-extrabold text-slate-900 block">
                          Madurai Central Depot
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium block">
                          Primary Dock Bay 01 (LPG Pressurized)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side Main Form (~70% width: cols 8) */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Section 1: Personal & Identification (KYC) */}
                  <div className="bg-white rounded-[24px] p-7 border border-slate-200/90 shadow-2xs space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-red-100 text-[#BC0118] font-black text-xs flex items-center justify-center shrink-0">
                          1
                        </div>
                        <div>
                          <h2 className="text-base font-extrabold text-slate-900">
                            Personal &amp; Identification (KYC)
                          </h2>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            Verified legal identity for field driver credentialing
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md uppercase">
                        Mandatory
                      </span>
                    </div>

                    <div className="space-y-4">
                      {/* Full Legal Name */}
                      <div>
                        <label className="text-xs font-bold text-slate-900 block mb-2">
                          Full Legal Name *
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            value={onboardFullName}
                            onChange={(e) => setOnboardFullName(e.target.value)}
                            placeholder="Ramsen Varma"
                            className="w-full bg-[#F1F4FA] rounded-2xl pl-11 pr-5 py-3.5 text-sm sm:text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                          />
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium block mt-1">
                          Must match driving license and national identity documents
                        </span>
                      </div>

                      {/* Row 2: Phone Numbers */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-900 block mb-2">
                            Primary Mobile Number *
                          </label>
                          <div className="flex gap-2">
                            <span className="px-3.5 py-3.5 bg-[#F1F4FA] rounded-2xl text-xs font-bold text-slate-700 flex items-center justify-center">
                              +91
                            </span>
                            <input
                              type="text"
                              required
                              value={onboardPrimaryPhone}
                              onChange={(e) => setOnboardPrimaryPhone(e.target.value)}
                              placeholder="98401 54321"
                              className="w-full bg-[#F1F4FA] rounded-2xl px-5 py-3.5 text-sm sm:text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                            />
                          </div>
                          <span className="text-[11px] text-slate-400 font-medium block mt-1">
                            Used for Driver Mobile Terminal OTP authentication.
                          </span>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-900 block mb-2">
                            Alternate / Emergency Contact
                          </label>
                          <div className="flex gap-2">
                            <span className="px-3.5 py-3.5 bg-[#F1F4FA] rounded-2xl text-xs font-bold text-slate-700 flex items-center justify-center">
                              +91
                            </span>
                            <input
                              type="text"
                              value={onboardEmergencyPhone}
                              onChange={(e) => setOnboardEmergencyPhone(e.target.value)}
                              placeholder="94432 98765"
                              className="w-full bg-[#F1F4FA] rounded-2xl px-5 py-3.5 text-sm sm:text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                            />
                          </div>
                          <span className="text-[11px] text-slate-400 font-medium block mt-1">
                            Depot emergency dispatcher broadcast line.
                          </span>
                        </div>
                      </div>

                      {/* Row 3: DOB & Aadhaar */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-900 block mb-2">
                            Date of Birth *
                          </label>
                          <div className="relative">
                            <Calendar className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={onboardDob}
                              onChange={(e) => setOnboardDob(e.target.value)}
                              placeholder="06/14/1989"
                              className="w-full bg-[#F1F4FA] rounded-2xl pl-11 pr-5 py-3.5 text-sm sm:text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                            />
                          </div>
                          <span className="text-[11px] text-slate-400 font-medium block mt-1">
                            Driver must be at least 21 years old.
                          </span>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-900 block mb-2">
                            Aadhaar / National ID Number *
                          </label>
                          <div className="relative">
                            <CreditCard className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={onboardAadhaar}
                              onChange={(e) => setOnboardAadhaar(e.target.value)}
                              placeholder="5421-8902-7314"
                              className="w-full bg-[#F1F4FA] rounded-2xl pl-11 pr-5 py-3.5 text-sm sm:text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                            />
                          </div>
                          <span className="text-[11px] text-slate-400 font-medium block mt-1">
                            Required for statutory cylinder tracking compliance.
                          </span>
                        </div>
                      </div>

                      {/* Commercial Driving License */}
                      <div>
                        <label className="text-xs font-bold text-slate-900 block mb-2">
                          Commercial Driving License No. *
                        </label>
                        <div className="relative">
                          <FileText className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            value={onboardLicense}
                            onChange={(e) => setOnboardLicense(e.target.value)}
                            placeholder="TN-59-2019-003819"
                            className="w-full bg-[#F1F4FA] rounded-2xl pl-11 pr-5 py-3.5 text-sm sm:text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                          />
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium block mt-1">
                          Verified against Tamil Nadu transport portal.
                        </span>
                      </div>

                      {/* Permanent Residential Address */}
                      <div>
                        <label className="text-xs font-bold text-slate-900 block mb-2">
                          Permanent Residential Address
                        </label>
                        <input
                          type="text"
                          value={onboardAddress}
                          onChange={(e) => setOnboardAddress(e.target.value)}
                          placeholder="14/23 West Veli Street, Near Old Bus Stand, Simmakkal, Madurai - 625001"
                          className="w-full bg-[#F1F4FA] rounded-2xl px-5 py-3.5 text-sm sm:text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                        />
                        <span className="text-[11px] text-slate-400 font-medium block mt-1">
                          Local residency verified for beat allocation.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Route Beat & Vehicle Custody */}
                  <div className="bg-white rounded-[24px] p-7 border border-slate-200/90 shadow-2xs space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-red-100 text-[#BC0118] font-black text-xs flex items-center justify-center shrink-0">
                          2
                        </div>
                        <div>
                          <h2 className="text-base font-extrabold text-slate-900">
                            Route Beat &amp; Vehicle Custody
                          </h2>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            Assign geographic boundaries, delivery vehicle, and hard custody thresholds
                          </p>
                        </div>
                      </div>
                      <Layers className="w-5 h-5 text-slate-400" />
                    </div>

                    <div className="space-y-4">
                      {/* Row: Beat & Effective Date */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-900 block mb-2">
                            Primary Delivery Beat / Sector *
                          </label>
                          <div className="relative">
                            <MapPin className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                            <select
                              value={onboardBeat}
                              onChange={(e) => setOnboardBeat(e.target.value)}
                              className="w-full bg-[#F1F4FA] rounded-2xl pl-11 pr-10 py-3.5 text-sm sm:text-base font-bold text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer"
                            >
                              <option value="Simmakkal Route (Old City Commercial)">
                                Simmakkal Route (Old City Commercial)
                              </option>
                              <option value="Anna Nagar Route (Zone 1 Residential)">
                                Anna Nagar Route (Zone 1 Residential)
                              </option>
                              <option value="K.K. Nagar Route (Zone 2 Commercial)">
                                K.K. Nagar Route (Zone 2 Commercial)
                              </option>
                              <option value="Commercial Hub Special Dispatch">
                                Commercial Hub Special Dispatch
                              </option>
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                          <span className="text-[11px] text-slate-400 font-medium block mt-1">
                            Defines active customer dispatch order routing in Driver App.
                          </span>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-900 block mb-2">
                            Shift Effective Date *
                          </label>
                          <div className="relative">
                            <Calendar className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={onboardEffectiveDate}
                              onChange={(e) => setOnboardEffectiveDate(e.target.value)}
                              placeholder="08/16/2026"
                              className="w-full bg-[#F1F4FA] rounded-2xl pl-11 pr-5 py-3.5 text-sm sm:text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                            />
                          </div>
                          <span className="text-[11px] text-slate-400 font-medium block mt-1">
                            First active gate pass generation date.
                          </span>
                        </div>
                      </div>

                      {/* Row: Vehicle Type & Registration Plate */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-900 block mb-2">
                            Assigned Vehicle Type *
                          </label>
                          <div className="relative">
                            <Truck className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                            <select
                              value={onboardVehicleType}
                              onChange={(e) => setOnboardVehicleType(e.target.value)}
                              className="w-full bg-[#F1F4FA] rounded-2xl pl-11 pr-10 py-3.5 text-sm sm:text-base font-bold text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer"
                            >
                              <option value="Commercial Van (30 cyl capacity)">
                                Commercial Van (30 cyl capacity)
                              </option>
                              <option value="Mini Truck / Tata Ace (50 cyl capacity)">
                                Mini Truck / Tata Ace (50 cyl capacity)
                              </option>
                              <option value="Three-Wheeler Auto (20 cyl capacity)">
                                Three-Wheeler Auto (20 cyl capacity)
                              </option>
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                          <span className="text-[11px] text-slate-400 font-medium block mt-1">
                            Carrying capacity class determines standard custody allotment.
                          </span>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-900 block mb-2">
                            Vehicle Registration Number *
                          </label>
                          <div className="relative">
                            <FileText className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={onboardPlateNumber}
                              onChange={(e) => setOnboardPlateNumber(e.target.value)}
                              placeholder="TN 58 AX 4821"
                              className="w-full bg-[#F1F4FA] rounded-2xl pl-11 pr-5 py-3.5 text-sm sm:text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                            />
                          </div>
                          <span className="text-[11px] text-slate-400 font-medium block mt-1">
                            Commercial plate yellow registration format.
                          </span>
                        </div>
                      </div>

                      {/* Row: Safe Custody Limit & Handover Dock */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-bold text-slate-900">
                              Safe Cylinder Custody Limit *
                            </label>
                            <span className="text-[10px] font-extrabold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                              Safe Load Cap
                            </span>
                          </div>
                          <div className="relative flex items-center">
                            <input
                              type="number"
                              value={onboardCustodyLimit}
                              onChange={(e) => setOnboardCustodyLimit(e.target.value)}
                              className="w-full bg-[#F1F4FA] rounded-2xl px-5 py-3.5 pr-32 text-sm sm:text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                            />
                            <span className="absolute right-4 text-xs font-bold text-slate-500 bg-white/80 px-2.5 py-1 rounded-lg">
                              Cylinders Max
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-1 text-[11px]">
                            <span className="text-slate-400 font-medium">
                              System strictly blocks depot gate pass above this limit
                            </span>
                            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              Van Tier Standard
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-900 block mb-2">
                            Depot Handover Dock *
                          </label>
                          <div className="relative">
                            <Building2 className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                            <select
                              value={onboardHandoverDock}
                              onChange={(e) => setOnboardHandoverDock(e.target.value)}
                              className="w-full bg-[#F1F4FA] rounded-2xl pl-11 pr-10 py-3.5 text-sm sm:text-base font-bold text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer"
                            >
                              <option value="Madurai Central Depot - Bay A (Three-wheeler)">
                                Madurai Central Depot - Bay A (Three-wheeler)
                              </option>
                              <option value="Madurai Central Depot - Bay B (Heavy Truck)">
                                Madurai Central Depot - Bay B (Heavy Truck)
                              </option>
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                          <span className="text-[11px] text-slate-400 font-medium block mt-1">
                            Driver checks in and settles empty returns here.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: App Access, Security & Settlement Compliance */}
                  <div className="bg-white rounded-[24px] p-7 border border-slate-200/90 shadow-2xs space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-red-100 text-[#BC0118] font-black text-xs flex items-center justify-center shrink-0">
                          3
                        </div>
                        <div>
                          <h2 className="text-base font-extrabold text-slate-900">
                            App Access, Security &amp; Settlement Compliance
                          </h2>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            Smartphone terminal authorization, OTP dispatch, and cash handling thresholds
                          </p>
                        </div>
                      </div>
                      <Shield className="w-5 h-5 text-slate-400" />
                    </div>

                    <div className="space-y-4">
                      {/* Toggle card */}
                      <div className="bg-[#F4F8FA] rounded-2xl p-4 sm:p-5 flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-red-100 text-[#BC0118] flex items-center justify-center shrink-0 mt-0.5">
                            <Smartphone className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-extrabold text-slate-900">
                                Grant Super Gas Driver App Terminal Access
                              </span>
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                                Enabled
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                              Driver receives realtime assigned deliveries, digital customer receipts, and UPI/Cash collection tags directly on their smartphone.
                            </p>
                          </div>
                        </div>

                        {/* Switch */}
                        <div
                          onClick={() => setOnboardGrantAppAccess(!onboardGrantAppAccess)}
                          className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition shrink-0 mt-1 ${
                            onboardGrantAppAccess ? 'bg-[#BC0118]' : 'bg-slate-300'
                          }`}
                        >
                          <div
                            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                              onboardGrantAppAccess ? 'translate-x-6' : 'translate-x-0'
                            }`}
                          ></div>
                        </div>
                      </div>

                      {/* Checkboxes row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div
                          onClick={() => setOnboardSendOtpSms(!onboardSendOtpSms)}
                          className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-4 flex items-start gap-3 cursor-pointer select-none"
                        >
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition ${
                              onboardSendOtpSms ? 'bg-[#BC0118]' : 'bg-white border border-slate-300'
                            }`}
                          >
                            {onboardSendOtpSms && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">
                              Send One-Time Activation PIN via SMS
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium block mt-0.5 leading-snug">
                              Sends setup code to +91 98401 54321 immediately upon onboarding authorization
                            </span>
                          </div>
                        </div>

                        <div
                          onClick={() => setOnboardIndemnityBond(!onboardIndemnityBond)}
                          className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-4 flex items-start gap-3 cursor-pointer select-none"
                        >
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition ${
                              onboardIndemnityBond ? 'bg-[#BC0118]' : 'bg-white border border-slate-300'
                            }`}
                          >
                            {onboardIndemnityBond && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">
                              Indemnity Bond on File at Depot HQ
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium block mt-0.5 leading-snug">
                              Physical signed ₹50,000 cylinder security bond (Audited collateral #IND-
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Cash limit */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-bold text-slate-900">
                            Daily Cash Holding &amp; Collection Limit *
                          </label>
                          <span className="text-[11px] text-slate-400 font-medium">
                            Mandatory runaway depot cash ringfence threshold if exceeded
                          </span>
                        </div>
                        <div className="relative flex items-center">
                          <span className="absolute left-4 text-xs font-bold text-slate-600">
                            ₹ (INR)
                          </span>
                          <input
                            type="text"
                            value={onboardCashLimit}
                            onChange={(e) => setOnboardCashLimit(e.target.value)}
                            placeholder="50,000"
                            className="w-full bg-[#F1F4FA] rounded-2xl pl-16 pr-5 py-3.5 text-sm sm:text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                          />
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium block mt-1">
                          Driver terminal locks customer cash payment acceptance once balance reaches ₹50,000 until counter cash/UPI settlement.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </main>

            {/* Bottom Sticky Footer (Sticks within content pane to the right of sidebar, never overlapping it) */}
            <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-6 sm:px-8 py-3.5 shadow-xs mt-auto">
              <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-slate-900 block">
                      Onboarding initiated by Agency Admin
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium block">
                      Session ID: REG-MDU-2026-0518 · Madurai Central Operations Desk
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className="px-5 py-2.5 bg-transparent hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer"
                  >
                    Discard
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      triggerToast('Draft saved successfully to agency registry.');
                      setViewMode('list');
                    }}
                    className="px-5 py-2.5 bg-[#F1F4FA] hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer"
                  >
                    Save Draft
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#BC0118] hover:bg-red-800 active:scale-98 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>Confirm Partner</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          /* VIEW 2: Delivery Partners Directory & Table View */
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
                onClick={() => setViewMode('add')}
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
                      {filteredPartners.map((partner, index) => {
                        const rowKey = partner.id || partner.code || `partner-${index}`;
                        const isSelected = rowKey === selectedPartnerId || partner.code === selectedPartnerId;
                        return (
                          <tr
                            key={rowKey}
                            onClick={() => setSelectedPartnerId(rowKey)}
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
                {selectedPartner ? (
                  <>
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
                  </>
                ) : (
                  <div className="py-16 text-center space-y-2">
                    <p className="text-sm font-semibold text-slate-500">No partner selected</p>
                    <p className="text-xs text-slate-400">Select a delivery partner from the list to view custody details.</p>
                  </div>
                )}
              </div>
            </div>
          </main>
        )}
      </div>

      {/* Modal: Quick Issue Cylinders to Partner */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-lg w-full shadow-2xl border border-slate-100 p-7 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Issue Cylinders to Partner
                </h3>
                <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-1">
                  Assign filled stock and generate gate pass for {selectedPartner?.name || 'Partner'}
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
                  {selectedPartner ? `${selectedPartner.name} (${selectedPartner.code}) · ${selectedPartner.area}` : 'No partner selected'}
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
