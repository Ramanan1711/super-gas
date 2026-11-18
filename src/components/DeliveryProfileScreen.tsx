'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Camera,
  Building2,
  Truck,
  User,
  Lock,
  Phone,
  Edit2,
  FileBadge,
  ShieldCheck,
  CheckCircle2,
  Eye,
  Smartphone,
  RefreshCw,
  X,
  FileText,
  CreditCard,
  Check,
} from 'lucide-react';

interface DeliveryProfileScreenProps {
  onBack: () => void;
}

export default function DeliveryProfileScreen({ onBack }: DeliveryProfileScreenProps) {
  const [showEditContactModal, setShowEditContactModal] = useState(false);
  const [showDocPreviewModal, setShowDocPreviewModal] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Profile information updated successfully');
  const [isSaving, setIsSaving] = useState(false);

  // Profile data from database
  const [driverName, setDriverName] = useState('Suresh Babu');
  const [partnerCode, setPartnerCode] = useState('DP-003');
  const [hubName, setHubName] = useState('Madurai Central Hub');
  const [assignedVan, setAssignedVan] = useState('Van 03 (TN-58-BZ-4412)');
  const [bloodGroup, setBloodGroup] = useState('O+ (Rh Pos)');

  // Editable contact state
  const [primaryPhone, setPrimaryPhone] = useState('+91 97876 54321');
  const [altPhone, setAltPhone] = useState('+91 94440 90768');
  const [addressLine1, setAddressLine1] = useState('42/B, Kamarajar Salai, East Gate');
  const [addressLine2, setAddressLine2] = useState('Madurai, Tamil Nadu - 625009');

  // Fetch live driver profile on mount
  useEffect(() => {
    async function loadDriverProfile() {
      try {
        const res = await fetch('/api/drivers/profile?partnerCode=DP-003');
        if (!res.ok) return;
        const result = await res.json();
        if (result.success && result.data) {
          const p = result.data;
          if (p.name) setDriverName(p.name);
          if (p.partnerCode) setPartnerCode(p.partnerCode);
          if (p.phone) setPrimaryPhone(p.phone);
          if (p.altPhone) setAltPhone(p.altPhone);
          if (p.bloodGroup) setBloodGroup(p.bloodGroup);
          if (p.depot?.name) setHubName(p.depot.name);
          if (p.assignedVehicle?.regNumber) {
            setAssignedVan(`Van 03 (${p.assignedVehicle.regNumber})`);
          }
          if (p.address) {
            const parts = p.address.split(',');
            if (parts.length > 2) {
              setAddressLine1(parts.slice(0, 2).join(',').trim());
              setAddressLine2(parts.slice(2).join(',').trim());
            } else {
              setAddressLine1(p.address);
            }
          }
        }
      } catch (err) {
        console.warn('Could not fetch driver profile from DB, using defaults:', err);
      }
    }

    loadDriverProfile();
  }, []);

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const fullAddress = `${addressLine1}, ${addressLine2}`.replace(/,\s*,/g, ',').trim();
      const res = await fetch('/api/drivers/profile?partnerCode=DP-003', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: primaryPhone.trim(),
          altPhone: altPhone.trim() || null,
          address: fullAddress,
          bloodGroup: bloodGroup.trim(),
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error?.message || 'Failed to update profile');
      }

      setToastMessage('Profile and emergency contact updated successfully in database');
      setShowEditContactModal(false);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F8FAFC] overflow-hidden">
      {/* Top Header */}
      <div className="shrink-0 px-4 pt-3 pb-3 bg-white border-b border-slate-100 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="p-1 -ml-1 text-slate-800 hover:text-black transition cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2]" />
        </button>
        <h1 className="text-lg font-black text-slate-900 tracking-tight">
          My Profile
        </h1>
      </div>

      {/* Toast notification */}
      {showSuccessToast && (
        <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 text-center flex items-center justify-center gap-1.5 shadow-md animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-3.5 pb-8">
        {/* 1. Profile Hero Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs relative text-center">
          {/* Top Row Badges */}
          <div className="flex items-center justify-between w-full">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Active Duty</span>
            </span>
            <span className="bg-[#EEF2FF] text-slate-700 font-bold px-2.5 py-1 rounded-lg text-xs">
              ID: {partnerCode}
            </span>
          </div>

          {/* Avatar with Camera Icon */}
          <div className="relative inline-block mt-2">
            <div className="w-20 h-20 rounded-full bg-[#B30014] text-white font-black text-2xl flex items-center justify-center shadow-sm tracking-wide mx-auto">
              {driverName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <button
              type="button"
              onClick={() => alert('Change profile photo')}
              className="w-6 h-6 rounded-full bg-white text-slate-700 border border-slate-200 shadow-xs absolute bottom-0 right-0 flex items-center justify-center hover:bg-slate-50 cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5 stroke-[2]" />
            </button>
          </div>

          {/* Name & Hub */}
          <h2 className="text-xl font-black text-slate-900 tracking-tight mt-2.5">
            {driverName}
          </h2>
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium mt-0.5">
            <Building2 className="w-3.5 h-3.5 text-[#BC0118]" />
            <span>{hubName}</span>
          </div>

          {/* Van Pill */}
          <div className="inline-flex items-center justify-center gap-1.5 bg-[#EEF2FF] text-slate-700 text-xs font-semibold px-3 py-1 rounded-full mt-2.5">
            <Truck className="w-3.5 h-3.5 text-slate-600 stroke-[2]" />
            <span>{assignedVan}</span>
          </div>
        </div>

        {/* 2. Personal Information Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 stroke-[2]" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Personal Information
            </h3>
          </div>

          {/* 2x2 Field Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-[#F0F3FF] rounded-xl p-2.5">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider block">
                FULL NAME
              </span>
              <span className="text-xs font-bold text-slate-900 block mt-0.5">
                {driverName}
              </span>
            </div>

            <div className="bg-[#F0F3FF] rounded-xl p-2.5">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider block">
                DATE OF BIRTH
              </span>
              <span className="text-xs font-bold text-slate-900 block mt-0.5">
                14 Aug 1991 (35y)
              </span>
            </div>

            <div className="bg-[#F0F3FF] rounded-xl p-2.5">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider block">
                GENDER
              </span>
              <span className="text-xs font-bold text-slate-900 block mt-0.5">
                Male
              </span>
            </div>

            <div className="bg-[#F0F3FF] rounded-xl p-2.5">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider block">
                BLOOD GROUP
              </span>
              <span className="text-xs font-bold text-red-600 block mt-0.5">
                {bloodGroup}
              </span>
            </div>
          </div>

          {/* Bottom Policy Notice */}
          <div className="flex items-start gap-1.5 pt-1 text-[11px] text-slate-500 font-normal leading-relaxed">
            <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span>Legal name revisions require government ID upload and Depot Admin re-approval.</span>
          </div>
        </div>

        {/* 3. Contact Information Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4 stroke-[2]" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Contact Information
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowEditContactModal(true)}
              className="text-[#BC0118] text-xs font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Edit</span>
              <Edit2 className="w-3 h-3 stroke-[2.5]" />
            </button>
          </div>

          {/* Primary Mobile */}
          <div className="bg-[#F0F3FF] rounded-xl p-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-medium">Primary Mobile (OTP Login)</span>
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                <Check className="w-3 h-3 stroke-[2.5]" /> Verified
              </span>
            </div>
            <p className="text-xs font-bold text-slate-900 mt-0.5">{primaryPhone}</p>
            <p className="text-[10px] text-slate-400 font-normal mt-0.5">Changes require OTP verification</p>
          </div>

          {/* Alternate Mobile */}
          <div className="bg-[#F0F3FF] rounded-xl p-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-medium">Alternate Mobile</span>
              <span className="text-[10px] text-slate-400 font-medium">Family Backup</span>
            </div>
            <p className="text-xs font-bold text-slate-900 mt-0.5">{altPhone}</p>
          </div>

          {/* Residential / Delivery Base */}
          <div className="bg-[#F0F3FF] rounded-xl p-3">
            <span className="text-[10px] text-slate-400 font-medium block">Residential / Delivery Base</span>
            <p className="text-xs font-bold text-slate-900 mt-0.5">{addressLine1}</p>
            <p className="text-xs text-slate-700 font-bold mt-0.5">{addressLine2}</p>
          </div>
        </div>

        {/* 4. Employment Information Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <FileBadge className="w-4 h-4 stroke-[2]" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Employment Information
              </h3>
            </div>
            <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
              Admin Managed
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Partner ID</span>
              <span className="font-bold text-slate-900">DP-003</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Joining Date</span>
              <span className="font-bold text-slate-900">12 March 2023 (3+ Years)</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Assigned Depot</span>
              <span className="font-bold text-slate-900">Madurai Logistics Node (HQ)</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Primary Beat</span>
              <span className="font-bold text-slate-900">Commercial Hub & Madurai North</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400 font-medium">Employment Type</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Permanent On-Duty</span>
              </span>
            </div>
          </div>
        </div>

        {/* 5. Assigned Vehicle Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4 stroke-[2]" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Assigned Vehicle
              </h3>
            </div>
            <button
              type="button"
              onClick={() => alert('Request Vehicle Swap with Depot Yard')}
              className="text-[#BC0118] text-xs font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>Request Swap</span>
              <span>→</span>
            </button>
          </div>

          {/* Vehicle Box */}
          <div className="bg-[#F0F3FF] rounded-xl p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider">FLEET UNIT</span>
              <span className="font-black text-slate-900 text-xs">TN 58 AX 4821</span>
            </div>

            <div>
              <p className="font-black text-slate-900 text-sm">Tata Ace Gold Diesel</p>
              <p className="text-[11px] text-slate-500 font-normal mt-0.5">Commercial Van • 30 Cylinder Payload</p>
            </div>

            <div className="pt-2 border-t border-slate-200/60 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Driving Licence:</span>
                <span className="font-bold text-slate-900">TN-58-2015-0046019</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Licence Validity:</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <Check className="w-3 h-3 stroke-[2.5]" /> 20 Nov 2028 (Valid)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Fleet Insurance:</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <Check className="w-3 h-3 stroke-[2.5]" /> 15 Oct 2027 (Active)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-1.5 text-[11px] text-slate-500 font-normal leading-relaxed">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span>Vehicle transfers require mandatory depot yard physical inspection before dispatch.</span>
          </div>
        </div>

        {/* 6. Documents & KYC Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 stroke-[2]" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Documents & KYC
              </h3>
            </div>
            <span className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
              4 of 5 Verified
            </span>
          </div>

          <div className="space-y-2">
            {/* Item 1: Identity Proof */}
            <div className="bg-[#F0F3FF] rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-600 shadow-2xs">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 leading-tight">Identity Proof (Aadhaar)</p>
                  <p className="text-[10px] text-slate-400">•••• •••• 2714</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Verified
                </span>
                <button
                  type="button"
                  onClick={() => setShowDocPreviewModal('Identity Proof (Aadhaar)')}
                  className="p-1 text-slate-500 hover:text-black cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Item 2: Driving License */}
            <div className="bg-[#F0F3FF] rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-600 shadow-2xs">
                  <FileBadge className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 leading-tight">Commercial Driving License</p>
                  <p className="text-[10px] text-slate-400">LMV/HMV • Exp 2028</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Verified
                </span>
                <button
                  type="button"
                  onClick={() => setShowDocPreviewModal('Commercial Driving License')}
                  className="p-1 text-slate-500 hover:text-black cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Item 3: Vehicle RC */}
            <div className="bg-[#F0F3FF] rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-600 shadow-2xs">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 leading-tight">Vehicle RC Certificate</p>
                  <p className="text-[10px] text-slate-400">TN 58 AX 4821</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Verified
                </span>
                <button
                  type="button"
                  onClick={() => setShowDocPreviewModal('Vehicle RC Certificate')}
                  className="p-1 text-slate-500 hover:text-black cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Item 4: Fleet Insurance */}
            <div className="bg-[#F0F3FF] rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-600 shadow-2xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 leading-tight">Fleet Insurance Policy</p>
                  <p className="text-[10px] text-slate-400">HDFC ERGO 0821</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Verified
                </span>
                <button
                  type="button"
                  onClick={() => setShowDocPreviewModal('Fleet Insurance Policy')}
                  className="p-1 text-slate-500 hover:text-black cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 7. Account & Security Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 stroke-[2]" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Account & Security
            </h3>
          </div>

          {/* Email / Device Box */}
          <div className="bg-[#F0F3FF] rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-medium block">Registered Login Mail / Id</span>
              <p className="text-xs font-bold text-slate-900 mt-0.5">sureshbabu@gmail.com</p>
            </div>
            <Smartphone className="w-4 h-4 text-slate-400" />
          </div>

          {/* Password Box */}
          <div className="bg-[#F0F3FF] rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-medium block">Portal Access Password</span>
              <p className="text-xs font-bold text-slate-900 mt-0.5 tracking-wider">••••••••••••</p>
            </div>
            <button
              type="button"
              onClick={() => alert('Password reset link sent to registered email.')}
              className="text-[#BC0118] text-xs font-bold hover:underline cursor-pointer"
            >
              Change
            </button>
          </div>

          {/* Session Details */}
          <div className="pt-1 space-y-1.5 text-xs">
            <div className="flex justify-between items-center text-slate-500">
              <span>Active Session Login:</span>
              <span className="font-bold text-slate-900">Today, 07:15 AM</span>
            </div>
            <div className="flex justify-between items-center text-slate-500">
              <span>Depot Terminal:</span>
              <span className="font-bold text-slate-900">Madurai Hub Node 04</span>
            </div>
            <div className="flex justify-between items-center text-slate-500">
              <span>Security Token:</span>
              <span className="font-bold text-emerald-700">SSL v3 Verified</span>
            </div>
          </div>
        </div>

        {/* 8. Bottom Action Button: Update Profile Details */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => {
              setShowSuccessToast(true);
              setTimeout(() => setShowSuccessToast(false), 3000);
            }}
            className="w-full bg-[#BC0118] hover:bg-red-800 active:scale-98 text-white font-bold text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 stroke-[2.2]" />
            <span>Update Profile Details</span>
          </button>
        </div>
      </div>

      {/* Edit Contact Modal */}
      {showEditContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4">
          <div className="w-full max-w-[390px] bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Edit Contact Information</h3>
              <button
                type="button"
                onClick={() => setShowEditContactModal(false)}
                className="p-1 text-slate-400 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Primary Mobile (OTP)</label>
                <input
                  type="text"
                  value={primaryPhone}
                  onChange={(e) => setPrimaryPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Alternate Mobile</label>
                <input
                  type="text"
                  value={altPhone}
                  onChange={(e) => setAltPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Residential Address</label>
                <input
                  type="text"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <input
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 mt-1.5 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditContactModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-xl bg-[#BC0118] hover:bg-red-800 disabled:opacity-50 text-white font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isSaving && (
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  )}
                  <span>{isSaving ? 'Saving to Database...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document View Modal */}
      {showDocPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4">
          <div className="w-full max-w-[380px] bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 space-y-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">{showDocPreviewModal}</h3>
              <button
                type="button"
                onClick={() => setShowDocPreviewModal(null)}
                className="p-1 text-slate-400 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-full h-56 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200 p-4 text-center">
              <div>
                <ShieldCheck className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-800">Verified Document Copy</p>
                <p className="text-[11px] text-slate-400 mt-1">DP-003 Suresh Babu • Madurai Central Hub</p>
                <span className="inline-block mt-3 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Government Validated
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowDocPreviewModal(null)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
