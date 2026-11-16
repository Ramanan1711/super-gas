'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import AdminSidebar from './AdminSidebar';
import {
  Bell,
  Download,
  Plus,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Minus,
  ShieldCheck,
  X,
  Check,
  Truck,
  RotateCcw,
  MapPin,
  Flame,
  User,
} from 'lucide-react';

interface PartnerMovement {
  id: string;
  name: string;
  code: string;
  route: string;
  filledIssued: number;
  filledReturned: number;
  emptyCollected: number;
  emptyDeposited: number;
  currentFilled: number;
  currentEmpty: number;
  lastDispatch: string;
  status: 'In Field' | 'Depot' | 'Not Started';
}

interface StockItem {
  id: string;
  type: string;
  category: 'Domestic' | 'Commercial' | 'Industrial';
  state: 'FILLED' | 'EMPTY';
  openingBalance: number;
  stockReceived: number;
  issuedToPartners: number;
  returnedByPartners: number;
  adjustments: number;
  availableQuantity: number;
  minReserveLevel: string;
  status: 'Low Stock' | 'Available' | 'Healthy' | 'Adequate';
}

interface AuditRecord {
  id: string;
  ref: string;
  dateTime: string;
  type: 'Issue to Partner' | 'Empty Return' | 'Refill Arrival' | 'Dispatch to Plant';
  condition: 'FILLED' | 'EMPTY';
  quantity: string;
  source: string;
  destination: string;
  recordedBy: string;
  status: 'COMPLETED' | 'PENDING';
}

// Initial movements dataset matching mockup
const initialMovements: PartnerMovement[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    code: 'DP-01',
    route: 'Anna Nagar',
    filledIssued: 25,
    filledReturned: 0,
    emptyCollected: 14,
    emptyDeposited: 0,
    currentFilled: 10,
    currentEmpty: 14,
    lastDispatch: '07:30 AM',
    status: 'In Field',
  },
  {
    id: '2',
    name: 'Mohamed Irfan',
    code: 'DP-02',
    route: 'KK Nagar',
    filledIssued: 20,
    filledReturned: 0,
    emptyCollected: 8,
    emptyDeposited: 0,
    currentFilled: 5,
    currentEmpty: 8,
    lastDispatch: '08:15 AM',
    status: 'In Field',
  },
  {
    id: '3',
    name: 'Suresh Babu',
    code: 'DP-03',
    route: 'Tallakulam',
    filledIssued: 22,
    filledReturned: 0,
    emptyCollected: 9,
    emptyDeposited: 5,
    currentFilled: 12,
    currentEmpty: 4,
    lastDispatch: '07:45 AM',
    status: 'In Field',
  },
  {
    id: '4',
    name: 'Karthik Raja',
    code: 'DP-04',
    route: 'Bypass Road',
    filledIssued: 11,
    filledReturned: 0,
    emptyCollected: 11,
    emptyDeposited: 10,
    currentFilled: 0,
    currentEmpty: 1,
    lastDispatch: '08:45 AM',
    status: 'In Field',
  },
  {
    id: '5',
    name: 'Vignesh V',
    code: 'DP-05',
    route: 'Mattuthavani',
    filledIssued: 0,
    filledReturned: 0,
    emptyCollected: 0,
    emptyDeposited: 0,
    currentFilled: 0,
    currentEmpty: 0,
    lastDispatch: '--',
    status: 'Not Started',
  },
];

// Master stock items matching mockup
const initialStockItems: StockItem[] = [
  {
    id: 's1',
    type: '14.2 kg Domestic',
    category: 'Domestic',
    state: 'FILLED',
    openingBalance: 140,
    stockReceived: 0,
    issuedToPartners: -40,
    returnedByPartners: 0,
    adjustments: 0,
    availableQuantity: 100,
    minReserveLevel: '200 units',
    status: 'Low Stock',
  },
  {
    id: 's2',
    type: '14.2 kg Domestic',
    category: 'Domestic',
    state: 'EMPTY',
    openingBalance: 77,
    stockReceived: 0,
    issuedToPartners: 0,
    returnedByPartners: 18,
    adjustments: 0,
    availableQuantity: 95,
    minReserveLevel: 'Max 250',
    status: 'Available',
  },
  {
    id: 's3',
    type: '19.5 kg Commercial',
    category: 'Commercial',
    state: 'FILLED',
    openingBalance: 74,
    stockReceived: 20,
    issuedToPartners: -52,
    returnedByPartners: 0,
    adjustments: 0,
    availableQuantity: 42,
    minReserveLevel: '40 units',
    status: 'Healthy',
  },
  {
    id: 's4',
    type: '19.5 kg Commercial',
    category: 'Commercial',
    state: 'EMPTY',
    openingBalance: 29,
    stockReceived: 0,
    issuedToPartners: 0,
    returnedByPartners: 8,
    adjustments: 0,
    availableQuantity: 37,
    minReserveLevel: 'Max 120',
    status: 'Available',
  },
  {
    id: 's5',
    type: '47.5 kg Industrial',
    category: 'Industrial',
    state: 'FILLED',
    openingBalance: 15,
    stockReceived: 0,
    issuedToPartners: -3,
    returnedByPartners: 0,
    adjustments: 0,
    availableQuantity: 12,
    minReserveLevel: '10 units',
    status: 'Adequate',
  },
  {
    id: 's6',
    type: '47.5 kg Industrial',
    category: 'Industrial',
    state: 'EMPTY',
    openingBalance: 4,
    stockReceived: 0,
    issuedToPartners: 0,
    returnedByPartners: 2,
    adjustments: 0,
    availableQuantity: 6,
    minReserveLevel: 'Max 40',
    status: 'Available',
  },
];

// Audit ledger entries
const initialAuditRecords: AuditRecord[] = [
  {
    id: 'a1',
    ref: '#MV-20261016-04',
    dateTime: 'Oct 16, 08:45 AM',
    type: 'Issue to Partner',
    condition: 'FILLED',
    quantity: '11 units',
    source: 'Depot Bay A',
    destination: 'Karthik Raja (DP-004)',
    recordedBy: 'Agency Admin',
    status: 'COMPLETED',
  },
  {
    id: 'a2',
    ref: '#MV-20261016-03',
    dateTime: 'Oct 16, 08:15 AM',
    type: 'Issue to Partner',
    condition: 'FILLED',
    quantity: '20 units',
    source: 'Depot Bay A',
    destination: 'Suresh Babu (DP-003)',
    recordedBy: 'Agency Admin',
    status: 'COMPLETED',
  },
  {
    id: 'a3',
    ref: '#MV-20261016-02',
    dateTime: 'Oct 16, 07:55 AM',
    type: 'Empty Return',
    condition: 'EMPTY',
    quantity: '+5 units',
    source: 'Mohamed Irfan (DP-002)',
    destination: 'Depot Yard Empties',
    recordedBy: 'Agency Admin',
    status: 'COMPLETED',
  },
  {
    id: 'a4',
    ref: '#MV-20261016-01',
    dateTime: 'Oct 16, 07:30 AM',
    type: 'Refill Arrival',
    condition: 'FILLED',
    quantity: '+20 units',
    source: 'Indian Oil Plant Bottling Truck',
    destination: 'Depot Bay C',
    recordedBy: 'Plant Logistics Handover',
    status: 'COMPLETED',
  },
];

export default function AdminInventoryPage() {
  const [showAlertBanner, setShowAlertBanner] = useState(true);
  const [actionToast, setActionToast] = useState<string | null>(null);

  // Quick Issue Form State
  const [issuePartner, setIssuePartner] = useState('Rajesh Kumar (DP-001) - Anna Nagar Route');
  const [issueQty19, setIssueQty19] = useState(10);
  const [issueQty14, setIssueQty14] = useState(0);

  // Record Empty Return Form State (matching exact Figma design)
  const [returnPartner, setReturnPartner] = useState(
    'Suresh Babu (DP-003) · Expected Empties: 9 units'
  );
  const [returnQty, setReturnQty] = useState('9');
  const [inspectionRemarks, setInspectionRemarks] = useState(
    'All seals checked; zero tare-weight valve leakages'
  );
  const [inspectionChecked, setInspectionChecked] = useState(true);

  // Agency Stock Filter Tab
  const [stockCategoryFilter, setStockCategoryFilter] = useState<'All' | 'Commercial' | 'Domestic' | 'Industrial'>('All');

  // Audit Ledger Filter Chips
  const [auditFilter, setAuditFilter] = useState<'All' | 'Issues' | 'Returns' | 'Plant' | 'Refills'>('All');

  // Modals state
  const [showRefillModal, setShowRefillModal] = useState(false);
  const [showStockMovementModal, setShowStockMovementModal] = useState(false);
  const [viewPartnerDetails, setViewPartnerDetails] = useState<PartnerMovement | null>(null);

  interface CylinderMovementItem {
    id: string;
    size: string;
    state: string;
    quantity: string;
    price: string;
  }

  // Record Stock Movement Modal State (matching exact attached design)
  const [movementCategory, setMovementCategory] = useState('Receive Filled Cylinders');
  const [truckBillNumber, setTruckBillNumber] = useState('');
  const [cylinderItems, setCylinderItems] = useState<CylinderMovementItem[]>([
    {
      id: 'c-1',
      size: '14.2 Kg Domestic',
      state: 'Filled (Sealed & Checked)',
      quantity: '20',
      price: '',
    },
  ]);

  const handleAddCylinderCategory = () => {
    setCylinderItems((prev) => [
      ...prev,
      {
        id: `c-${prev.length + 1}`,
        size: '14.2 Kg Domestic',
        state: 'Filled (Sealed & Checked)',
        quantity: '20',
        price: '',
      },
    ]);
    triggerToast('Added cylinder category row.');
  };

  const handleUpdateCylinderItem = (
    id: string,
    field: keyof CylinderMovementItem,
    val: string
  ) => {
    setCylinderItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  const handleRemoveCylinderItem = (id: string) => {
    if (cylinderItems.length <= 1) return;
    setCylinderItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCommitMovementEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const totalQty = cylinderItems.reduce(
      (sum, item) => sum + (parseInt(item.quantity, 10) || 0),
      0
    );
    const refNum = truckBillNumber.trim() || `TNO:${10000 + (auditRecords.length + 1) * 73}`;
    const newRef = `#MV-20261016-${(auditRecords.length + 1).toString().padStart(2, '0')}`;

    const primaryState = cylinderItems[0]?.state || 'Filled (Sealed & Checked)';
    const isFilled = primaryState.includes('Filled');
    const recordType: AuditRecord['type'] =
      movementCategory === 'Receive Filled Cylinders'
        ? 'Refill Arrival'
        : movementCategory === 'Issue to Delivery Partner'
        ? 'Issue to Partner'
        : 'Empty Return';

    setAuditRecords((prev) => [
      {
        id: `a-${prev.length + 1}`,
        ref: newRef,
        dateTime: 'Oct 16, Just Now',
        type: recordType,
        condition: isFilled ? 'FILLED' : 'EMPTY',
        quantity: isFilled ? `${totalQty} units` : `+${totalQty} units`,
        source: 'Plant Indent / External Truck',
        destination: 'Depot Yard Central',
        recordedBy: 'Agency Admin',
        status: 'COMPLETED',
      },
      ...prev,
    ]);

    triggerToast(
      `Movement committed: ${totalQty} units across ${cylinderItems.length} categories under ref ${refNum}`
    );
    setShowStockMovementModal(false);
  };

  // Record Cylinder Issue Modal State (matching exact attached design)
  const [showRecordCylinderIssueModal, setShowRecordCylinderIssueModal] = useState(false);
  const [modalSelectedPartner, setModalSelectedPartner] = useState('Rajesh Kumar (DP-001)');
  const [gatePassNotes, setGatePassNotes] = useState('');

  interface IssueCylinderItem {
    id: string;
    size: string;
    quantity: string;
  }

  const [issueCylinderItems, setIssueCylinderItems] = useState<IssueCylinderItem[]>([
    {
      id: 'issue-1',
      size: '14.2 Kg Domestic',
      quantity: '10',
    },
  ]);

  const handleAddIssueCylinderSize = () => {
    setIssueCylinderItems((prev) => [
      ...prev,
      {
        id: `issue-${prev.length + 1}`,
        size: prev.length === 1 ? '19.2 Kg Commercial' : '14.2 Kg Domestic',
        quantity: '10',
      },
    ]);
    triggerToast('Added cylinder size row.');
  };

  const handleUpdateIssueCylinderItem = (
    id: string,
    field: keyof IssueCylinderItem,
    val: string
  ) => {
    setIssueCylinderItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  const handleRemoveIssueCylinderItem = (id: string) => {
    if (issueCylinderItems.length <= 1) return;
    setIssueCylinderItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCommitCylinderIssue = (e: React.FormEvent) => {
    e.preventDefault();
    const totalQty = issueCylinderItems.reduce(
      (sum, item) => sum + (parseInt(item.quantity, 10) || 0),
      0
    );
    const newRef = `#MV-20261016-${(auditRecords.length + 1).toString().padStart(2, '0')}`;

    setAuditRecords((prev) => [
      {
        id: `a-${prev.length + 1}`,
        ref: newRef,
        dateTime: 'Oct 16, Just Now',
        type: 'Issue to Partner',
        condition: 'FILLED',
        quantity: `${totalQty} units`,
        source: 'Depot Bay A',
        destination: modalSelectedPartner,
        recordedBy: 'Agency Admin',
        status: 'COMPLETED',
      },
      ...prev,
    ]);

    setMovements((prev) =>
      prev.map((p) => {
        if (modalSelectedPartner.includes(p.name) || modalSelectedPartner.includes(p.code)) {
          return {
            ...p,
            filledIssued: p.filledIssued + totalQty,
            currentFilled: p.currentFilled + totalQty,
            lastDispatch: 'Just Now',
          };
        }
        return p;
      })
    );

    triggerToast(`Gate pass issued: ${totalQty} filled cylinders dispatched to ${modalSelectedPartner}`);
    setShowRecordCylinderIssueModal(false);
  };

  // Datasets state
  const [movements, setMovements] = useState<PartnerMovement[]>(initialMovements);
  const [stockItems] = useState<StockItem[]>(initialStockItems);
  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>(initialAuditRecords);

  const triggerToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 3000);
  };

  // Filtered Stock Items
  const filteredStock = useMemo(() => {
    if (stockCategoryFilter === 'All') return stockItems;
    return stockItems.filter((item) => item.category === stockCategoryFilter);
  }, [stockItems, stockCategoryFilter]);

  // Filtered Audit Records
  const filteredAudit = useMemo(() => {
    if (auditFilter === 'All') return auditRecords;
    if (auditFilter === 'Issues') return auditRecords.filter((a) => a.type === 'Issue to Partner');
    if (auditFilter === 'Returns') return auditRecords.filter((a) => a.type === 'Empty Return');
    if (auditFilter === 'Plant') return auditRecords.filter((a) => a.type === 'Dispatch to Plant');
    if (auditFilter === 'Refills') return auditRecords.filter((a) => a.type === 'Refill Arrival');
    return auditRecords;
  }, [auditRecords, auditFilter]);

  // Quick Issue Submit
  const handleQuickIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalIssued = issueQty19 + issueQty14;
    if (totalIssued === 0) {
      triggerToast('Please select at least 1 cylinder to issue.');
      return;
    }

    const partnerName = issuePartner.split(' (')[0];
    setMovements((prev) =>
      prev.map((p) => {
        if (p.name.includes(partnerName)) {
          return {
            ...p,
            filledIssued: p.filledIssued + totalIssued,
            currentFilled: p.currentFilled + totalIssued,
            lastDispatch: 'Just Now',
            status: 'In Field',
          };
        }
        return p;
      })
    );

    const newRef = `#MV-20261016-${(auditRecords.length + 1).toString().padStart(2, '0')}`;
    setAuditRecords((prev) => [
      {
        id: `a-${Date.now()}`,
        ref: newRef,
        dateTime: 'Oct 16, Just Now',
        type: 'Issue to Partner',
        condition: 'FILLED',
        quantity: `${totalIssued} units`,
        source: 'Depot Bay A',
        destination: issuePartner,
        recordedBy: 'Agency Admin',
        status: 'COMPLETED',
      },
      ...prev,
    ]);

    triggerToast(`Gate Pass issued for ${totalIssued} cylinders to ${partnerName}.`);
    setIssueQty19(0);
    setIssueQty14(0);
  };

  // Record Empty Return Submit
  const handleEmptyReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qtyNum = parseInt(returnQty, 10) || 0;
    if (qtyNum === 0) {
      triggerToast('Please specify returned empty cylinder quantity.');
      return;
    }

    const partnerName = returnPartner.split(' (')[0];
    setMovements((prev) =>
      prev.map((p) => {
        if (p.name.includes(partnerName)) {
          return {
            ...p,
            emptyDeposited: p.emptyDeposited + qtyNum,
            currentEmpty: Math.max(0, p.currentEmpty - qtyNum),
          };
        }
        return p;
      })
    );

    const newRef = `#MV-20261016-${(auditRecords.length + 1).toString().padStart(2, '0')}`;
    setAuditRecords((prev) => [
      {
        id: `a-${prev.length + 1}`,
        ref: newRef,
        dateTime: 'Oct 16, Just Now',
        type: 'Empty Return',
        condition: 'EMPTY',
        quantity: `+${qtyNum} units`,
        source: returnPartner,
        destination: 'Depot Yard Empties',
        recordedBy: 'Agency Admin',
        status: 'COMPLETED',
      },
      ...prev,
    ]);

    triggerToast(`Empty cylinder receipt confirmed: ${qtyNum} units from ${partnerName}.`);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Ref #', 'Date Time', 'Type', 'Condition', 'Quantity', 'Source', 'Destination', 'Recorded By', 'Status'];
    const rows = auditRecords.map((a) => [
      a.ref,
      a.dateTime,
      a.type,
      a.condition,
      a.quantity,
      a.source,
      a.destination,
      a.recordedBy,
      a.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', 'supergas_inventory_ledger.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-800 font-sans antialiased">
      {/* 1. Left Sidebar Navigation */}
      <AdminSidebar className="sticky top-0 h-screen z-30 border-r border-slate-200/90 rounded-none shrink-0" />

      {/* 2. Main Scrollable Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200/90 px-6 flex items-center justify-between sticky top-0 z-20">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs">
            <span className="w-4 h-4 rounded-full bg-[#E81B24] inline-block shrink-0"></span>
            <Link href="/admin" className="text-slate-500 hover:text-slate-800 font-medium transition">
              Dashboard
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-slate-900 font-extrabold">Inventory</span>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3.5">
            <span className="inline-flex items-center gap-1.5 bg-[#DCFCE7] text-[#16A34A] text-xs font-bold px-3 py-1 rounded-full shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse"></span>
              <span>Agency: Operational</span>
            </span>

            <button
              type="button"
              className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full ring-2 ring-white"></span>
            </button>

            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-[#BC0118] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                <User className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-extrabold text-slate-900 leading-tight">Agency Admin</p>
                <p className="text-[10px] text-slate-400 font-medium leading-tight">HQ Branch</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="p-6 sm:p-8 space-y-6 max-w-[1600px] w-full mx-auto">
          {/* Header Title Bar */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Inventory Management
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-semibold border border-blue-100">
                  <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Depot Location: Central Depot, Madurai (Auth Depot 2026-HQ)</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-3xl">
                Manage cylinder stock flow across agency warehouse, active partner custody, buffer pools, and live reconciliation logs.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleExportCSV}
                className="bg-white border border-slate-200/90 hover:bg-slate-50 active:scale-98 text-slate-800 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-2xs transition flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-600 stroke-[2.2]" />
                <span>Export Ledger</span>
              </button>

              <button
                type="button"
                onClick={() => setShowStockMovementModal(true)}
                className="bg-[#BC0118] hover:bg-red-800 active:scale-98 text-white font-bold text-xs sm:text-sm px-4.5 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Record Stock Movement</span>
              </button>
            </div>
          </div>

          {/* Critical Warning Alert Banner */}
          {showAlertBanner && (
            <div className="bg-[#FEF2F2] border border-red-200 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs animate-in fade-in duration-200">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-red-950">
                    Low Stock Level Alert: 14.2 kg Domestic Filled
                  </h3>
                  <p className="text-xs text-red-700 font-medium mt-0.5">
                    Current balance is 100 units (Safety floor: 200 units). 100 units below reserve threshold.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
                <button
                  type="button"
                  onClick={() => setShowRefillModal(true)}
                  className="bg-[#BC0118] hover:bg-red-800 active:scale-98 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition cursor-pointer"
                >
                  Request Stock Refill
                </button>
                <button
                  type="button"
                  onClick={() => setShowAlertBanner(false)}
                  className="text-xs font-bold text-red-800 hover:text-red-950 hover:underline px-2 py-1 transition cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* 4 Primary Top KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Filled Cylinders Available
                </span>
                <div className="w-8 h-8 rounded-full bg-red-50 text-[#BC0118] flex items-center justify-center">
                  <Flame className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-slate-900 tracking-tight">180</span>
                  <span className="text-xs font-bold text-slate-400">units</span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Available in warehouse</p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">Safety Stock Status:</span>
                <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Well Stocked
                </span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Empty Cylinders at Agency
                </span>
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <RotateCcw className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-slate-900 tracking-tight">95</span>
                  <span className="text-xs font-bold text-slate-400">units</span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Available at depot ready to refill</p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">Return to Bottling Plant:</span>
                <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  95 units
                </span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Cylinders with Delivery Partners
                </span>
                <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md">
                  In Transit
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-slate-900 tracking-tight">56</span>
                  <span className="text-xs font-bold text-slate-400">units</span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Currently in partner custody</p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">Custody Breakdown:</span>
                <span className="font-bold text-slate-700">27 Filled | 29 Empty</span>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Low Stock Alerts
                </span>
                <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-md">
                  At Reserve
                </span>
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-red-600 tracking-tight">1 Active Alert</span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">14.2 kg Domestic is below threshold</p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">Action Required:</span>
                <span className="font-extrabold text-red-600">Order 100 units</span>
              </div>
            </div>
          </div>

          {/* Workflow Section: Left (Fast Warehouse Issue) vs Right (Quick Issue Card) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Box: Fast Warehouse Cylinder Issue */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-5">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Fast Warehouse Cylinder Issue
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Record fast dispatch from warehouse to delivery partners
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRecordCylinderIssueModal(true)}
                  className="bg-[#BC0118] hover:bg-red-800 active:scale-98 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Record Cylinder Issue</span>
                </button>
              </div>

              {/* 3 Sub-stat counters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                    Total Issued Today
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-slate-900">78 units</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium block">
                    Dispatched with partners
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                    Partners in Field
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-slate-900">4 partners</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium block">
                    Currently active routes
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                    In Transit Inventory
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-slate-900">27 units</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium block">
                    Currently in partner vans
                  </span>
                </div>
              </div>

              {/* Active Delivery Partners Status */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 block">
                  Active Delivery Partners Status:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1 text-center">
                    <span className="text-xs font-bold text-slate-900 block truncate">Rajesh Kumar</span>
                    <span className="text-[11px] font-bold text-red-600 block">
                      10 Filled <span className="text-blue-600">· 14 Empty</span>
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1 text-center">
                    <span className="text-xs font-bold text-slate-900 block truncate">Mohamed Irfan</span>
                    <span className="text-[11px] font-bold text-red-600 block">
                      5 Filled <span className="text-blue-600">· 8 Empty</span>
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1 text-center">
                    <span className="text-xs font-bold text-slate-900 block truncate">Suresh Babu</span>
                    <span className="text-[11px] font-bold text-red-600 block">
                      12 Filled <span className="text-blue-600">· 4 Empty</span>
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1 text-center">
                    <span className="text-xs font-bold text-slate-900 block truncate">Karthik Raja</span>
                    <span className="text-[11px] font-bold text-slate-500 block">
                      0 Filled <span className="text-blue-600">· 1 Empty</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Info Banner */}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2 text-slate-600 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 stroke-[2.2] shrink-0" />
                  <span>All issues digitally signed via delivery partner custody handshake</span>
                </div>
                <button
                  type="button"
                  onClick={() => triggerToast('Viewing live custody summary')}
                  className="text-xs font-bold text-red-700 hover:text-red-900 hover:underline cursor-pointer shrink-0"
                >
                  Live Custody Summary &gt;
                </button>
              </div>
            </div>

            {/* Right Box: Quick Issue Card (Gate Pass Generator) */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-red-100 text-[#BC0118] flex items-center justify-center font-black text-sm">
                    Q
                  </div>
                  <div>
                    <h2 className="text-sm font-extrabold text-slate-900">Quick Issue Card</h2>
                    <p className="text-[11px] text-slate-400 font-medium">Fast Dispatch Out to Partner</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
                  Gate Pass Generator
                </span>
              </div>

              <form onSubmit={handleQuickIssueSubmit} className="space-y-3.5">
                {/* Field 1: Partner Selector */}
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                    Select Delivery Partner
                  </label>
                  <div className="relative">
                    <select
                      value={issuePartner}
                      onChange={(e) => setIssuePartner(e.target.value)}
                      className="w-full bg-[#F1F4FA] rounded-xl px-3.5 py-2.5 pr-8 text-xs font-bold text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer"
                    >
                      <option value="Rajesh Kumar (DP-001) - Anna Nagar Route">
                        Rajesh Kumar (DP-001) · Anna Nagar Route
                      </option>
                      <option value="Mohamed Irfan (DP-002) - KK Nagar Route">
                        Mohamed Irfan (DP-002) · KK Nagar Route
                      </option>
                      <option value="Suresh Babu (DP-003) - Tallakulam Route">
                        Suresh Babu (DP-003) · Tallakulam Route
                      </option>
                      <option value="Karthik Raja (DP-004) - Bypass Road Route">
                        Karthik Raja (DP-004) · Bypass Road Route
                      </option>
                      <option value="Vignesh V (DP-005) - Mattuthavani Route">
                        Vignesh V (DP-005) · Mattuthavani Route
                      </option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Partner Live Truck State Preview */}
                <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-xl p-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Current Status</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      Active in Delivery
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Truck Inventory</span>
                    <span className="text-[11px] font-bold text-slate-800 mt-0.5 block">
                      10 Filled · 14 Empty
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Max Capacity</span>
                    <span className="text-[11px] font-black text-red-700 mt-0.5 block">28 units</span>
                  </div>
                </div>

                {/* Cylinder Stepper Rows */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-[#F1F4FA] rounded-xl px-3 py-2 text-xs font-bold text-slate-800">
                      19.5 kg Commercial
                    </div>
                    <div className="flex items-center bg-white border border-slate-200 rounded-xl px-2 py-1 gap-3">
                      <button
                        type="button"
                        onClick={() => setIssueQty19(Math.max(0, issueQty19 - 1))}
                        className="text-slate-500 hover:text-slate-900 p-1 cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-extrabold text-slate-900 w-4 text-center">
                        {issueQty19}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIssueQty19(issueQty19 + 1)}
                        className="text-slate-500 hover:text-slate-900 p-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-[#F1F4FA] rounded-xl px-3 py-2 text-xs font-bold text-slate-800">
                      14.2 kg Domestic
                    </div>
                    <div className="flex items-center bg-white border border-slate-200 rounded-xl px-2 py-1 gap-3">
                      <button
                        type="button"
                        onClick={() => setIssueQty14(Math.max(0, issueQty14 - 1))}
                        className="text-slate-500 hover:text-slate-900 p-1 cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-extrabold text-slate-900 w-4 text-center">
                        {issueQty14}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIssueQty14(issueQty14 + 1)}
                        className="text-slate-500 hover:text-slate-900 p-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => triggerToast('Additional cylinder category added.')}
                  className="w-full py-2 border border-dashed border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Cylinder Type</span>
                </button>

                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                  * Custody will transfer immediately once partner signs Gate Pass on arriving at the agency for morning dispatch.
                </p>

                <button
                  type="submit"
                  className="w-full bg-[#BC0118] hover:bg-red-800 active:scale-98 text-white font-bold text-xs sm:text-sm py-2.5 rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Confirm &amp; Issue Gate Pass</span>
                </button>
              </form>
            </div>
          </div>

          {/* Today's Cylinder Movements Table Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Today&apos;s Cylinder Movements</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Track individual delivery partner movements, dispatches, and returns for operations today
                </p>
              </div>
              <span className="text-xs text-slate-400 font-bold">
                Viewing 5 of 5 Active Delivery Partners
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[1100px]">
                <thead>
                  <tr className="border-b border-slate-200/80 text-[10px] font-bold uppercase text-slate-400 tracking-wider bg-slate-50/50">
                    <th className="py-3.5 pl-6 min-w-[170px]">Delivery Partner</th>
                    <th className="py-3.5 text-center min-w-[110px]">Filled Cylinders Issued</th>
                    <th className="py-3.5 text-center min-w-[110px]">Filled Cylinders Returned</th>
                    <th className="py-3.5 text-center min-w-[130px]">
                      Empty Cylinders Collected (Customer)
                    </th>
                    <th className="py-3.5 text-center min-w-[130px]">
                      Empty Cylinders Deposited (Depot)
                    </th>
                    <th className="py-3.5 text-center min-w-[110px]">Current Field Custody</th>
                    <th className="py-3.5 text-center min-w-[110px]">Current Empty Custody</th>
                    <th className="py-3.5 text-center min-w-[110px]">Last Dispatch Time</th>
                    <th className="py-3.5 text-center pr-6 min-w-[140px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {movements.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 pl-6">
                        <span className="font-extrabold text-slate-900 block text-xs">{m.name}</span>
                        <span className="text-[11px] text-slate-400 font-medium block">
                          {m.code} · {m.route}
                        </span>
                      </td>
                      <td className="py-4 text-center font-bold text-slate-900">{m.filledIssued}</td>
                      <td className="py-4 text-center font-bold text-slate-500">{m.filledReturned}</td>
                      <td className="py-4 text-center font-bold text-slate-900">{m.emptyCollected}</td>
                      <td className="py-4 text-center font-bold text-slate-500">{m.emptyDeposited}</td>
                      <td className="py-4 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-bold bg-red-100 text-red-700">
                          {m.currentFilled} Filled
                        </span>
                      </td>
                      <td className="py-4 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-100 text-blue-700">
                          {m.currentEmpty} empty
                        </span>
                      </td>
                      <td className="py-4 text-center text-slate-600 font-medium">{m.lastDispatch}</td>
                      <td className="py-4 text-center pr-6">
                        {m.status === 'Not Started' ? (
                          <button
                            type="button"
                            onClick={() => {
                              setIssuePartner(`${m.name} (${m.code}) - ${m.route} Route`);
                              triggerToast(`Ready to issue cylinders to ${m.name}`);
                            }}
                            className="bg-[#BC0118] hover:bg-red-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-2xs transition cursor-pointer"
                          >
                            Issue Cylinders
                          </button>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setViewPartnerDetails(m)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                            >
                              View Details
                            </button>
                            <button
                              type="button"
                              onClick={() => setViewPartnerDetails(m)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                            >
                              History
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Agency Stock Master Inventory Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Agency Stock</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Master stock level and reserve capacity breakdown at the agency
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                {(['All', 'Commercial', 'Domestic', 'Industrial'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setStockCategoryFilter(cat)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      stockCategoryFilter === cat
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {cat === 'All' ? 'All Types' : `${cat} Only`}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[1100px]">
                <thead>
                  <tr className="border-b border-slate-200/80 text-[10px] font-bold uppercase text-slate-400 tracking-wider bg-slate-50/50">
                    <th className="py-3.5 pl-6 min-w-[170px]">Cylinder Type &amp; Size</th>
                    <th className="py-3.5 min-w-[90px]">State</th>
                    <th className="py-3.5 text-center min-w-[100px]">Opening Balance</th>
                    <th className="py-3.5 text-center min-w-[100px]">Stock Received</th>
                    <th className="py-3.5 text-center min-w-[110px]">Issued to Partners</th>
                    <th className="py-3.5 text-center min-w-[120px]">Returned by Partners</th>
                    <th className="py-3.5 text-center min-w-[120px]">Physical Adjustments</th>
                    <th className="py-3.5 text-center min-w-[110px]">Available Quantity</th>
                    <th className="py-3.5 text-center min-w-[120px]">Minimum Reserve Level</th>
                    <th className="py-3.5 text-center min-w-[100px]">Status</th>
                    <th className="py-3.5 text-center pr-6 min-w-[130px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStock.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 pl-6 font-extrabold text-slate-900">{s.type}</td>
                      <td className="py-4">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded ${
                            s.state === 'FILLED' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {s.state}
                        </span>
                      </td>
                      <td className="py-4 text-center font-bold text-slate-900">{s.openingBalance}</td>
                      <td className="py-4 text-center font-bold text-emerald-600">
                        {s.stockReceived > 0 ? `+${s.stockReceived}` : s.stockReceived}
                      </td>
                      <td className="py-4 text-center font-bold text-red-600">
                        {s.issuedToPartners !== 0 ? s.issuedToPartners : '--'}
                      </td>
                      <td className="py-4 text-center font-bold text-emerald-600">
                        {s.returnedByPartners > 0 ? `+${s.returnedByPartners}` : '--'}
                      </td>
                      <td className="py-4 text-center text-slate-500 font-bold">{s.adjustments}</td>
                      <td className="py-4 text-center">
                        <span
                          className={`font-black text-sm ${
                            s.status === 'Low Stock' ? 'text-red-600' : 'text-slate-900'
                          }`}
                        >
                          {s.availableQuantity}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-medium">units</span>
                      </td>
                      <td className="py-4 text-center text-slate-600 font-medium">{s.minReserveLevel}</td>
                      <td className="py-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            s.status === 'Low Stock'
                              ? 'bg-red-100 text-red-700'
                              : s.status === 'Healthy'
                              ? 'bg-emerald-100 text-emerald-700'
                              : s.status === 'Adequate'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="py-4 text-center pr-6">
                        {s.state === 'FILLED' ? (
                          <button
                            type="button"
                            onClick={() => setShowRefillModal(true)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer ${
                              s.status === 'Low Stock'
                                ? 'bg-[#BC0118] text-white hover:bg-red-800'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                            }`}
                          >
                            {s.status === 'Low Stock' ? 'Stock Refill' : '+ Quick Refill'}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => triggerToast(`Dispatch to plant initiated for ${s.type}`)}
                            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition cursor-pointer"
                          >
                            Dispatch to Plant
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 px-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-slate-600 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600 stroke-[2.2]" />
                <span>Daily physical audit verified by Plant Manager at 06:00 AM</span>
              </div>
              <span className="text-[11px] font-bold text-red-600">
                * Threshold auto-alert: 14.2 KG Domestic - 100 below min reserve
              </span>
            </div>
          </div>

          {/* Two Cards Section: Left (Partner Custody Matrix) vs Right (Record Empty Cylinder Return) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Partner Custody Matrix */}
            <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-red-100 text-[#BC0118] flex items-center justify-center font-bold">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Partner Custody Matrix</h3>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Live distribution of cylinders currently assigned to partners
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                >
                  Download Audit CSV
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                      <th className="py-2.5">Partner Name</th>
                      <th className="py-2.5 text-center">Filled Units</th>
                      <th className="py-2.5 text-center">Empty Units</th>
                      <th className="py-2.5 text-center">Total Held</th>
                      <th className="py-2.5 text-right">Safety Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {movements.map((p) => {
                      const totalHeld = p.currentFilled + p.currentEmpty;
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/50">
                          <td className="py-3 font-bold text-slate-900">
                            {p.name} ({p.code})
                          </td>
                          <td className="py-3 text-center font-bold text-red-600">{p.currentFilled}</td>
                          <td className="py-3 text-center font-bold text-blue-600">{p.currentEmpty}</td>
                          <td className="py-3 text-center font-black text-slate-900">{totalHeld}</td>
                          <td className="py-3 text-right">
                            {p.status === 'Not Started' ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                Not in Field
                              </span>
                            ) : p.currentFilled === 0 ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                                Safe / Empty
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                                Safe Custody
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs flex items-center justify-between">
                <span className="text-slate-500 font-medium text-[11px]">
                  Delivery partners must return all empty cylinders to depot custody prior to end-of-shift reconciliation.
                </span>
                <button
                  type="button"
                  onClick={() => triggerToast('Shift handover logs downloaded')}
                  className="text-xs font-bold text-red-700 hover:underline shrink-0 ml-2"
                >
                  Handover Logs by Shift &gt;
                </button>
              </div>
            </div>

            {/* Right: Record Empty Cylinder Return (Exact Figma Design) */}
            <div className="lg:col-span-6 bg-white rounded-[24px] p-7 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-[#EEF2FB] flex items-center justify-center shrink-0">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#BC0118"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="4" width="18" height="17" rx="3" />
                        <path d="M12 9v6" />
                        <path d="m9 12 3 3 3-3" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
                        Record Empty Cylinder<br />Return
                      </h3>
                      <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-1">
                        Depot gate empty check-in
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#6EF796] text-slate-900 font-bold text-xs px-3.5 py-1.5 rounded-xl text-left leading-tight shrink-0 shadow-2xs">
                    <div>Ledger Audit</div>
                    <div>Inflow</div>
                  </div>
                </div>

                <div className="border-b border-slate-200/80 my-5" />

                <form onSubmit={handleEmptyReturnSubmit} className="space-y-4">
                  {/* Field 1: RETURNING DELIVERY PARTNER */}
                  <div>
                    <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2">
                      Returning Delivery Partner
                    </label>
                    <div className="relative">
                      <select
                        value={returnPartner}
                        onChange={(e) => setReturnPartner(e.target.value)}
                        className="w-full bg-[#F1F4FA] rounded-2xl px-5 py-3.5 pr-10 text-sm sm:text-base font-bold text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer"
                      >
                        <option value="Suresh Babu (DP-003) · Expected Empties: 9 units">
                          Suresh Babu (DP-003) · Expected Empties: 9 units
                        </option>
                        <option value="Rajesh Kumar (DP-001) · Expected Empties: 14 units">
                          Rajesh Kumar (DP-001) · Expected Empties: 14 units
                        </option>
                        <option value="Mohamed Irfan (DP-002) · Expected Empties: 8 units">
                          Mohamed Irfan (DP-002) · Expected Empties: 8 units
                        </option>
                        <option value="Karthik Raja (DP-004) · Expected Empties: 4 units">
                          Karthik Raja (DP-004) · Expected Empties: 4 units
                        </option>
                      </select>
                      <ChevronDown className="w-5 h-5 text-slate-600 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.2]" />
                    </div>
                  </div>

                  {/* Row 2: EXPECTED EMPTY CUSTODY & EMPTY RETURN QTY */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2">
                        Expected Empty Custody
                      </label>
                      <div className="w-full bg-[#F1F4FA] rounded-2xl py-3.5 px-4 text-center text-slate-600 font-medium text-base sm:text-lg flex items-center justify-center">
                        9 units
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2">
                        Empty Return Qty
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={returnQty}
                        onChange={(e) => setReturnQty(e.target.value)}
                        className="w-full bg-[#F1F4FA] rounded-2xl py-3.5 px-4 text-center text-slate-900 font-extrabold text-xl focus:outline-none focus:ring-2 focus:ring-red-500/20"
                      />
                    </div>
                  </div>

                  {/* Field 3: RECEIVER NOTES & DEFECT INSPECTION */}
                  <div>
                    <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2">
                      Receiver Notes &amp; Defect Inspection
                    </label>
                    <input
                      type="text"
                      value={inspectionRemarks}
                      onChange={(e) => setInspectionRemarks(e.target.value)}
                      placeholder="All seals checked; zero tare-weight valve leakages"
                      className="w-full bg-[#F1F4FA] rounded-2xl px-5 py-3.5 text-sm sm:text-base font-normal text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    />
                  </div>

                  {/* Field 4: Physical verification checkbox banner */}
                  <div
                    onClick={() => setInspectionChecked(!inspectionChecked)}
                    className="bg-[#F1F4FA] rounded-2xl p-4 flex items-start gap-3.5 cursor-pointer select-none"
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition ${
                        inspectionChecked ? 'bg-[#BC0118]' : 'bg-white border border-slate-300'
                      }`}
                    >
                      {inspectionChecked && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </div>
                    <span className="text-xs sm:text-[13px] font-medium text-slate-700 leading-snug">
                      Physically verified zero tare-weight valve defect &amp; safety cap locked
                    </span>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full bg-[#101828] hover:bg-slate-800 active:scale-98 text-white font-bold text-sm sm:text-base py-3.5 rounded-2xl shadow-xs transition flex items-center justify-center gap-2.5 cursor-pointer mt-2"
                  >
                    <CheckCircle2 className="w-5 h-5 text-white stroke-[2.2]" />
                    <span>Confirm Empty Receipt into Depot</span>
                  </button>
                </form>
              </div>

              {/* Bottom footer */}
              <div>
                <div className="border-b border-slate-200/80 my-4" />
                <div className="flex items-center justify-between text-xs sm:text-[13px] pt-0.5">
                  <span className="text-slate-500 font-medium">Updates depot balance atomically</span>
                  <span className="text-[#047857] font-bold">Ledger: Real-time</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stock Movement History (Audit Ledger) Table Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Stock Movement History (Audit Ledger)
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Chronological, immutable audit ledger for every cylinder dispatch, receipt, and transfer
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportCSV}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition cursor-pointer self-start md:self-auto"
              >
                Download Settlement Ledger
              </button>
            </div>

            {/* Filter Chips & Search toolbar */}
            <div className="p-4 px-6 bg-slate-50/50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setAuditFilter('All')}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    auditFilter === 'All'
                      ? 'bg-[#BC0118] text-white shadow-2xs'
                      : 'bg-white border border-slate-200/90 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Movements (124)
                </button>
                <button
                  type="button"
                  onClick={() => setAuditFilter('Issues')}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    auditFilter === 'Issues'
                      ? 'bg-[#BC0118] text-white shadow-2xs'
                      : 'bg-white border border-slate-200/90 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Issues to Partners (78)
                </button>
                <button
                  type="button"
                  onClick={() => setAuditFilter('Returns')}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    auditFilter === 'Returns'
                      ? 'bg-[#BC0118] text-white shadow-2xs'
                      : 'bg-white border border-slate-200/90 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Returns by Partners (29)
                </button>
                <button
                  type="button"
                  onClick={() => setAuditFilter('Plant')}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    auditFilter === 'Plant'
                      ? 'bg-[#BC0118] text-white shadow-2xs'
                      : 'bg-white border border-slate-200/90 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Dispatches to Plant (0)
                </button>
                <button
                  type="button"
                  onClick={() => setAuditFilter('Refills')}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    auditFilter === 'Refills'
                      ? 'bg-[#BC0118] text-white shadow-2xs'
                      : 'bg-white border border-slate-200/90 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Primary Refills (20)
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 bg-white border border-slate-200/90 px-3 py-1.5 rounded-xl shadow-2xs">
                  Today, 16 Oct
                </span>
                <span className="text-xs font-bold text-slate-500 bg-white border border-slate-200/90 px-3 py-1.5 rounded-xl shadow-2xs">
                  All partners
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[1000px]">
                <thead>
                  <tr className="border-b border-slate-200/80 text-[10px] font-bold uppercase text-slate-400 tracking-wider bg-slate-50/50">
                    <th className="py-3.5 pl-6 min-w-[150px]">Movement Ref #</th>
                    <th className="py-3.5 min-w-[140px]">Date &amp; Time</th>
                    <th className="py-3.5 min-w-[150px]">Movement Type</th>
                    <th className="py-3.5 min-w-[100px]">Condition</th>
                    <th className="py-3.5 min-w-[100px]">Quantity</th>
                    <th className="py-3.5 min-w-[170px]">Source</th>
                    <th className="py-3.5 min-w-[180px]">Destination</th>
                    <th className="py-3.5 min-w-[140px]">Recorded By</th>
                    <th className="py-3.5 pr-6 min-w-[110px] text-right">Status / Sign</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAudit.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 pl-6 font-extrabold text-slate-900">{a.ref}</td>
                      <td className="py-4 text-slate-500 font-medium">{a.dateTime}</td>
                      <td className="py-4 font-bold text-slate-800">{a.type}</td>
                      <td className="py-4">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded ${
                            a.condition === 'FILLED' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {a.condition}
                        </span>
                      </td>
                      <td className="py-4 font-black">
                        <span className={a.quantity.includes('+') ? 'text-emerald-600' : 'text-red-600'}>
                          {a.quantity}
                        </span>
                      </td>
                      <td className="py-4 text-slate-700 font-medium">{a.source}</td>
                      <td className="py-4 text-slate-700 font-medium">{a.destination}</td>
                      <td className="py-4 text-slate-500 font-medium">{a.recordedBy}</td>
                      <td className="py-4 pr-6 text-right">
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 px-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Displaying 4 of 124 stock movements for 16 October 2026</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-2.5 py-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  Previous
                </button>
                <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-900 font-bold">
                  Page 1 of 6
                </span>
                <button
                  type="button"
                  className="px-2.5 py-1 text-slate-700 hover:text-slate-900 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Card: Daily Physical Count Reconciliation */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Daily Physical Count Reconciliation
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Three-point validation confirming physical on-premises inventory matches computed stock ledger and live custody balances.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                  System Computed Log
                </span>
                <span className="text-2xl font-black text-slate-900 block">180 Domestic Filled</span>
                <span className="text-xs text-slate-500 font-medium block">
                  Continuous transaction balance
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                  Physical Audit Count
                </span>
                <span className="text-2xl font-black text-slate-900 block">180 Cylinders Counted</span>
                <span className="text-xs text-slate-500 font-medium block">
                  Logged 06:00 AM by Shift Officer
                </span>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider">
                    Tally Variance
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                </div>
                <span className="text-2xl font-black text-emerald-700 block">0 units (Zero variance)</span>
                <span className="text-xs text-emerald-800 font-medium block">
                  Zero discrepancy. Stock reconciled to warehouse floor.
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal 1: Request Stock Refill */}
      {showRefillModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-lg w-full shadow-2xl border border-slate-100 p-7 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Request Primary Stock Refill</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Place replenishment indentation with bottling plant
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRefillModal(false)}
                className="text-slate-700 hover:text-slate-900 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                triggerToast('Stock refill order for 100 Domestic Filled placed with Indian Oil.');
                setShowRefillModal(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Cylinder Type</label>
                <input
                  type="text"
                  readOnly
                  value="14.2 kg Domestic Filled"
                  className="w-full bg-[#F1F4FA] rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Required Quantity</label>
                <input
                  type="number"
                  defaultValue={100}
                  className="w-full bg-[#F1F4FA] rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Plant Indent Source</label>
                <select className="w-full bg-[#F1F4FA] rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none">
                  <option>Indian Oil Bottling Plant - Madurai Division</option>
                  <option>Regional Buffer Storage - Tuticorin</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowRefillModal(false)}
                  className="bg-[#EEF2F8] text-slate-700 font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#BC0118] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs cursor-pointer"
                >
                  Confirm Refill Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Record Stock Movement (matching exact attached design - full flow) */}
      {showStockMovementModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-xl w-full shadow-2xl border border-slate-100 p-7 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            {/* Header: Title, Subtitle, Close X */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Record Stock Movement
                </h3>
                <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-1">
                  Link customer for exclusive cylinder dispatch handovers
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowStockMovementModal(false)}
                className="text-slate-900 hover:text-slate-600 p-1 cursor-pointer transition"
                title="Close"
              >
                <X className="w-6 h-6 stroke-[1.8]" />
              </button>
            </div>

            <form onSubmit={handleCommitMovementEntry} className="space-y-4">
              {/* Field 1: TRANSACTION CATEGORY */}
              <div>
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2">
                  Transaction Category
                </label>
                <div className="relative">
                  <select
                    value={movementCategory}
                    onChange={(e) => setMovementCategory(e.target.value)}
                    className="w-full bg-[#F1F4FA] rounded-2xl px-5 py-3.5 pr-10 text-sm sm:text-base font-bold text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer"
                  >
                    <option value="Receive Filled Cylinders">Receive Filled Cylinders</option>
                    <option value="Issue to Delivery Partner">Issue to Delivery Partner</option>
                    <option value="Receive Empty Cylinders">Receive Empty Cylinders</option>
                    <option value="Dispatch Empty Cylinders to Plant">Dispatch Empty Cylinders to Plant</option>
                    <option value="Stock Adjustment">Stock Adjustment</option>
                  </select>
                  <ChevronDown className="w-5 h-5 text-slate-600 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.2]" />
                </div>
              </div>

              {/* Dynamic Cylinder Category Rows (Full Flow) */}
              <div className="space-y-4">
                {cylinderItems.map((item) => (
                  <div key={item.id} className="space-y-4">
                    {/* Row 1: CYLINDER SIZE & CYLINDER STATE */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2">
                          Cylinder Size
                        </label>
                        <div className="relative">
                          <select
                            value={item.size}
                            onChange={(e) => handleUpdateCylinderItem(item.id, 'size', e.target.value)}
                            className="w-full bg-[#F1F4FA] rounded-2xl px-5 py-3.5 pr-10 text-sm sm:text-base font-bold text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer"
                          >
                            <option value="14.2 Kg Domestic">14.2 Kg Domestic</option>
                            <option value="15 Kg">15 Kg</option>
                            <option value="19.5 Kg Commercial">19.5 Kg Commercial</option>
                            <option value="47.5 Kg Industrial">47.5 Kg Industrial</option>
                            <option value="5 Kg Domestic">5 Kg Domestic</option>
                          </select>
                          <ChevronDown className="w-5 h-5 text-slate-600 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.2]" />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                            Cylinder State
                          </label>
                          {cylinderItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveCylinderItem(item.id)}
                              className="text-[11px] font-semibold text-slate-400 hover:text-red-600 transition cursor-pointer"
                              title="Remove category"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="relative">
                          <select
                            value={item.state}
                            onChange={(e) => handleUpdateCylinderItem(item.id, 'state', e.target.value)}
                            className="w-full bg-[#F1F4FA] rounded-2xl px-5 py-3.5 pr-10 text-sm sm:text-base font-bold text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer"
                          >
                            <option value="Filled (Sealed & Checked)">Filled (Sealed &amp; Checked)</option>
                            <option value="Empty (Awaiting Refill)">Empty (Awaiting Refill)</option>
                            <option value="Damaged / Defective">Damaged / Defective</option>
                          </select>
                          <ChevronDown className="w-5 h-5 text-slate-600 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.2]" />
                        </div>
                      </div>
                    </div>

                    {/* Row 2: MOVEMENT QUANTITY & PRICE */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2">
                          Movement Quantity
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateCylinderItem(item.id, 'quantity', e.target.value)}
                          className="w-full bg-[#F1F4FA] rounded-2xl px-5 py-3.5 text-sm sm:text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                          placeholder="20"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2">
                          Price
                        </label>
                        <div className="relative">
                          <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-slate-900 text-sm sm:text-base">
                            ₹
                          </span>
                          <input
                            type="text"
                            value={item.price}
                            onChange={(e) => handleUpdateCylinderItem(item.id, 'price', e.target.value)}
                            className="w-full bg-[#F1F4FA] rounded-2xl pl-10 pr-5 py-3.5 text-sm sm:text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                            placeholder=""
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Cylinder Category Button */}
              <button
                type="button"
                onClick={handleAddCylinderCategory}
                className="w-full bg-[#F1F4FA] hover:bg-slate-200 active:scale-98 text-slate-900 font-bold text-sm sm:text-base py-3.5 rounded-2xl flex items-center justify-center gap-2.5 transition cursor-pointer my-2"
              >
                <PlusCircle className="w-5 h-5 text-slate-900 stroke-[2]" />
                <span>Add Cylinder Category</span>
              </button>

              {/* Field: REFERENCE / TRUCK BILL OF LADING # */}
              <div>
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2">
                  Reference / Truck Bill of Lading #
                </label>
                <input
                  type="text"
                  value={truckBillNumber}
                  onChange={(e) => setTruckBillNumber(e.target.value)}
                  placeholder="eg. TNO:09876"
                  className="w-full bg-[#F1F4FA] border border-blue-400/90 rounded-2xl px-5 py-3.5 text-sm sm:text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Footer Actions: Cancel & Commit Movement Entry */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowStockMovementModal(false)}
                  className="bg-[#EEF2F8] hover:bg-slate-200 active:scale-98 text-slate-800 font-bold text-sm px-7 py-3 rounded-2xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#BC0118] hover:bg-red-800 active:scale-98 text-white font-bold text-sm px-7 py-3 rounded-2xl shadow-xs transition cursor-pointer"
                >
                  Commit Movement Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Record Cylinder Issue (matching exact attached design - full flow) */}
      {showRecordCylinderIssueModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-xl w-full shadow-2xl border border-slate-100 p-7 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            {/* Header: Title, Subtitle, Close X, Divider */}
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    Record Cylinder Issue
                  </h3>
                  <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-1">
                    Gate pass issuance for filled cylinders
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRecordCylinderIssueModal(false)}
                  className="text-slate-900 hover:text-slate-600 p-1 cursor-pointer transition"
                  title="Close"
                >
                  <X className="w-6 h-6 stroke-[1.8]" />
                </button>
              </div>
              <div className="border-b border-slate-200/80 mt-4" />
            </div>

            <form onSubmit={handleCommitCylinderIssue} className="space-y-4">
              {/* Field 1: SELECTED DELIVERY PARTNER */}
              <div>
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2">
                  Selected Delivery Partner
                </label>
                <div className="relative">
                  <select
                    value={modalSelectedPartner}
                    onChange={(e) => setModalSelectedPartner(e.target.value)}
                    className="w-full bg-[#F1F4FA] rounded-2xl px-5 py-3.5 pr-10 text-sm sm:text-base font-bold text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer"
                  >
                    <option value="Rajesh Kumar (DP-001)">Rajesh Kumar (DP-001)</option>
                    <option value="Mohamed Irfan (DP-002)">Mohamed Irfan (DP-002)</option>
                    <option value="Suresh Babu (DP-003)">Suresh Babu (DP-003)</option>
                    <option value="Karthik Raja (DP-004)">Karthik Raja (DP-004)</option>
                    <option value="Vignesh V (DP-005)">Vignesh V (DP-005)</option>
                  </select>
                  <ChevronDown className="w-5 h-5 text-slate-600 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.2]" />
                </div>
              </div>

              {/* Field 2: AVAILABLE AGENCY STOCK */}
              <div>
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2">
                  Available Agency Stock
                </label>
                <div className="w-full bg-[#F1F4FA] rounded-2xl px-5 py-3.5 flex items-center justify-between">
                  <span className="text-sm sm:text-base font-bold text-slate-900">
                    180 Filled Cylinders
                  </span>
                  <div className="text-right">
                    <span className="text-[10px] font-medium text-slate-500 block">
                      Partner Limit Status
                    </span>
                    <span className="text-xs font-bold text-slate-900 block">
                      Safe (&lt;30 cap)
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Cylinder Issue Rows */}
              <div className="space-y-4">
                {issueCylinderItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2">
                        Cylinder Size
                      </label>
                      <div className="relative">
                        <select
                          value={item.size}
                          onChange={(e) =>
                            handleUpdateIssueCylinderItem(item.id, 'size', e.target.value)
                          }
                          className="w-full bg-[#F1F4FA] rounded-2xl px-5 py-3.5 pr-10 text-sm sm:text-base font-bold text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer"
                        >
                          <option value="14.2 Kg Domestic">14.2 Kg Domestic</option>
                          <option value="19.2 Kg Commercial">19.2 Kg Commercial</option>
                          <option value="19.5 Kg Commercial">19.5 Kg Commercial</option>
                          <option value="47.5 Kg Industrial">47.5 Kg Industrial</option>
                          <option value="5 Kg Domestic">5 Kg Domestic</option>
                        </select>
                        <ChevronDown className="w-5 h-5 text-slate-600 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.2]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Filled Issue Quantity
                        </label>
                        {issueCylinderItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveIssueCylinderItem(item.id)}
                            className="text-[11px] font-semibold text-slate-400 hover:text-red-600 transition cursor-pointer"
                            title="Remove size"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleUpdateIssueCylinderItem(item.id, 'quantity', e.target.value)
                        }
                        className="w-full bg-[#F1F4FA] rounded-2xl px-5 py-3.5 text-sm sm:text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                        placeholder="10"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Cylinder Size Button */}
              <button
                type="button"
                onClick={handleAddIssueCylinderSize}
                className="w-full bg-[#F1F4FA] hover:bg-slate-200 active:scale-98 text-slate-900 font-bold text-sm sm:text-base py-3.5 rounded-2xl flex items-center justify-center gap-2.5 transition cursor-pointer my-2"
              >
                <PlusCircle className="w-5 h-5 text-slate-900 stroke-[2]" />
                <span>Add Cylinder Size</span>
              </button>

              {/* Field: GATE PASS DISSPATCH NOTES */}
              <div>
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-2">
                  Gate Pass Disspatch Notes
                </label>
                <input
                  type="text"
                  value={gatePassNotes}
                  onChange={(e) => setGatePassNotes(e.target.value)}
                  placeholder="eg. Morning second run:"
                  className="w-full bg-[#F1F4FA] rounded-2xl px-5 py-3.5 text-sm sm:text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>

              {/* Footer Actions: Cancel & Issue Cylinders & Print Pass */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRecordCylinderIssueModal(false)}
                  className="bg-[#EEF2F8] hover:bg-slate-200 active:scale-98 text-slate-800 font-bold text-sm px-7 py-3 rounded-2xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#BC0118] hover:bg-red-800 active:scale-98 text-white font-bold text-sm px-7 py-3 rounded-2xl shadow-xs transition cursor-pointer"
                >
                  Issue Cylinders &amp; Print Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Partner Details & Movement History */}
      {viewPartnerDetails && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-lg w-full shadow-2xl border border-slate-100 p-7 space-y-5 animate-in fade-in zoom-in-95 duration-150 text-xs">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">{viewPartnerDetails.name}</h3>
                <p className="text-slate-400 font-medium">
                  {viewPartnerDetails.code} · {viewPartnerDetails.route} Route
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewPartnerDetails(null)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-red-50/60 p-3 rounded-xl border border-red-100">
                <span className="text-[10px] font-bold uppercase text-red-500 block">Filled In Custody</span>
                <span className="text-xl font-black text-red-700 block mt-0.5">
                  {viewPartnerDetails.currentFilled} units
                </span>
              </div>
              <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100">
                <span className="text-[10px] font-bold uppercase text-blue-500 block">Empty In Custody</span>
                <span className="text-xl font-black text-blue-700 block mt-0.5">
                  {viewPartnerDetails.currentEmpty} units
                </span>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl space-y-2 border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">Filled Cylinders Issued:</span>
                <span className="font-bold text-slate-900">{viewPartnerDetails.filledIssued} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Empty Cylinders Collected:</span>
                <span className="font-bold text-slate-900">{viewPartnerDetails.emptyCollected} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Empty Cylinders Deposited to Depot:</span>
                <span className="font-bold text-slate-900">{viewPartnerDetails.emptyDeposited} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Last Dispatch Time:</span>
                <span className="font-bold text-slate-900">{viewPartnerDetails.lastDispatch}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setViewPartnerDetails(null)}
                className="bg-slate-900 text-white font-bold px-5 py-2 rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Feedback Toast */}
      {actionToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
          <span>{actionToast}</span>
        </div>
      )}
    </div>
  );
}
