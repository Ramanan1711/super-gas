'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';

interface AdminSidebarProps {
  activeItem?: string;
  onNavigate?: (item: string) => void;
  className?: string;
}

export default function AdminSidebar({
  activeItem: propActiveItem,
  onNavigate,
  className = '',
}: AdminSidebarProps) {
  const [internalActive, setInternalActive] = useState('Dashboard');
  const active = propActiveItem ?? internalActive;

  const navItems = [
    { name: 'Dashboard', icon: LayoutGrid, href: '/admin' },
    { name: 'Customers', icon: Users, href: '/admin' },
    { name: 'Inventory', icon: Archive, href: '/admin' },
    { name: 'Delivery Partners', icon: Truck, href: '/admin' },
    { name: 'Invoices & Payments', icon: ReceiptText, href: '/admin' },
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

  return (
    <aside
      className={`w-[270px] bg-white border border-slate-200/90 rounded-2xl sm:rounded-none flex flex-col justify-between h-full min-h-[640px] select-none shadow-sm sm:shadow-none ${className}`}
    >
      <div>
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
              Super Gas
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Logistics Core
            </p>
          </div>
          <span className="bg-[#FEE2E2] text-[#801317] font-black text-[10px] px-2 py-0.5 rounded-md tracking-wider">
            ADMIN
          </span>
        </div>

        {/* Navigation Items List */}
        <nav className="p-3.5 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.name;

            return (
              <button
                key={item.name}
                type="button"
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
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile Footer */}
      <div className="p-4 border-t border-slate-100 flex items-center justify-between">
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
      </div>
    </aside>
  );
}
