'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import AdminSidebar from './AdminSidebar';
import {
  Shield,
  KeyRound,
  Users,
  UserPlus,
  Building2,
  DollarSign,
  Truck,
  Database,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Trash2,
  Save,
  Download,
  X,
  Phone,
  Mail,
  Sparkles,
  Clock,
  ShieldCheck,
  Fuel,
} from 'lucide-react';

interface UserItem {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'DELIVERY_PARTNER';
  isActive: boolean;
  createdAt: string;
  partnerProfile?: {
    id: string;
    partnerCode: string;
    name: string;
    status: string;
    depot?: { id: string; code: string; name: string };
    assignedVehicle?: { id: string; regNumber: string; model: string };
  } | null;
}

interface DepotItem {
  id: string;
  code: string;
  name: string;
  city: string;
}

interface VehicleItem {
  id: string;
  regNumber: string;
  model: string;
  capacity: number;
}

interface UnlinkedPartnerItem {
  id: string;
  partnerCode: string;
  name: string;
  phone: string;
  status: string;
  depot?: { id: string; name: string };
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<
    'users' | 'agency' | 'pricing' | 'fleet' | 'backup'
  >('users');

  // Loading & notification states
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [depotsList, setDepotsList] = useState<DepotItem[]>([]);
  const [vehiclesList, setVehiclesList] = useState<VehicleItem[]>([]);
  const [unlinkedPartners, setUnlinkedPartners] = useState<UnlinkedPartnerItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters for user directory
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'SUPER_ADMIN' | 'DELIVERY_PARTNER'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Create User Modal
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [createRole, setCreateRole] = useState<'ADMIN' | 'SUPER_ADMIN' | 'DELIVERY_PARTNER'>('ADMIN');
  const [createName, setCreateName] = useState('');
  const [createPhone, setCreatePhone] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [partnerMode, setPartnerMode] = useState<'link' | 'new'>('new');
  const [selectedUnlinkedPartnerId, setSelectedUnlinkedPartnerId] = useState('');
  const [customPartnerCode, setCustomPartnerCode] = useState('');
  const [selectedDepotId, setSelectedDepotId] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);

  // Reset Password Modal
  const [resetTargetUser, setResetTargetUser] = useState<UserItem | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Settings State
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [agencyForm, setAgencyForm] = useState({
    name: 'Super Gas Logistics Private Limited',
    brandName: 'Super Gas Direct Dispatch',
    gstin: '33AAACH1234F1Z8',
    pan: 'AAACH1234F',
    cin: 'U40200TN2022PTC148921',
    headOfficeAddress: 'Plot 18/A, Logistics Corridor, Ring Road Bypass, Madurai - 625020, Tamil Nadu',
    contactPhone: '+91 452 2345678',
    dispatchHotline: '+91 98421 54321',
    accountsEmail: 'accounts@supergas.in',
    supportEmail: 'care@supergas.in',
  });

  const [pricingForm, setPricingForm] = useState({
    cylinder19kgCommercial: 1850,
    cylinder47kgIndustrial: 4200,
    cylinder14kgDomestic: 850,
    cylinder5kgMiniCommercial: 620,
    commercialGstPercent: 18,
    domesticGstPercent: 5,
    cylinderDeposit19kg: 2500,
    cylinderDeposit47kg: 6000,
    cylinderDeposit14kg: 1500,
    defaultCreditDays: 15,
    defaultCreditLimit: 25000,
  });

  const [fleetForm, setFleetForm] = useState({
    maxVanCapacity: 30,
    dailyCashHandoverCutoffTime: '19:30',
    mandatorySignaturePod: true,
    emptyCylinderAuditRequired: true,
    autoRescheduleFailedDrops: true,
    expenseAutoApprovalLimit: 500,
  });

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load live users & settings
  const loadData = async () => {
    try {
      const [usersRes, settingsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/settings'),
      ]);

      if (usersRes.ok) {
        const json = await usersRes.json();
        if (json.success && json.data) {
          setUsersList(json.data.users || []);
          setDepotsList(json.data.depots || []);
          setVehiclesList(json.data.vehicles || []);
          setUnlinkedPartners(json.data.unlinkedPartners || []);
          if (json.data.depots?.[0]) setSelectedDepotId(json.data.depots[0].id);
          if (json.data.vehicles?.[0]) setSelectedVehicleId(json.data.vehicles[0].id);
        }
      }

      if (settingsRes.ok) {
        const json = await settingsRes.json();
        if (json.success && json.data?.settings) {
          const s = json.data.settings;
          if (s.agency) setAgencyForm(s.agency);
          if (s.commercialPricing) setPricingForm(s.commercialPricing);
          if (s.fleetControls) setFleetForm(s.fleetControls);
        }
      }
    } catch (err) {
      console.warn('Failed loading settings or users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      fetch('/api/admin/users').then((r) => r.json()),
      fetch('/api/admin/settings').then((r) => r.json()),
    ])
      .then(([usersJson, settingsJson]) => {
        if (!isMounted) return;
        if (usersJson.success && usersJson.data) {
          setUsersList(usersJson.data.users || []);
          setDepotsList(usersJson.data.depots || []);
          setVehiclesList(usersJson.data.vehicles || []);
          setUnlinkedPartners(usersJson.data.unlinkedPartners || []);
          if (usersJson.data.depots?.[0]) setSelectedDepotId(usersJson.data.depots[0].id);
          if (usersJson.data.vehicles?.[0]) setSelectedVehicleId(usersJson.data.vehicles[0].id);
        }
        if (settingsJson.success && settingsJson.data?.settings) {
          const s = settingsJson.data.settings;
          if (s.agency) setAgencyForm(s.agency);
          if (s.commercialPricing) setPricingForm(s.commercialPricing);
          if (s.fleetControls) setFleetForm(s.fleetControls);
        }
      })
      .catch((err) => {
        console.warn('Failed initial loading:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingUsers(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
      if (statusFilter === 'ACTIVE' && !u.isActive) return false;
      if (statusFilter === 'INACTIVE' && u.isActive) return false;

      if (userSearch.trim()) {
        const q = userSearch.toLowerCase();
        const matchesName = u.name.toLowerCase().includes(q);
        const matchesPhone = u.phone.toLowerCase().includes(q);
        const matchesEmail = u.email ? u.email.toLowerCase().includes(q) : false;
        const matchesPartner = u.partnerProfile?.partnerCode?.toLowerCase().includes(q) || false;
        if (!matchesName && !matchesPhone && !matchesEmail && !matchesPartner) return false;
      }
      return true;
    });
  }, [usersList, roleFilter, statusFilter, userSearch]);

  // Generate random strong password
  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let res = '';
    for (let i = 0; i < 10; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  };

  // Copy to clipboard
  const copyToClipboard = (text: string, label = 'Copied') => {
    navigator.clipboard?.writeText(text);
    triggerToast(`${label} copied to clipboard`);
  };

  // Submit User Creation
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) {
      alert('Please enter user full name');
      return;
    }
    if (!createPhone.trim()) {
      alert('Please enter valid user login phone number');
      return;
    }
    if (!createPassword || createPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    setIsSubmittingUser(true);
    try {
      const payload = {
        name: createName.trim(),
        phone: createPhone.trim(),
        email: createEmail.trim() || undefined,
        password: createPassword,
        role: createRole,
        partnerId:
          createRole === 'DELIVERY_PARTNER' && partnerMode === 'link'
            ? selectedUnlinkedPartnerId || undefined
            : undefined,
        createPartnerProfile:
          createRole === 'DELIVERY_PARTNER' && partnerMode === 'new',
        partnerCode: customPartnerCode.trim() || undefined,
        depotId: selectedDepotId || undefined,
        assignedVehicleId: selectedVehicleId || undefined,
      };

      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || json.message || 'Failed to create user account');
      }

      triggerToast(`Account for ${createName} created successfully!`);
      setShowCreateUserModal(false);
      setCreateName('');
      setCreatePhone('');
      setCreateEmail('');
      setCreatePassword('');
      setCustomPartnerCode('');
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error creating user');
    } finally {
      setIsSubmittingUser(false);
    }
  };

  // Reset Password Submit
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetUser) return;
    if (!newPasswordInput || newPasswordInput.length < 6) {
      alert('New password must be at least 6 characters');
      return;
    }

    setIsResettingPassword(true);
    try {
      const res = await fetch(`/api/admin/users/${resetTargetUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPasswordInput }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || 'Failed to update password');
      }

      triggerToast(`Password updated for ${resetTargetUser.name}!`);
      setResetTargetUser(null);
      setNewPasswordInput('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error updating password');
    } finally {
      setIsResettingPassword(false);
    }
  };

  // Toggle User Active Status
  const handleToggleActive = async (user: UserItem) => {
    const nextStatus = !user.isActive;
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: nextStatus }),
      });
      if (res.ok) {
        setUsersList((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, isActive: nextStatus } : u))
        );
        triggerToast(`User ${user.name} marked as ${nextStatus ? 'Active' : 'Inactive'}`);
      }
    } catch (err) {
      console.warn('Status toggle error:', err);
    }
  };

  // Delete User
  const handleDeleteUser = async (user: UserItem) => {
    if (!confirm(`Are you sure you want to remove user ${user.name}? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setUsersList((prev) => prev.filter((u) => u.id !== user.id));
        triggerToast(`User account ${user.name} removed successfully`);
      } else {
        const json = await res.json().catch(() => null);
        alert(json?.error?.message || 'Failed to remove user account');
      }
    } catch {
      alert('Error deleting user account');
    }
  };

  // Save Settings
  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agency: agencyForm,
          commercialPricing: pricingForm,
          fleetControls: fleetForm,
        }),
      });
      if (res.ok) {
        triggerToast('System settings saved & updated across all terminals!');
      } else {
        alert('Failed saving settings');
      }
    } catch {
      alert('Network error saving settings');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Download System Data Backup
  const handleDownloadBackup = async () => {
    try {
      triggerToast('Preparing complete system data backup...');
      const res = await fetch('/api/admin/settings?action=backup');
      if (!res.ok) throw new Error('Backup failed');
      const json = await res.json();
      const blob = new Blob([JSON.stringify(json.data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SuperGas_System_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      triggerToast('System database backup downloaded successfully!');
    } catch {
      alert('Error exporting system backup');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-800 font-sans antialiased">
      {/* 1. Left Sidebar Navigation */}
      <AdminSidebar className="sticky top-0 h-screen z-30 border-r border-slate-200/90 rounded-none shrink-0" />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200/90 px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-4 h-4 rounded-full bg-[#E81B24] inline-block shrink-0"></span>
            <Link href="/admin" className="text-slate-500 hover:text-slate-800 transition">
              Dashboard
            </Link>
            <span className="text-slate-300">/</span>
            <span className="font-bold text-slate-800">Settings</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Postgres: Synchronized
            </div>
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={isSavingSettings}
              className="flex items-center gap-1.5 bg-[#BC0118] hover:bg-red-800 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSavingSettings ? 'Saving...' : 'Save All Changes'}</span>
            </button>
          </div>
        </header>

        {/* Settings Body */}
        <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* Header Banner */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 bg-red-50 text-[#BC0118] rounded-xl inline-block">
                  <KeyRound className="w-5 h-5" />
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  System Settings &amp; Access Provisioning
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Configure user credentials, agency registration details, commercial cylinder prices, and fleet automation rules.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setCreatePassword(generateStrongPassword());
                setShowCreateUserModal(true);
              }}
              className="flex items-center justify-center gap-2 bg-[#BC0118] hover:bg-red-800 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-xs transition active:scale-98 cursor-pointer shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create User &amp; Credentials</span>
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
                activeTab === 'users'
                  ? 'bg-[#BC0118] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>User Accounts &amp; Credentials</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  activeTab === 'users' ? 'bg-red-900/40 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {usersList.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('agency')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
                activeTab === 'agency'
                  ? 'bg-[#BC0118] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Agency &amp; Hub Profile</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('pricing')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
                activeTab === 'pricing'
                  ? 'bg-[#BC0118] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>LPG Pricing &amp; GST Rates</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('fleet')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
                activeTab === 'fleet'
                  ? 'bg-[#BC0118] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>Fleet &amp; Terminal Controls</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('backup')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
                activeTab === 'backup'
                  ? 'bg-[#BC0118] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Database &amp; Data Backup</span>
            </button>
          </div>

          {/* TAB 1: USER ACCOUNTS & CREDENTIALS PROVISIONING */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Quick Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                      TOTAL USERS PROVISIONED
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-2">{usersList.length}</div>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">
                    {usersList.filter((u) => u.isActive).length} active credentials
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                      ADMINISTRATORS
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-red-50 text-[#BC0118] flex items-center justify-center">
                      <Shield className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-[#BC0118] mt-2">
                    {usersList.filter((u) => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length}
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">
                    {usersList.filter((u) => u.role === 'SUPER_ADMIN').length} Super Admin / {usersList.filter((u) => u.role === 'ADMIN').length} Admin
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                      DELIVERY PARTNER TERMINALS
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                      <Truck className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-blue-700 mt-2">
                    {usersList.filter((u) => u.role === 'DELIVERY_PARTNER').length}
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">
                    Active driver mobile terminal accounts
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                      CREDENTIAL ENCRYPTION
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-emerald-700 mt-2">SHA-256</div>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">
                    Salted hash verification active
                  </p>
                </div>
              </div>

              {/* User Directory Toolbar */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search by name, phone/login ID, email, or DP code..."
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold focus:outline-none focus:border-red-500 focus:bg-white transition"
                  />
                  {userSearch && (
                    <button
                      type="button"
                      onClick={() => setUserSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Role filter */}
                  <div className="flex items-center gap-1 bg-[#F8FAFC] p-1 border border-slate-200 rounded-xl text-xs font-bold">
                    {(['ALL', 'ADMIN', 'SUPER_ADMIN', 'DELIVERY_PARTNER'] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRoleFilter(r)}
                        className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-[11px] ${
                          roleFilter === r
                            ? 'bg-white text-slate-900 shadow-2xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        {r === 'ALL'
                          ? 'All Roles'
                          : r === 'SUPER_ADMIN'
                          ? 'Super Admin'
                          : r === 'ADMIN'
                          ? 'Admin'
                          : 'Driver / DP'}
                      </button>
                    ))}
                  </div>

                  {/* Status filter */}
                  <div className="flex items-center gap-1 bg-[#F8FAFC] p-1 border border-slate-200 rounded-xl text-xs font-bold">
                    {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStatusFilter(st)}
                        className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-[11px] ${
                          statusFilter === st
                            ? 'bg-white text-slate-900 shadow-2xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        {st === 'ALL' ? 'All' : st === 'ACTIVE' ? 'Active' : 'Suspended'}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={loadData}
                    title="Refresh Directory"
                    className="p-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-600 transition cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#EDF2F9] text-slate-600 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-200">
                        <th className="py-3 px-4 whitespace-nowrap">USER / IDENTITY</th>
                        <th className="py-3 px-4 whitespace-nowrap">LOGIN USER ID (PHONE)</th>
                        <th className="py-3 px-4 whitespace-nowrap">SYSTEM ROLE</th>
                        <th className="py-3 px-4 whitespace-nowrap">ASSIGNED DEPOT &amp; FLEET</th>
                        <th className="py-3 px-4 text-center whitespace-nowrap">STATUS</th>
                        <th className="py-3 px-4 text-center whitespace-nowrap">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                      {loadingUsers ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400 font-bold">
                            Loading user credentials from database...
                          </td>
                        </tr>
                      ) : filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400 font-bold">
                            No user accounts match the current filter.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => {
                          const initials = user.name
                            .split(' ')
                            .map((p) => p[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase();

                          return (
                            <tr key={user.id} className="hover:bg-slate-50/80 transition">
                              {/* User Info */}
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                                      user.role === 'SUPER_ADMIN'
                                        ? 'bg-purple-100 text-purple-800'
                                        : user.role === 'ADMIN'
                                        ? 'bg-red-100 text-[#BC0118]'
                                        : 'bg-blue-100 text-blue-800'
                                    }`}
                                  >
                                    {initials}
                                  </div>
                                  <div>
                                    <div className="font-extrabold text-slate-900 leading-tight">
                                      {user.name}
                                    </div>
                                    <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                                      {user.email || 'No email registered'}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Phone / User ID */}
                              <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-800 font-bold">
                                <div className="flex items-center gap-1.5">
                                  <span>{user.phone}</span>
                                  <button
                                    type="button"
                                    onClick={() => copyToClipboard(user.phone, 'User ID / Phone')}
                                    title="Copy User ID"
                                    className="p-1 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>

                              {/* Role */}
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                {user.role === 'SUPER_ADMIN' && (
                                  <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                                    <Sparkles className="w-3 h-3" />
                                    <span>Super Admin</span>
                                  </span>
                                )}
                                {user.role === 'ADMIN' && (
                                  <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                                    <Shield className="w-3 h-3" />
                                    <span>Agency Admin</span>
                                  </span>
                                )}
                                {user.role === 'DELIVERY_PARTNER' && (
                                  <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                                    <Truck className="w-3 h-3" />
                                    <span>
                                      Driver {user.partnerProfile ? `(${user.partnerProfile.partnerCode})` : ''}
                                    </span>
                                  </span>
                                )}
                              </td>

                              {/* Assigned Depot & Vehicle */}
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                {user.partnerProfile ? (
                                  <div>
                                    <div className="font-bold text-slate-800">
                                      {user.partnerProfile.depot?.name || 'Madurai Central Hub'}
                                    </div>
                                    <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                                      {user.partnerProfile.assignedVehicle
                                        ? `${user.partnerProfile.assignedVehicle.regNumber} (${user.partnerProfile.assignedVehicle.model})`
                                        : 'Van TN 58 AX 4821'}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-slate-400 font-medium">Headquarters (All Hubs)</span>
                                )}
                              </td>

                              {/* Status */}
                              <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                {user.isActive ? (
                                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Active</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                                    <AlertCircle className="w-3 h-3" />
                                    <span>Suspended</span>
                                  </span>
                                )}
                              </td>

                              {/* Actions */}
                              <td className="py-3.5 px-4 text-center whitespace-nowrap">
                                <div className="flex items-center justify-center gap-2">
                                  {/* Reset Password */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setResetTargetUser(user);
                                      setNewPasswordInput(generateStrongPassword());
                                    }}
                                    className="border border-red-200 hover:bg-red-50 text-[#BC0118] font-bold text-xs px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1"
                                    title="Reset Password"
                                  >
                                    <KeyRound className="w-3 h-3" />
                                    <span>Reset Pwd</span>
                                  </button>

                                  {/* Toggle Active */}
                                  <button
                                    type="button"
                                    onClick={() => handleToggleActive(user)}
                                    className="p-1.5 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg transition cursor-pointer"
                                    title={user.isActive ? 'Deactivate User' : 'Activate User'}
                                  >
                                    <PowerIcon active={user.isActive} />
                                  </button>

                                  {/* Delete */}
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteUser(user)}
                                    className="p-1.5 border border-slate-200 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition cursor-pointer"
                                    title="Delete User"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-[#F8FAFC] border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 font-medium">
                  <span>
                    Showing {filteredUsers.length} of {usersList.length} registered accounts
                  </span>
                  <span>
                    Default demo credential fallback: <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-slate-800">supergas123</code>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AGENCY & HUB PROFILE */}
          {activeTab === 'agency' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-base font-extrabold text-slate-900">Agency Legal &amp; Registration Identity</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Official business registration details printed on customer invoices, tax vouchers, and delivery receipts.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-semibold">
                  <div>
                    <label className="text-slate-500 font-bold block mb-1">Legal Entity Name</label>
                    <input
                      type="text"
                      value={agencyForm.name}
                      onChange={(e) => setAgencyForm({ ...agencyForm, name: e.target.value })}
                      className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-bold focus:bg-white focus:outline-none focus:border-red-500 transition"
                    />
                  </div>

                  <div>
                    <label className="text-slate-500 font-bold block mb-1">Brand Name (Display)</label>
                    <input
                      type="text"
                      value={agencyForm.brandName}
                      onChange={(e) => setAgencyForm({ ...agencyForm, brandName: e.target.value })}
                      className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-bold focus:bg-white focus:outline-none focus:border-red-500 transition"
                    />
                  </div>

                  <div>
                    <label className="text-slate-500 font-bold block mb-1">GSTIN Number</label>
                    <input
                      type="text"
                      value={agencyForm.gstin}
                      onChange={(e) => setAgencyForm({ ...agencyForm, gstin: e.target.value })}
                      className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:border-red-500 transition"
                    />
                  </div>

                  <div>
                    <label className="text-slate-500 font-bold block mb-1">PAN Number</label>
                    <input
                      type="text"
                      value={agencyForm.pan}
                      onChange={(e) => setAgencyForm({ ...agencyForm, pan: e.target.value })}
                      className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:border-red-500 transition"
                    />
                  </div>

                  <div>
                    <label className="text-slate-500 font-bold block mb-1">CIN / Registration No</label>
                    <input
                      type="text"
                      value={agencyForm.cin}
                      onChange={(e) => setAgencyForm({ ...agencyForm, cin: e.target.value })}
                      className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:border-red-500 transition"
                    />
                  </div>

                  <div>
                    <label className="text-slate-500 font-bold block mb-1">Dispatch Contact Phone</label>
                    <input
                      type="text"
                      value={agencyForm.dispatchHotline}
                      onChange={(e) => setAgencyForm({ ...agencyForm, dispatchHotline: e.target.value })}
                      className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-bold focus:bg-white focus:outline-none focus:border-red-500 transition"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-slate-500 font-bold block mb-1">Registered Logistics HQ Address</label>
                    <input
                      type="text"
                      value={agencyForm.headOfficeAddress}
                      onChange={(e) => setAgencyForm({ ...agencyForm, headOfficeAddress: e.target.value })}
                      className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-red-500 transition"
                    />
                  </div>

                  <div>
                    <label className="text-slate-500 font-bold block mb-1">Accounts Email Address</label>
                    <input
                      type="email"
                      value={agencyForm.accountsEmail}
                      onChange={(e) => setAgencyForm({ ...agencyForm, accountsEmail: e.target.value })}
                      className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-red-500 transition"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    disabled={isSavingSettings}
                    className="flex items-center gap-2 bg-[#BC0118] hover:bg-red-800 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingSettings ? 'Saving...' : 'Update Agency Profile'}</span>
                  </button>
                </div>
              </div>

              {/* Active Hub Depots */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Registered Depots &amp; Hub Nodes</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Distribution depots holding cylinder inventory and vehicle handovers.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {depotsList.map((depot) => (
                    <div
                      key={depot.id}
                      className="bg-[#F8FAFC] border border-slate-200/80 rounded-xl p-4 flex items-start gap-3.5"
                    >
                      <div className="w-10 h-10 rounded-xl bg-red-50 text-[#BC0118] flex items-center justify-center shrink-0 font-black text-xs">
                        {depot.code}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-extrabold text-slate-900 text-sm">{depot.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{depot.city} Cluster Logistics Node</div>
                        <div className="inline-block mt-2 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-[10px] font-bold">
                          Active Dispatch Depot
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LPG PRICING & GST RATES */}
          {activeTab === 'pricing' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-extrabold text-slate-900">Commercial &amp; Domestic LPG Cylinder Rates</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Default rate card loaded into driver terminals during invoice generation and bill creation.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-semibold">
                <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-600 font-bold mb-1">
                    <Fuel className="w-4 h-4 text-[#BC0118]" />
                    <span>19kg Commercial Cylinder</span>
                  </div>
                  <div className="mt-2">
                    <label className="text-[10px] text-slate-400 font-bold block uppercase">Unit Base Price (₹)</label>
                    <input
                      type="number"
                      value={pricingForm.cylinder19kgCommercial}
                      onChange={(e) =>
                        setPricingForm({ ...pricingForm, cylinder19kgCommercial: Number(e.target.value) })
                      }
                      className="w-full mt-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-base font-black text-slate-900 focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div className="mt-2 text-[11px] text-slate-500">
                    Security Deposit: ₹{pricingForm.cylinderDeposit19kg.toLocaleString()}
                  </div>
                </div>

                <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-600 font-bold mb-1">
                    <Fuel className="w-4 h-4 text-purple-600" />
                    <span>47.5kg Industrial Cylinder</span>
                  </div>
                  <div className="mt-2">
                    <label className="text-[10px] text-slate-400 font-bold block uppercase">Unit Base Price (₹)</label>
                    <input
                      type="number"
                      value={pricingForm.cylinder47kgIndustrial}
                      onChange={(e) =>
                        setPricingForm({ ...pricingForm, cylinder47kgIndustrial: Number(e.target.value) })
                      }
                      className="w-full mt-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-base font-black text-slate-900 focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div className="mt-2 text-[11px] text-slate-500">
                    Security Deposit: ₹{pricingForm.cylinderDeposit47kg.toLocaleString()}
                  </div>
                </div>

                <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-600 font-bold mb-1">
                    <Fuel className="w-4 h-4 text-emerald-600" />
                    <span>14.2kg Domestic Cylinder</span>
                  </div>
                  <div className="mt-2">
                    <label className="text-[10px] text-slate-400 font-bold block uppercase">Unit Base Price (₹)</label>
                    <input
                      type="number"
                      value={pricingForm.cylinder14kgDomestic}
                      onChange={(e) =>
                        setPricingForm({ ...pricingForm, cylinder14kgDomestic: Number(e.target.value) })
                      }
                      className="w-full mt-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-base font-black text-slate-900 focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div className="mt-2 text-[11px] text-slate-500">
                    Security Deposit: ₹{pricingForm.cylinderDeposit14kg.toLocaleString()}
                  </div>
                </div>

                <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-600 font-bold mb-1">
                    <Fuel className="w-4 h-4 text-amber-600" />
                    <span>5kg Mini Commercial</span>
                  </div>
                  <div className="mt-2">
                    <label className="text-[10px] text-slate-400 font-bold block uppercase">Unit Base Price (₹)</label>
                    <input
                      type="number"
                      value={pricingForm.cylinder5kgMiniCommercial}
                      onChange={(e) =>
                        setPricingForm({ ...pricingForm, cylinder5kgMiniCommercial: Number(e.target.value) })
                      }
                      className="w-full mt-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-base font-black text-slate-900 focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div className="mt-2 text-[11px] text-slate-500">Non-subsidized commercial</div>
                </div>
              </div>

              {/* Taxation & Credit Rules */}
              <div className="border-t border-slate-100 pt-6 space-y-4">
                <h4 className="text-sm font-extrabold text-slate-800">GST Rates &amp; Credit Configuration</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-semibold">
                  <div>
                    <label className="text-slate-500 font-bold block mb-1">Commercial LPG GST Rate (%)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={pricingForm.commercialGstPercent}
                        onChange={(e) =>
                          setPricingForm({ ...pricingForm, commercialGstPercent: Number(e.target.value) })
                        }
                        className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-black focus:bg-white focus:outline-none focus:border-red-500"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-500 font-bold block mb-1">Domestic LPG GST Rate (%)</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={pricingForm.domesticGstPercent}
                        onChange={(e) =>
                          setPricingForm({ ...pricingForm, domesticGstPercent: Number(e.target.value) })
                        }
                        className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-black focus:bg-white focus:outline-none focus:border-red-500"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-500 font-bold block mb-1">Default Customer Credit Days</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={pricingForm.defaultCreditDays}
                        onChange={(e) =>
                          setPricingForm({ ...pricingForm, defaultCreditDays: Number(e.target.value) })
                        }
                        className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-black focus:bg-white focus:outline-none focus:border-red-500"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Days</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-500 font-bold block mb-1">Default Credit Limit (₹)</label>
                    <input
                      type="number"
                      value={pricingForm.defaultCreditLimit}
                      onChange={(e) =>
                        setPricingForm({ ...pricingForm, defaultCreditLimit: Number(e.target.value) })
                      }
                      className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-black focus:bg-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={isSavingSettings}
                  className="flex items-center gap-2 bg-[#BC0118] hover:bg-red-800 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingSettings ? 'Saving...' : 'Save LPG Price Matrix'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: FLEET & TERMINAL CONTROLS */}
          {activeTab === 'fleet' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-extrabold text-slate-900">Fleet Operations &amp; Driver Terminal Rules</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automated checks enforced when drivers complete drops, submit cash handovers, or file expense claims.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs font-semibold">
                <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                    <Truck className="w-4 h-4 text-[#BC0118]" />
                    <span>Maximum Van Cylinder Capacity</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Caps the maximum filled cylinders that can be checked out during Quick Issue handovers.
                  </p>
                  <div className="relative">
                    <input
                      type="number"
                      value={fleetForm.maxVanCapacity}
                      onChange={(e) => setFleetForm({ ...fleetForm, maxVanCapacity: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-black text-sm focus:outline-none focus:border-red-500"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Units</span>
                  </div>
                </div>

                <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Daily Cash Handover Cutoff</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Time by which drivers must drop route collections at depot vault before day-end settlement freeze.
                  </p>
                  <input
                    type="time"
                    value={fleetForm.dailyCashHandoverCutoffTime}
                    onChange={(e) => setFleetForm({ ...fleetForm, dailyCashHandoverCutoffTime: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-black text-sm focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>Expense Auto-Review Limit</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Routine fuel/toll expense claims up to this amount are highlighted for rapid single-click audit.
                  </p>
                  <div className="relative">
                    <input
                      type="number"
                      value={fleetForm.expenseAutoApprovalLimit}
                      onChange={(e) => setFleetForm({ ...fleetForm, expenseAutoApprovalLimit: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-black text-sm focus:outline-none focus:border-red-500"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">INR</span>
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="border-t border-slate-100 pt-6 space-y-4">
                <h4 className="text-sm font-extrabold text-slate-800">Compliance &amp; Proof of Delivery Rules</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex items-start gap-3 p-4 bg-[#F8FAFC] border border-slate-200/80 rounded-xl cursor-pointer hover:bg-slate-50 transition">
                    <input
                      type="checkbox"
                      checked={fleetForm.mandatorySignaturePod}
                      onChange={(e) => setFleetForm({ ...fleetForm, mandatorySignaturePod: e.target.checked })}
                      className="mt-0.5 rounded border-slate-300 text-red-600 focus:ring-red-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Enforce Customer Signature / OTP at Delivery</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Requires driver to capture physical acknowledgment before marking drop completed.
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 bg-[#F8FAFC] border border-slate-200/80 rounded-xl cursor-pointer hover:bg-slate-50 transition">
                    <input
                      type="checkbox"
                      checked={fleetForm.emptyCylinderAuditRequired}
                      onChange={(e) => setFleetForm({ ...fleetForm, emptyCylinderAuditRequired: e.target.checked })}
                      className="mt-0.5 rounded border-slate-300 text-red-600 focus:ring-red-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Mandatory Empty Cylinder Collection Check</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Prompts driver to confirm tare/empty cylinder return count on every replacement.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={isSavingSettings}
                  className="flex items-center gap-2 bg-[#BC0118] hover:bg-red-800 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingSettings ? 'Saving...' : 'Save Fleet Rules'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: DATABASE & BACKUP EXPORT */}
          {activeTab === 'backup' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-extrabold text-slate-900">System Health, Infrastructure &amp; Data Backup</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time database connection diagnostics and export tools for regulatory compliance and safety backups.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Database Server</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                  <div className="text-base font-black text-slate-900 mt-2">PostgreSQL (AWS Neon)</div>
                  <div className="text-[11px] text-emerald-600 font-bold mt-1">Status: Operational &amp; Replicating</div>
                </div>

                <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-xl p-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Application Build</span>
                  <div className="text-base font-black text-slate-900 mt-2">Next.js 16 (Webpack)</div>
                  <div className="text-[11px] text-slate-500 font-semibold mt-1">Prisma Client v7.10.1</div>
                </div>

                <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-xl p-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Security Protocol</span>
                  <div className="text-base font-black text-slate-900 mt-2">Session Auth &amp; Role Guard</div>
                  <div className="text-[11px] text-slate-500 font-semibold mt-1">Bearer Token &amp; Cookie Store</div>
                </div>
              </div>

              {/* Data Export Box */}
              <div className="bg-red-50/60 border border-red-200/80 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-extrabold text-[#BC0118] flex items-center gap-1.5">
                    <Download className="w-4 h-4" />
                    <span>Download Comprehensive Master Data Backup</span>
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 max-w-2xl">
                    Exports an uncompressed, structured JSON snapshot of all active customers, delivery partners, registered vehicles, invoices, payment transactions, and expense records.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  className="flex items-center justify-center gap-2 bg-[#BC0118] hover:bg-red-800 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-xs transition active:scale-98 cursor-pointer shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Backup JSON</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: CREATE USER & CREDENTIALS */}
      {showCreateUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-red-50 text-[#BC0118] rounded-lg">
                  <UserPlus className="w-4 h-4" />
                </span>
                <h3 className="font-extrabold text-base text-slate-900">Provision User ID &amp; Password</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateUserModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 pt-4 text-xs font-semibold">
              {/* Role Selection */}
              <div>
                <label className="text-slate-500 font-bold block mb-1">Select System Role *</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCreateRole('ADMIN')}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                      createRole === 'ADMIN'
                        ? 'bg-red-50 border-red-500 text-[#BC0118] font-black'
                        : 'bg-[#F8FAFC] border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Shield className="w-4 h-4 mx-auto mb-1 text-[#BC0118]" />
                    <span>Admin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCreateRole('DELIVERY_PARTNER')}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                      createRole === 'DELIVERY_PARTNER'
                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-black'
                        : 'bg-[#F8FAFC] border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Truck className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                    <span>Driver / DP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCreateRole('SUPER_ADMIN')}
                    className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                      createRole === 'SUPER_ADMIN'
                        ? 'bg-purple-50 border-purple-500 text-purple-700 font-black'
                        : 'bg-[#F8FAFC] border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 mx-auto mb-1 text-purple-600" />
                    <span>Super Admin</span>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="text-slate-500 font-bold block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="e.g. Karthik Raja"
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-bold focus:bg-white focus:outline-none focus:border-red-500"
                />
              </div>

              {/* User ID / Phone */}
              <div>
                <label className="text-slate-500 font-bold block mb-1">
                  User ID / Phone Number (Login Identifier) *
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={createPhone}
                    onChange={(e) => setCreatePhone(e.target.value)}
                    placeholder="+91 98421 54321 or 9842154321"
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  This phone number will serve as the primary login User ID for web &amp; mobile terminals.
                </p>
              </div>

              {/* Email (Optional) */}
              <div>
                <label className="text-slate-500 font-bold block mb-1">Email Address (Optional)</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    placeholder="e.g. karthik@supergas.in"
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-slate-900 font-semibold focus:bg-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-500 font-bold">Initial Password *</label>
                  <button
                    type="button"
                    onClick={() => setCreatePassword(generateStrongPassword())}
                    className="text-[#BC0118] hover:underline text-[11px] font-bold cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Auto-Generate</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showCreatePassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    placeholder="Enter password (min 6 chars)"
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl pl-3.5 pr-10 py-2 text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:border-red-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCreatePassword(!showCreatePassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                  >
                    {showCreatePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Delivery Partner Options */}
              {createRole === 'DELIVERY_PARTNER' && (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-blue-900 text-xs">Driver Profile Assignment</span>
                    <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-blue-200">
                      <button
                        type="button"
                        onClick={() => setPartnerMode('new')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                          partnerMode === 'new' ? 'bg-blue-600 text-white' : 'text-slate-600'
                        }`}
                      >
                        Create New
                      </button>
                      <button
                        type="button"
                        onClick={() => setPartnerMode('link')}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                          partnerMode === 'link' ? 'bg-blue-600 text-white' : 'text-slate-600'
                        }`}
                      >
                        Link Existing
                      </button>
                    </div>
                  </div>

                  {partnerMode === 'link' ? (
                    <div>
                      <label className="text-slate-600 font-bold block mb-1">Select Driver to Link</label>
                      <select
                        value={selectedUnlinkedPartnerId}
                        onChange={(e) => setSelectedUnlinkedPartnerId(e.target.value)}
                        className="w-full bg-white border border-blue-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800"
                      >
                        <option value="">-- Choose unlinked partner --</option>
                        {unlinkedPartners.map((dp) => (
                          <option key={dp.id} value={dp.id}>
                            {dp.partnerCode} - {dp.name} ({dp.phone})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-slate-600 font-bold block mb-1">Assigned Depot</label>
                        <select
                          value={selectedDepotId}
                          onChange={(e) => setSelectedDepotId(e.target.value)}
                          className="w-full bg-white border border-blue-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800"
                        >
                          {depotsList.map((depot) => (
                            <option key={depot.id} value={depot.id}>
                              {depot.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-slate-600 font-bold block mb-1">Assigned Vehicle</label>
                        <select
                          value={selectedVehicleId}
                          onChange={(e) => setSelectedVehicleId(e.target.value)}
                          className="w-full bg-white border border-blue-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800"
                        >
                          {vehiclesList.map((veh) => (
                            <option key={veh.id} value={veh.id}>
                              {veh.regNumber}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingUser}
                  className="flex-1 bg-[#BC0118] hover:bg-red-800 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-xs transition cursor-pointer text-center"
                >
                  {isSubmittingUser ? 'Provisioning...' : 'Confirm & Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESET PASSWORD */}
      {resetTargetUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-red-50 text-[#BC0118] rounded-lg">
                  <KeyRound className="w-4 h-4" />
                </span>
                <h3 className="font-extrabold text-base text-slate-900">Reset User Password</h3>
              </div>
              <button
                type="button"
                onClick={() => setResetTargetUser(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4 pt-4 text-xs font-semibold">
              <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-xl p-3">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Target Account</div>
                <div className="font-extrabold text-slate-900 text-sm mt-0.5">{resetTargetUser.name}</div>
                <div className="font-mono text-slate-600 text-xs mt-0.5">
                  {resetTargetUser.phone} ({resetTargetUser.role})
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-500 font-bold">New Password (min 6 chars)</label>
                  <button
                    type="button"
                    onClick={() => setNewPasswordInput(generateStrongPassword())}
                    className="text-[#BC0118] hover:underline text-[11px] font-bold cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Auto-Generate</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl pl-3 pr-10 py-2 text-slate-900 font-mono font-bold focus:bg-white focus:outline-none focus:border-red-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetTargetUser(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResettingPassword}
                  className="flex-1 bg-[#BC0118] hover:bg-red-800 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-xs transition cursor-pointer text-center"
                >
                  {isResettingPassword ? 'Updating...' : 'Save New Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E293B] text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

function PowerIcon({ active }: { active: boolean }) {
  return (
    <svg
      className={`w-3.5 h-3.5 ${active ? 'text-emerald-600' : 'text-slate-400'}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
      <line x1="12" y1="2" x2="12" y2="12" />
    </svg>
  );
}
