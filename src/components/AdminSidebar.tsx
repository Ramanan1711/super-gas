'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  Users,
  Archive,
  Truck,
  ReceiptText,
  CheckSquare,
  FileText,
  BarChart3,
  Settings,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface AdminSidebarProps {
  activeItem?: string;
  onNavigate?: (item: string) => void;
  className?: string;
  collapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
}

export default function AdminSidebar({
  activeItem: propActiveItem,
  onNavigate,
  className = '',
  collapsed: propCollapsed,
  onToggleCollapse,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [internalActive, setInternalActive] = useState<string | null>(null);
  const [internalCollapsed, setInternalCollapsed] = useState(false);

  // Automatically derive active navigation item directly from the URL pathname
  const active = useMemo(() => {
    if (pathname) {
      if (pathname.startsWith('/admin/customers') || pathname.startsWith('/admin/customer')) {
        return 'Customers';
      }
      if (pathname === '/admin' || pathname === '/admin/') {
        return 'Dashboard';
      }
      if (pathname.startsWith('/admin/inventory')) {
        return 'Inventory';
      }
      if (
        pathname.startsWith('/admin/delivery-partners') ||
        pathname.startsWith('/admin/delivery-partner')
      ) {
        return 'Delivery Partners';
      }
      if (
        pathname.startsWith('/admin/invoices') ||
        pathname.startsWith('/admin/invoice')
      ) {
        return 'Invoices & Payments';
      }
      if (pathname.startsWith('/admin/settlements')) {
        return 'Settlements';
      }
      if (pathname.startsWith('/admin/expenses')) {
        return 'Expenses';
      }
      if (pathname.startsWith('/admin/reports')) {
        return 'Reports';
      }
      if (pathname.startsWith('/admin/settings')) {
        return 'Settings';
      }
    }
    return propActiveItem ?? internalActive ?? 'Dashboard';
  }, [pathname, propActiveItem, internalActive]);

  const isCollapsed = propCollapsed ?? internalCollapsed;

  const navItems = [
    { name: 'Dashboard', icon: LayoutGrid, href: '/admin' },
    { name: 'Customers', icon: Users, href: '/admin/customers' },
    { name: 'Inventory', icon: Archive, href: '/admin/inventory' },
    { name: 'Delivery Partners', icon: Truck, href: '/admin/delivery-partners' },
    { name: 'Invoices & Payments', icon: ReceiptText, href: '/admin/invoices' },
    { name: 'Settlements', icon: CheckSquare, href: '/admin' },
    { name: 'Expenses', icon: FileText, href: '/admin' },
    { name: 'Reports', icon: BarChart3, href: '/admin' },
    { name: 'Settings', icon: Settings, href: '/admin' },
  ];

  const handleClick = (name: string) => {
    setInternalActive(name);
    if (onNavigate) {
      onNavigate(name);
    }
  };

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setInternalCollapsed(next);
    if (onToggleCollapse) {
      onToggleCollapse(next);
    }
  };

  return (
    <aside
      className={`relative bg-white border border-slate-200/90 rounded-2xl sm:rounded-none flex flex-col justify-between h-full min-h-[640px] select-none shadow-sm sm:shadow-none transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-[84px]' : 'w-[270px]'
      } ${className}`}
    >
      {/* Floating Minimize/Maximize Edge Button */}
      <button
        type="button"
        onClick={toggleCollapse}
        className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-white border border-slate-200/90 shadow-sm flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 cursor-pointer transition z-40"
        title={isCollapsed ? 'Maximize sidebar' : 'Minimize sidebar'}
        aria-label={isCollapsed ? 'Maximize sidebar' : 'Minimize sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
        )}
      </button>

      <div>
        {/* Top Header */}
        <div
          className={`border-b border-slate-100 flex items-start transition-all ${
            isCollapsed
              ? 'px-3 py-3.5 flex-col items-center text-center'
              : 'px-5 py-4 justify-between'
          }`}
        >
          <div className="min-w-0">
            <h2
              className={`font-black text-slate-900 tracking-tight leading-tight ${
                isCollapsed ? 'text-xs' : 'text-xl'
              }`}
            >
              Super Gas
            </h2>
            <p
              className={`text-slate-500 font-medium leading-tight mt-0.5 ${
                isCollapsed ? 'text-[9px]' : 'text-xs'
              }`}
            >
              Logistics Core
            </p>
          </div>

          {!isCollapsed && (
            <span className="bg-[#FEE2E2] text-[#801317] font-black text-[10px] px-2 py-0.5 rounded-md tracking-wider shrink-0">
              ADMIN
            </span>
          )}
        </div>

        {/* Navigation Items List */}
        <nav
          className={`transition-all ${
            isCollapsed ? 'p-2 space-y-2' : 'p-3.5 space-y-1.5'
          }`}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.name;

            if (isCollapsed) {
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => handleClick(item.name)}
                  title={item.name}
                  className={`w-11 h-11 mx-auto flex items-center justify-center rounded-xl transition cursor-pointer ${
                    isActive
                      ? 'bg-[#FDE2E1] text-[#BC0118] shadow-2xs'
                      : 'text-[#826A6A] hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 ${
                      isActive ? 'text-[#BC0118] stroke-[2.2]' : 'text-[#826A6A] stroke-[1.8]'
                    }`}
                  />
                </Link>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => handleClick(item.name)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm transition cursor-pointer text-left ${
                  isActive
                    ? 'bg-[#FDE2E1] text-[#BC0118] font-bold shadow-2xs'
                    : 'text-[#826A6A] hover:text-slate-900 hover:bg-slate-50 font-medium'
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 ${
                    isActive ? 'text-[#BC0118] stroke-[2.2]' : 'text-[#826A6A] stroke-[1.8]'
                  }`}
                />
                <span className="leading-none">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile Footer */}
      <div
        className={`border-t border-slate-100 transition-all ${
          isCollapsed ? 'p-3 flex flex-col items-center gap-3' : 'p-4 flex items-center justify-between'
        }`}
      >
        {isCollapsed ? (
          <>
            <div
              className="w-10 h-10 rounded-full bg-[#BC0118] text-white flex items-center justify-center shadow-2xs shrink-0 cursor-pointer"
              title="Agency Admin"
            >
              <User className="w-5 h-5 stroke-[2.2]" />
            </div>

            <Link
              href="/"
              title="Logout / Return to Mobile View"
              className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              <LogOut className="w-5 h-5 stroke-[2]" />
            </Link>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-[#BC0118] text-white flex items-center justify-center shrink-0 shadow-2xs">
                <User className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-extrabold text-slate-900 leading-tight truncate">
                  Agency Admin
                </p>
                <p className="text-xs text-slate-500 font-medium leading-tight mt-0.5 truncate">
                  Administrator
                </p>
              </div>
            </div>

            <Link
              href="/"
              title="Logout / Return to Mobile View"
              className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition cursor-pointer"
            >
              <LogOut className="w-5 h-5 stroke-[2]" />
            </Link>
          </>
        )}
      </div>
    </aside>
  );
}
