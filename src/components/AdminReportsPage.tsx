'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import AdminSidebar from './AdminSidebar';
import {
  Calendar,
  ChevronDown,
  Download,
  Users,
  Truck,
  FileText,
  Banknote,
  AlertCircle,
  CreditCard,
  CheckCircle2,
  TrendingUp,
  Search,
  SlidersHorizontal,
  Info,
  ArrowRight,
  ShieldAlert,
  Bell,
  Wallet,
  Receipt,
  User,
} from 'lucide-react';

interface OperationalActivity {
  id: string;
  dateTime: string;
  activityType: 'delivery' | 'payment' | 'invoice' | 'expense' | 'handover';
  activityLabel: string;
  referenceId: string;
  entityName: string;
  entitySubtitle: string;
  amountVolume: string;
  amountHighlight?: boolean;
  amountGreen?: boolean;
  status: string;
  statusType: 'completed' | 'verified' | 'partial' | 'approved' | 'discrepancy';
}

const initialActivities: OperationalActivity[] = [
  {
    id: 'act-1',
    dateTime: '24 Oct, 04:15 PM',
    activityType: 'delivery',
    activityLabel: 'Cylinder Delivery',
    referenceId: 'DEL-20261024-94',
    entityName: 'Hotel Annapoorna (CUS-00042)',
    entitySubtitle: 'Partner: DP-003 Suresh Babu',
    amountVolume: '6x15, 5x22, 1x32 kg Filled Delivered',
    status: 'Completed',
    statusType: 'completed',
  },
  {
    id: 'act-2',
    dateTime: '24 Oct, 03:30 PM',
    activityType: 'payment',
    activityLabel: 'Customer Payment',
    referenceId: 'PAY-20261024-81',
    entityName: 'Sri Krishna Sweets (CUS-00088)',
    entitySubtitle: 'Bank Ref: UPI-SBIN-99214',
    amountVolume: '₹3,700.00 (UPI)',
    amountGreen: true,
    status: 'Verified (FIFO)',
    statusType: 'verified',
  },
  {
    id: 'act-3',
    dateTime: '24 Oct, 02:10 PM',
    activityType: 'invoice',
    activityLabel: 'Invoice Generated',
    referenceId: 'INV-20261024-89',
    entityName: 'Rajesh Kumar (CUS-00124)',
    entitySubtitle: 'Direct Counter Delivery',
    amountVolume: '₹1,500.00',
    status: 'Partially Paid (Bal: ₹500)',
    statusType: 'partial',
  },
  {
    id: 'act-4',
    dateTime: '24 Oct, 01:20 PM',
    activityType: 'expense',
    activityLabel: 'Expense Claim',
    referenceId: 'EXP-DP-20261024-04',
    entityName: 'DP-001 Rajesh Kumar (Diesel Van 04)',
    entitySubtitle: 'Fuel Receipt: BPCL-4921',
    amountVolume: '₹1,200.00',
    status: 'Approved',
    statusType: 'approved',
  },
  {
    id: 'act-5',
    dateTime: '24 Oct, 11:45 AM',
    activityType: 'handover',
    activityLabel: 'Depot Cash Handover',
    referenceId: 'CASH-20261016-001',
    entityName: 'Suresh Babu (Van 03)',
    entitySubtitle: 'Cash Shortage: ₹2,000 pending tally',
    amountVolume: '₹16,500 / ₹18,500',
    amountHighlight: true,
    status: 'Discrepancy Flagged',
    statusType: 'discrepancy',
  },
];

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState('Overall Branch Report');
  const [selectedPeriod, setSelectedPeriod] = useState('This Month (01 - 24 Oct 2026)');
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [chartTimeRange, setChartTimeRange] = useState<'7 D' | '30 D' | 'Custom'>('30 D');
  const [searchQuery, setSearchQuery] = useState('');
  const [activityFilter, setActivityFilter] = useState('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [reportMetrics, setReportMetrics] = useState({
    customers: 0,
    deliveries: 0,
    invoices: 0,
    revenue: 0,
    receivables: 0,
  });

  useEffect(() => {
    fetch('/api/admin/metrics')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setReportMetrics({
            customers: json.data.totalCustomers || 0,
            deliveries: json.data.deliveries?.completed || 0,
            invoices: json.data.deliveries?.completed || 0,
            revenue: json.data.totalRevenue || 0,
            receivables: 0,
          });
        }
      })
      .catch(() => {});
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const tabs = [
    { id: 'Overall Branch Report', label: 'Overall Branch Report' },
    { id: 'Customer Reports', label: 'Customer Reports' },
    { id: 'Delivery Reports', label: 'Delivery Reports' },
    { id: 'Invoice & Payment Reports', label: 'Invoice & Payment Reports' },
    { id: 'Inventory Reports', label: 'Inventory Reports' },
    { id: 'Delivery Partner Reports', label: 'Delivery Partner Reports', highlightRed: true },
    { id: 'Expenses Reports', label: 'Expenses Reports', highlightRed: true },
  ];

  const filteredActivities = useMemo(() => {
    return initialActivities.filter((act) => {
      if (activityFilter !== 'all' && act.activityType !== activityFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          act.referenceId.toLowerCase().includes(q) ||
          act.entityName.toLowerCase().includes(q) ||
          act.entitySubtitle.toLowerCase().includes(q) ||
          act.activityLabel.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [activityFilter, searchQuery]);

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800 font-sans antialiased overflow-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Admin Sidebar */}
      <AdminSidebar activeItem="Reports" />

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="h-14 border-b border-slate-100 bg-white/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600 inline-block" />
            <span className="text-[11px] font-bold text-slate-400">Super Gas Analytics</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Agency: Operational
            </span>

            <button
              type="button"
              onClick={() => triggerToast('No new notifications')}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full" />
            </button>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-100">
              <div className="w-7 h-7 rounded-full bg-[#BC0118] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                <User className="w-4 h-4" />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-800 leading-tight">Agency Admin</p>
                <p className="text-[10px] text-slate-400 leading-tight">HQ Branch</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Reports Container */}
        <main className="p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Page Title & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Reports</h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-black tracking-wide">
                  <ShieldAlert className="w-3 h-3 text-rose-600" />
                  Admin Console
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Monitor branch performance, deliveries, financial activity, inventory, and business operations.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Reporting Period Dropdown */}
              <div className="relative">
                <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-0.5">
                  REPORTING PERIOD
                </span>
                <button
                  type="button"
                  onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                  className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs px-3.5 py-2 rounded-xl shadow-2xs transition flex items-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>{selectedPeriod}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showPeriodDropdown && (
                  <div className="absolute top-full right-0 mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 text-xs font-bold text-slate-700">
                    {[
                      'Today (24 Oct 2026)',
                      'Last 7 Days (18 - 24 Oct 2026)',
                      'This Month (01 - 24 Oct 2026)',
                      'Previous Month (Sep 2026)',
                      'Q3 2026 Comprehensive',
                    ].map((period) => (
                      <div
                        key={period}
                        onClick={() => {
                          setSelectedPeriod(period);
                          setShowPeriodDropdown(false);
                          triggerToast(`Switched period to ${period}`);
                        }}
                        className={`px-4 py-2 hover:bg-[#F1F4FA] cursor-pointer ${
                          selectedPeriod === period ? 'text-[#BC0118] font-black bg-rose-50/50' : ''
                        }`}
                      >
                        {period}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Export Report Dropdown */}
              <div className="pt-3.5 relative">
                <button
                  type="button"
                  onClick={() => setShowExportDropdown(!showExportDropdown)}
                  className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs px-3.5 py-2 rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>Export Report</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {showExportDropdown && (
                  <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 text-xs font-bold text-slate-700">
                    <button
                      type="button"
                      onClick={() => {
                        setShowExportDropdown(false);
                        triggerToast('Downloading Executive PDF Summary...');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-[#F1F4FA] cursor-pointer"
                    >
                      Export as PDF Report
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowExportDropdown(false);
                        triggerToast('Exporting complete ledger CSV...');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-[#F1F4FA] cursor-pointer"
                    >
                      Export CSV (Raw Data)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowExportDropdown(false);
                        triggerToast('Generating Audit Bundle...');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-[#F1F4FA] cursor-pointer"
                    >
                      Compliance &amp; Audit Bundle
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tab Navigation Strip */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200/60">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    triggerToast(`Viewing ${tab.label}`);
                  }}
                  className={`text-xs whitespace-nowrap transition cursor-pointer px-3.5 py-2 rounded-xl ${
                    isActive
                      ? 'bg-[#FDEEEE] text-[#BC0118] font-black'
                      : tab.highlightRed
                      ? 'text-[#BC0118] font-bold hover:bg-rose-50/50'
                      : 'text-slate-600 hover:text-slate-900 font-bold'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Top 6 KPI Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {/* Card 1: TOTAL CUSTOMERS */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                  TOTAL CUSTOMERS
                </span>
                <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2.5">
                <p className="text-2xl font-black text-slate-900 tracking-tight">{reportMetrics.customers.toLocaleString('en-IN')}</p>
                <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>Real DB accounts</span>
                </p>
              </div>
            </div>

            {/* Card 2: TOTAL DELIVERIES */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                  TOTAL DELIVERIES
                </span>
                <div className="w-6 h-6 rounded-lg bg-rose-50 text-[#BC0118] flex items-center justify-center">
                  <Truck className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2.5">
                <p className="text-2xl font-black text-slate-900 tracking-tight">{reportMetrics.deliveries.toLocaleString('en-IN')}</p>
                <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Fulfillment tasks</span>
                </p>
              </div>
            </div>

            {/* Card 3: TOTAL INVOICES */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                  TOTAL INVOICES
                </span>
                <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FileText className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2.5">
                <p className="text-2xl font-black text-slate-900 tracking-tight">{reportMetrics.invoices.toLocaleString('en-IN')}</p>
                <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  <span>Generated invoices</span>
                </p>
              </div>
            </div>

            {/* Card 4: AMOUNT COLLECTED */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                  AMOUNT COLLECTED
                </span>
                <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Banknote className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2.5">
                <p className="text-2xl font-black text-slate-900 tracking-tight">₹{reportMetrics.revenue.toLocaleString('en-IN')}</p>
                <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Zero Double Counting</span>
                </p>
              </div>
            </div>

            {/* Card 5: RECEIVABLES */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                  RECEIVABLES
                </span>
                <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertCircle className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2.5">
                <p className="text-2xl font-black text-slate-900 tracking-tight">₹{reportMetrics.receivables.toLocaleString('en-IN')}</p>
                <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>Across {reportMetrics.customers} Accounts</span>
                </p>
              </div>
            </div>

            {/* Card 6: TOTAL EXPENSES */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                  TOTAL EXPENSES
                </span>
                <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                  <CreditCard className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2.5">
                <p className="text-2xl font-black text-slate-900 tracking-tight">₹52,400</p>
                <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  <span>Approved OpEx Only</span>
                </p>
              </div>
            </div>
          </div>

          {/* Charts Row 1: Daily Delivery Performance & Revenue vs Collection Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Chart 1: Daily Delivery Performance */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Daily Delivery Performance</h3>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      Fulfillment volume across branches (01 Oct – 24 Oct 2026)
                    </p>
                  </div>
                  {/* Time Range Pills */}
                  <div className="bg-slate-100 p-0.5 rounded-lg flex items-center text-[10px] font-bold">
                    {(['7 D', '30 D', 'Custom'] as const).map((range) => (
                      <button
                        key={range}
                        type="button"
                        onClick={() => setChartTimeRange(range)}
                        className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                          chartTimeRange === range
                            ? 'bg-white text-slate-900 font-black shadow-2xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SVG Area/Line Chart */}
                <div className="mt-5 relative h-48 w-full">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 500 170" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="deliveryAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#BC0118" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#BC0118" stopOpacity="0.01" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal reference dashed lines */}
                    <line x1="20" y1="20" x2="490" y2="20" stroke="#F1F5F9" strokeDasharray="3 3" />
                    <line x1="20" y1="55" x2="490" y2="55" stroke="#F1F5F9" strokeDasharray="3 3" />
                    <line x1="20" y1="90" x2="490" y2="90" stroke="#F1F5F9" strokeDasharray="3 3" />
                    <line x1="20" y1="125" x2="490" y2="125" stroke="#F1F5F9" strokeDasharray="3 3" />
                    <line x1="20" y1="150" x2="490" y2="150" stroke="#E2E8F0" />

                    {/* Y-axis numbers */}
                    <text x="5" y="24" fill="#94A3B8" fontSize="8" fontWeight="bold">20</text>
                    <text x="5" y="59" fill="#94A3B8" fontSize="8" fontWeight="bold">15</text>
                    <text x="5" y="94" fill="#94A3B8" fontSize="8" fontWeight="bold">10</text>
                    <text x="5" y="129" fill="#94A3B8" fontSize="8" fontWeight="bold">5</text>
                    <text x="5" y="153" fill="#94A3B8" fontSize="8" fontWeight="bold">0</text>

                    {/* Filled Area */}
                    <path
                      d="M 20 120 Q 55 125 75 110 T 130 95 T 185 105 T 240 75 T 295 85 T 350 55 T 410 40 L 460 55 L 460 150 L 20 150 Z"
                      fill="url(#deliveryAreaGrad)"
                    />

                    {/* Smooth Stroke Line */}
                    <path
                      d="M 20 120 Q 55 125 75 110 T 130 95 T 185 105 T 240 75 T 295 85 T 350 55 T 410 40 L 460 55"
                      fill="none"
                      stroke="#BC0118"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    {/* Peak Point on 21 Oct */}
                    <circle cx="410" cy="40" r="4" fill="#BC0118" stroke="#FFFFFF" strokeWidth="2" />
                  </svg>

                  {/* Tooltip on 21 Oct */}
                  <div className="absolute top-2 right-16 sm:right-20 bg-slate-950 text-white text-[10px] font-black px-2.5 py-1 rounded-md shadow-md pointer-events-none">
                    20 Oct: 48 Deliveries
                  </div>

                  {/* X-axis labels */}
                  <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 pt-1.5 px-3">
                    <span>1 Oct</span>
                    <span>05 Oct</span>
                    <span>09 Oct</span>
                    <span>13 Oct</span>
                    <span>17 Oct</span>
                    <span>21 Oct</span>
                    <span>24 Oct</span>
                  </div>
                </div>
              </div>

              {/* Bottom Performance Stats */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <p className="text-slate-600">
                  Peak Day: <strong className="text-slate-900 font-extrabold">52 Cylinders (21 Oct)</strong>
                </p>
                <p className="text-slate-600">
                  Average: <strong className="text-slate-900 font-extrabold">35.25 Cylinders/Day</strong>
                </p>
                <p className="text-emerald-600 font-extrabold">
                  Completion Rate: 98.4%
                </p>
              </div>
            </div>

            {/* Chart 2: Revenue vs Collection Trend */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Revenue vs Collection Trend</h3>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      Invoiced revenue vs realized bank/cash receipts (₹ in Thousands)
                    </p>
                  </div>
                  {/* Legend */}
                  <div className="flex items-center gap-3 text-xs font-bold">
                    <span className="flex items-center gap-1.5 text-slate-800">
                      <span className="w-2.5 h-2.5 rounded-2xs bg-slate-900 inline-block" />
                      Invoiced
                    </span>
                    <span className="flex items-center gap-1.5 text-[#BC0118]">
                      <span className="w-2.5 h-2.5 rounded-2xs bg-[#BC0118] inline-block" />
                      Collected
                    </span>
                  </div>
                </div>

                {/* SVG Double Line Chart */}
                <div className="mt-5 relative h-48 w-full">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 500 170" preserveAspectRatio="none">
                    {/* Horizontal reference dashed lines */}
                    <line x1="25" y1="20" x2="490" y2="20" stroke="#F1F5F9" strokeDasharray="3 3" />
                    <line x1="25" y1="55" x2="490" y2="55" stroke="#F1F5F9" strokeDasharray="3 3" />
                    <line x1="25" y1="90" x2="490" y2="90" stroke="#F1F5F9" strokeDasharray="3 3" />
                    <line x1="25" y1="125" x2="490" y2="125" stroke="#F1F5F9" strokeDasharray="3 3" />
                    <line x1="25" y1="150" x2="490" y2="150" stroke="#E2E8F0" />

                    {/* Y-axis numbers */}
                    <text x="5" y="24" fill="#94A3B8" fontSize="8" fontWeight="bold">1M</text>
                    <text x="5" y="59" fill="#94A3B8" fontSize="8" fontWeight="bold">750k</text>
                    <text x="5" y="94" fill="#94A3B8" fontSize="8" fontWeight="bold">500k</text>
                    <text x="5" y="129" fill="#94A3B8" fontSize="8" fontWeight="bold">250k</text>
                    <text x="5" y="153" fill="#94A3B8" fontSize="8" fontWeight="bold">0</text>

                    {/* Invoiced Line (Charcoal / Black) */}
                    <path
                      d="M 30 115 Q 100 80 150 90 T 260 55 T 370 45 L 450 35"
                      fill="none"
                      stroke="#1E293B"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />

                    {/* Collected Line (Red) */}
                    <path
                      d="M 30 125 Q 100 100 150 105 T 260 65 T 370 55 L 450 45"
                      fill="none"
                      stroke="#BC0118"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />

                    {/* Data Points on 24 Oct */}
                    <circle cx="450" cy="35" r="3.5" fill="#1E293B" stroke="#FFFFFF" strokeWidth="1.5" />
                    <circle cx="450" cy="45" r="3.5" fill="#BC0118" stroke="#FFFFFF" strokeWidth="1.5" />
                  </svg>

                  {/* Tooltip Box */}
                  <div className="absolute top-10 right-10 sm:right-16 bg-slate-950 text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-md pointer-events-none">
                    Inv: ₹68,400 | Col: ₹61,200
                  </div>

                  {/* X-axis labels */}
                  <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 pt-1.5 px-4">
                    <span>W1 (01-07)</span>
                    <span>W2 (08-14)</span>
                    <span>W3 (15-21)</span>
                    <span>22 Oct</span>
                    <span>24 Oct</span>
                  </div>
                </div>
              </div>

              {/* Bottom Financial Stats */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <p className="text-slate-600">
                  Invoiced: <strong className="text-slate-900 font-extrabold">₹13,33,250</strong>
                </p>
                <p className="text-slate-600">
                  Collected: <strong className="text-slate-900 font-extrabold">₹11,48,250 (86.1%)</strong>
                </p>
                <p className="text-[#BC0118] font-extrabold">
                  Collection Gap: ₹1.85L (Credit Cycle)
                </p>
              </div>
            </div>
          </div>

          {/* Charts Row 2: Cylinder Breakdown, Payment Split & Operating Expenses */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: Cylinder Breakdown */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Cylinder Breakdown</h3>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      Units delivered by cylinder spec
                    </p>
                  </div>
                  <span className="bg-slate-100 text-slate-800 text-[10px] font-black px-2.5 py-1 rounded-full">
                    846 Units
                  </span>
                </div>

                {/* Vertical Bar Chart */}
                <div className="mt-6 h-36 flex items-end justify-around px-2 border-b border-slate-100 pb-2">
                  {/* Bar 1: 14.2 KG */}
                  <div className="flex flex-col items-center gap-1.5 w-12">
                    <span className="text-[10px] font-extrabold text-slate-700">420</span>
                    <div className="w-9 bg-[#475569] rounded-t-lg h-28 transition-all hover:opacity-90" />
                    <span className="text-[9px] font-bold text-slate-400 mt-1 whitespace-nowrap">14.2 KG</span>
                  </div>

                  {/* Bar 2: 19.5 KG */}
                  <div className="flex flex-col items-center gap-1.5 w-12">
                    <span className="text-[10px] font-extrabold text-slate-700">260</span>
                    <div className="w-9 bg-[#334155] rounded-t-lg h-20 transition-all hover:opacity-90" />
                    <span className="text-[9px] font-bold text-slate-400 mt-1 whitespace-nowrap">19.5 KG</span>
                  </div>

                  {/* Bar 3: 32.5 KG */}
                  <div className="flex flex-col items-center gap-1.5 w-12">
                    <span className="text-[10px] font-extrabold text-[#BC0118]">48</span>
                    <div className="w-9 bg-[#BC0118] rounded-t-lg h-8 transition-all hover:opacity-90" />
                    <span className="text-[9px] font-bold text-slate-400 mt-1 whitespace-nowrap">32.5 KG</span>
                  </div>

                  {/* Bar 4: 47.5 KG */}
                  <div className="flex flex-col items-center gap-1.5 w-12">
                    <span className="text-[10px] font-extrabold text-red-600">16</span>
                    <div className="w-9 bg-red-600 rounded-t-lg h-4 transition-all hover:opacity-90" />
                    <span className="text-[9px] font-bold text-slate-400 mt-1 whitespace-nowrap">47.5 KG</span>
                  </div>
                </div>
              </div>

              {/* Legend Grid */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-2xs bg-[#475569] inline-block" />
                  Domestic: 61.3%
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-2xs bg-[#334155] inline-block" />
                  Commercial: 30.7%
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-2xs bg-[#BC0118] inline-block" />
                  Industrial: 5.7%
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-2xs bg-red-600 inline-block" />
                  Heavy: 2.1%
                </span>
              </div>
            </div>

            {/* Card 2: Payment Split */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Payment Split</h3>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">Channel reconciliation</p>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black px-2 py-0.5 rounded-md">
                    100% Reconciled
                  </span>
                </div>

                {/* Donut Chart */}
                <div className="mt-4 flex items-center justify-center relative">
                  <svg className="w-36 h-36 -rotate-90" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#F1F5F9" strokeWidth="14" />
                    {/* Cash Handover (62%) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#BC0118"
                      strokeWidth="14"
                      strokeDasharray="238.76"
                      strokeDashoffset="90.73"
                    />
                    {/* Instant UPI (30%) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#1E293B"
                      strokeWidth="14"
                      strokeDasharray="238.76"
                      strokeDashoffset="167.13"
                      transform="rotate(223.2 50 50)"
                    />
                    {/* Direct Bank (8%) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#10B981"
                      strokeWidth="14"
                      strokeDasharray="238.76"
                      strokeDashoffset="219.66"
                      transform="rotate(331.2 50 50)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    <span className="text-base font-black text-slate-900">₹11.48L</span>
                    <span className="text-[8px] font-extrabold text-slate-400 tracking-wider uppercase">
                      COLLECTED
                    </span>
                  </div>
                </div>
              </div>

              {/* Breakdown List */}
              <div className="mt-4 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between font-semibold">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <span className="w-2 h-2 rounded-full bg-[#BC0118] inline-block" />
                    Cash Delivery Handover
                  </span>
                  <span className="font-extrabold text-slate-900">₹7,12,000 (62%)</span>
                </div>
                <div className="flex items-center justify-between font-semibold">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <span className="w-2 h-2 rounded-full bg-[#1E293B] inline-block" />
                    Instant UPI / BharatQR
                  </span>
                  <span className="font-extrabold text-slate-900">₹3,44,250 (30%)</span>
                </div>
                <div className="flex items-center justify-between font-semibold">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <span className="w-2 h-2 rounded-full bg-[#10B981] inline-block" />
                    Direct Bank NEFT / RTGS
                  </span>
                  <span className="font-extrabold text-slate-900">₹92,000 (8%)</span>
                </div>
              </div>
            </div>

            {/* Card 3: Operating Expenses */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Operating Expenses</h3>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">Verified depot OpEx claims</p>
                  </div>
                  <span className="text-xs font-bold text-slate-500">
                    ₹52,400.00
                  </span>
                </div>

                {/* Donut Chart */}
                <div className="mt-4 flex items-center justify-center relative">
                  <svg className="w-36 h-36 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#F1F5F9" strokeWidth="14" />
                    {/* Fuel & Diesel (42.2%) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#BC0118"
                      strokeWidth="14"
                      strokeDasharray="238.76"
                      strokeDashoffset="138.0"
                    />
                    {/* Driver Allowances (29.8%) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#334155"
                      strokeWidth="14"
                      strokeDasharray="238.76"
                      strokeDashoffset="167.6"
                      transform="rotate(151.9 50 50)"
                    />
                    {/* Vehicle Maintenance (16.1%) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#64748B"
                      strokeWidth="14"
                      strokeDasharray="238.76"
                      strokeDashoffset="200.3"
                      transform="rotate(259.2 50 50)"
                    />
                    {/* Depot Utilities (8.1%) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#CBD5E1"
                      strokeWidth="14"
                      strokeDasharray="238.76"
                      strokeDashoffset="219.4"
                      transform="rotate(317.1 50 50)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    <span className="text-base font-black text-slate-900">₹52.4K</span>
                    <span className="text-[8px] font-extrabold text-slate-400 tracking-wider uppercase">
                      OPEX VERIFIED
                    </span>
                  </div>
                </div>
              </div>

              {/* Breakdown List */}
              <div className="mt-4 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-slate-600">Fuel &amp; Diesel</span>
                  <span className="font-extrabold text-slate-900">₹22,100 (42.2%)</span>
                </div>
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-slate-600">Driver Allowances</span>
                  <span className="font-extrabold text-slate-900">₹15,600 (29.8%)</span>
                </div>
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-slate-600">Vehicle Maintenance</span>
                  <span className="font-extrabold text-slate-900">₹8,450 (16.1%)</span>
                </div>
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-slate-600">Depot Utilities</span>
                  <span className="font-extrabold text-slate-900">₹4,250 (8.1%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Info Alert Banner: Operating Scope Isolation */}
          <div className="bg-[#F1F4FA] border border-slate-200/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                <strong className="text-slate-800 font-bold">Operating Scope Isolation:</strong> The figures above strictly exclude Capital Expenditure (CapEx), tanker fleet additions, and refundable customer cylinder security deposits. Those are managed separately under the <span className="font-bold text-slate-800">Investments Reports</span> module.
              </p>
            </div>
            <Link
              href="/admin/settlements"
              className="text-xs font-bold text-[#BC0118] hover:text-red-800 flex items-center gap-1 shrink-0 whitespace-nowrap transition cursor-pointer"
            >
              <span>View CapEx Assets</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Recent Branch Operational Activity Table Card */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-slate-900">Recent Branch Operational Activity</h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Latest real-time transactions across logistics, billing, and settlements
                </p>
              </div>

              {/* Search & Filters */}
              <div className="flex items-center gap-2.5 relative">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filter ledger records..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-[#F1F4FA] text-xs font-semibold text-slate-800 placeholder:text-slate-400 pl-8 pr-3 py-2 rounded-xl outline-none w-56 sm:w-64 border-none"
                  />
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                    className="bg-[#F1F4FA] hover:bg-slate-200/60 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Filters</span>
                  </button>

                  {showFilterMenu && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 text-xs font-bold text-slate-700">
                      {[
                        { label: 'All Activities', val: 'all' },
                        { label: 'Cylinder Delivery', val: 'delivery' },
                        { label: 'Customer Payment', val: 'payment' },
                        { label: 'Invoice Generated', val: 'invoice' },
                        { label: 'Expense Claim', val: 'expense' },
                        { label: 'Cash Handover', val: 'handover' },
                      ].map((f) => (
                        <div
                          key={f.val}
                          onClick={() => {
                            setActivityFilter(f.val);
                            setShowFilterMenu(false);
                            triggerToast(`Filtered by ${f.label}`);
                          }}
                          className={`px-4 py-2 hover:bg-[#F1F4FA] cursor-pointer ${
                            activityFilter === f.val ? 'text-[#BC0118] font-black' : ''
                          }`}
                        >
                          {f.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                    <th className="py-3.5 px-6">DATE &amp; TIME</th>
                    <th className="py-3.5 px-4">ACTIVITY TYPE</th>
                    <th className="py-3.5 px-4">REFERENCE ID</th>
                    <th className="py-3.5 px-4">RELATED ENTITY / PARTNER</th>
                    <th className="py-3.5 px-4">AMOUNT / VOLUME</th>
                    <th className="py-3.5 px-6 text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold">
                  {filteredActivities.map((act) => (
                    <tr
                      key={act.id}
                      onClick={() => triggerToast(`Inspecting transaction ${act.referenceId}`)}
                      className="hover:bg-slate-50/80 transition cursor-pointer"
                    >
                      {/* Date & Time */}
                      <td className="py-4 px-6 text-slate-700 font-bold whitespace-nowrap">
                        {act.dateTime}
                      </td>

                      {/* Activity Type Badge */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {act.activityType === 'delivery' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-black bg-rose-50 border border-rose-200/60 text-[#BC0118]">
                            <Truck className="w-3.5 h-3.5 text-[#BC0118]" />
                            {act.activityLabel}
                          </span>
                        )}
                        {act.activityType === 'payment' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-black bg-emerald-50 border border-emerald-200/60 text-emerald-700">
                            <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                            {act.activityLabel}
                          </span>
                        )}
                        {act.activityType === 'invoice' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-black bg-blue-50 border border-blue-200/60 text-blue-700">
                            <FileText className="w-3.5 h-3.5 text-blue-600" />
                            {act.activityLabel}
                          </span>
                        )}
                        {act.activityType === 'expense' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-black bg-slate-100 border border-slate-200 text-slate-700">
                            <Receipt className="w-3.5 h-3.5 text-slate-600" />
                            {act.activityLabel}
                          </span>
                        )}
                        {act.activityType === 'handover' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-black bg-rose-50 border border-rose-200/60 text-[#BC0118]">
                            <Wallet className="w-3.5 h-3.5 text-[#BC0118]" />
                            {act.activityLabel}
                          </span>
                        )}
                      </td>

                      {/* Reference ID */}
                      <td className="py-4 px-4 font-mono text-xs text-slate-600 whitespace-nowrap font-bold">
                        {act.referenceId}
                      </td>

                      {/* Related Entity / Partner */}
                      <td className="py-4 px-4">
                        <p className="font-extrabold text-slate-900 text-xs">{act.entityName}</p>
                        <p
                          className={`text-[11px] mt-0.5 ${
                            act.activityType === 'handover'
                              ? 'text-rose-600 font-bold'
                              : 'text-slate-400 font-medium'
                          }`}
                        >
                          {act.entitySubtitle}
                        </p>
                      </td>

                      {/* Amount / Volume */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`font-black text-xs ${
                            act.amountHighlight
                              ? 'text-rose-600'
                              : act.amountGreen
                              ? 'text-emerald-700'
                              : 'text-slate-800'
                          }`}
                        >
                          {act.amountVolume}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        {act.statusType === 'completed' && (
                          <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {act.status}
                          </span>
                        )}
                        {act.statusType === 'verified' && (
                          <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {act.status}
                          </span>
                        )}
                        {act.statusType === 'partial' && (
                          <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            {act.status}
                          </span>
                        )}
                        {act.statusType === 'approved' && (
                          <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {act.status}
                          </span>
                        )}
                        {act.statusType === 'discrepancy' && (
                          <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            {act.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Strip */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
              <p>Showing 5 of 142 daily operational records</p>
              <div className="flex items-center gap-1 font-bold">
                <button
                  type="button"
                  onClick={() => triggerToast('Previous page')}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer text-xs"
                >
                  &lt;
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  className={`w-7 h-7 rounded-lg text-xs font-black transition cursor-pointer ${
                    currentPage === 1 ? 'bg-[#BC0118] text-white shadow-2xs' : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  1
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(2)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition cursor-pointer ${
                    currentPage === 2 ? 'bg-[#BC0118] text-white shadow-2xs' : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  2
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(3)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition cursor-pointer ${
                    currentPage === 3 ? 'bg-[#BC0118] text-white shadow-2xs' : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  3
                </button>
                <span className="px-1 text-slate-400">...</span>
                <button
                  type="button"
                  onClick={() => setCurrentPage(29)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition cursor-pointer ${
                    currentPage === 29 ? 'bg-[#BC0118] text-white shadow-2xs' : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  29
                </button>
                <button
                  type="button"
                  onClick={() => triggerToast('Next page')}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer text-xs"
                >
                  &gt;
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
