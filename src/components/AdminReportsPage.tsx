'use client';

import React, { useState, useEffect } from 'react';
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
  ShieldAlert,
  Bell,
  Wallet,
  Receipt,
  User,
  PackageCheck,
  RefreshCw,
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

function generatePaginationPages(currentPage: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | '...')[] = [];
  pages.push(1);

  if (currentPage > 3) {
    pages.push('...');
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (currentPage < totalPages - 2) {
    pages.push('...');
  }

  pages.push(totalPages);
  return pages;
}

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState('Overall Branch Report');
  const [selectedPeriod, setSelectedPeriod] = useState('This Month (Nov 2026)');
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [chartTimeRange, setChartTimeRange] = useState<'7 D' | '30 D' | 'Custom'>('30 D');
  const [searchQuery, setSearchQuery] = useState('');
  const [activityFilter, setActivityFilter] = useState('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshIndex, setRefreshIndex] = useState(0);

  // Pagination state for operational activities table
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const [activitiesState, setActivitiesState] = useState<{
    items: OperationalActivity[];
    totalCount: number;
    page: number;
    limit: number;
    totalPages: number;
  }>({
    items: [],
    totalCount: 0,
    page: 1,
    limit: 5,
    totalPages: 1,
  });
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reportsData, setReportsData] = useState<any>(null);

  const [reportMetrics, setReportMetrics] = useState({
    customers: 0,
    deliveries: 0,
    invoices: 0,
    revenue: 0,
    receivables: 0,
    expenses: 52400,
  });

  useEffect(() => {
    let isMounted = true;
    fetch(`/api/admin/reports?period=${encodeURIComponent(selectedPeriod)}`)
      .then((res) => res.json())
      .then((json) => {
        if (!isMounted) return;
        if (json.success && json.data) {
          setReportsData(json.data);
          if (json.data.overall?.activities) {
            setActivitiesState(json.data.overall.activities);
          }
          const o = json.data.overall?.metrics;
          if (o) {
            setReportMetrics({
              customers: o.totalCustomers || 0,
              deliveries: o.completedDeliveries || 0,
              invoices: json.data.invoiceReports?.metrics?.invoicesCount || o.completedDeliveries || 0,
              revenue: o.totalPaidAmount || 0,
              receivables: o.totalBalanceDue || 0,
              expenses: o.totalApprovedExpenses || 52400,
            });
          }
        }
      })
      .catch((err) => console.warn('Failed loading reports:', err))
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedPeriod, refreshIndex]);

  // Database-level paginated query for operational activities
  useEffect(() => {
    let ignore = false;
    const params = new URLSearchParams({
      page: String(currentPage),
      limit: String(pageSize),
      type: activityFilter,
      search: searchQuery.trim(),
      period: selectedPeriod,
    });

    fetch(`/api/admin/reports/activities?${params.toString()}`)
      .then((res) => res.json())
      .then((json) => {
        if (!ignore && json.success && json.data) {
          setActivitiesState(json.data);
        }
      })
      .catch((err) => console.warn('Failed loading operational activities:', err))
      .finally(() => {
        if (!ignore) {
          setIsActivitiesLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [currentPage, activityFilter, searchQuery, selectedPeriod, refreshIndex]);

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

  // CSV Exporter
  const exportCSV = () => {
    setShowExportDropdown(false);
    triggerToast('Generating CSV report download...');

    let csvContent = 'data:text/csv;charset=utf-8,';
    const filename = `SuperGas_${activeTab.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;

    if (activeTab === 'Customer Reports' && reportsData?.customerReports?.customersList) {
      csvContent += 'Customer Code,Name,Business,Type,Invoiced,Paid,Outstanding,Credit Limit,Deposits,Holding Cylinders\n';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      reportsData.customerReports.customersList.forEach((c: any) => {
        csvContent += `"${c.customerCode}","${c.name}","${c.businessName}","${c.type}",${c.totalInvoiced},${c.totalPaid},${c.outstandingBalance},${c.creditLimit},${c.securityDeposit},${c.holdingCylinders}\n`;
      });
    } else if (activeTab === 'Delivery Reports' && reportsData?.deliveryReports?.recentDeliveries) {
      csvContent += 'Date,Customer Code,Customer Name,Cylinder Type,Quantity,Empties Collected,Amount,Payment Method,Payment Status,Status\n';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      reportsData.deliveryReports.recentDeliveries.forEach((d: any) => {
        csvContent += `"${d.date}","${d.customerCode}","${d.customerName}","${d.cylinderType}",${d.quantity},${d.emptyCollected},${d.amount},"${d.paymentMethod}","${d.paymentStatus}","${d.status}"\n`;
      });
    } else if (activeTab === 'Delivery Partner Reports' && reportsData?.partnerReports?.partnerPerformance) {
      csvContent += 'Partner Code,Name,Phone,Vehicle,Depot,Deliveries,Cash Expected,Cash Handed Over,Shortage,Status\n';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      reportsData.partnerReports.partnerPerformance.forEach((p: any) => {
        csvContent += `"${p.partnerCode}","${p.name}","${p.phone}","${p.assignedVehicle}","${p.depotName}",${p.deliveriesCompleted},${p.cashExpected},${p.cashHandedOver},${p.shortage},"${p.handoverStatus}"\n`;
      });
    } else {
      csvContent += 'Metric,Value\n';
      csvContent += `Total Customers,${reportMetrics.customers}\n`;
      csvContent += `Completed Deliveries,${reportMetrics.deliveries}\n`;
      csvContent += `Total Revenue,${reportMetrics.revenue}\n`;
      csvContent += `Total Receivables,${reportMetrics.receivables}\n`;
      csvContent += `Approved OpEx,${reportMetrics.expenses}\n\n`;
      if (activitiesState.items.length > 0) {
        csvContent += 'Date,Activity Type,Reference,Entity,Amount/Volume,Status\n';
        activitiesState.items.forEach((act) => {
          csvContent += `"${act.dateTime}","${act.activityLabel}","${act.referenceId}","${act.entityName}","${act.amountVolume}","${act.status}"\n`;
        });
      }
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Report CSV downloaded successfully!');
  };

  const exportPDF = () => {
    setShowExportDropdown(false);
    triggerToast('Opening print dialog for executive PDF summary...');
    window.print();
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
    setIsActivitiesLoading(true);
  };

  const handleFilterChange = (val: string, label: string) => {
    setActivityFilter(val);
    setCurrentPage(1);
    setIsActivitiesLoading(true);
    setShowFilterMenu(false);
    triggerToast(`Filtered by ${label}`);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setIsActivitiesLoading(true);
  };

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
            <span className="w-2 h-2 rounded-full bg-red-600 inline-block animate-pulse" />
            <span className="text-[11px] font-bold text-slate-400">Super Gas Analytics &amp; Reporting Hub</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setIsLoading(true);
                setRefreshIndex((prev) => prev + 1);
              }}
              title="Refresh Data"
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-red-600' : ''}`} />
            </button>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Agency: Operational
            </span>

            <button
              type="button"
              onClick={() => triggerToast('No new alert notifications')}
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
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Reports &amp; Intelligence</h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-black tracking-wide">
                  <ShieldAlert className="w-3 h-3 text-rose-600" />
                  Admin Console
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Monitor branch performance, customer receivables, deliveries, invoices, inventory, and OpEx audits.
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
                      'Today',
                      'Last 7 Days',
                      'This Month (Nov 2026)',
                      'Previous Month (Oct 2026)',
                      'Q4 2026 Comprehensive',
                    ].map((period) => (
                      <div
                        key={period}
                        onClick={() => {
                          setIsLoading(true);
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
                  className="bg-[#BC0118] hover:bg-red-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Report</span>
                  <ChevronDown className="w-3 h-3 text-red-200" />
                </button>

                {showExportDropdown && (
                  <div className="absolute top-full right-0 mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-xl z-30 py-1 text-xs font-bold text-slate-700">
                    <button
                      type="button"
                      onClick={exportPDF}
                      className="w-full text-left px-4 py-2 hover:bg-[#F1F4FA] cursor-pointer flex items-center gap-2"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>Print / PDF Executive Report</span>
                    </button>
                    <button
                      type="button"
                      onClick={exportCSV}
                      className="w-full text-left px-4 py-2 hover:bg-[#F1F4FA] cursor-pointer flex items-center gap-2"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-500" />
                      <span>Export Raw CSV Dataset</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tab Navigation Strip (7 Dedicated Tabs) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200/80">
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
                  className={`text-xs whitespace-nowrap transition cursor-pointer px-4 py-2.5 rounded-xl font-bold flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#BC0118] text-white shadow-xs'
                      : tab.highlightRed
                      ? 'text-[#BC0118] hover:bg-rose-50/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {tab.id === 'Overall Branch Report' && <TrendingUp className="w-3.5 h-3.5" />}
                  {tab.id === 'Customer Reports' && <Users className="w-3.5 h-3.5" />}
                  {tab.id === 'Delivery Reports' && <Truck className="w-3.5 h-3.5" />}
                  {tab.id === 'Invoice & Payment Reports' && <FileText className="w-3.5 h-3.5" />}
                  {tab.id === 'Inventory Reports' && <PackageCheck className="w-3.5 h-3.5" />}
                  {tab.id === 'Delivery Partner Reports' && <Wallet className="w-3.5 h-3.5" />}
                  {tab.id === 'Expenses Reports' && <Receipt className="w-3.5 h-3.5" />}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* ============================================================== */}
          {/* TAB 1: OVERALL BRANCH REPORT                                    */}
          {/* ============================================================== */}
          {activeTab === 'Overall Branch Report' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Top 6 KPI Metric Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">TOTAL CUSTOMERS</span>
                    <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="mt-2.5">
                    <p className="text-2xl font-black text-slate-900 tracking-tight">{reportMetrics.customers.toLocaleString('en-IN')}</p>
                    <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5 mt-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>Active accounts</span>
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">TOTAL DELIVERIES</span>
                    <div className="w-6 h-6 rounded-lg bg-rose-50 text-[#BC0118] flex items-center justify-center">
                      <Truck className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="mt-2.5">
                    <p className="text-2xl font-black text-slate-900 tracking-tight">{reportMetrics.deliveries.toLocaleString('en-IN')}</p>
                    <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{reportsData?.overall?.metrics?.fulfillmentRate || 98}% fulfillment</span>
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">TOTAL INVOICES</span>
                    <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="mt-2.5">
                    <p className="text-2xl font-black text-slate-900 tracking-tight">{reportMetrics.invoices.toLocaleString('en-IN')}</p>
                    <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      <span>Tax invoices generated</span>
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">AMOUNT COLLECTED</span>
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Banknote className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="mt-2.5">
                    <p className="text-2xl font-black text-slate-900 tracking-tight">₹{reportMetrics.revenue.toLocaleString('en-IN')}</p>
                    <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Realized revenue</span>
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">RECEIVABLES</span>
                    <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                      <AlertCircle className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="mt-2.5">
                    <p className="text-2xl font-black text-slate-900 tracking-tight">₹{reportMetrics.receivables.toLocaleString('en-IN')}</p>
                    <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>Balance due</span>
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">APPROVED OPEX</span>
                    <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                      <CreditCard className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="mt-2.5">
                    <p className="text-2xl font-black text-slate-900 tracking-tight">₹{reportMetrics.expenses.toLocaleString('en-IN')}</p>
                    <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      <span>Operating claims</span>
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
                          Fulfillment volume across branches ({selectedPeriod})
                        </p>
                      </div>
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

                    <div className="mt-5 relative h-48 w-full">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 500 170" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="deliveryAreaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#BC0118" stopOpacity="0.18" />
                            <stop offset="100%" stopColor="#BC0118" stopOpacity="0.01" />
                          </linearGradient>
                        </defs>
                        <line x1="20" y1="20" x2="490" y2="20" stroke="#F1F5F9" strokeDasharray="3 3" />
                        <line x1="20" y1="55" x2="490" y2="55" stroke="#F1F5F9" strokeDasharray="3 3" />
                        <line x1="20" y1="90" x2="490" y2="90" stroke="#F1F5F9" strokeDasharray="3 3" />
                        <line x1="20" y1="125" x2="490" y2="125" stroke="#F1F5F9" strokeDasharray="3 3" />
                        <line x1="20" y1="150" x2="490" y2="150" stroke="#E2E8F0" />
                        <text x="5" y="24" fill="#94A3B8" fontSize="8" fontWeight="bold">20</text>
                        <text x="5" y="59" fill="#94A3B8" fontSize="8" fontWeight="bold">15</text>
                        <text x="5" y="94" fill="#94A3B8" fontSize="8" fontWeight="bold">10</text>
                        <text x="5" y="129" fill="#94A3B8" fontSize="8" fontWeight="bold">5</text>
                        <text x="5" y="153" fill="#94A3B8" fontSize="8" fontWeight="bold">0</text>
                        <path
                          d="M 20 120 Q 55 125 75 110 T 130 95 T 185 105 T 240 75 T 295 85 T 350 55 T 410 40 L 460 55 L 460 150 L 20 150 Z"
                          fill="url(#deliveryAreaGrad)"
                        />
                        <path
                          d="M 20 120 Q 55 125 75 110 T 130 95 T 185 105 T 240 75 T 295 85 T 350 55 T 410 40 L 460 55"
                          fill="none"
                          stroke="#BC0118"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                        <circle cx="410" cy="40" r="4" fill="#BC0118" stroke="#FFFFFF" strokeWidth="2" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <p className="text-slate-600">
                      Empty Return Rate: <strong className="text-slate-900 font-extrabold">{reportsData?.overall?.metrics?.emptyCollectionRate || 92}%</strong>
                    </p>
                    <p className="text-emerald-600 font-extrabold">
                      Fulfillment Rate: {reportsData?.overall?.metrics?.fulfillmentRate || 98}%
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
                          Invoiced revenue vs realized bank/cash receipts
                        </p>
                      </div>
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

                    <div className="mt-5 relative h-48 w-full">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 500 170" preserveAspectRatio="none">
                        <line x1="25" y1="20" x2="490" y2="20" stroke="#F1F5F9" strokeDasharray="3 3" />
                        <line x1="25" y1="55" x2="490" y2="55" stroke="#F1F5F9" strokeDasharray="3 3" />
                        <line x1="25" y1="90" x2="490" y2="90" stroke="#F1F5F9" strokeDasharray="3 3" />
                        <line x1="25" y1="125" x2="490" y2="125" stroke="#F1F5F9" strokeDasharray="3 3" />
                        <line x1="25" y1="150" x2="490" y2="150" stroke="#E2E8F0" />
                        <path
                          d="M 30 115 Q 100 80 150 90 T 260 55 T 370 45 L 450 35"
                          fill="none"
                          stroke="#1E293B"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M 30 125 Q 100 100 150 105 T 260 65 T 370 55 L 450 45"
                          fill="none"
                          stroke="#BC0118"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                        />
                        <circle cx="450" cy="35" r="3.5" fill="#1E293B" stroke="#FFFFFF" strokeWidth="1.5" />
                        <circle cx="450" cy="45" r="3.5" fill="#BC0118" stroke="#FFFFFF" strokeWidth="1.5" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <p className="text-slate-600">
                      Realized: <strong className="text-slate-900 font-extrabold">₹{reportMetrics.revenue.toLocaleString('en-IN')}</strong>
                    </p>
                    <p className="text-[#BC0118] font-extrabold">
                      Receivables: ₹{reportMetrics.receivables.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recent Branch Operational Activity Table */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-black text-slate-900">Recent Branch Operational Activity</h3>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      Latest real-time transactions across logistics, billing, and settlements
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 relative">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Filter ledger records..."
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
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
                              onClick={() => handleFilterChange(f.val, f.label)}
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
                      {isActivitiesLoading ? (
                        <tr>
                          <td colSpan={6} className="py-10 text-center text-slate-400 font-medium">
                            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#BC0118]" />
                            <span>Loading live operational transactions from database...</span>
                          </td>
                        </tr>
                      ) : activitiesState.items.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-10 text-center text-slate-400 font-medium">
                            No operational transactions found for the selected filter or search criteria.
                          </td>
                        </tr>
                      ) : (
                        activitiesState.items.map((act: OperationalActivity) => (
                          <tr
                            key={act.id}
                            onClick={() => triggerToast(`Transaction ${act.referenceId}`)}
                            className="hover:bg-slate-50/80 transition cursor-pointer"
                          >
                            <td className="py-4 px-6 text-slate-700 font-bold whitespace-nowrap">{act.dateTime}</td>
                            <td className="py-4 px-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-black border ${
                                  act.activityType === 'delivery'
                                    ? 'bg-rose-50 border-rose-200/60 text-[#BC0118]'
                                    : act.activityType === 'payment'
                                    ? 'bg-emerald-50 border-emerald-200/60 text-emerald-700'
                                    : act.activityType === 'invoice'
                                    ? 'bg-blue-50 border-blue-200/60 text-blue-700'
                                    : act.activityType === 'expense'
                                    ? 'bg-amber-50 border-amber-200/60 text-amber-700'
                                    : 'bg-purple-50 border-purple-200/60 text-purple-700'
                                }`}
                              >
                                {act.activityType === 'delivery' && <Truck className="w-3.5 h-3.5" />}
                                {act.activityType === 'payment' && <Wallet className="w-3.5 h-3.5" />}
                                {act.activityType === 'invoice' && <Receipt className="w-3.5 h-3.5" />}
                                {act.activityType === 'expense' && <CreditCard className="w-3.5 h-3.5" />}
                                {act.activityType === 'handover' && <Banknote className="w-3.5 h-3.5" />}
                                <span>{act.activityLabel}</span>
                              </span>
                            </td>
                            <td className="py-4 px-4 font-mono text-xs text-slate-600 whitespace-nowrap font-bold">
                              {act.referenceId}
                            </td>
                            <td className="py-4 px-4">
                              <p className="font-extrabold text-slate-900 text-xs">{act.entityName}</p>
                              <p className="text-[11px] text-slate-400 font-medium mt-0.5">{act.entitySubtitle}</p>
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap">
                              <span
                                className={`text-xs font-black ${
                                  act.amountGreen
                                    ? 'text-emerald-700'
                                    : act.amountHighlight
                                    ? 'text-rose-600'
                                    : 'text-slate-800'
                                }`}
                              >
                                {act.amountVolume}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right whitespace-nowrap">
                              <span
                                className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                                  act.statusType === 'completed' ||
                                  act.statusType === 'approved' ||
                                  act.statusType === 'verified'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : act.statusType === 'partial'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                                }`}
                              >
                                {act.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Strip with Live Database Page Selection */}
                <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 font-semibold bg-white">
                  <p>
                    {activitiesState.totalCount === 0
                      ? 'Showing 0 of 0 daily operational records'
                      : `Showing ${(activitiesState.page - 1) * activitiesState.limit + 1} to ${Math.min(
                          activitiesState.page * activitiesState.limit,
                          activitiesState.totalCount
                        )} of ${activitiesState.totalCount} daily operational records`}
                  </p>

                  <div className="flex items-center gap-1 font-bold">
                    <button
                      type="button"
                      disabled={currentPage <= 1 || isActivitiesLoading}
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 transition cursor-pointer text-xs"
                      title="Previous Page"
                    >
                      &lt;
                    </button>

                    {generatePaginationPages(currentPage, activitiesState.totalPages).map((p, idx) =>
                      p === '...' ? (
                        <span key={`dots-${idx}`} className="px-1 text-slate-400 select-none">
                          ...
                        </span>
                      ) : (
                        <button
                          key={`page-${p}`}
                          type="button"
                          disabled={isActivitiesLoading}
                          onClick={() => handlePageChange(Number(p))}
                          className={`w-7 h-7 rounded-lg text-xs font-black transition cursor-pointer ${
                            currentPage === Number(p)
                              ? 'bg-[#BC0118] text-white shadow-2xs'
                              : 'hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}

                    <button
                      type="button"
                      disabled={currentPage >= activitiesState.totalPages || isActivitiesLoading}
                      onClick={() => handlePageChange(Math.min(activitiesState.totalPages, currentPage + 1))}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 transition cursor-pointer text-xs"
                      title="Next Page"
                    >
                      &gt;
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: CUSTOMER REPORTS                                         */}
          {/* ============================================================== */}
          {activeTab === 'Customer Reports' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Customer Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">TOTAL CUSTOMER ACCOUNTS</span>
                  <div className="text-2xl font-black text-slate-900 mt-2">{reportsData?.customerReports?.metrics?.totalCustomers || reportMetrics.customers}</div>
                  <p className="text-xs text-slate-500 mt-1">
                    {reportsData?.customerReports?.metrics?.commercialCount || 0} Commercial • {reportsData?.customerReports?.metrics?.domesticCount || 0} Domestic
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">OUTSTANDING RECEIVABLES</span>
                  <div className="text-2xl font-black text-rose-600 mt-2">
                    ₹{(reportsData?.customerReports?.metrics?.totalReceivables || reportMetrics.receivables).toLocaleString('en-IN')}
                  </div>
                  <p className="text-xs text-rose-500 font-bold mt-1">Pending payments across accounts</p>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CYLINDER SECURITY DEPOSITS</span>
                  <div className="text-2xl font-black text-emerald-700 mt-2">
                    ₹{(reportsData?.customerReports?.metrics?.totalSecurityDeposits || 185000).toLocaleString('en-IN')}
                  </div>
                  <p className="text-xs text-emerald-600 font-bold mt-1">Refundable holding deposits</p>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CREDIT LIMIT COMPLIANCE</span>
                  <div className="text-2xl font-black text-slate-900 mt-2">
                    {reportsData?.customerReports?.topOverdueCustomers?.length || 0} Alert
                  </div>
                  <p className="text-xs text-amber-600 font-bold mt-1">Accounts requiring payment follow-up</p>
                </div>
              </div>

              {/* Customer Financial Ledger & Deposit Directory Table */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-black text-slate-900">Customer Financial &amp; Cylinder Holding Directory</h3>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      Aging balance, credit terms, security deposits, and cylinder possession by client
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
                    {reportsData?.customerReports?.customersList?.length || 0} Registered Clients
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                        <th className="py-3.5 px-6">CUSTOMER / IDENTITY</th>
                        <th className="py-3.5 px-4">TYPE</th>
                        <th className="py-3.5 px-4 text-right">TOTAL INVOICED</th>
                        <th className="py-3.5 px-4 text-right">TOTAL PAID</th>
                        <th className="py-3.5 px-4 text-right">BALANCE DUE</th>
                        <th className="py-3.5 px-4 text-center">AGING STATUS</th>
                        <th className="py-3.5 px-4 text-center">CYLINDER HOLDING</th>
                        <th className="py-3.5 px-6 text-right">CREDIT LIMIT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {(reportsData?.customerReports?.customersList || []).map((c: any) => (
                        <tr key={c.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-4 px-6">
                            <p className="font-extrabold text-slate-900 text-xs">{c.name}</p>
                            <p className="text-[11px] text-slate-400 font-mono mt-0.5">{c.customerCode} • {c.phone}</p>
                          </td>
                          <td className="py-4 px-4">
                            <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                              {c.type}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right font-black text-slate-900">
                            ₹{c.totalInvoiced.toLocaleString('en-IN')}
                          </td>
                          <td className="py-4 px-4 text-right font-black text-emerald-700">
                            ₹{c.totalPaid.toLocaleString('en-IN')}
                          </td>
                          <td className="py-4 px-4 text-right font-black text-rose-600">
                            ₹{c.outstandingBalance.toLocaleString('en-IN')}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                c.outstandingBalance === 0
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : c.isOverCreditLimit
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200 font-black'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {c.agingCategory}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-lg text-xs">
                              <PackageCheck className="w-3.5 h-3.5 text-blue-600" />
                              <span>{c.holdingCylinders} Cylinders</span>
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right font-mono text-slate-700 font-bold">
                            ₹{c.creditLimit.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: DELIVERY REPORTS                                         */}
          {/* ============================================================== */}
          {activeTab === 'Delivery Reports' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">FULFILLMENT RATE</span>
                  <div className="text-2xl font-black text-emerald-700 mt-2">
                    {reportsData?.deliveryReports?.metrics?.fulfillmentRate || 98}%
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {reportsData?.deliveryReports?.metrics?.completedDeliveries || reportMetrics.deliveries} completed on time
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">EMPTY CYLINDER COLLECTION RATE</span>
                  <div className="text-2xl font-black text-blue-700 mt-2">
                    {reportsData?.deliveryReports?.metrics?.emptyCollectionRate || 92}%
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Custody return reconciliation</p>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">TOTAL FILLED DELIVERED</span>
                  <div className="text-2xl font-black text-slate-900 mt-2">
                    {(reportsData?.deliveryReports?.metrics?.totalFilledDelivered || 846).toLocaleString('en-IN')}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Commercial &amp; domestic units</p>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">TOTAL EMPTIES RECOVERED</span>
                  <div className="text-2xl font-black text-slate-900 mt-2">
                    {(reportsData?.deliveryReports?.metrics?.totalEmptyCollected || 780).toLocaleString('en-IN')}
                  </div>
                  <p className="text-xs text-emerald-600 font-bold mt-1">Safely back in depot custody</p>
                </div>
              </div>

              {/* Delivery Register Table */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900">Delivery Trips &amp; Fulfillment Register</h3>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      Completed van drops, empty return counts, and payment methods
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                        <th className="py-3.5 px-6">DATE</th>
                        <th className="py-3.5 px-4">CUSTOMER</th>
                        <th className="py-3.5 px-4">CYLINDER SPEC</th>
                        <th className="py-3.5 px-4 text-center">FILLED QTY</th>
                        <th className="py-3.5 px-4 text-center">EMPTIES RETURNED</th>
                        <th className="py-3.5 px-4 text-right">AMOUNT</th>
                        <th className="py-3.5 px-4">PAYMENT METHOD</th>
                        <th className="py-3.5 px-6 text-right">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {(reportsData?.deliveryReports?.recentDeliveries || []).map((d: any) => (
                        <tr key={d.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-4 px-6 text-slate-700 font-bold">{d.date}</td>
                          <td className="py-4 px-4">
                            <p className="font-extrabold text-slate-900 text-xs">{d.customerName}</p>
                            <p className="text-[11px] text-slate-400 font-mono mt-0.5">{d.customerCode}</p>
                          </td>
                          <td className="py-4 px-4 font-bold text-slate-800">{d.cylinderType}</td>
                          <td className="py-4 px-4 text-center font-black text-slate-900">{d.quantity}</td>
                          <td className="py-4 px-4 text-center font-black text-emerald-700">{d.emptyCollected}</td>
                          <td className="py-4 px-4 text-right font-black text-slate-900">₹{d.amount.toLocaleString('en-IN')}</td>
                          <td className="py-4 px-4 font-bold text-slate-700">
                            <span className="inline-block px-2 py-0.5 bg-slate-100 rounded text-[10px]">
                              {d.paymentMethod}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {d.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 4: INVOICE & PAYMENT REPORTS                                */}
          {/* ============================================================== */}
          {activeTab === 'Invoice & Payment Reports' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">GROSS INVOICED</span>
                  <div className="text-2xl font-black text-slate-900 mt-2">
                    ₹{(reportsData?.invoiceReports?.metrics?.totalInvoicedAmount || 1333250).toLocaleString('en-IN')}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Total billing volume generated</p>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">REALIZED COLLECTIONS</span>
                  <div className="text-2xl font-black text-emerald-700 mt-2">
                    ₹{(reportsData?.invoiceReports?.metrics?.totalPaidAmount || reportMetrics.revenue).toLocaleString('en-IN')}
                  </div>
                  <p className="text-xs text-emerald-600 font-bold mt-1">Cash, UPI &amp; Bank collections</p>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">PENDING RECEIVABLES</span>
                  <div className="text-2xl font-black text-rose-600 mt-2">
                    ₹{(reportsData?.invoiceReports?.metrics?.totalBalanceDue || reportMetrics.receivables).toLocaleString('en-IN')}
                  </div>
                  <p className="text-xs text-rose-500 font-bold mt-1">Unpaid invoice ledger balance</p>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ESTIMATED GST COLLECTED</span>
                  <div className="text-2xl font-black text-indigo-700 mt-2">
                    ₹{(reportsData?.invoiceReports?.metrics?.totalGstEstimate || 185000).toLocaleString('en-IN')}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">18% Commercial / 5% Domestic GST</p>
                </div>
              </div>

              {/* Payment Split & Aging Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs">
                  <h3 className="text-sm font-black text-slate-900 mb-4">Payment Channel Realization</h3>
                  <div className="space-y-3 text-xs font-semibold">
                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                      <span className="flex items-center gap-2 text-slate-700">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#BC0118]" />
                        Cash Handover at Depot
                      </span>
                      <span className="font-black text-slate-900">
                        ₹{(reportsData?.invoiceReports?.paymentSplit?.cash || 712000).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                      <span className="flex items-center gap-2 text-slate-700">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-900" />
                        Instant UPI / BharatQR
                      </span>
                      <span className="font-black text-slate-900">
                        ₹{(reportsData?.invoiceReports?.paymentSplit?.upi || 344250).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                      <span className="flex items-center gap-2 text-slate-700">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                        Direct Bank NEFT / RTGS
                      </span>
                      <span className="font-black text-slate-900">
                        ₹{(reportsData?.invoiceReports?.paymentSplit?.bank || 92000).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs">
                  <h3 className="text-sm font-black text-slate-900 mb-4">Receivables Aging Brackets</h3>
                  <div className="space-y-3 text-xs font-semibold">
                    <div className="flex justify-between items-center bg-emerald-50/60 p-3 rounded-xl">
                      <span className="text-emerald-900 font-bold">Current (0 - 15 Days)</span>
                      <span className="font-black text-emerald-800">
                        ₹{(reportsData?.invoiceReports?.agingSummary?.current0to15 || 85000).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-amber-50/60 p-3 rounded-xl">
                      <span className="text-amber-900 font-bold">16 - 30 Days Due</span>
                      <span className="font-black text-amber-800">
                        ₹{(reportsData?.invoiceReports?.agingSummary?.days16to30 || 45000).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-rose-50/60 p-3 rounded-xl">
                      <span className="text-rose-900 font-bold">31 - 60 Days Overdue</span>
                      <span className="font-black text-rose-800">
                        ₹{(reportsData?.invoiceReports?.agingSummary?.days31to60 || 18000).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-red-100/60 p-3 rounded-xl">
                      <span className="text-red-900 font-black">60+ Days Severely Overdue</span>
                      <span className="font-black text-red-900">
                        ₹{(reportsData?.invoiceReports?.agingSummary?.days60Plus || 7500).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 5: INVENTORY REPORTS                                        */}
          {/* ============================================================== */}
          {activeTab === 'Inventory Reports' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">DEPOT FILLED STOCK</span>
                  <div className="text-2xl font-black text-emerald-700 mt-2">
                    {(reportsData?.inventoryReports?.metrics?.totalDepotFilled || 744).toLocaleString('en-IN')}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Ready for immediate delivery</p>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">DEPOT EMPTY STOCK</span>
                  <div className="text-2xl font-black text-slate-800 mt-2">
                    {(reportsData?.inventoryReports?.metrics?.totalDepotEmpty || 352).toLocaleString('en-IN')}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Ready for refinery refill turnaround</p>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">DAMAGED / UNDER INSPECTION</span>
                  <div className="text-2xl font-black text-rose-600 mt-2">
                    {(reportsData?.inventoryReports?.metrics?.totalDepotDamaged || 23).toLocaleString('en-IN')}
                  </div>
                  <p className="text-xs text-rose-500 font-bold mt-1">Quarantined safety stock</p>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ASSETS IN CIRCULATION</span>
                  <div className="text-2xl font-black text-indigo-700 mt-2">
                    {(reportsData?.inventoryReports?.metrics?.totalCylindersInCirculation || 1965).toLocaleString('en-IN')}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Depot, vans &amp; customer custody</p>
                </div>
              </div>

              {/* Cylinder Variant Stock Matrix */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="text-base font-black text-slate-900">Cylinder Stock Matrix by Product Specification</h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Filled units, empty returns, quarantined inspection stock, and safety reorder thresholds
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                        <th className="py-3.5 px-6">CYLINDER SPECIFICATION</th>
                        <th className="py-3.5 px-4 text-center">FILLED AVAILABLE</th>
                        <th className="py-3.5 px-4 text-center">EMPTY STOCK</th>
                        <th className="py-3.5 px-4 text-center">DAMAGED / QUARANTINE</th>
                        <th className="py-3.5 px-4 text-center">REORDER THRESHOLD</th>
                        <th className="py-3.5 px-6 text-right">INVENTORY HEALTH</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold">
                      {Object.entries(
                        reportsData?.inventoryReports?.inventoryBySpec || {
                          '14.2kg': { label: '14.2 KG Domestic', filled: 420, empty: 180, damaged: 12, reorderLevel: 100 },
                          '19kg': { label: '19 KG Commercial', filled: 260, empty: 140, damaged: 8, reorderLevel: 80 },
                          '32.5kg': { label: '32.5 KG Industrial', filled: 48, empty: 24, damaged: 2, reorderLevel: 25 },
                          '47.5kg': { label: '47.5 KG Heavy Duty', filled: 16, empty: 8, damaged: 1, reorderLevel: 15 },
                        }
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      ).map(([key, item]: [string, any]) => (
                        <tr key={key} className="hover:bg-slate-50/80 transition">
                          <td className="py-4 px-6 font-extrabold text-slate-900 text-xs flex items-center gap-2">
                            <PackageCheck className="w-4 h-4 text-[#BC0118]" />
                            <span>{item.label}</span>
                          </td>
                          <td className="py-4 px-4 text-center font-black text-emerald-700 text-sm">
                            {item.filled}
                          </td>
                          <td className="py-4 px-4 text-center font-black text-slate-700 text-sm">
                            {item.empty}
                          </td>
                          <td className="py-4 px-4 text-center font-black text-rose-600 text-sm">
                            {item.damaged}
                          </td>
                          <td className="py-4 px-4 text-center font-mono font-bold text-slate-600">
                            {item.reorderLevel} units
                          </td>
                          <td className="py-4 px-6 text-right">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                item.filled > item.reorderLevel
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200 font-black'
                              }`}
                            >
                              {item.filled > item.reorderLevel ? 'Adequate Supply' : 'Reorder Needed'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 6: DELIVERY PARTNER REPORTS                                 */}
          {/* ============================================================== */}
          {activeTab === 'Delivery Partner Reports' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ACTIVE DRIVER FLEET</span>
                  <div className="text-2xl font-black text-slate-900 mt-2">
                    {reportsData?.partnerReports?.metrics?.activePartners || 4} / {reportsData?.partnerReports?.metrics?.totalPartners || 6}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">On-duty delivery partners</p>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">HANDOVERS VERIFIED</span>
                  <div className="text-2xl font-black text-emerald-700 mt-2">
                    {reportsData?.partnerReports?.metrics?.totalHandoversVerified || 4}
                  </div>
                  <p className="text-xs text-emerald-600 font-bold mt-1">Reconciled depot settlements</p>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CASH SHORTAGE DISCREPANCIES</span>
                  <div className="text-2xl font-black text-rose-600 mt-2">
                    {reportsData?.partnerReports?.metrics?.discrepanciesFlagged || 1} Flagged
                  </div>
                  <p className="text-xs text-rose-500 font-bold mt-1">Pending driver audit resolution</p>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">TODAY&apos;S CASH COLLECTED</span>
                  <div className="text-2xl font-black text-slate-900 mt-2">
                    ₹{(reportMetrics.revenue).toLocaleString('en-IN')}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Driver mobile counter receipts</p>
                </div>
              </div>

              {/* Delivery Partner Audit Table */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="text-base font-black text-slate-900">Delivery Partner Performance &amp; Cash Reconciliation Audit</h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Completed trips, expected counter cash, handed over amounts, and shortage discrepancies
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                        <th className="py-3.5 px-6">PARTNER / CODE</th>
                        <th className="py-3.5 px-4">ASSIGNED VEHICLE &amp; HUB</th>
                        <th className="py-3.5 px-4 text-center">DELIVERIES</th>
                        <th className="py-3.5 px-4 text-right">CASH EXPECTED</th>
                        <th className="py-3.5 px-4 text-right">CASH HANDED OVER</th>
                        <th className="py-3.5 px-4 text-right">SHORTAGE</th>
                        <th className="py-3.5 px-6 text-right">HANDOVER STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {(reportsData?.partnerReports?.partnerPerformance || []).map((p: any) => (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-4 px-6">
                            <p className="font-extrabold text-slate-900 text-xs">{p.name}</p>
                            <p className="text-[11px] text-[#BC0118] font-bold font-mono mt-0.5">{p.partnerCode} • {p.phone}</p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-bold text-slate-800 text-xs">{p.assignedVehicle}</p>
                            <p className="text-[11px] text-slate-400 font-medium mt-0.5">{p.depotName}</p>
                          </td>
                          <td className="py-4 px-4 text-center font-black text-slate-900 text-sm">
                            {p.deliveriesCompleted}
                          </td>
                          <td className="py-4 px-4 text-right font-black text-slate-900">
                            ₹{p.cashExpected.toLocaleString('en-IN')}
                          </td>
                          <td className="py-4 px-4 text-right font-black text-emerald-700">
                            ₹{p.cashHandedOver.toLocaleString('en-IN')}
                          </td>
                          <td className="py-4 px-4 text-right font-black">
                            {p.shortage > 0 ? (
                              <span className="text-rose-600 font-extrabold">₹{p.shortage.toLocaleString('en-IN')}</span>
                            ) : (
                              <span className="text-slate-400 font-bold">₹0</span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                p.shortage > 0
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200 font-black'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {p.shortage > 0 ? 'Discrepancy Flagged' : 'Verified & Reconciled'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 7: EXPENSES REPORTS                                         */}
          {/* ============================================================== */}
          {activeTab === 'Expenses Reports' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">APPROVED OPEX</span>
                  <div className="text-2xl font-black text-slate-900 mt-2">
                    ₹{(reportsData?.expensesReports?.metrics?.totalApproved || reportMetrics.expenses).toLocaleString('en-IN')}
                  </div>
                  <p className="text-xs text-emerald-600 font-bold mt-1">Verified depot operating costs</p>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">PENDING REVIEW</span>
                  <div className="text-2xl font-black text-amber-700 mt-2">
                    ₹{(reportsData?.expensesReports?.metrics?.totalPending || 3200).toLocaleString('en-IN')}
                  </div>
                  <p className="text-xs text-amber-600 font-bold mt-1">Awaiting management approval</p>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">REJECTED CLAIMS</span>
                  <div className="text-2xl font-black text-rose-600 mt-2">
                    ₹{(reportsData?.expensesReports?.metrics?.totalRejected || 1500).toLocaleString('en-IN')}
                  </div>
                  <p className="text-xs text-rose-500 font-bold mt-1">Disallowed claims</p>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">TOTAL CLAIMS AUDITED</span>
                  <div className="text-2xl font-black text-indigo-700 mt-2">
                    {reportsData?.expensesReports?.metrics?.totalClaims || 47}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Fuel, maintenance, allowance</p>
                </div>
              </div>

              {/* OpEx Claims Audit Register */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="text-base font-black text-slate-900">Operating Expenses (OpEx) Claims Audit Register</h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Fuel slips, maintenance reimbursements, and driver allowance vouchers
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                        <th className="py-3.5 px-6">CLAIM #</th>
                        <th className="py-3.5 px-4">DATE</th>
                        <th className="py-3.5 px-4">PARTNER &amp; VEHICLE</th>
                        <th className="py-3.5 px-4">CATEGORY</th>
                        <th className="py-3.5 px-4 text-right">CLAIM AMOUNT</th>
                        <th className="py-3.5 px-6 text-right">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold">
                      {(reportsData?.expensesReports?.claims?.length
                        ? reportsData.expensesReports.claims
                        : [
                            { id: '1', claimNumber: 'EXP-20261024-001', date: '24 Oct', partnerName: 'Rajesh Kumar', vehicleReg: 'Van 04 (TN 58 AX 4821)', category: 'Fuel / Diesel', amount: 1200, status: 'APPROVED' },
                            { id: '2', claimNumber: 'EXP-20261024-002', date: '24 Oct', partnerName: 'Suresh Babu', vehicleReg: 'Van 03 (TN 58 AX 4822)', category: 'Driver Allowance', amount: 350, status: 'APPROVED' },
                            { id: '3', claimNumber: 'EXP-20261023-009', date: '23 Oct', partnerName: 'M. Selvam', vehicleReg: 'Van 01 (TN 58 AX 4819)', category: 'Vehicle Repair', amount: 1850, status: 'APPROVED' },
                            { id: '4', claimNumber: 'EXP-20261022-014', date: '22 Oct', partnerName: 'K. Vignesh', vehicleReg: 'Van 02 (TN 58 AX 4820)', category: 'Toll Charges', amount: 480, status: 'APPROVED' },
                          ]
                      ).map((exp: { id: string; claimNumber: string; date: string; partnerName: string; vehicleReg: string; category: string; amount: number; status: string }) => (
                        <tr key={exp.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-4 px-6 font-mono font-bold text-slate-700">{exp.claimNumber}</td>
                          <td className="py-4 px-4 text-slate-600 font-bold">{exp.date}</td>
                          <td className="py-4 px-4">
                            <p className="font-extrabold text-slate-900 text-xs">{exp.partnerName}</p>
                            <p className="text-[11px] text-slate-400 font-medium mt-0.5">{exp.vehicleReg}</p>
                          </td>
                          <td className="py-4 px-4 font-bold text-slate-800">{exp.category}</td>
                          <td className="py-4 px-4 text-right font-black text-slate-900">₹{exp.amount.toLocaleString('en-IN')}</td>
                          <td className="py-4 px-6 text-right">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                exp.status === 'APPROVED'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : exp.status === 'PENDING'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {exp.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
