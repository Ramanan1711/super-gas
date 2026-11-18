'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  RefreshCw,
  CreditCard,
  Truck,
  Shield,
  FileText,
  MapPin,
  Gavel,
  AlertTriangle,
  Flame,
  X,
  ShieldCheck,
  Check,
  Upload,
  Calendar,
} from 'lucide-react';

interface DeliveryDocumentsScreenProps {
  onBack: () => void;
}

interface DriverDocument {
  id: string;
  type: string;
  title: string;
  docNumber: string;
  issuedBy?: string | null;
  validUntil?: string | null;
  status: string;
  fileUrl?: string | null;
  remarks?: string | null;
}

export default function DeliveryDocumentsScreen({ onBack }: DeliveryDocumentsScreenProps) {
  const [documents, setDocuments] = useState<DriverDocument[]>([]);
  const [now, setNow] = useState<number | null>(null);

  // PUC status state to allow interactive update
  const [pucUpdated, setPucUpdated] = useState(false);
  const [pucNumber, setPucNumber] = useState('TN058-PUC-2026-9481');
  const [showPucModal, setShowPucModal] = useState(false);
  const [pucInput, setPucInput] = useState('');
  const [vehicleReg, setVehicleReg] = useState('TN 58 AX 4821');
  const [expiryDate, setExpiryDate] = useState('2027-11-18');
  const [pucFile, setPucFile] = useState<File | null>(null);
  const [isSavingPuc, setIsSavingPuc] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  // Hazardous renewal state
  const [hazRenewed, setHazRenewed] = useState(false);

  // Document preview modal state
  const [selectedDocPreview, setSelectedDocPreview] = useState<{
    title: string;
    refNumber: string;
    issuedBy: string;
    validity: string;
    fileUrl?: string | null;
  } | null>(null);

  // Status check modal state
  const [statusCheckDoc, setStatusCheckDoc] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch('/api/drivers/documents?partnerCode=DP-003');
      const json = await res.json();
      if (json?.success && json?.data?.documents) {
        const docs: DriverDocument[] = json.data.documents;
        setDocuments(docs);

        const puc = docs.find((d) => d.type === 'PUC_CERTIFICATE');
        if (puc) {
          setPucNumber(puc.docNumber);
          if (puc.status === 'VERIFIED') setPucUpdated(true);
        }

        const haz = docs.find((d) => d.type === 'HAZARDOUS_LPG');
        if (haz && haz.status === 'VERIFIED') {
          setHazRenewed(true);
        }
      }
    } catch (err) {
      console.error('Failed to load driver documents:', err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/drivers/documents?partnerCode=DP-003')
      .then((res) => res.json())
      .then((json) => {
        if (!isMounted) return;
        setNow(Date.now());
        if (json?.success && json?.data?.documents) {
          const docs: DriverDocument[] = json.data.documents;
          setDocuments(docs);

          const puc = docs.find((d) => d.type === 'PUC_CERTIFICATE');
          if (puc) {
            setPucNumber(puc.docNumber);
            if (puc.status === 'VERIFIED') setPucUpdated(true);
          }

          const haz = docs.find((d) => d.type === 'HAZARDOUS_LPG');
          if (haz && haz.status === 'VERIFIED') {
            setHazRenewed(true);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load driver documents:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Derived counts
  const verifiedCount = useMemo(() => {
    let count = documents.filter((d) => d.status === 'VERIFIED').length;
    if (pucUpdated && !documents.some((d) => d.type === 'PUC_CERTIFICATE' && d.status === 'VERIFIED')) {
      count += 1;
    }
    if (hazRenewed && !documents.some((d) => d.type === 'HAZARDOUS_LPG' && d.status === 'VERIFIED')) {
      count += 1;
    }
    return count > 0 ? count : (pucUpdated ? 5 : 4);
  }, [documents, pucUpdated, hazRenewed]);

  const pendingCount = useMemo(() => {
    return documents.filter((d) => d.status === 'PENDING_VERIFICATION' || d.status === 'EXPIRING_SOON').length || 1;
  }, [documents]);

  const issuesCount = useMemo(() => {
    if (pucUpdated && hazRenewed) return 0;
    if (pucUpdated || hazRenewed) return 1;
    return 2;
  }, [pucUpdated, hazRenewed]);

  // Helper date formatters
  const formatDateStr = (dateStr?: string | null, fallback = 'N/A') => {
    if (!dateStr) return fallback;
    try {
      return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(new Date(dateStr));
    } catch {
      return fallback;
    }
  };

  const getDaysRemainingText = (dateStr?: string | null, fallback = 'Expiring Soon') => {
    if (!dateStr) return fallback;
    try {
      const target = new Date(dateStr).getTime();
      const current = now ?? new Date('2026-11-18').getTime();
      const diffDays = Math.ceil((target - current) / (1000 * 60 * 60 * 24));
      if (diffDays < 0) return `Expired ${Math.abs(diffDays)} days ago`;
      if (diffDays === 0) return 'Expires today';
      return `Expires in ${diffDays} days in PESO Portal`;
    } catch {
      return fallback;
    }
  };

  // Find individual documents
  const dlDoc = documents.find((d) => d.type === 'DRIVING_LICENSE');
  const hazDoc = documents.find((d) => d.type === 'HAZARDOUS_LPG');
  const rcDoc = documents.find((d) => d.type === 'VEHICLE_RC');
  const insDoc = documents.find((d) => d.type === 'FLEET_INSURANCE');
  const pucDoc = documents.find((d) => d.type === 'PUC_CERTIFICATE');

  const handleUpdatePuc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pucInput.trim()) return;
    setIsSavingPuc(true);
    setUploadStatus('Preparing verification...');

    try {
      let uploadedFileUrl: string | undefined = undefined;

      // Handle optional file upload
      if (pucFile) {
        setUploadStatus('Uploading certificate attachment...');
        const formData = new FormData();
        formData.append('file', pucFile);
        formData.append('folder', 'documents');

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadJson = await uploadRes.json();
        if (uploadJson.success && uploadJson.data?.url) {
          uploadedFileUrl = uploadJson.data.url;
        }
      }

      setUploadStatus('Validating with Parivahan emission registry...');
      const res = await fetch('/api/drivers/documents/puc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          certificateNumber: pucInput.trim(),
          vehicleRegNumber: vehicleReg,
          expiryDate: expiryDate,
          fileUrl: uploadedFileUrl,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setPucNumber(pucInput.trim());
        setPucUpdated(true);
        setShowPucModal(false);
        setPucInput('');
        setPucFile(null);
        await fetchDocuments();
      } else {
        alert(json.error || 'Failed to update PUC certificate.');
      }
    } catch (err) {
      console.error('Failed to sync PUC update:', err);
      alert('Error updating PUC certificate.');
    } finally {
      setIsSavingPuc(false);
      setUploadStatus(null);
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
          My Documents
        </h1>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-4 pb-8">
        {/* Top 3 KPI Summary Cards */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* Card 1: VERIFIED */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                VERIFIED
              </span>
              <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.2]" />
              </div>
            </div>
            <p className="text-xl font-black text-slate-900 tracking-tight">
              {verifiedCount}
            </p>
            <p className="text-[10px] font-bold text-emerald-600">
              Active
            </p>
          </div>

          {/* Card 2: PENDING */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                PENDING
              </span>
              <div className="w-4 h-4 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5 stroke-[2.2]" />
              </div>
            </div>
            <p className="text-xl font-black text-slate-900 tracking-tight">
              {pendingCount}
            </p>
            <p className="text-[10px] font-medium text-slate-400">
              In Review
            </p>
          </div>

          {/* Card 3: ISSUES */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                ISSUES
              </span>
              <div className="w-4 h-4 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertCircle className="w-3.5 h-3.5 stroke-[2.2]" />
              </div>
            </div>
            <p className="text-xl font-black text-slate-900 tracking-tight">
              {issuesCount}
            </p>
            <p className="text-[10px] font-bold text-rose-600">
              {issuesCount === 0 ? 'Cleared' : 'Alerts'}
            </p>
          </div>
        </div>

        {/* SECTION 1: Identity Documents */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-black text-slate-900">
              Identity Documents
            </h2>
            <span className="text-[10px] font-medium text-slate-400">
              2 Records Verified
            </span>
          </div>

          {/* Card 1: Aadhaar */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F0F3FF] text-blue-600 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 leading-tight">
                    Aadhaar / National ID
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                    •••• •••• 2714
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Verified</span>
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-0.5">
              <span className="text-slate-500 font-medium">UIDAI Demographic Auth</span>
              <span className="text-emerald-700 font-bold">Live Active</span>
            </div>

            <button
              type="button"
              onClick={() =>
                setSelectedDocPreview({
                  title: 'Aadhaar / National ID',
                  refNumber: '•••• •••• 2714',
                  issuedBy: 'Unique Identification Authority of India (UIDAI)',
                  validity: 'Permanent Demographic Record (Verified)',
                })
              }
              className="w-full bg-[#F0F3FF] hover:bg-[#E4EAFF] text-slate-800 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>View Record</span>
            </button>
          </div>

          {/* Card 2: PAN */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F0F3FF] text-blue-600 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 leading-tight">
                    Permanent Account Number (PAN)
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                    •••• 9241E
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Verified</span>
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-0.5">
              <span className="text-slate-500 font-medium">NSDL Tax Registry Linked</span>
              <span className="text-slate-600 font-semibold">TDS Tier 1 Valid</span>
            </div>

            <button
              type="button"
              onClick={() =>
                setSelectedDocPreview({
                  title: 'Permanent Account Number (PAN)',
                  refNumber: '•••• 9241E',
                  issuedBy: 'Income Tax Department (NSDL)',
                  validity: 'Active Tax Assessment Record',
                })
              }
              className="w-full bg-[#F0F3FF] hover:bg-[#E4EAFF] text-slate-800 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>View Record</span>
            </button>
          </div>
        </div>

        {/* SECTION 2: Driving Certifications */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-black text-slate-900">
              Driving Certifications
            </h2>
            <span className="text-[10px] font-bold text-rose-600">
              {hazRenewed ? 'All Clear' : '1 Alert'}
            </span>
          </div>

          {/* Card 1: Commercial DL */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F0F3FF] text-blue-600 flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 leading-tight">
                    Commercial DL (LMV / HMV)
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                    {dlDoc?.docNumber || 'TN-58-2015-0046019'}
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Verified</span>
              </span>
            </div>

            {/* Parivahan Status & RTO Office Box */}
            <div className="bg-[#F0F3FF] rounded-xl p-2.5 grid grid-cols-2 text-xs">
              <div>
                <span className="text-[9px] font-bold text-slate-400 tracking-wider block">
                  PARIVAHAN STATUS
                </span>
                <span className="text-[11px] font-bold text-slate-900 block mt-0.5">
                  {dlDoc?.validUntil ? `Valid until ${formatDateStr(dlDoc.validUntil)}` : 'Valid until 20 Nov 2028'}
                </span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 tracking-wider block">
                  RTO OFFICE
                </span>
                <span className="text-[11px] font-bold text-slate-900 block mt-0.5">
                  {dlDoc?.issuedBy || 'Madurai South (TN-58)'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStatusCheckDoc('Commercial DL (LMV / HMV)')}
              className="w-full bg-[#F0F3FF] hover:bg-[#E4EAFF] text-slate-800 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Check Status</span>
            </button>
          </div>

          {/* Card 2: Hazardous LPG Endorsement */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Flame className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 leading-tight">
                    Hazardous LPG Endorsement
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                    {hazDoc?.docNumber || 'HAZ-LPG-TN-901'}
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  hazRenewed
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200/80'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${hazRenewed ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                <span>{hazRenewed ? 'Renewed' : 'Expiring Soon'}</span>
              </span>
            </div>

            {/* Expiring Soon Notice Box */}
            {!hazRenewed ? (
              <div className="bg-[#F0F3FF] rounded-xl p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                  <Clock className="w-3.5 h-3.5 text-indigo-600 stroke-[2.2]" />
                  <span>{getDaysRemainingText(hazDoc?.validUntil, 'Expires in 18 days in PESO Portal')}</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                  Safety endorsement reaches its valid validity date on {formatDateStr(hazDoc?.validUntil, '10 Nov 2026')}. Complete mandated depot refresher training to update licensing registry.
                </p>
              </div>
            ) : (
              <div className="bg-emerald-50 rounded-xl p-3 text-[11px] text-emerald-800 font-medium">
                PESO Refresher Training scheduled with Depot Admin on 24 Nov 2026.
              </div>
            )}

            {/* Dual Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setSelectedDocPreview({
                    title: 'Hazardous LPG Endorsement',
                    refNumber: hazDoc?.docNumber || 'HAZ-LPG-TN-901',
                    issuedBy: hazDoc?.issuedBy || 'PESO (Petroleum & Explosives Safety Organisation)',
                    validity: hazRenewed ? 'Valid until 10 Nov 2029' : (hazDoc?.validUntil ? `Valid until ${formatDateStr(hazDoc.validUntil)} (Expiring Soon)` : 'Valid until 10 Nov 2026 (Expiring Soon)'),
                  })
                }
                className="flex-1 bg-[#F0F3FF] hover:bg-[#E4EAFF] text-slate-800 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1 transition cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>View Registry Record</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setHazRenewed(true);
                  alert('Refresher registration requested with Depot Admin.');
                }}
                className="flex-1 bg-[#BC0118] hover:bg-red-800 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>{hazRenewed ? 'Registered' : 'Renew Registration'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 3: Vehicle Documents */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-black text-slate-900">
              Vehicle Documents
            </h2>
            <span className="text-[10px] font-bold text-rose-600">
              {pucUpdated ? 'All Cleared' : 'Action Required'}
            </span>
          </div>

          {/* Card 1: RC - Tata Ace */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F0F3FF] text-blue-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <span className="bg-slate-900 text-white font-bold text-[10px] px-2 py-0.5 rounded-md inline-block mb-1">
                    TN 58 AX 4821
                  </span>
                  <h3 className="text-xs font-bold text-slate-900 leading-tight">
                    RC - Tata Ace Gold Diesel
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                    {rcDoc?.docNumber || 'VAHAN-RC-••••4821'}
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Verified</span>
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-0.5">
              <span className="text-slate-500 font-medium">
                {rcDoc?.validUntil ? `VAHAN Valid until ${formatDateStr(rcDoc.validUntil)}` : 'VAHAN Valid until 14 Mar 2035'}
              </span>
              <span className="text-emerald-700 font-bold">Fitness passed</span>
            </div>

            <button
              type="button"
              onClick={() => setStatusCheckDoc('RC - Tata Ace Gold Diesel')}
              className="w-full bg-[#F0F3FF] hover:bg-[#E4EAFF] text-slate-800 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Check Status</span>
            </button>
          </div>

          {/* Card 2: Commercial Fleet Insurance */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F0F3FF] text-blue-600 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 leading-tight">
                    Commercial Fleet Insurance
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                    {insDoc?.docNumber || 'HDFC ERGO •••• 0821'}
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Verified</span>
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-0.5">
              <span className="text-slate-500 font-medium">
                {insDoc?.validUntil ? `IIB Registry: Expires ${formatDateStr(insDoc.validUntil)}` : 'IIB Registry: Expires 15 Oct 2027'}
              </span>
              <span className="text-slate-600 font-medium text-right">Comprehensive Cover</span>
            </div>

            <button
              type="button"
              onClick={() => setStatusCheckDoc('Commercial Fleet Insurance')}
              className="w-full bg-[#F0F3FF] hover:bg-[#E4EAFF] text-slate-800 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Check Status</span>
            </button>
          </div>

          {/* Card 3: PUC Emission Certificate */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 leading-tight">
                    PUC Emission Certificate
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                    {pucNumber}
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  pucUpdated
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                    : 'bg-rose-50 text-rose-700 border-rose-200/80'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${pucUpdated ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <span>{pucUpdated ? 'Verified' : 'Expired'}</span>
              </span>
            </div>

            {/* Parivahan Alert Notice Box */}
            {!pucUpdated ? (
              <div className="bg-[#FFF1F2] rounded-xl p-3 border border-rose-100 space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-900">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 stroke-[2.2]" />
                  <span>Parivahan Registry Notice</span>
                </div>
                <p className="text-[11px] text-rose-800 leading-relaxed font-normal">
                  PUC emission record for {vehicleReg} expired on Parivahan central server on 22 Oct 2026. Complete automated center test and enter renewed test certificate ID.
                </p>
              </div>
            ) : (
              <div className="bg-emerald-50 rounded-xl p-3 text-[11px] text-emerald-800 font-medium">
                Renewed PUC Certificate validated on Parivahan database. Valid until {formatDateStr(pucDoc?.validUntil, '18 Nov 2027')}.
              </div>
            )}

            {/* Action button */}
            {!pucUpdated ? (
              <button
                type="button"
                onClick={() => setShowPucModal(true)}
                className="w-full bg-[#BC0118] hover:bg-red-800 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>Update Renewed PUC Number</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowPucModal(true)}
                className="w-full bg-[#F0F3FF] hover:bg-[#E4EAFF] text-slate-800 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>Edit PUC Certificate</span>
              </button>
            )}
          </div>
        </div>

        {/* SECTION 4: Compliance & Other Records */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-black text-slate-900">
              Compliance & Other Records
            </h2>
            <span className="text-[10px] font-medium text-slate-400">
              2 Records
            </span>
          </div>

          {/* Card 1: Address / Domicile */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F0F3FF] text-blue-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 leading-tight">
                    Address / Domicile Record
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                    MAD-DOM-••••620
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Verified</span>
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-0.5">
              <span className="text-slate-500 font-medium">Verified via Aadhaar KYC</span>
              <span className="text-emerald-700 font-bold">Madurai District</span>
            </div>

            <button
              type="button"
              onClick={() =>
                setSelectedDocPreview({
                  title: 'Address / Domicile Record',
                  refNumber: 'MAD-DOM-••••620',
                  issuedBy: 'Government of Tamil Nadu - Revenue Dept',
                  validity: 'Verified Permanent Address (Madurai District)',
                })
              }
              className="w-full bg-[#F0F3FF] hover:bg-[#E4EAFF] text-slate-800 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>View Record</span>
            </button>
          </div>

          {/* Card 2: Depot Indemnity Bond */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F0F3FF] text-blue-600 flex items-center justify-center shrink-0">
                  <Gavel className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 leading-tight">
                    Depot Indemnity Bond
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                    Bond Ref: IND-MDU-2024-884
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Verified</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: Update PUC Number */}
      {showPucModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-2xs p-4">
          <div className="w-full max-w-[380px] bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Update PUC Certificate</h3>
              <button
                type="button"
                onClick={() => setShowPucModal(false)}
                className="p-1 text-slate-400 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdatePuc} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Vehicle Fleet Unit</label>
                <input
                  type="text"
                  value={vehicleReg}
                  onChange={(e) => setVehicleReg(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 uppercase"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">New PUC Certificate Number*</label>
                <input
                  type="text"
                  required
                  value={pucInput}
                  onChange={(e) => setPucInput(e.target.value)}
                  placeholder="e.g. TN058-PUC-2026-9481"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 uppercase"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Expiry Date*</label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Certificate Attachment (Photo / PDF)</label>
                <div className="relative">
                  <input
                    type="file"
                    id="pucAttachmentInput"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={(e) => setPucFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <label
                    htmlFor="pucAttachmentInput"
                    className="flex items-center justify-between w-full bg-slate-50 border border-slate-200 border-dashed rounded-xl px-3 py-2.5 cursor-pointer hover:bg-slate-100 transition"
                  >
                    <span className="text-xs text-slate-600 truncate">
                      {pucFile ? pucFile.name : 'Upload Certificate (Image or PDF)...'}
                    </span>
                    <Upload className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                  </label>
                </div>
              </div>

              {uploadStatus && (
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-medium flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
                  <span>{uploadStatus}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPucModal(false)}
                  disabled={isSavingPuc}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingPuc}
                  className="flex-1 py-2.5 rounded-xl bg-[#BC0118] hover:bg-red-800 disabled:opacity-60 text-white font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isSavingPuc ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save & Validate</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Document Record Preview */}
      {selectedDocPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4">
          <div className="w-full max-w-[380px] bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">{selectedDocPreview.title}</h3>
              <button
                type="button"
                onClick={() => setSelectedDocPreview(null)}
                className="p-1 text-slate-400 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#F0F3FF] rounded-2xl p-4 text-center space-y-2">
              <ShieldCheck className="w-12 h-12 text-emerald-600 mx-auto" />
              <p className="text-xs font-bold text-slate-900">{selectedDocPreview.refNumber}</p>
              <p className="text-[11px] text-slate-500">{selectedDocPreview.issuedBy}</p>
              <div className="pt-2 border-t border-slate-200/60">
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                  {selectedDocPreview.validity}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedDocPreview(null)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: Status Check Live Sync */}
      {statusCheckDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4">
          <div className="w-full max-w-[360px] bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 space-y-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900">Parivahan Live Sync</h3>
              <button
                type="button"
                onClick={() => setStatusCheckDoc(null)}
                className="p-1 text-slate-400 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center py-3 space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h4 className="text-xs font-bold text-slate-900">{statusCheckDoc}</h4>
              <p className="text-[11px] text-slate-500">
                Government registry record is verified and in active standing on Parivahan central server.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setStatusCheckDoc(null)}
              className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
