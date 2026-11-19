'use client';

import React, { useState, useCallback } from 'react';
import AdminSidebar from './AdminSidebar';
import {
  Search,
  Bell,
  ChevronDown,
  ArrowUpRight,
  RefreshCw,
  Plus,
  PlusCircle,
  Printer,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileText,
  BookOpen,
  Package,
  Clock,
  Wallet,
  Receipt,
  CreditCard,
  ShieldCheck,
  Check,
  X,
} from 'lucide-react';

export default function AdminDashboard() {
  const [chart1Period, setChart1Period] = useState<'Today' | '7 Days' | '30 Days'>('Today');
  const [chart2Period, setChart2Period] = useState<'Today' | '7 Days' | '30 Days'>('Today');
  const [fuelClaimStatus, setFuelClaimStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

  // Live KPI counters
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [todayCollection, setTodayCollection] = useState<number>(0);
  const [activeVehicles, setActiveVehicles] = useState<number>(0);
  const [cylindersInCirculation, setCylindersInCirculation] = useState<number>(0);
  const [completedDeliveries, setCompletedDeliveries] = useState<number>(0);
  const [emptyAvailable, setEmptyAvailable] = useState<number>(0);
  const [overallEmpty, setOverallEmpty] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // Quick Issue Card / New Dispatch Modal State
  const [showNewDispatchModal, setShowNewDispatchModal] = useState(false);
  const [dispatchDrivers, setDispatchDrivers] = useState<
    Array<{ name: string; code: string; route: string; filled?: number; empty?: number; todayIssued?: number }>
  >([]);
  const [dispatchPartner, setDispatchPartner] = useState('');
  const [dispatchRows, setDispatchRows] = useState([
    { id: '1', type: '14.2 kg Domestic', qty: 10 },
  ]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  interface RecentInvoiceItem {
    id: string;
    invoiceNumber: string;
    customerName: string;
    customerCode: string;
    amount: number;
    paid: number;
    balance: number;
    status: string;
  }
  const [recentInvoices, setRecentInvoices] = useState<RecentInvoiceItem[]>([]);

  const handleUpdateRowQty = (id: string, delta: number) => {
    setDispatchRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, qty: Math.max(0, row.qty + delta) } : row))
    );
  };

  const handleAddCylinderRow = () => {
    setDispatchRows((prev) => [
      ...prev,
      { id: String(prev.length + 1), type: '19.5 kg Commercial', qty: 5 },
    ]);
  };

  const handleConfirmGatePass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchPartner) {
      setToastMessage('Please select or onboard a delivery partner first.');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    const curDriver = dispatchDrivers.find(
      (d) => `${d.name} (${d.code}) · ${d.route}` === dispatchPartner
    );
    try {
      if (curDriver) {
        await fetch('/api/inventory/handover', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            partnerCode: curDriver.code,
            transferType: 'LOAD_VEHICLE',
            notes: 'Gate pass dispatch issued via Quick Issue Card',
            items: dispatchRows.map((r) => ({
              productCode: r.type.includes('19') ? 'COMM_19KG' : r.type.includes('47') ? 'IND_47KG' : 'DOM_14KG',
              filledQuantity: r.qty,
              emptyQuantity: 0,
            })),
          }),
        });
        await fetchMetrics();
      }
    } catch (err) {
      console.warn('Could not record dispatch handover in DB:', err);
    }
    setShowNewDispatchModal(false);
    setToastMessage(`Gate-pass #GP-1095 issued for ${dispatchPartner.split(' · ')[0]}`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/metrics');
      if (!res.ok) return;
      const result = await res.json();
      if (result.success && result.data) {
        const d = result.data;
        if (d.totalRevenue !== undefined) setTotalRevenue(d.totalRevenue);
        if (d.todayCollection !== undefined) setTodayCollection(d.todayCollection);
        if (d.activeVehicles !== undefined) setActiveVehicles(d.activeVehicles);
        if (d.cylindersInCirculation !== undefined) setCylindersInCirculation(d.cylindersInCirculation);
        if (d.deliveries?.completed !== undefined) setCompletedDeliveries(d.deliveries.completed);
        if (d.inventory?.depotEmpty !== undefined) setEmptyAvailable(d.inventory.depotEmpty);
        if (d.inventory?.depotEmpty !== undefined && d.inventory?.vehicleEmpty !== undefined) {
          setOverallEmpty(d.inventory.depotEmpty + d.inventory.vehicleEmpty);
        }
      }
    } catch (err) {
      console.warn('Could not load admin metrics from database:', err);
    }
  }, []);

  // Fetch live metrics from database on mount
  React.useEffect(() => {
    let ignore = false;
    async function loadData() {
      if (!ignore) {
        await fetchMetrics();
      }
      try {
        const res = await fetch('/api/drivers');
        if (!res.ok) return;
        const result = await res.json();
        if (!ignore && result.success && Array.isArray(result.data?.partners)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mapped = result.data.partners.map((p: any) => ({
            name: p.name,
            code: p.partnerCode || p.code || p.id,
            route: p.address?.split(',')?.[0] || 'Central Route Beat',
            filled: p.filledCylinders || 0,
            empty: p.emptyCylinders || 0,
            todayIssued: p.todayDeliveries || 0,
          }));
          setDispatchDrivers(mapped);
          if (mapped.length > 0) {
            setDispatchPartner(`${mapped[0].name} (${mapped[0].code}) · ${mapped[0].route}`);
          }
        }
      } catch (err) {
        console.warn('Could not load drivers for dispatch:', err);
      }

      try {
        const invRes = await fetch('/api/admin/invoices');
        if (invRes.ok) {
          const invJson = await invRes.json();
          if (!ignore && invJson.success && Array.isArray(invJson.data?.invoices)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mappedInvoices = invJson.data.invoices.slice(0, 5).map((inv: any) => ({
              id: inv.id,
              invoiceNumber: inv.invoiceNumber || inv.id,
              customerName: inv.customer?.name || inv.customerName || 'Customer',
              customerCode: inv.customer?.customerCode || 'Registered',
              amount: inv.totalAmount || inv.amount || 0,
              paid: inv.paidAmount || (inv.status === 'PAID' ? inv.totalAmount : 0) || 0,
              balance: inv.balanceAmount || (inv.status === 'PAID' ? 0 : inv.totalAmount) || 0,
              status: inv.status || 'UNPAID',
            }));
            setRecentInvoices(mappedInvoices);
          }
        }
      } catch (err) {
        console.warn('Could not load recent invoices:', err);
      }
    }
    loadData();
    return () => {
      ignore = true;
    };
  }, [fetchMetrics]);

  const handleForceSync = async () => {
    setIsSyncing(true);
    await fetchMetrics();
    setTimeout(() => setIsSyncing(false), 500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-800 font-sans antialiased">
      {/* 1. Left Sidebar */}
      <AdminSidebar
        className="sticky top-0 h-screen z-30 border-r border-slate-200/90 rounded-none shrink-0"
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200/90 px-6 flex items-center justify-between sticky top-0 z-20">
          {/* Breadcrumb / Title */}
          <div className="flex items-center gap-3">
            <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-md">
              Dashboard
            </span>
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
              Super Gas Agency Operations
            </h1>
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-3.5">
            {/* Search Input */}
            <div className="relative w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search customer, cylinder batch, invoice..."
                className="w-full bg-slate-50 border border-slate-200/90 rounded-xl pl-9 pr-3.5 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition"
              />
            </div>

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
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
        </header>

        {/* Scrollable Dashboard Body */}
        <main className="flex-1 p-6 space-y-6 max-w-[1440px] mx-auto w-full">
          {/* Header Row: Dashboard Title, Status & Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Dashboard
                </h2>
                <span className="inline-flex items-center gap-1.5 bg-[#DCFCE7] text-[#16A34A] text-xs font-bold px-2.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
                  <span>Agency Active: GasPoint Opex</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Monitor your agency operations, field custody, and daily financial reconciliation.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              <div className="text-right hidden md:block mr-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  DEPOT STATUS
                </span>
                <span className="text-xs font-black text-slate-900 block">
                  Coimbatore Central Hub ({activeVehicles} Active Vans)
                </span>
              </div>

              <button
                type="button"
                onClick={handleForceSync}
                disabled={isSyncing}
                className="bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl px-4 py-2 text-sm font-bold text-slate-900 flex items-center gap-2 shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer transition disabled:opacity-75"
              >
                <RefreshCw className={`w-4 h-4 text-slate-900 stroke-[2.4] ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Force Sync</span>
              </button>

              <button
                type="button"
                onClick={() => setShowNewDispatchModal(true)}
                className="bg-[#E81B24] hover:bg-red-700 active:scale-95 text-white rounded-xl px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-red-600/30 cursor-pointer transition"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>New Dispatch</span>
              </button>
            </div>
          </div>

          {/* Section 1: Top 4 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: TOTAL CYLINDER */}
            <div className="bg-white rounded-2xl p-4.5 border border-slate-200/80 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  TOTAL CYLINDER
                </span>
                <div className="p-1.5 rounded-lg bg-red-50 text-red-600">
                  <Package className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900 tracking-tight">{cylindersInCirculation.toLocaleString('en-IN')}</p>
              <div className="flex items-center gap-1 text-xs">
                <span className="font-bold text-[#16A34A] flex items-center">
                  <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  +44
                </span>
                <span className="text-slate-400 font-medium">this week</span>
              </div>
            </div>

            {/* Card 2: SUCCESSFULLY COMPLETED */}
            <div className="bg-white rounded-2xl p-4.5 border border-slate-200/80 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  SUCCESSFULLY COMPLETED
                </span>
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900 tracking-tight">{completedDeliveries}</p>
              <div className="flex items-center gap-1 text-xs">
                <span className="font-bold text-[#16A34A]">87%</span>
                <span className="text-slate-400 font-medium">completion rate</span>
              </div>
            </div>

            {/* Card 3: EMPTY AVAILABLE */}
            <div className="bg-white rounded-2xl p-4.5 border border-slate-200/80 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  EMPTY AVAILABLE
                </span>
                <div className="p-1.5 rounded-lg bg-red-50 text-red-600">
                  <Package className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900 tracking-tight">{emptyAvailable}</p>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span>
                <span className="text-slate-500 font-medium">Collected by the agent</span>
              </div>
            </div>

            {/* Card 4: OVERALL EMPTY */}
            <div className="bg-white rounded-2xl p-4.5 border border-slate-200/80 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  OVERALL EMPTY
                </span>
                <div className="p-1.5 rounded-lg bg-red-50 text-red-600">
                  <Package className="w-4 h-4 stroke-[2.2]" />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900 tracking-tight">{overallEmpty}</p>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span>
                <span className="text-slate-500 font-medium">Held by the customer</span>
              </div>
            </div>
          </div>

          {/* Section 2: Operational & Financial Analytics (2 Interactive Visual Charts) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Operational & Financial Analytics
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Daily filled cylinder dispatches and empty cylinder collections
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-1">
              {/* Chart 1: Cylinder Movement & Stock Trend */}
              <div className="border border-slate-100 rounded-2xl p-4 space-y-3.5 bg-white">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Cylinder Movement & Stock Trend
                    </h4>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                      Illustrative preview — Filled delivered vs Empty collected
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-100">
                    {(['Today', '7 Days', '30 Days'] as const).map((period) => (
                      <button
                        key={period}
                        type="button"
                        onClick={() => setChart1Period(period)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-md transition cursor-pointer ${
                          chart1Period === period
                            ? 'bg-[#E81B24] text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-slate-900 inline-block"></span>
                    <span>Filled delivered</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block"></span>
                    <span>Empty collected</span>
                  </div>
                </div>

                {/* Chart Graphic (Exact SVG Visualization matching mockup) */}
                <div className="relative pt-2 pb-1">
                  <svg className="w-full h-44 overflow-visible" viewBox="0 0 500 160">
                    {/* Horizontal Grid lines */}
                    {[0, 20, 40, 60, 80, 100].map((val) => {
                      const y = 140 - (val / 100) * 120;
                      return (
                        <g key={val}>
                          <line
                            x1="30"
                            y1={y}
                            x2="480"
                            y2={y}
                            stroke="#F1F5F9"
                            strokeWidth="1"
                          />
                          <text
                            x="20"
                            y={y + 3}
                            textAnchor="end"
                            fontSize="9"
                            fill="#94A3B8"
                            fontWeight="500"
                          >
                            {val}
                          </text>
                        </g>
                      );
                    })}

                    {/* Filled Delivered Line (Black) */}
                    <path
                      d="M 50 120 C 100 110, 140 80, 190 75 C 240 70, 280 55, 340 45 C 390 35, 430 40, 460 30"
                      fill="none"
                      stroke="#0F172A"
                      strokeWidth="2.5"
                    />

                    {/* Empty Collected Line (Dotted Grey) */}
                    <path
                      d="M 50 135 C 100 125, 140 100, 190 95 C 240 90, 280 75, 340 65 C 390 55, 430 60, 460 50"
                      fill="none"
                      stroke="#94A3B8"
                      strokeWidth="2"
                      strokeDasharray="4 3"
                    />

                    {/* Points on Line */}
                    {[
                      { x: 50, y: 120 },
                      { x: 120, y: 100 },
                      { x: 190, y: 75 },
                      { x: 260, y: 65 },
                      { x: 340, y: 45 },
                      { x: 410, y: 35 },
                      { x: 460, y: 30 },
                    ].map((pt, i) => (
                      <circle
                        key={i}
                        cx={pt.x}
                        cy={pt.y}
                        r="3.5"
                        fill="#0F172A"
                        stroke="#FFFFFF"
                        strokeWidth="1.5"
                      />
                    ))}

                    {/* X-axis Labels */}
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(
                      (day, idx) => {
                        const x = 50 + idx * 68;
                        return (
                          <text
                            key={day}
                            x={x}
                            y="155"
                            textAnchor="middle"
                            fontSize="10"
                            fill="#64748B"
                            fontWeight="500"
                          >
                            {day}
                          </text>
                        );
                      }
                    )}
                  </svg>

                  {/* Interactive Tooltip Card pinned near Friday */}
                  <div className="absolute top-6 left-[56%] bg-white border border-slate-200/90 rounded-xl p-2.5 shadow-md text-xs space-y-1 pointer-events-none">
                    <p className="font-extrabold text-slate-800 text-[11px]">Today</p>
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                      <span>Filled: 78</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span>
                      <span>Empty: 65</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart 2: Collection & Reconciliation */}
              <div className="border border-slate-100 rounded-2xl p-4 space-y-3.5 bg-white">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Collection & Reconciliation
                    </h4>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                      Illustrative preview — Expected vs Actual collection
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-100">
                    {(['Today', '7 Days', '30 Days'] as const).map((period) => (
                      <button
                        key={period}
                        type="button"
                        onClick={() => setChart2Period(period)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-md transition cursor-pointer ${
                          chart2Period === period
                            ? 'bg-[#E81B24] text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-slate-900 inline-block"></span>
                    <span>Expected</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#E81B24] inline-block"></span>
                    <span>Actual</span>
                  </div>
                </div>

                {/* Chart Graphic (Clustered Bar Chart) */}
                <div className="relative pt-2 pb-1">
                  <svg className="w-full h-44 overflow-visible" viewBox="0 0 500 160">
                    {/* Horizontal Grid lines */}
                    {[0, 20, 40, 60, 80].map((val) => {
                      const y = 140 - (val / 80) * 120;
                      return (
                        <g key={val}>
                          <line
                            x1="30"
                            y1={y}
                            x2="480"
                            y2={y}
                            stroke="#F1F5F9"
                            strokeWidth="1"
                          />
                          <text
                            x="20"
                            y={y + 3}
                            textAnchor="end"
                            fontSize="9"
                            fill="#94A3B8"
                            fontWeight="500"
                          >
                            {val}
                          </text>
                        </g>
                      );
                    })}

                    {/* Bars for Mon - Sun */}
                    {[
                      { day: 'Mon', exp: 35, act: 32 },
                      { day: 'Tue', exp: 45, act: 42 },
                      { day: 'Wed', exp: 50, act: 48 },
                      { day: 'Thu', exp: 40, act: 38 },
                      { day: 'Fri', exp: 65, act: 60 },
                      { day: 'Sat', exp: 55, act: 52 },
                      { day: 'Sun', exp: 58, act: 54 },
                    ].map((item, idx) => {
                      const groupX = 50 + idx * 64;
                      const expH = (item.exp / 80) * 120;
                      const actH = (item.act / 80) * 120;
                      return (
                        <g key={item.day}>
                          {/* Expected Bar (Black) */}
                          <rect
                            x={groupX}
                            y={140 - expH}
                            width="11"
                            height={expH}
                            rx="2"
                            fill="#0F172A"
                          />
                          {/* Actual Bar (Red) */}
                          <rect
                            x={groupX + 13}
                            y={140 - actH}
                            width="11"
                            height={actH}
                            rx="2"
                            fill="#E81B24"
                          />
                          {/* Label */}
                          <text
                            x={groupX + 12}
                            y="155"
                            textAnchor="middle"
                            fontSize="10"
                            fill="#64748B"
                            fontWeight="500"
                          >
                            {item.day}
                          </text>
                        </g>
                      );
                    })}
                  </svg>

                  {/* Tooltip Card on Friday */}
                  <div className="absolute top-2 left-[54%] bg-white border border-slate-200/90 rounded-xl p-2.5 shadow-md text-xs space-y-1 pointer-events-none">
                    <p className="font-extrabold text-slate-800 text-[11px]">Today</p>
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span>
                      <span>Expected: ₹45,000</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                      <span>Actual: ₹43,000</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-red-600 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                      <span>Variance: -₹2,000</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Today's Financial Summary (5 Cards Row) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Today&apos;s Financial Summary
                </h3>
                <span className="bg-[#FEE2E2] text-[#DC2626] font-bold text-[10px] px-2 py-0.5 rounded-md">
                  SETTLEMENT LIVE
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Reconciliation cut-off: 21:00 IST</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 font-medium -mt-2">
              Cash & digital collection reconciliation against invoiced billing
            </p>

            {/* 5 Column Metric Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 pt-1">
              {/* Card 1: INVOICE VALUE TODAY / TOTAL REVENUE */}
              <div className="bg-[#F8FAFC] rounded-xl p-3.5 border border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    TOTAL REVENUE (TODAY)
                  </span>
                  <span className="bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                    Total Billed
                  </span>
                </div>
                <p className="text-xl font-black text-slate-900 tracking-tight">₹{totalRevenue.toLocaleString('en-IN')}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-1">
                  <span>Invoices</span>
                  <span className="font-bold text-slate-800">Reconciled</span>
                </div>
              </div>

              {/* Card 2: CASH COLLECTED / TODAY'S COLLECTION */}
              <div className="bg-[#F8FAFC] rounded-xl p-3.5 border border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    TODAY&apos;S COLLECTION
                  </span>
                  <Wallet className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <p className="text-xl font-black text-slate-900 tracking-tight">₹{todayCollection.toLocaleString('en-IN')}</p>
                <p className="text-[11px] text-slate-400 font-medium pt-1">
                  Cash vault &amp; digital collection
                </p>
              </div>

              {/* Card 3: UPI COLLECTED */}
              <div className="bg-[#F8FAFC] rounded-xl p-3.5 border border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    UPI COLLECTED
                  </span>
                  <span className="bg-[#DCFCE7] text-[#16A34A] text-[9px] font-bold px-1.5 py-0.5 rounded">
                    Verified
                  </span>
                </div>
                <p className="text-xl font-black text-[#16A34A] tracking-tight">₹55,000</p>
                <p className="text-[11px] text-[#16A34A] font-semibold pt-1">
                  Direct bank settlement
                </p>
              </div>

              {/* Card 4: OUTSTANDING NEW/BALANCES */}
              <div className="bg-[#F8FAFC] rounded-xl p-3.5 border border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    OUTSTANDING NEW/BALANCES
                  </span>
                  <CreditCard className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <p className="text-xl font-black text-[#EA580C] tracking-tight">₹25,000</p>
                <p className="text-[11px] text-slate-400 font-medium pt-1">
                  Unpaid customer balance on today&apos;s invoices
                </p>
              </div>

              {/* Card 5: EXPENSES TODAY */}
              <div className="bg-[#F8FAFC] rounded-xl p-3.5 border border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    EXPENSES TODAY
                  </span>
                  <Receipt className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <p className="text-xl font-black text-slate-900 tracking-tight">₹3,500</p>
                <p className="text-[11px] text-slate-400 font-medium pt-1">
                  Driver & fuel operational claims
                </p>
              </div>
            </div>

            {/* Financial Note Banner */}
            <div className="bg-[#EEF2F6] rounded-xl p-3 flex items-start gap-2.5 text-xs text-slate-600">
              <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <span className="font-bold text-slate-800">Financial Note:</span> Invoice value reflects total billing generated today. Outstanding amounts reflect uncollected balances. Cash & UPI collections reflect verified receipts.
              </p>
            </div>
          </div>

          {/* Section 4: 2 Cards Row (Agency Cylinder Inventory & Delivery Partner Settlements) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Col 1: Agency Cylinder Inventory */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                      Agency Cylinder Inventory
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Physical stock on premises at agency depot
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-xs font-bold text-[#E81B24] hover:text-red-700 flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Inventory</span>
                    <span>&rarr;</span>
                  </button>
                </div>

                {/* Big Stock Metric Card */}
                <div className="bg-[#F8FAFC] rounded-xl p-4 border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      FILLED CYLINDERS
                    </span>
                    <span className="bg-[#DCFCE7] text-[#16A34A] text-[10px] font-bold px-2 py-0.5 rounded">
                      Stock Per Depot
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-slate-900">180</span>
                    <span className="text-xs font-medium text-slate-500">units</span>
                  </div>

                  {/* Progress Bar (Threshold: 200 units) */}
                  <div className="space-y-1">
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div className="w-[75%] h-full bg-[#E81B24] rounded-full"></div>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">Threshold: 200 units</p>
                  </div>
                </div>

                {/* Warning Alert Banner */}
                <div className="bg-[#FFFBEB] border border-amber-200 rounded-xl p-3 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-800 leading-snug">
                    <span className="font-extrabold block">Low Stock Alert</span>
                    <p className="text-[11px] text-amber-700 mt-0.5">
                      Filled cylinder stock (180 units) is below the configured reorder threshold of 200 units. Indent replenishment backlog.
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 font-medium pt-2">
                *Strictly depot inventory. Excludes cylinders currently held in transit by delivery partners.
              </p>
            </div>

            {/* Col 2: Delivery Partner Settlements */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                      Delivery Partner Settlements
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Daily cash reconciliation & empty return review
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-xs font-bold text-[#E81B24] hover:text-red-700 flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Settlements</span>
                    <span>&rarr;</span>
                  </button>
                </div>

                {/* 2x2 Metric Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#F8FAFC] rounded-xl p-3 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        AWAITING REVIEW
                      </span>
                      <span className="bg-[#FEF3C7] text-amber-700 text-[9px] font-bold px-1.5 py-0.5 rounded">
                        Action Req
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-xl font-black text-slate-900">3</span>
                      <span className="text-xs font-medium text-slate-500">shifts</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Pending admin signoff
                    </span>
                  </div>

                  <div className="bg-[#F8FAFC] rounded-xl p-3 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      CASH EXPECTED
                    </span>
                    <span className="text-xl font-black text-slate-900 block mt-1">
                      ₹18,500
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Calculated via invoices
                    </span>
                  </div>

                  <div className="bg-[#F8FAFC] rounded-xl p-3 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">
                      CASH RETURNED
                    </span>
                    <span className="text-xl font-black text-[#16A34A] block mt-1">
                      ₹16,500
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Verified physical cash
                    </span>
                  </div>

                  <div className="bg-[#F8FAFC] rounded-xl p-3 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        CASH MISMATCH
                      </span>
                      <span className="bg-[#FEE2E2] text-[#DC2626] text-[9px] font-bold px-1.5 py-0.5 rounded">
                        Shortfall
                      </span>
                    </div>
                    <span className="text-xl font-black text-[#DC2626] block mt-1">
                      ₹2,000
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Requires audit check
                    </span>
                  </div>
                </div>

                {/* Shortfall Alert */}
                <div className="bg-[#FEF2F2] border border-red-200 rounded-xl p-3 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700 leading-snug">
                    <span className="font-extrabold">Unresolved Shortfall:</span> Cash shortfall detected across 1 pending delivery partner shift (Suresh Babu - DP-02).
                  </p>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 font-medium pt-2">
                Final settlement deadline: 21:30 IST
              </p>
            </div>
          </div>

          {/* Section 5: Delivery Partner Cylinder Custody Table */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Delivery Partner Cylinder Custody
                </h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Inbound all-vehicle inventory & handover status in real-time
                </p>
              </div>
              <button
                type="button"
                className="bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 transition cursor-pointer shadow-2xs"
              >
                <span>View All Delivery Partners</span>
                <span className="ml-1">&gt;</span>
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    <th className="pb-3 pl-1">DELIVERY PARTNER</th>
                    <th className="pb-3 text-center">FILLED CYLINDERS HELD</th>
                    <th className="pb-3 text-center">EMPTY CYLINDERS HELD</th>
                    <th className="pb-3">VAN LOAD RATIO</th>
                    <th className="pb-3 text-right pr-1">SETTLEMENT STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Row 1: Rajesh Kumar */}
                  <tr className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 pl-1">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          RK
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900">Rajesh Kumar</p>
                          <p className="text-[11px] text-slate-400">ID: DP-01 · +91 98401 23450</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 text-center">
                      <span className="inline-block bg-[#FEE2E2] text-[#DC2626] font-bold text-xs px-3 py-1 rounded-full">
                        10 Filled
                      </span>
                    </td>
                    <td className="py-3.5 text-center">
                      <span className="inline-block bg-[#EFF6FF] text-[#2563EB] font-bold text-xs px-3 py-1 rounded-full">
                        15 Empty
                      </span>
                    </td>
                    <td className="py-3.5">
                      <div className="space-y-1 max-w-[140px]">
                        <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                          <div className="w-[83%] h-full bg-slate-900 rounded-full"></div>
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium block">
                          25 / 30 slots
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 text-right pr-1">
                      <span className="inline-block bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-1 rounded-full">
                        Not Submitted
                      </span>
                    </td>
                  </tr>

                  {/* Row 2: Mohamed Irfan */}
                  <tr className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 pl-1">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          MI
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900">Mohamed Irfan</p>
                          <p className="text-[11px] text-slate-400">ID: DP-04 · +91 97890 12345</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 text-center">
                      <span className="inline-block bg-[#FEE2E2] text-[#DC2626] font-bold text-xs px-3 py-1 rounded-full">
                        5 Filled
                      </span>
                    </td>
                    <td className="py-3.5 text-center">
                      <span className="inline-block bg-[#EFF6FF] text-[#2563EB] font-bold text-xs px-3 py-1 rounded-full">
                        8 Empty
                      </span>
                    </td>
                    <td className="py-3.5">
                      <div className="space-y-1 max-w-[140px]">
                        <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                          <div className="w-[52%] h-full bg-slate-900 rounded-full"></div>
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium block">
                          13 / 25 slots
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 text-right pr-1">
                      <span className="inline-block bg-[#EEF2FF] text-[#4F46E5] text-xs font-semibold px-3 py-1 rounded-full">
                        Submitted
                      </span>
                    </td>
                  </tr>

                  {/* Row 3: Suresh Babu */}
                  <tr className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 pl-1">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          SB
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900">Suresh Babu</p>
                          <p className="text-[11px] text-slate-400">ID: DP-02 · +91 94432 98765</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 text-center">
                      <span className="inline-block bg-[#FEE2E2] text-[#DC2626] font-bold text-xs px-3 py-1 rounded-full">
                        12 Filled
                      </span>
                    </td>
                    <td className="py-3.5 text-center">
                      <span className="inline-block bg-[#EFF6FF] text-[#2563EB] font-bold text-xs px-3 py-1 rounded-full">
                        4 Empty
                      </span>
                    </td>
                    <td className="py-3.5">
                      <div className="space-y-1 max-w-[140px]">
                        <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                          <div className="w-[53%] h-full bg-slate-900 rounded-full"></div>
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium block">
                          16 / 30 slots
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 text-right pr-1">
                      <span className="inline-block bg-[#FEF3C7] text-amber-700 text-xs font-semibold px-3 py-1 rounded-full">
                        Under Review
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 gap-2">
              <p>*Field custody represents stock physically loaded on transit vehicles; distinct from depot warehouse records.</p>
              <p className="font-bold text-slate-800">
                Total in Transit: <span className="text-[#DC2626]">27 Filled</span> · <span className="text-[#2563EB]">27 Empty</span>
              </p>
            </div>
          </div>

          {/* Section 6: 2 Columns Row (Invoices & Payments & Expense Approvals) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Col 1: Invoices & Payments */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                    Invoices & Payments
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Chronological ledger & customer balance tracking
                  </p>
                </div>
                <button
                  type="button"
                  className="text-xs font-bold text-[#E81B24] hover:text-red-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>View All Invoices</span>
                  <span>&rarr;</span>
                </button>
              </div>

              {/* Strip KPIs */}
              <div className="grid grid-cols-4 gap-2 bg-[#F8FAFC] rounded-xl p-3 border border-slate-100 text-center">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">INVOICES TODAY</span>
                  <span className="text-base font-black text-slate-900 block mt-0.5">{recentInvoices.length}</span>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">PAID</span>
                  </div>
                  <span className="text-base font-black text-[#16A34A] block mt-0.5">
                    {recentInvoices.filter((i) => i.status === 'PAID').length}
                  </span>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">PARTIALLY PAID</span>
                  </div>
                  <span className="text-base font-black text-amber-600 block mt-0.5">
                    {recentInvoices.filter((i) => i.status === 'PARTIALLY_PAID').length}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">CUSTOMER DUES</span>
                  <span className="text-base font-black text-slate-900 block mt-0.5">
                    ₹{recentInvoices.reduce((sum, i) => sum + (i.balance || 0), 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Table of Invoices */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200/80 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                      <th className="pb-2.5">INVOICE #</th>
                      <th className="pb-2.5">CUSTOMER</th>
                      <th className="pb-2.5">AMOUNT</th>
                      <th className="pb-2.5">PAID</th>
                      <th className="pb-2.5">BALANCE</th>
                      <th className="pb-2.5 text-right">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentInvoices.length > 0 ? (
                      recentInvoices.map((inv) => (
                        <tr key={inv.id}>
                          <td className="py-2.5 font-bold text-slate-900">{inv.invoiceNumber}</td>
                          <td className="py-2.5">
                            <span className="font-bold text-slate-800 block">{inv.customerName}</span>
                            <span className="text-[10px] text-slate-400">{inv.customerCode}</span>
                          </td>
                          <td className="py-2.5 font-semibold text-slate-900">₹{inv.amount.toLocaleString('en-IN')}</td>
                          <td className="py-2.5 font-semibold text-[#16A34A]">₹{inv.paid.toLocaleString('en-IN')}</td>
                          <td className="py-2.5 font-bold text-amber-600">₹{inv.balance.toLocaleString('en-IN')}</td>
                          <td className="py-2.5 text-right">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              inv.status === 'PAID'
                                ? 'bg-[#DCFCE7] text-[#16A34A]'
                                : inv.status === 'PARTIALLY_PAID'
                                ? 'bg-[#FEF3C7] text-amber-700'
                                : 'bg-[#FEE2E2] text-[#DC2626]'
                            }`}>
                              {inv.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                          No customer invoices recorded yet. Start by dispatching cylinders and completing customer deliveries.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* FIFO Rules Enforced Footer */}
              <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-500 font-medium">
                <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
                <span>FIFO Rules Enforced: Incoming payments auto-allocate strictly to oldest customer invoices first.</span>
              </div>
            </div>

            {/* Col 2: Expense Approvals */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                    Expense Approvals
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Delivery partner operational claims & fuel vouchers
                  </p>
                </div>
                <button
                  type="button"
                  className="text-xs font-bold text-[#E81B24] hover:text-red-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>Review Expenses</span>
                  <span>&rarr;</span>
                </button>
              </div>

              {/* 4 Stat Boxes (2x2) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#F8FAFC] rounded-xl p-3 border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">AWAITING APPROVAL</span>
                    <span className="bg-[#FEF3C7] text-amber-700 text-[9px] font-bold px-1.5 py-0.5 rounded">Action</span>
                  </div>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-black text-slate-900">4</span>
                    <span className="text-xs font-medium text-slate-500">claims</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">₹1,850 pending total</span>
                </div>

                <div className="bg-[#F8FAFC] rounded-xl p-3 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">APPROVED TODAY</span>
                  <span className="text-xl font-black text-slate-900 block mt-1">₹3,500</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">4 claims settled</span>
                </div>

                <div className="bg-[#F8FAFC] rounded-xl p-3 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">REJECTED TODAY</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-black text-slate-900">1</span>
                    <span className="text-xs font-medium text-slate-500">claim</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Duplicated fuel slip</span>
                </div>

                <div className="bg-[#F8FAFC] rounded-xl p-3 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">EXPENSES THIS MONTH</span>
                  <span className="text-xl font-black text-slate-900 block mt-1">₹42,800</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Within monthly budget</span>
                </div>
              </div>

              {/* Pending Claim Action Item */}
              <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-red-50 text-red-600 shrink-0 mt-0.5">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">
                      Vehicle Fuel Reimbursement — Van 04
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Rajesh Kumar · ₹650.00 · Odo start 24321
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {fuelClaimStatus === 'PENDING' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setFuelClaimStatus('APPROVED')}
                        className="bg-[#16A34A] hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-2xs transition cursor-pointer"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => setFuelClaimStatus('REJECTED')}
                        className="bg-white hover:bg-slate-100 border border-slate-200/90 text-slate-700 font-bold text-xs px-3 py-1.5 rounded-lg transition cursor-pointer"
                      >
                        Reject
                      </button>
                    </>
                  ) : fuelClaimStatus === 'APPROVED' ? (
                    <span className="bg-[#DCFCE7] text-[#16A34A] font-bold text-xs px-2.5 py-1 rounded-md flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      Approved
                    </span>
                  ) : (
                    <span className="bg-[#FEE2E2] text-[#DC2626] font-bold text-xs px-2.5 py-1 rounded-md flex items-center gap-1">
                      <X className="w-3.5 h-3.5 stroke-[2.5]" />
                      Rejected
                    </span>
                  )}
                </div>
              </div>

              {/* Expense Budget Progress */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                <span>Budget Cap: ₹60,000 / month</span>
                <span className="font-bold text-slate-900">71.3% consumed</span>
              </div>
            </div>
          </div>

          {/* Section 7: Operational Alerts & Exceptions */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Operational Alerts & Exceptions
                </h3>
                <span className="bg-[#FEE2E2] text-[#DC2626] font-bold text-[10px] px-2 py-0.5 rounded-md">
                  5 Urgent
                </span>
              </div>
              <button
                type="button"
                className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark All Read</span>
              </button>
            </div>
            <p className="text-xs text-slate-400 font-medium -mt-2">
              Critical items requiring immediate administrator intervention
            </p>

            {/* 5 Column Alert Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 pt-1">
              {/* Alert 1 */}
              <div className="bg-[#F8FAFC] rounded-xl p-3.5 border border-slate-100 space-y-2 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="bg-[#FEF3C7] text-amber-700 text-[9px] font-bold px-1.5 py-0.5 rounded">
                      INVENTORY
                    </span>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-tight">
                    LOW CYLINDER STOCK
                  </h5>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black text-slate-900">180</span>
                    <span className="text-xs font-medium text-slate-500">Units</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">Threshold: 200 units</p>
                </div>
                <button
                  type="button"
                  className="text-xs font-bold text-[#E81B24] hover:text-red-700 flex items-center gap-1 pt-1 cursor-pointer"
                >
                  <span>Order Indent</span>
                  <span>&rarr;</span>
                </button>
              </div>

              {/* Alert 2 */}
              <div className="bg-[#F8FAFC] rounded-xl p-3.5 border border-slate-100 space-y-2 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="bg-[#FEE2E2] text-[#DC2626] text-[9px] font-bold px-1.5 py-0.5 rounded">
                      SETTLEMENT
                    </span>
                    <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                  </div>
                  <h5 className="text-[11px] font-black text-[#DC2626] uppercase tracking-tight">
                    CASH SHORTFALL
                  </h5>
                  <span className="text-lg font-black text-[#DC2626] block">
                    ₹2,000
                  </span>
                  <p className="text-[10px] text-slate-400 font-medium">Suresh Babu shift</p>
                </div>
                <button
                  type="button"
                  className="text-xs font-bold text-[#E81B24] hover:text-red-700 flex items-center gap-1 pt-1 cursor-pointer"
                >
                  <span>View Discrepancy</span>
                  <span>&rarr;</span>
                </button>
              </div>

              {/* Alert 3 */}
              <div className="bg-[#F8FAFC] rounded-xl p-3.5 border border-slate-100 space-y-2 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="bg-[#EFF6FF] text-blue-700 text-[9px] font-bold px-1.5 py-0.5 rounded">
                      FIELD TRANSIT
                    </span>
                    <Package className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-tight">
                    EXCESS FIELD EMPTIES
                  </h5>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black text-slate-900">15</span>
                    <span className="text-xs font-medium text-slate-500">cylinders</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">Rajesh Kumar van</p>
                </div>
                <button
                  type="button"
                  className="text-xs font-bold text-[#E81B24] hover:text-red-700 flex items-center gap-1 pt-1 cursor-pointer"
                >
                  <span>Reconcile Stock</span>
                  <span>&rarr;</span>
                </button>
              </div>

              {/* Alert 4 */}
              <div className="bg-[#F8FAFC] rounded-xl p-3.5 border border-slate-100 space-y-2 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="bg-[#FEF3C7] text-amber-700 text-[9px] font-bold px-1.5 py-0.5 rounded">
                      APPROVAL
                    </span>
                    <FileText className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-tight">
                    PENDING CLAIMS (4)
                  </h5>
                  <span className="text-lg font-black text-slate-900 block">
                    ₹1,850
                  </span>
                  <p className="text-[10px] text-slate-400 font-medium">Awaiting signoff</p>
                </div>
                <button
                  type="button"
                  className="text-xs font-bold text-[#E81B24] hover:text-red-700 flex items-center gap-1 pt-1 cursor-pointer"
                >
                  <span>Review Claims</span>
                  <span>&rarr;</span>
                </button>
              </div>

              {/* Alert 5 */}
              <div className="bg-[#F8FAFC] rounded-xl p-3.5 border border-slate-100 space-y-2 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="bg-[#EEF2F6] text-slate-700 text-[9px] font-bold px-1.5 py-0.5 rounded">
                      LEDGER
                    </span>
                    <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-tight">
                    PARTIALLY PAID INVOICES
                  </h5>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black text-slate-900">14</span>
                    <span className="text-xs font-medium text-slate-500">bills</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">Requires customer audit</p>
                </div>
                <button
                  type="button"
                  className="text-xs font-bold text-[#E81B24] hover:text-red-700 flex items-center gap-1 pt-1 cursor-pointer"
                >
                  <span>View Accounts</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Quick Issue Card Modal (New Dispatch) */}
        {showNewDispatchModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4 overflow-y-auto">
            <div className="w-full max-w-[480px] bg-white rounded-[24px] p-6 sm:p-7 shadow-2xl border border-slate-100 my-8 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#FEECEC] flex items-center justify-center shrink-0">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#BC0118"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="4" width="18" height="17" rx="3" />
                      <path d="M10 12h7" />
                      <path d="m14 9 3 3-3 3" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-snug">
                      Quick Issue Card
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Floor Custody Gate Transfer
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[#4B6B94] bg-[#EEF3FB] px-2.5 py-1 rounded-md shrink-0 tracking-wider">
                    GATE-PASS #GP-1095
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowNewDispatchModal(false)}
                    className="p-1 -mr-1 text-slate-400 hover:text-slate-700 cursor-pointer transition"
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="border-b border-slate-100 my-2" />

              <form onSubmit={handleConfirmGatePass} className="space-y-4">
                {/* Select Delivery Partner */}
                <div>
                  <label className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    SELECT DELIVERY PARTNER
                  </label>
                  <div className="relative">
                    <select
                      value={dispatchPartner}
                      onChange={(e) => setDispatchPartner(e.target.value)}
                      className="w-full bg-[#F1F4FA] rounded-2xl px-4 py-3 pr-10 text-xs sm:text-sm font-bold text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer"
                    >
                      {dispatchDrivers.length === 0 ? (
                        <option value="">No Active Partners - Onboard Partner First</option>
                      ) : (
                        dispatchDrivers.map((d) => {
                          const val = `${d.name} (${d.code}) · ${d.route}`;
                          return (
                            <option key={d.code} value={val}>
                              {val}
                            </option>
                          );
                        })
                      )}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-600 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.2]" />
                  </div>
                </div>

                {/* 3-Column Custody Summary */}
                <div className="bg-[#F1F4FA] rounded-2xl p-3.5 sm:p-4 grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      AGENCY FILLED
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-[#047857] block">
                      {cylindersInCirculation > 0 ? `${cylindersInCirculation} units ready` : '0 units ready'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      PARTNER CUSTODY
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight block">
                      {(() => {
                        const curDriver = dispatchDrivers.find(
                          (d) => `${d.name} (${d.code}) · ${d.route}` === dispatchPartner
                        );
                        return `${curDriver?.filled || 0} Filled · ${curDriver?.empty || 0}\nEmpty`;
                      })()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      TODAY&apos;S PREV<br />ISSUED
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-[#BC0118] block mt-0.5">
                      {(() => {
                        const curDriver = dispatchDrivers.find(
                          (d) => `${d.name} (${d.code}) · ${d.route}` === dispatchPartner
                        );
                        return `${curDriver?.todayIssued || 0} units`;
                      })()}
                    </span>
                  </div>
                </div>

                {/* Dynamic Cylinder Rows */}
                <div className="space-y-3">
                  {dispatchRows.map((row) => (
                    <div key={row.id} className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                          CYLINDER TYPE
                        </label>
                        <div className="relative">
                          <select
                            value={row.type}
                            onChange={(e) => {
                              const val = e.target.value;
                              setDispatchRows((prev) =>
                                prev.map((r) => (r.id === row.id ? { ...r, type: val } : r))
                              );
                            }}
                            className="w-full bg-[#F1F4FA] rounded-2xl px-4 py-3 pr-8 text-xs sm:text-sm font-bold text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer truncate"
                          >
                            <option value="15 kg Domestic">15 kg Domestic</option>
                            <option value="33 kg Domestic">33 kg Domestic</option>
                            <option value="19.5 kg Commercial">19.5 kg Commercial</option>
                            <option value="47.5 kg Industrial">47.5 kg Industrial</option>
                            <option value="5 kg Domestic">5 kg Domestic</option>
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.2]" />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                          FILLED CYLINDERS ISSUED
                        </label>
                        <div className="bg-[#F1F4FA] rounded-2xl px-4 py-2.5 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => handleUpdateRowQty(row.id, -1)}
                            className="text-slate-900 font-extrabold text-xl hover:text-red-600 px-2 cursor-pointer transition select-none"
                          >
                            −
                          </button>
                          <span className="text-sm sm:text-base font-extrabold text-slate-900">
                            {row.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateRowQty(row.id, 1)}
                            className="text-slate-900 font-extrabold text-xl hover:text-red-600 px-2 cursor-pointer transition select-none"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Cylinder Type Button */}
                <button
                  type="button"
                  onClick={handleAddCylinderRow}
                  className="w-full bg-[#F1F4FA] hover:bg-slate-200 active:scale-98 text-slate-900 font-bold text-xs sm:text-sm py-3.5 rounded-2xl flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 text-slate-900 stroke-[2.2]" />
                  <span>Add Cylinder Type</span>
                </button>

                <p className="text-[11px] italic text-slate-500 font-medium leading-relaxed">
                  * Gate handover requires driver physical signature upon loading into delivery three-wheeler/van.
                </p>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-[#BC0118] hover:bg-red-800 active:scale-98 text-white font-bold text-sm py-3.5 rounded-2xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-white stroke-[2.2]" />
                  <span>Confirm &amp; Issue Gate Pass</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Action Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs sm:text-sm font-semibold border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}
